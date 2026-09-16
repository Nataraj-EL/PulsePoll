package service

import (
	"context"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

type mockPollRepo struct {
	polls map[string]*models.Poll
}

func newMockPollRepo() repository.PollRepository {
	return &mockPollRepo{
		polls: make(map[string]*models.Poll),
	}
}

func (m *mockPollRepo) InitIndexes(ctx context.Context) error {
	return nil
}

func (m *mockPollRepo) Create(ctx context.Context, poll *models.Poll) error {
	if poll.ID.IsZero() {
		poll.ID = primitive.NewObjectID()
	}
	m.polls[poll.ID.Hex()] = poll
	return nil
}

func (m *mockPollRepo) FindByCreatorID(ctx context.Context, creatorID primitive.ObjectID) ([]*models.Poll, error) {
	result := make([]*models.Poll, 0)
	for _, p := range m.polls {
		if p.CreatorID == creatorID {
			result = append(result, p)
		}
	}
	return result, nil
}

func (m *mockPollRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error) {
	if p, ok := m.polls[id.Hex()]; ok {
		return p, nil
	}
	return nil, nil
}

func (m *mockPollRepo) FindByCode(ctx context.Context, code string) (*models.Poll, error) {
	for _, p := range m.polls {
		if p.Code == code {
			return p, nil
		}
	}
	return nil, nil
}

func (m *mockPollRepo) UpdateStatus(ctx context.Context, id primitive.ObjectID, status models.PollStatus) error {
	if p, ok := m.polls[id.Hex()]; ok {
		p.Status = status
		return nil
	}
	return repository.ErrPollNotFound
}

func TestCreatePollSuccess(t *testing.T) {
	repo := newMockPollRepo()
	svc := NewPollService(repo)

	creatorID := primitive.NewObjectID()
	req := models.CreatePollRequest{
		Question:   "What feature should we build next?",
		Options:    []string{"Realtime Polling", "Export CSV", "QR Code Sharing"},
		ChoiceType: models.ChoiceTypeSingle,
		Publish:    true,
	}

	poll, err := svc.CreatePoll(context.Background(), creatorID, req)
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if poll.Question != req.Question {
		t.Errorf("expected question %q, got %q", req.Question, poll.Question)
	}

	if len(poll.Options) != 3 {
		t.Errorf("expected 3 options, got %d", len(poll.Options))
	}

	if poll.Status != models.PollStatusActive {
		t.Errorf("expected status %s, got %s", models.PollStatusActive, poll.Status)
	}

	if poll.Code == "" {
		t.Error("expected non-empty 6-digit poll code")
	}
}

func TestCreatePollInvalidInput(t *testing.T) {
	repo := newMockPollRepo()
	svc := NewPollService(repo)

	creatorID := primitive.NewObjectID()

	// Missing question
	_, err := svc.CreatePoll(context.Background(), creatorID, models.CreatePollRequest{
		Question: "",
		Options:  []string{"Opt A", "Opt B"},
	})
	if err == nil {
		t.Error("expected error for empty question, got nil")
	}

	// Insufficient options (less than 2)
	_, err = svc.CreatePoll(context.Background(), creatorID, models.CreatePollRequest{
		Question: "Single Option Question",
		Options:  []string{"Only One Option"},
	})
	if err == nil {
		t.Error("expected error for less than 2 options, got nil")
	}

	// Too many options (more than 6)
	_, err = svc.CreatePoll(context.Background(), creatorID, models.CreatePollRequest{
		Question: "Too Many Options Question",
		Options:  []string{"1", "2", "3", "4", "5", "6", "7"},
	})
	if err == nil {
		t.Error("expected error for >6 options, got nil")
	}
}

func TestPublishPollAuthorization(t *testing.T) {
	repo := newMockPollRepo()
	svc := NewPollService(repo)

	creatorID := primitive.NewObjectID()
	otherCreatorID := primitive.NewObjectID()

	// Create a draft poll
	poll, err := svc.CreatePoll(context.Background(), creatorID, models.CreatePollRequest{
		Question: "Draft Poll Question",
		Options:  []string{"Option A", "Option B"},
		Publish:  false,
	})
	if err != nil {
		t.Fatalf("failed to create draft poll: %v", err)
	}

	// Other creator attempts to publish should fail with ErrUnauthorizedAccess
	_, err = svc.PublishPoll(context.Background(), otherCreatorID, poll.ID)
	if err == nil || err != ErrUnauthorizedAccess {
		t.Errorf("expected ErrUnauthorizedAccess, got: %v", err)
	}

	// Owner creator publishes successfully
	pubPoll, err := svc.PublishPoll(context.Background(), creatorID, poll.ID)
	if err != nil {
		t.Fatalf("expected successful publish by owner, got: %v", err)
	}

	if pubPoll.Status != models.PollStatusActive {
		t.Errorf("expected active status after publish, got: %s", pubPoll.Status)
	}
}
