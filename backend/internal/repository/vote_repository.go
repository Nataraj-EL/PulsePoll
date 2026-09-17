package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"pulsepoll/backend/internal/models"
)

var (
	ErrDuplicateVote = errors.New("You have already voted on this poll")
)

type VoteRepository interface {
	InitIndexes(ctx context.Context) error
	Create(ctx context.Context, vote *models.Vote) error
	HasVoted(ctx context.Context, pollID primitive.ObjectID, voterID string) (bool, error)
	GetVotesByPollID(ctx context.Context, pollID primitive.ObjectID) ([]*models.Vote, error)
}

type mongoVoteRepository struct {
	collection *mongo.Collection
}

func NewVoteRepository(db *mongo.Database) VoteRepository {
	return &mongoVoteRepository{
		collection: db.Collection("votes"),
	}
}

func (r *mongoVoteRepository) InitIndexes(ctx context.Context) error {
	models := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "poll_id", Value: 1}, {Key: "voter_id", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{{Key: "poll_id", Value: 1}},
		},
	}
	_, err := r.collection.Indexes().CreateMany(ctx, models)
	return err
}

func (r *mongoVoteRepository) Create(ctx context.Context, vote *models.Vote) error {
	vote.CreatedAt = time.Now()

	result, err := r.collection.InsertOne(ctx, vote)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "E11000") {
			return ErrDuplicateVote
		}
		return fmt.Errorf("failed to save vote in database: %w", err)
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		vote.ID = oid
	}
	return nil
}

func (r *mongoVoteRepository) HasVoted(ctx context.Context, pollID primitive.ObjectID, voterID string) (bool, error) {
	count, err := r.collection.CountDocuments(ctx, bson.M{
		"poll_id":  pollID,
		"voter_id": voterID,
	})
	if err != nil {
		return false, fmt.Errorf("failed to check existing vote: %w", err)
	}
	return count > 0, nil
}

func (r *mongoVoteRepository) GetVotesByPollID(ctx context.Context, pollID primitive.ObjectID) ([]*models.Vote, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"poll_id": pollID})
	if err != nil {
		return nil, fmt.Errorf("failed to fetch votes: %w", err)
	}
	defer cursor.Close(ctx)

	votes := make([]*models.Vote, 0)
	if err := cursor.All(ctx, &votes); err != nil {
		return nil, fmt.Errorf("failed to decode votes: %w", err)
	}
	return votes, nil
}
