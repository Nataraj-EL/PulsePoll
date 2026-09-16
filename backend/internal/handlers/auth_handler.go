package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/middleware"
	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/service"
)

// AuthHandler exposes HTTP handlers for user authentication
type AuthHandler struct {
	authService service.AuthService
}

// NewAuthHandler creates a new AuthHandler instance
func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Signup handles POST /api/v1/auth/signup
func (h *AuthHandler) Signup(c *gin.Context) {
	var req models.SignupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation Error",
			"message": "Invalid signup payload. Name, valid email, and password (min 6 chars) are required.",
			"status":  http.StatusBadRequest,
		})
		return
	}

	user, token, err := h.authService.Signup(c.Request.Context(), req.Name, req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrDuplicateEmail) {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Conflict",
				"message": service.ErrDuplicateEmail.Error(),
				"status":  http.StatusConflict,
			})
			return
		}
		if errors.Is(err, service.ErrInvalidInput) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": err.Error(),
				"status":  http.StatusBadRequest,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "An error occurred while creating your account. Please try again.",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	// Set Secure HTTP-Only Cookie
	setAuthCookie(c, token, 86400) // 24 hours

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user":    user,
	})
}

// Login handles POST /api/v1/auth/login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation Error",
			"message": "Valid email address and password are required.",
			"status":  http.StatusBadRequest,
		})
		return
	}

	user, token, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": service.ErrInvalidCredentials.Error(),
				"status":  http.StatusUnauthorized,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "An error occurred while signing in. Please try again.",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	// Set Secure HTTP-Only Cookie
	setAuthCookie(c, token, 86400) // 24 hours

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged in successfully",
		"user":    user,
	})
}

// Logout handles POST /api/v1/auth/logout
func (h *AuthHandler) Logout(c *gin.Context) {
	// Expire cookie immediately
	setAuthCookie(c, "", -1)

	c.JSON(http.StatusOK, gin.H{
		"message": "Successfully logged out",
	})
}

// Me handles GET /api/v1/auth/me (Protected)
func (h *AuthHandler) Me(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Authentication required",
			"status":  http.StatusUnauthorized,
		})
		return
	}

	userID, ok := userIDVal.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Invalid user context",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	user, err := h.authService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": service.ErrUserNotFound.Error(),
				"status":  http.StatusNotFound,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to fetch user profile",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

// Helper to set HTTP-Only Session Cookie
func setAuthCookie(c *gin.Context, token string, maxAge int) {
	// SameSite Lax allows cross-site top-level navigation while securing credentials
	c.SetSameSite(http.SameSiteLaxMode)
	// c.SetCookie(name, value, maxAge, path, domain, secure, httpOnly)
	c.SetCookie(middleware.CookieName, token, maxAge, "/", "", false, true)
}
