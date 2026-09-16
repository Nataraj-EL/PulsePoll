package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pulsepoll/backend/internal/models"
)

var (
	ErrPollNotFound = errors.New("poll not found")
)

// PollRepository defines MongoDB operations for Poll entities
type PollRepository interface {
	InitIndexes(ctx context.Context) error
	Create(ctx context.Context, poll *models.Poll) error
	FindByCreatorID(ctx context.Context, creatorID primitive.ObjectID) ([]*models.Poll, error)
	FindByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error)
	FindByCode(ctx context.Context, code string) (*models.Poll, error)
	UpdateStatus(ctx context.Context, id primitive.ObjectID, status models.PollStatus) error
}

type mongoPollRepository struct {
	collection *mongo.Collection
}

// NewPollRepository returns a new PollRepository instance
func NewPollRepository(db *mongo.Database) PollRepository {
	return &mongoPollRepository{
		collection: db.Collection("polls"),
	}
}

func (r *mongoPollRepository) InitIndexes(ctx context.Context) error {
	// Index on code (unique) and creator_id
	models := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "code", Value: 1}},
			Options: options.Index().SetUnique(true).SetSparse(true),
		},
		{
			Keys: bson.D{{Key: "creator_id", Value: 1}, {Key: "created_at", Value: -1}},
		},
	}
	_, err := r.collection.Indexes().CreateMany(ctx, models)
	return err
}

func (r *mongoPollRepository) Create(ctx context.Context, poll *models.Poll) error {
	poll.CreatedAt = time.Now()
	poll.UpdatedAt = time.Now()

	result, err := r.collection.InsertOne(ctx, poll)
	if err != nil {
		return fmt.Errorf("failed to insert poll into database: %w", err)
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		poll.ID = oid
	}
	return nil
}

func (r *mongoPollRepository) FindByCreatorID(ctx context.Context, creatorID primitive.ObjectID) ([]*models.Poll, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cursor, err := r.collection.Find(ctx, bson.M{"creator_id": creatorID}, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to query polls by creator: %w", err)
	}
	defer cursor.Close(ctx)

	polls := make([]*models.Poll, 0)
	if err := cursor.All(ctx, &polls); err != nil {
		return nil, fmt.Errorf("failed to decode polls: %w", err)
	}
	return polls, nil
}

func (r *mongoPollRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Poll, error) {
	var poll models.Poll
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&poll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("database query error: %w", err)
	}
	return &poll, nil
}

func (r *mongoPollRepository) FindByCode(ctx context.Context, code string) (*models.Poll, error) {
	var poll models.Poll
	err := r.collection.FindOne(ctx, bson.M{"code": code}).Decode(&poll)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return nil, nil
		}
		return nil, fmt.Errorf("database query error: %w", err)
	}
	return &poll, nil
}

func (r *mongoPollRepository) UpdateStatus(ctx context.Context, id primitive.ObjectID, status models.PollStatus) error {
	update := bson.M{
		"$set": bson.M{
			"status":     status,
			"updated_at": time.Now(),
		},
	}
	res, err := r.collection.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return fmt.Errorf("failed to update poll status: %w", err)
	}
	if res.MatchedCount == 0 {
		return ErrPollNotFound
	}
	return nil
}
