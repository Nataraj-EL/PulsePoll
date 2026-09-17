package database

import (
	"crypto/tls"
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/redis/go-redis/v9"
)

// ConnectRedis initializes and verifies a connection to Redis (supports Addr+Password or REDIS_URL/rediss://)
func ConnectRedis(ctx context.Context, addr, password, redisURL string) (*redis.Client, error) {
	var opts *redis.Options
	var err error

	if redisURL != "" {
		if strings.Contains(redisURL, "<") || strings.Contains(redisURL, ">") {
			return nil, fmt.Errorf("REDIS_URL contains unreplaced placeholder angle brackets '<...>'; please replace with actual Upstash credentials in Render environment variables")
		}
		opts, err = redis.ParseURL(redisURL)
		if err != nil {
			// Fallback: parse custom redis URL if password contains unescaped special characters
			opts, err = parseCustomRedisURL(redisURL)
			if err != nil {
				return nil, fmt.Errorf("failed to parse REDIS_URL: %w", err)
			}
		}
	} else {
		opts = &redis.Options{
			Addr:     addr,
			Password: password,
			DB:       0, // Default DB
		}
	}

	rdb := redis.NewClient(opts)

	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if _, err := rdb.Ping(pingCtx).Result(); err != nil {
		_ = rdb.Close()
		return nil, fmt.Errorf("failed to ping Redis at %s: %w", opts.Addr, err)
	}

	log.Printf("Successfully connected to Redis instance at: %s", opts.Addr)
	return rdb, nil
}

func parseCustomRedisURL(raw string) (*redis.Options, error) {
	isTLS := strings.HasPrefix(raw, "rediss://")
	trimmed := strings.TrimPrefix(raw, "rediss://")
	trimmed = strings.TrimPrefix(trimmed, "redis://")

	lastAt := strings.LastIndex(trimmed, "@")
	if lastAt == -1 {
		return nil, fmt.Errorf("invalid redis url format (missing @ separator)")
	}

	userinfo := trimmed[:lastAt]
	hostPort := trimmed[lastAt+1:]

	password := userinfo
	if colonIdx := strings.Index(userinfo, ":"); colonIdx != -1 {
		password = userinfo[colonIdx+1:]
	}

	opts := &redis.Options{
		Addr:     hostPort,
		Password: password,
	}
	if isTLS {
		opts.TLSConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}
	return opts, nil
}

// PingRedis checks Redis connectivity and measures latency
func PingRedis(ctx context.Context, rdb *redis.Client) (bool, float64, error) {
	if rdb == nil {
		return false, 0, fmt.Errorf("Redis client is nil")
	}

	start := time.Now()
	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	_, err := rdb.Ping(pingCtx).Result()
	latency := time.Since(start).Seconds() * 1000 // in milliseconds

	if err != nil {
		return false, latency, err
	}
	return true, latency, nil
}
