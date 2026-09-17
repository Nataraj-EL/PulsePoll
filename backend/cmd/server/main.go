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
	"pulsepoll/backend/internal/repository"
	"pulsepoll/backend/internal/service"
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

	// 3. Initialize Redis Connection
	redisClient, err := database.ConnectRedis(ctx, cfg.RedisAddr, cfg.RedisPassword, cfg.RedisURL)
	if err != nil {
		log.Printf("⚠️ Warning: Initial Redis connection error: %v", err)
	} else {
		defer func() {
			if err := redisClient.Close(); err != nil {
				log.Printf("Error closing Redis client: %v", err)
			}
		}()
	}

	// 4. Initialize Data Repositories & Services
	var userRepo repository.UserRepository
	var pollRepo repository.PollRepository
	var voteRepo repository.VoteRepository

	var authService service.AuthService
	var pollService service.PollService
	var voteService service.VoteService
	var realtimeService service.RealtimeService

	if mongoDB != nil {
		userRepo = repository.NewUserRepository(mongoDB)
		if err := userRepo.InitIndexes(ctx); err != nil {
			log.Printf("⚠️ Notice: User indexes initialization warning: %v", err)
		}
		authService = service.NewAuthService(userRepo, cfg.JWTSecret)

		pollRepo = repository.NewPollRepository(mongoDB)
		if err := pollRepo.InitIndexes(ctx); err != nil {
			log.Printf("⚠️ Notice: Poll indexes initialization warning: %v", err)
		}
		pollService = service.NewPollService(pollRepo)

		voteRepo = repository.NewVoteRepository(mongoDB)
		if err := voteRepo.InitIndexes(ctx); err != nil {
			log.Printf("⚠️ Notice: Vote indexes initialization warning: %v", err)
		}

		realtimeService = service.NewRealtimeService(redisClient, pollRepo, voteRepo)
		voteService = service.NewVoteService(pollRepo, voteRepo, realtimeService)
	} else {
		log.Println("⚠️ Notice: Running without active MongoDB connection (DB operations will fail gracefully)")
	}

	// 5. Setup Gin Router & Middleware
	router := gin.New()
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())
	router.Use(middleware.CORS(cfg.CORSOrigin))

	// 6. Register Handlers & Routes
	healthHandler := handlers.NewHealthHandler(mongoClient, redisClient, cfg.Environment)

	apiV1 := router.Group("/api/v1")
	{
		// Infrastructure Health Check
		apiV1.GET("/health", healthHandler.Check)

		// Authentication Routes (if AuthService is available)
		if authService != nil {
			authHandler := handlers.NewAuthHandler(authService)

			authGroup := apiV1.Group("/auth")
			{
				authGroup.POST("/signup", authHandler.Signup)
				authGroup.POST("/login", authHandler.Login)
				authGroup.POST("/logout", authHandler.Logout)

				// Protected Auth Route
				authGroup.GET("/me", middleware.RequireAuth(cfg.JWTSecret), authHandler.Me)
			}
		}

		// Poll Routes (if PollService is available)
		if pollService != nil {
			pollHandler := handlers.NewPollHandler(pollService)
			requireAuth := middleware.RequireAuth(cfg.JWTSecret)

			pollsGroup := apiV1.Group("/polls")
			{
				// Protected Creator Endpoints
				pollsGroup.POST("", requireAuth, pollHandler.Create)
				pollsGroup.GET("", requireAuth, pollHandler.GetUserPolls)
				pollsGroup.POST("/:id/publish", requireAuth, pollHandler.Publish)

				// Public / Creator Access Endpoint
				pollsGroup.GET("/:id", pollHandler.GetByID)

				// Public Participant Voting Endpoint
				if voteService != nil {
					voteHandler := handlers.NewVoteHandler(voteService)
					pollsGroup.POST("/:id/votes", voteHandler.CastVote)
				}

				// Realtime Results & WebSocket Endpoint
				if realtimeService != nil {
					realtimeHandler := handlers.NewRealtimeHandler(pollRepo, realtimeService)
					pollsGroup.GET("/:id/results", realtimeHandler.GetResults)
					pollsGroup.GET("/:id/ws", realtimeHandler.StreamResults)
				}
			}
		}
	}

	// Root route for quick verification
	router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"app":     "PulsePoll API",
			"version": "1.0.0-auth",
			"status":  "running",
			"health":  "/api/v1/health",
		})
	})

	// 7. Start HTTP Server with Graceful Shutdown
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
