package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all backend configuration parameters
type Config struct {
	Port          string
	MongoURI      string
	MongoDBName   string
	RedisAddr     string
	RedisPassword string
	RedisURL      string
	CORSOrigin    string
	Environment   string
	JWTSecret     string
	ResendAPIKey  string
}

// LoadConfig initializes configuration from environment variables with sensible defaults
func LoadConfig() *Config {
	// Attempt to load .env file if available (ignore error if not found)
	if err := godotenv.Load(); err != nil {
		log.Println("Notice: .env file not found, using system environment variables")
	}

	cfg := &Config{
		Port:          getEnv("PORT", "8080"),
		MongoURI:      getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDBName:   getEnv("MONGO_DB", "pulsepoll"),
		RedisAddr:     getEnv("REDIS_ADDR", "localhost:6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),
		RedisURL:      getEnv("REDIS_URL", ""),
		CORSOrigin:    getEnv("CORS_ORIGIN", "http://localhost:5173"),
		Environment:   getEnv("ENVIRONMENT", "development"),
		JWTSecret:     getEnv("JWT_SECRET", "pulsepoll-production-secure-jwt-secret-key-2026"),
		ResendAPIKey:  getEnv("RESEND_API_KEY", ""),
	}

	// Sanitize port
	if !strings.HasPrefix(cfg.Port, ":") {
		cfg.Port = ":" + cfg.Port
	}

	return cfg
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists && strings.TrimSpace(value) != "" {
		return strings.TrimSpace(value)
	}
	return defaultValue
}
