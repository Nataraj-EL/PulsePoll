package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// ConnectRedis initializes and verifies a connection to Redis (supports Addr+Password or REDIS_URL/rediss://)
func ConnectRedis(ctx context.Context, addr, password, redisURL string) (*redis.Client, error) {
	var opts *redis.Options
	var err error

	if redisURL != "" {
		opts, err = redis.ParseURL(redisURL)
		if err != nil {
			return nil, fmt.Errorf("failed to parse REDIS_URL: %w", err)
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
		return nil, fmt.Errorf("failed to ping Redis: %w", err)
	}

	log.Printf("Successfully connected to Redis instance at: %s", opts.Addr)
	return rdb, nil
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
