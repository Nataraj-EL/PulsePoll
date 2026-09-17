package handlers

import (
	"context"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
	"pulsepoll/backend/internal/service"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow cross-origin WebSocket connections in dev
	},
}

type RealtimeHandler struct {
	pollRepo        repository.PollRepository
	realtimeService service.RealtimeService
}

func NewRealtimeHandler(pollRepo repository.PollRepository, realtimeService service.RealtimeService) *RealtimeHandler {
	return &RealtimeHandler{
		pollRepo:        pollRepo,
		realtimeService: realtimeService,
	}
}

func (h *RealtimeHandler) findPoll(ctx context.Context, idOrCode string) (*models.Poll, error) {
	poll, err := h.pollRepo.FindByCode(ctx, idOrCode)
	if err == nil && poll != nil {
		return poll, nil
	}
	if objID, err := primitive.ObjectIDFromHex(idOrCode); err == nil {
		return h.pollRepo.FindByID(ctx, objID)
	}
	return nil, err
}

// GetResults handles GET /api/v1/polls/:code/results (HTTP REST)
func (h *RealtimeHandler) GetResults(c *gin.Context) {
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

	poll, err := h.findPoll(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to fetch poll",
			"status":  http.StatusInternalServerError,
		})
		return
	}
	if poll == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Not Found",
			"message": service.ErrPollNotFound.Error(),
			"status":  http.StatusNotFound,
		})
		return
	}

	results, err := h.realtimeService.GetLiveResults(c.Request.Context(), poll)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Server Error",
			"message": "Failed to fetch live poll results",
			"status":  http.StatusInternalServerError,
		})
		return
	}

	c.JSON(http.StatusOK, results)
}

// StreamResults handles GET /api/v1/polls/:code/ws (WebSocket Streaming)
func (h *RealtimeHandler) StreamResults(c *gin.Context) {
	code := c.Param("code")
	if code == "" {
		code = c.Param("id")
	}
	code = strings.TrimSpace(code)
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poll code required"})
		return
	}

	poll, err := h.findPoll(c.Request.Context(), code)
	if err != nil || poll == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Poll not found"})
		return
	}

	// Upgrade HTTP connection to WebSocket
	ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade WebSocket for poll %s: %v", code, err)
		return
	}
	defer ws.Close()

	// 1. Send initial snapshot immediately to WebSocket client
	initialResults, err := h.realtimeService.GetLiveResults(c.Request.Context(), poll)
	if err == nil && initialResults != nil {
		_ = ws.WriteJSON(initialResults)
	}

	// 2. Subscribe to Redis Pub/Sub events for this poll
	ctx, cancel := context.WithCancel(c.Request.Context())
	defer cancel()

	eventsCh, unsubscribe := h.realtimeService.SubscribeEvents(ctx, poll.Code)
	defer unsubscribe()

	// Read loop to detect client disconnection
	go func() {
		for {
			if _, _, err := ws.ReadMessage(); err != nil {
				cancel()
				break
			}
		}
	}()

	// 3. Stream incoming Redis Pub/Sub live updates over WebSocket
	for {
		select {
		case <-ctx.Done():
			return
		case msg, ok := <-eventsCh:
			if !ok {
				return
			}
			if err := ws.WriteMessage(websocket.TextMessage, []byte(msg)); err != nil {
				return
			}
		}
	}
}

