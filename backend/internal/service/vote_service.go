package service

import (
	"context"
	"errors"
	"fmt"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

var (
	ErrPollNotActive = errors.New("Voting is only allowed on active live polls")
	ErrInvalidOption = errors.New("One or more selected options do not belong to this poll")
	ErrInvalidVote   = errors.New("Invalid vote submission")
)

type VoteService interface {
	CastVote(ctx context.Context, code string, voterID string, optionIDs []string) (*models.VoteResponse, error)
}

type voteService struct {
	pollRepo        repository.PollRepository
	voteRepo        repository.VoteRepository
	realtimeService RealtimeService
}

func NewVoteService(pollRepo repository.PollRepository, voteRepo repository.VoteRepository, realtimeService RealtimeService) VoteService {
	return &voteService{
		pollRepo:        pollRepo,
		voteRepo:        voteRepo,
		realtimeService: realtimeService,
	}
}

func (s *voteService) CastVote(ctx context.Context, code string, voterID string, optionIDs []string) (*models.VoteResponse, error) {
	if code == "" || voterID == "" {
		return nil, fmt.Errorf("%w: Missing poll code or voter identification", ErrInvalidVote)
	}

	// 1. Fetch poll by code
	poll, err := s.pollRepo.FindByCode(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch poll: %w", err)
	}
	if poll == nil {
		return nil, ErrPollNotFound
	}

	// 2. Validate poll status is active
	if poll.Status != models.PollStatusActive {
		return nil, ErrPollNotActive
	}

	// 3. Clean & validate option IDs
	if len(optionIDs) == 0 {
		return nil, fmt.Errorf("%w: At least one option must be selected", ErrInvalidVote)
	}

	// Single choice validation
	if poll.ChoiceType == models.ChoiceTypeSingle && len(optionIDs) != 1 {
		return nil, fmt.Errorf("%w: Exactly one option must be selected for single choice polls", ErrInvalidVote)
	}

	// Verify option IDs belong to the poll options
	validOptionIDs := make(map[string]bool)
	for _, opt := range poll.Options {
		validOptionIDs[opt.ID] = true
	}

	dedupOptions := make([]string, 0, len(optionIDs))
	seen := make(map[string]bool)

	for _, optID := range optionIDs {
		if !validOptionIDs[optID] {
			return nil, ErrInvalidOption
		}
		if !seen[optID] {
			seen[optID] = true
			dedupOptions = append(dedupOptions, optID)
		}
	}

	// 4. Duplicate vote check
	hasVoted, err := s.voteRepo.HasVoted(ctx, poll.ID, voterID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing vote: %w", err)
	}
	if hasVoted {
		return nil, repository.ErrDuplicateVote
	}

	// 5. Create vote entity in MongoDB (authoritative durable store)
	vote := &models.Vote{
		PollID:    poll.ID,
		PollCode:  poll.Code,
		OptionIDs: dedupOptions,
		VoterID:   voterID,
	}

	if err := s.voteRepo.Create(ctx, vote); err != nil {
		return nil, err
	}

	// 6. Update Redis counters & publish live event to Pub/Sub
	if s.realtimeService != nil {
		_ = s.realtimeService.RecordVoteAndPublish(ctx, poll.Code, dedupOptions)
	}

	resp := vote.ToResponse()
	return &resp, nil
}
