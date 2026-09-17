package service

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

var (
	ErrDuplicateEmail     = errors.New("An account with this email address already exists")
	ErrInvalidCredentials = errors.New("Invalid email address or password")
	ErrUserNotFound       = errors.New("User account not found")
	ErrInvalidInput       = errors.New("Invalid input parameters")
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// AuthService defines methods for user authentication and management
type AuthService interface {
	Signup(ctx context.Context, name, email, rawPassword string) (*models.UserResponse, string, error)
	Login(ctx context.Context, email, rawPassword string) (*models.UserResponse, string, error)
	GetUserByID(ctx context.Context, userID primitive.ObjectID) (*models.UserResponse, error)
	GenerateToken(user *models.User) (string, error)
}

type authService struct {
	userRepo     repository.UserRepository
	jwtSecret    string
	emailService EmailService
}

// NewAuthService creates a new AuthService instance
func NewAuthService(userRepo repository.UserRepository, jwtSecret string, emailService EmailService) AuthService {
	return &authService{
		userRepo:     userRepo,
		jwtSecret:    jwtSecret,
		emailService: emailService,
	}
}

// Signup validates inputs, checks duplicates, hashes password, saves user, and issues a JWT token
func (s *authService) Signup(ctx context.Context, name, email, rawPassword string) (*models.UserResponse, string, error) {
	// Normalize & validate email
	email = strings.ToLower(strings.TrimSpace(email))
	if !emailRegex.MatchString(email) {
		return nil, "", fmt.Errorf("%w: invalid email address format", ErrInvalidInput)
	}

	name = strings.TrimSpace(name)
	if name == "" {
		return nil, "", fmt.Errorf("%w: name is required", ErrInvalidInput)
	}

	if len(rawPassword) < 6 {
		return nil, "", fmt.Errorf("%w: password must be at least 6 characters long", ErrInvalidInput)
	}

	// Check if user with email already exists
	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", fmt.Errorf("failed to query database: %w", err)
	}
	if existingUser != nil {
		return nil, "", ErrDuplicateEmail
	}

	// Hash password with bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(rawPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hashedPassword),
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		// Duplicate key race condition safeguard
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "E11000") {
			return nil, "", ErrDuplicateEmail
		}
		return nil, "", fmt.Errorf("failed to save user to database: %w", err)
	}

	// Dispatch welcome email safely in background (must NOT block or fail account creation)
	if s.emailService != nil {
		go func(toEmail, toName string) {
			asyncCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
			defer cancel()
			if emailErr := s.emailService.SendWelcomeEmail(asyncCtx, toEmail, toName); emailErr != nil {
				log.Printf("⚠️ Notice: Non-fatal error sending welcome email to %s: %v", toEmail, emailErr)
			}
		}(user.Email, user.Name)
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate session token: %w", err)
	}

	resp := user.ToResponse()
	return &resp, token, nil
}

// Login validates user credentials and issues a JWT token
func (s *authService) Login(ctx context.Context, email, rawPassword string) (*models.UserResponse, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" || rawPassword == "" {
		return nil, "", ErrInvalidCredentials
	}

	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, "", fmt.Errorf("database query error: %w", err)
	}
	if user == nil {
		return nil, "", ErrInvalidCredentials
	}

	// Compare bcrypt password hash
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(rawPassword)); err != nil {
		return nil, "", ErrInvalidCredentials
	}

	token, err := s.GenerateToken(user)
	if err != nil {
		return nil, "", fmt.Errorf("failed to generate session token: %w", err)
	}

	resp := user.ToResponse()
	return &resp, token, nil
}

// GetUserByID fetches user profile by ObjectID
func (s *authService) GetUserByID(ctx context.Context, userID primitive.ObjectID) (*models.UserResponse, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("database query error: %w", err)
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	resp := user.ToResponse()
	return &resp, nil
}

// GenerateToken creates a signed JWT token valid for 24 hours
func (s *authService) GenerateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":   user.ID.Hex(),
		"name":  user.Name,
		"email": user.Email,
		"iat":   time.Now().Unix(),
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
