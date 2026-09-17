package database

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

// ConnectMongoDB initializes and verifies a connection to MongoDB
func ConnectMongoDB(ctx context.Context, uri, dbName string) (*mongo.Client, *mongo.Database, error) {
	if strings.Contains(uri, "<") || strings.Contains(uri, ">") {
		return nil, nil, fmt.Errorf("MONGO_URI contains unreplaced placeholder angle brackets '<...>'; please replace with actual MongoDB Atlas credentials in Render environment variables")
	}

	clientOpts := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to create MongoDB client: %w", err)
	}

	// Ping the primary database node
	pingCtx, cancel := context.WithTimeout(ctx, 8*time.Second)
	defer cancel()

	if err := client.Ping(pingCtx, readpref.Primary()); err != nil {
		_ = client.Disconnect(ctx)
		if strings.Contains(err.Error(), "tls: internal error") || strings.Contains(err.Error(), "handshake") {
			log.Printf("⚠️ MongoDB Atlas TLS Error: Ensure MongoDB Atlas Network Access allows '0.0.0.0/0' (Access from Anywhere) and credentials in MONGO_URI are valid.")
		}
		return nil, nil, fmt.Errorf("failed to ping MongoDB: %w", err)
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
