package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strings"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

var (
	ErrPollNotFound       = errors.New("Poll not found")
	ErrUnauthorizedAccess = errors.New("You do not have permission to access or modify this poll")
	ErrInvalidPollInput   = errors.New("Invalid poll parameters")
)

type PollService interface {
	CreatePoll(ctx context.Context, creatorID primitive.ObjectID, req models.CreatePollRequest) (*models.PollResponse, error)
	GetCreatorPolls(ctx context.Context, creatorID primitive.ObjectID) ([]models.PollResponse, error)
	GetPollByIDOrCode(ctx context.Context, idOrCode string, requestingUserID *primitive.ObjectID) (*models.PollResponse, error)
	PublishPoll(ctx context.Context, creatorID primitive.ObjectID, pollID string) (*models.PollResponse, error)
}

type pollService struct {
	pollRepo repository.PollRepository
}

func NewPollService(pollRepo repository.PollRepository) PollService {
	return &pollService{
		pollRepo: pollRepo,
	}
}

func (s *pollService) CreatePoll(ctx context.Context, creatorID primitive.ObjectID, req models.CreatePollRequest) (*models.PollResponse, error) {
	// 1. Server-side validation
	question := strings.TrimSpace(req.Question)
	if question == "" {
		return nil, fmt.Errorf("%w: Poll question is required", ErrInvalidPollInput)
	}

	// Clean & validate options (2 to 6 required)
	cleanOptions := make([]models.PollOption, 0)
	for i, opt := range req.Options {
		trimmed := strings.TrimSpace(opt)
		if trimmed != "" {
			cleanOptions = append(cleanOptions, models.PollOption{
				ID:   fmt.Sprintf("opt_%d", i+1),
				Text: trimmed,
			})
		}
	}

	if len(cleanOptions) < 2 || len(cleanOptions) > 6 {
		return nil, fmt.Errorf("%w: Polls must contain between 2 and 6 valid options", ErrInvalidPollInput)
	}

	// Choice type
	choiceType := req.ChoiceType
	if choiceType != models.ChoiceTypeMultiple {
		choiceType = models.ChoiceTypeSingle
	}

	// Generate unique 6-digit public code
	code, err := s.generateUniqueCode(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to generate unique poll code: %w", err)
	}

	status := models.PollStatusDraft
	if req.Publish {
		status = models.PollStatusActive
	}

	poll := &models.Poll{
		Code:       code,
		CreatorID:  creatorID,
		Question:   question,
		Options:    cleanOptions,
		ChoiceType: choiceType,
		Status:     status,
	}

	if err := s.pollRepo.Create(ctx, poll); err != nil {
		return nil, fmt.Errorf("failed to save poll: %w", err)
	}

	resp := poll.ToResponse()
	return &resp, nil
}

func (s *pollService) GetCreatorPolls(ctx context.Context, creatorID primitive.ObjectID) ([]models.PollResponse, error) {
	polls, err := s.pollRepo.FindByCreatorID(ctx, creatorID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch creator polls: %w", err)
	}

	responses := make([]models.PollResponse, 0, len(polls))
	for _, p := range polls {
		responses = append(responses, p.ToResponse())
	}
	return responses, nil
}

func (s *pollService) GetPollByIDOrCode(ctx context.Context, idOrCode string, requestingUserID *primitive.ObjectID) (*models.PollResponse, error) {
	idOrCode = strings.TrimSpace(idOrCode)
	if idOrCode == "" {
		return nil, ErrPollNotFound
	}

	var poll *models.Poll
	var err error

	// Try ObjectID lookup first if 24 hex characters
	if primitive.IsValidObjectID(idOrCode) {
		objID, _ := primitive.ObjectIDFromHex(idOrCode)
		poll, err = s.pollRepo.FindByID(ctx, objID)
	}

	// Fallback to Code lookup if not found by ID
	if poll == nil {
		poll, err = s.pollRepo.FindByCode(ctx, idOrCode)
	}

	if err != nil {
		return nil, fmt.Errorf("database query error: %w", err)
	}
	if poll == nil {
		return nil, ErrPollNotFound
	}

	// Authorization check: if poll is in draft, only creator can access it
	if poll.Status == models.PollStatusDraft {
		if requestingUserID == nil || *requestingUserID != poll.CreatorID {
			return nil, ErrUnauthorizedAccess
		}
	}

	resp := poll.ToResponse()
	return &resp, nil
}

func (s *pollService) PublishPoll(ctx context.Context, creatorID primitive.ObjectID, pollIDStr string) (*models.PollResponse, error) {
	pollIDStr = strings.TrimSpace(pollIDStr)
	if !primitive.IsValidObjectID(pollIDStr) {
		return nil, ErrPollNotFound
	}

	objID, err := primitive.ObjectIDFromHex(pollIDStr)
	if err != nil {
		return nil, ErrPollNotFound
	}

	poll, err := s.pollRepo.FindByID(ctx, objID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch poll: %w", err)
	}
	if poll == nil {
		return nil, ErrPollNotFound
	}

	// Verify creator ownership
	if poll.CreatorID != creatorID {
		return nil, ErrUnauthorizedAccess
	}

	// Ensure poll code exists
	if poll.Code == "" {
		code, err := s.generateUniqueCode(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to generate unique code: %w", err)
		}
		poll.Code = code
	}

	// Update status to active
	if err := s.pollRepo.UpdateStatus(ctx, objID, models.PollStatusActive); err != nil {
		return nil, fmt.Errorf("failed to publish poll: %w", err)
	}

	poll.Status = models.PollStatusActive
	resp := poll.ToResponse()
	return &resp, nil
}

// Generate a random 6-digit numeric poll code (e.g., "849201")
func (s *pollService) generateUniqueCode(ctx context.Context) (string, error) {
	for attempts := 0; attempts < 10; attempts++ {
		num, err := rand.Int(rand.Reader, big.NewInt(900000))
		if err != nil {
			return "", err
		}
		code := fmt.Sprintf("%06d", num.Int64()+100000)

		existing, err := s.pollRepo.FindByCode(ctx, code)
		if err != nil {
			return "", err
		}
		if existing == nil {
			return code, nil
		}
	}
	return "", errors.New("failed to generate unique poll code after multiple attempts")
}
