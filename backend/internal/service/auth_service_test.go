package service

import (
	"context"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

// mockUserRepo is an in-memory test double for UserRepository
type mockUserRepo struct {
	users map[string]*models.User
}

func newMockUserRepo() repository.UserRepository {
	return &mockUserRepo{
		users: make(map[string]*models.User),
	}
}

func (m *mockUserRepo) InitIndexes(ctx context.Context) error {
	return nil
}

func (m *mockUserRepo) Create(ctx context.Context, user *models.User) error {
	if _, exists := m.users[user.Email]; exists {
		return ErrDuplicateEmail
	}
	if user.ID.IsZero() {
		user.ID = primitive.NewObjectID()
	}
	m.users[user.Email] = user
	return nil
}

func (m *mockUserRepo) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	if u, ok := m.users[email]; ok {
		return u, nil
	}
	return nil, nil
}

func (m *mockUserRepo) FindByID(ctx context.Context, id primitive.ObjectID) (*models.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, nil
}

func TestSignupSuccess(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewAuthService(repo, "test-secret")

	user, token, err := svc.Signup(context.Background(), "Test User", "TEST@Example.com", "password123")
	if err != nil {
		t.Fatalf("expected no error, got: %v", err)
	}

	if user.Email != "test@example.com" {
		t.Errorf("expected email to be normalized to test@example.com, got: %s", user.Email)
	}

	if token == "" {
		t.Error("expected valid JWT token string, got empty")
	}
}

func TestSignupDuplicateEmail(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewAuthService(repo, "test-secret")

	ctx := context.Background()
	_, _, err := svc.Signup(ctx, "User One", "user@example.com", "password123")
	if err != nil {
		t.Fatalf("initial signup failed: %v", err)
	}

	_, _, err = svc.Signup(ctx, "User Two", "user@example.com", "anotherpassword")
	if err == nil || err != ErrDuplicateEmail {
		t.Errorf("expected ErrDuplicateEmail, got: %v", err)
	}
}

func TestLoginInvalidCredentials(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewAuthService(repo, "test-secret")

	ctx := context.Background()
	_, _, _ = svc.Signup(ctx, "Test User", "user@example.com", "password123")

	// Invalid password
	_, _, err := svc.Login(ctx, "user@example.com", "wrongpassword")
	if err == nil || err != ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials for wrong password, got: %v", err)
	}

	// Non-existent user
	_, _, err = svc.Login(ctx, "unknown@example.com", "password123")
	if err == nil || err != ErrInvalidCredentials {
		t.Errorf("expected ErrInvalidCredentials for unknown user, got: %v", err)
	}
}
