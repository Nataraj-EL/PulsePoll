package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
	"pulsepoll/backend/internal/service"
)

const VoterCookieName = "pulsepoll_voter_id"

type VoteHandler struct {
	voteService service.VoteService
}

func NewVoteHandler(voteService service.VoteService) *VoteHandler {
	return &VoteHandler{
		voteService: voteService,
	}
}

// CastVote handles POST /api/v1/polls/:id/votes (Public Anonymous Endpoint)
func (h *VoteHandler) CastVote(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		code = c.Param("id")
	}
	code = strings.TrimSpace(code)
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Bad Request",
			"message": "Poll code is required",
			"status":  http.StatusBadRequest,
		})
		return
	}

	var req models.CastVoteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Validation Error",
			"message": "Invalid vote request payload. Please select at least one option.",
			"status":  http.StatusBadRequest,
		})
		return
	}

	// Determine Voter ID (priority: payload > header > cookie > newly generated)
	voterID := strings.TrimSpace(req.VoterID)
	if voterID == "" {
		voterID = strings.TrimSpace(c.GetHeader("X-Voter-ID"))
	}
	if voterID == "" {
		if cookie, err := c.Cookie(VoterCookieName); err == nil && strings.TrimSpace(cookie) != "" {
			voterID = strings.TrimSpace(cookie)
		}
	}
	if voterID == "" {
		// Generate random 16-byte hex voter ID
		bytes := make([]byte, 16)
		_, _ = rand.Read(bytes)
		voterID = hex.EncodeToString(bytes)
	}

	// Set voter ID cookie for session persistence (valid 30 days)
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(VoterCookieName, voterID, 30*86400, "/", "", false, false)

	vote, err := h.voteService.CastVote(c.Request.Context(), code, voterID, req.OptionIDs)
	if err != nil {
		if errors.Is(err, service.ErrPollNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "Not Found",
				"message": service.ErrPollNotFound.Error(),
				"status":  http.StatusNotFound,
			})
			return
		}
		if errors.Is(err, service.ErrPollNotActive) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": service.ErrPollNotActive.Error(),
				"status":  http.StatusBadRequest,
			})
			return
		}
		if errors.Is(err, service.ErrInvalidOption) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": service.ErrInvalidOption.Error(),
				"status":  http.StatusBadRequest,
			})
			return
		}
		if errors.Is(err, service.ErrInvalidVote) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "Bad Request",
				"message": err.Error(),
				"status":  http.StatusBadRequest,
			})
			return
		}
		if errors.Is(err, repository.ErrDuplicateVote) {
			c.JSON(http.StatusConflict, gin.H{
				"error":   "Conflict",
				"message": repository.ErrDuplicateVote.Error(),
				"status":  http.StatusConflict,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "An error occurred while submitting your vote. Please try again.",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Vote submitted successfully",
		"vote":     vote,
		"voter_id": voterID,
	})
}
