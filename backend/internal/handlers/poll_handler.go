package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/service"
)

type PollHandler struct {
	pollService service.PollService
}

func NewPollHandler(pollService service.PollService) *PollHandler {
	return &PollHandler{
		pollService: pollService,
	}
}

// Create handles POST /api/v1/polls (Protected)
func (h *PollHandler) Create(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Authentication required",
			"status":  http.StatusUnauthorized,
		})
		return
	}
	creatorID := userIDVal.(primitive.ObjectID)

	var req models.CreatePollRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation Error",
			"message": "Invalid request body. Question and at least 2 options are required.",
			"status":  http.StatusBadRequest,
		})
		return
	}

	poll, err := h.pollService.CreatePoll(c.Request.Context(), creatorID, req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidPollInput) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": err.Error(),
				"status":  http.StatusBadRequest,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to create poll. Please try again.",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Poll created successfully",
		"poll":    poll,
	})
}

// GetUserPolls handles GET /api/v1/polls (Protected)
func (h *PollHandler) GetUserPolls(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Authentication required",
			"status":  http.StatusUnauthorized,
		})
		return
	}
	creatorID := userIDVal.(primitive.ObjectID)

	polls, err := h.pollService.GetCreatorPolls(c.Request.Context(), creatorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to retrieve polls",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"polls": polls,
	})
}

// GetByID handles GET /api/v1/polls/:id (Public / Semi-Protected for Drafts)
func (h *PollHandler) GetByID(c *gin.Context) {
	idOrCode := c.Param("id")

	var requestingUserID *primitive.ObjectID
	if userIDVal, exists := c.Get("userID"); exists {
		if uid, ok := userIDVal.(primitive.ObjectID); ok {
			requestingUserID = &uid
		}
	}

	poll, err := h.pollService.GetPollByIDOrCode(c.Request.Context(), idOrCode, requestingUserID)
	if err != nil {
		if errors.Is(err, service.ErrPollNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": service.ErrPollNotFound.Error(),
				"status":  http.StatusNotFound,
			})
			return
		}
		if errors.Is(err, service.ErrUnauthorizedAccess) {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Forbidden",
				"message": service.ErrUnauthorizedAccess.Error(),
				"status":  http.StatusForbidden,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to fetch poll",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"poll": poll,
	})
}

// Publish handles POST /api/v1/polls/:id/publish (Protected)
func (h *PollHandler) Publish(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Unauthorized",
			"message": "Authentication required",
			"status":  http.StatusUnauthorized,
		})
		return
	}
	creatorID := userIDVal.(primitive.ObjectID)
	pollID := c.Param("id")

	poll, err := h.pollService.PublishPoll(c.Request.Context(), creatorID, pollID)
	if err != nil {
		if errors.Is(err, service.ErrPollNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": service.ErrPollNotFound.Error(),
				"status":  http.StatusNotFound,
			})
			return
		}
		if errors.Is(err, service.ErrUnauthorizedAccess) {
			c.JSON(http.StatusForbidden, gin.H{
				"error":   "Forbidden",
				"message": service.ErrUnauthorizedAccess.Error(),
				"status":  http.StatusForbidden,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to publish poll",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Poll published successfully",
		"poll":    poll,
	})
}
