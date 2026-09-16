package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"pulsepoll/backend/internal/config"
	"pulsepoll/backend/internal/database"
	"pulsepoll/backend/internal/handlers"
	"pulsepoll/backend/internal/middleware"
)

func main() {
	log.Println("==================================================")
	log.Println("⚡ Starting PulsePoll Backend Engine (Go + Gin) ⚡")
	log.Println("==================================================")

	// 1. Load Configuration
	cfg := config.LoadConfig()

	// Set Gin mode based on environment
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Root context with timeout for initialization
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// 2. Initialize MongoDB Connection
	mongoClient, mongoDB, err := database.ConnectMongoDB(ctx, cfg.MongoURI, cfg.MongoDBName)
	if err != nil {
		log.Printf("⚠️ Warning: Initial MongoDB connection error: %v", err)
	} else {
		defer func() {
			disconnectCtx, dCancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer dCancel()
			if err := mongoClient.Disconnect(disconnectCtx); err != nil {
				log.Printf("Error disconnecting MongoDB: %v", err)
			}
		}()
	}
	_ = mongoDB // Available for future repository layers

	// 3. Initialize Redis Connection
	redisClient, err := database.ConnectRedis(ctx, cfg.RedisAddr, cfg.RedisPassword)
	if err != nil {
		log.Printf("⚠️ Warning: Initial Redis connection error: %v", err)
	} else {
		defer func() {
			if err := redisClient.Close(); err != nil {
				log.Printf("Error closing Redis client: %v", err)
			}
		}()
	}

	// 4. Setup Gin Router & Middleware
	router := gin.New()
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS(cfg.CORSOrigin))

	// 5. Register Handlers
	healthHandler := handlers.NewHealthHandler(mongoClient, redisClient, cfg.Environment)

	apiV1 := router.Group("/api/v1")
	{
		apiV1.GET("/health", healthHandler.Check)
	}

	// Root route for quick verification
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"app":     "PulsePoll API",
			"version": "1.0.0-sprint1",
			"status":  "running",
			"docs":    "/api/v1/health",
		})
	})

	// 6. Start HTTP Server with Graceful Shutdown
	srv := &http.Server{
		Addr:         cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🚀 Server running on port %s [Environment: %s]", cfg.Port, cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("❌ Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server gracefully...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly.")
}
