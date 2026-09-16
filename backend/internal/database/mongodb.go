package database

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// ConnectMongoDB initializes and verifies a connection to MongoDB
func ConnectMongoDB(ctx context.Context, uri, dbName string) (*mongo.Client, *mongo.Database, error) {
	clientOpts := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create MongoDB client: %w", err)
	}

	// Ping the primary database node
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx, readpref.Primary()); err != nil {
		_ = client.Disconnect(ctx)
		return nil, nil, fmt.Errorf("failed to ping MongoDB at %s: %w", uri, err)
	}

	log.Printf("Successfully connected to MongoDB database: %s", dbName)
	return client, client.Database(dbName), nil
}

// PingMongoDB checks MongoDB connectivity and measures latency
func PingMongoDB(ctx context.Context, client *mongo.Client) (bool, float64, error) {
	if client == nil {
		return false, 0, fmt.Errorf("MongoDB client is nil")
	}

	start := time.Now()
	pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	err := client.Ping(pingCtx, readpref.Primary())
	latency := time.Since(start).Seconds() * 1000 // in milliseconds

	if err != nil {
		return false, latency, err
	}
	return true, latency, nil
}
