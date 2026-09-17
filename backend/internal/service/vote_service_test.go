package service

import (
	"context"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

type mockVoteRepo struct {
	votes map[string]*models.Vote // key: poll_id + "_" + voter_id
}

func newMockVoteRepo() repository.VoteRepository {
	return &mockVoteRepo{
		votes: make(map[string]*models.Vote),
	}
}

func (m *mockVoteRepo) InitIndexes(ctx context.Context) error {
	return nil
}

func (m *mockVoteRepo) Create(ctx context.Context, vote *models.Vote) error {
	key := vote.PollID.Hex() + "_" + vote.VoterID
	if _, exists := m.votes[key]; exists {
		return repository.ErrDuplicateVote
	}
	if vote.ID.IsZero() {
		vote.ID = primitive.NewObjectID()
	}
	m.votes[key] = vote
	return nil
}

func (m *mockVoteRepo) HasVoted(ctx context.Context, pollID primitive.ObjectID, voterID string) (bool, error) {
	key := pollID.Hex() + "_" + voterID
	_, exists := m.votes[key]
	return exists, nil
}

func (m *mockVoteRepo) GetVotesByPollID(ctx context.Context, pollID primitive.ObjectID) ([]*models.Vote, error) {
	result := make([]*models.Vote, 0)
	for _, v := range m.votes {
		if v.PollID == pollID {
			result = append(result, v)
		}
	}
	return result, nil
}

func setupActivePoll(t *testing.T, pollRepo repository.PollRepository, choiceType models.ChoiceType, status models.PollStatus) *models.Poll {
	poll := &models.Poll{
		ID:         primitive.NewObjectID(),
		Code:       "849201",
		CreatorID:  primitive.NewObjectID(),
		Question:   "Sample Question",
		Options:    []models.PollOption{{ID: "opt_1", Text: "Choice A"}, {ID: "opt_2", Text: "Choice B"}},
		ChoiceType: choiceType,
		Status:     status,
	}
	if err := pollRepo.Create(context.Background(), poll); err != nil {
		t.Fatalf("failed to create test poll: %v", err)
	}
	return poll
}

func TestCastVoteSingleChoiceSuccess(t *testing.T) {
	pollRepo := newMockPollRepo()
	voteRepo := newMockVoteRepo()
	svc := NewVoteService(pollRepo, voteRepo, nil)

	setupActivePoll(t, pollRepo, models.ChoiceTypeSingle, models.PollStatusActive)

	res, err := svc.CastVote(context.Background(), "849201", "voter_123", []string{"opt_1"})
	if err != nil {
		t.Fatalf("expected successful vote, got: %v", err)
	}

	if len(res.OptionIDs) != 1 || res.OptionIDs[0] != "opt_1" {
		t.Errorf("expected option_ids [opt_1], got: %v", res.OptionIDs)
	}
}

func TestCastVoteMultipleChoiceSuccess(t *testing.T) {
	pollRepo := newMockPollRepo()
	voteRepo := newMockVoteRepo()
	svc := NewVoteService(pollRepo, voteRepo, nil)

	setupActivePoll(t, pollRepo, models.ChoiceTypeMultiple, models.PollStatusActive)

	res, err := svc.CastVote(context.Background(), "849201", "voter_456", []string{"opt_1", "opt_2"})
	if err != nil {
		t.Fatalf("expected successful multiple choice vote, got: %v", err)
	}

	if len(res.OptionIDs) != 2 {
		t.Errorf("expected 2 option_ids, got: %d", len(res.OptionIDs))
	}
}

func TestCastVoteInvalidOption(t *testing.T) {
	pollRepo := newMockPollRepo()
	voteRepo := newMockVoteRepo()
	svc := NewVoteService(pollRepo, voteRepo, nil)

	setupActivePoll(t, pollRepo, models.ChoiceTypeSingle, models.PollStatusActive)

	_, err := svc.CastVote(context.Background(), "849201", "voter_789", []string{"invalid_option_id"})
	if err == nil || err != ErrInvalidOption {
		t.Errorf("expected ErrInvalidOption for invalid option ID, got: %v", err)
	}
}

func TestCastVoteEmptySubmission(t *testing.T) {
	pollRepo := newMockPollRepo()
	voteRepo := newMockVoteRepo()
	svc := NewVoteService(pollRepo, voteRepo, nil)

	setupActivePoll(t, pollRepo, models.ChoiceTypeSingle, models.PollStatusActive)

	_, err := svc.CastVote(context.Background(), "849201", "voter_789", []string{})
	if err == nil {
		t.Error("expected error for empty option submission, got nil")
	}
}

func TestCastVoteDraftOrClosedPoll(t *testing.T) {
	pollRepo := newMockPollRepo()
	voteRepo := newMockVoteRepo()
	svc := NewVoteService(pollRepo, voteRepo, nil)

	// Draft poll
	setupActivePoll(t, pollRepo, models.ChoiceTypeSingle, models.PollStatusDraft)

	_, err := svc.CastVote(context.Background(), "849201", "voter_999", []string{"opt_1"})
	if err == nil || err != ErrPollNotActive {
		t.Errorf("expected ErrPollNotActive for draft poll, got: %v", err)
	}
}

func TestCastVoteDuplicatePrevention(t *testing.T) {
	pollRepo := newMockPollRepo()
	voteRepo := newMockVoteRepo()
	svc := NewVoteService(pollRepo, voteRepo, nil)

	setupActivePoll(t, pollRepo, models.ChoiceTypeSingle, models.PollStatusActive)

	// First vote
	_, err := svc.CastVote(context.Background(), "849201", "same_voter", []string{"opt_1"})
	if err != nil {
		t.Fatalf("first vote failed: %v", err)
	}

	// Second vote from same voter
	_, err = svc.CastVote(context.Background(), "849201", "same_voter", []string{"opt_2"})
	if err == nil || err != repository.ErrDuplicateVote {
		t.Errorf("expected ErrDuplicateVote for repeated vote, got: %v", err)
	}
}
