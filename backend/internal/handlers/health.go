package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"

	"pulsepoll/backend/internal/database"
)

// ServiceHealth represents the status of an external dependency
type ServiceHealth struct {
	Status    string  `json:"status"`
	LatencyMs float64 `json:"latency_ms"`
	Error     string  `json:"error,omitempty"`
}

// HealthResponse represents the API response payload for GET /api/v1/health
type HealthResponse struct {
	Status      string                   `json:"status"`
	Environment string                   `json:"environment"`
	Timestamp   string                   `json:"timestamp"`
	Services    map[string]ServiceHealth `json:"services"`
}

// HealthHandler handles health check requests
type HealthHandler struct {
	mongoClient *mongo.Client
	redisClient *redis.Client
	environment string
}

// NewHealthHandler creates a new HealthHandler instance
func NewHealthHandler(mongoClient *mongo.Client, redisClient *redis.Client, environment string) *HealthHandler {
	return &HealthHandler{
		mongoClient: mongoClient,
		redisClient: redisClient,
		environment: environment,
	}
}

// Check handles GET /api/v1/health
func (h *HealthHandler) Check(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 4*time.Second)
	defer cancel()

	services := make(map[string]ServiceHealth)
	allHealthy := true

	// Check MongoDB connection
	mongoOK, mongoLatency, mongoErr := database.PingMongoDB(ctx, h.mongoClient)
	if mongoOK {
		services["mongodb"] = ServiceHealth{
			Status:    "connected",
			LatencyMs: roundTwoDecimals(mongoLatency),
		}
	} else {
		allHealthy = false
		errMsg := "Connection failed"
		if mongoErr != nil {
			errMsg = mongoErr.Error()
		}
		services["mongodb"] = ServiceHealth{
			Status:    "disconnected",
			LatencyMs: roundTwoDecimals(mongoLatency),
			Error:     errMsg,
		}
	}

	// Check Redis connection
	redisOK, redisLatency, redisErr := database.PingRedis(ctx, h.redisClient)
	if redisOK {
		services["redis"] = ServiceHealth{
			Status:    "connected",
			LatencyMs: roundTwoDecimals(redisLatency),
		}
	} else {
		allHealthy = false
		errMsg := "Connection failed"
		if redisErr != nil {
			errMsg = redisErr.Error()
		}
		services["redis"] = ServiceHealth{
			Status:    "disconnected",
			LatencyMs: roundTwoDecimals(redisLatency),
			Error:     errMsg,
		}
	}

	overallStatus := "ok"
	httpStatusCode := http.StatusOK

	if !allHealthy {
		overallStatus = "degraded"
		// If both are down, set status to unhealthy
		if !mongoOK && !redisOK {
			overallStatus = "down"
		}
		httpStatusCode = http.StatusServiceUnavailable
	}

	response := HealthResponse{
		Status:      overallStatus,
		Environment: h.environment,
		Timestamp:   time.Now().UTC().Format(time.RFC3339),
		Services:    services,
	}

	c.JSON(httpStatusCode, response)
}

func roundTwoDecimals(val float64) float64 {
	return float64(int(val*100+0.5)) / 100
}
