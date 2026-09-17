package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Vote represents a participant vote entity in MongoDB
type Vote struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	PollID    primitive.ObjectID `json:"poll_id" bson:"poll_id"`
	PollCode  string             `json:"poll_code" bson:"poll_code"`
	OptionIDs []string           `json:"option_ids" bson:"option_ids"`
	VoterID   string             `json:"voter_id" bson:"voter_id"` // Anonymous participant/session ID
	CreatedAt time.Time          `json:"created_at" bson:"created_at"`
}

// CastVoteRequest represents incoming vote submission payload
type CastVoteRequest struct {
	OptionIDs []string `json:"option_ids" binding:"required"`
	VoterID   string   `json:"voter_id"`
}

// VoteResponse represents clean serialized vote confirmation
type VoteResponse struct {
	ID        string    `json:"id"`
	PollCode  string    `json:"poll_code"`
	OptionIDs []string  `json:"option_ids"`
	CreatedAt time.Time `json:"created_at"`
}

func (v *Vote) ToResponse() VoteResponse {
	return VoteResponse{
		ID:        v.ID.Hex(),
		PollCode:  v.PollCode,
		OptionIDs: v.OptionIDs,
		CreatedAt: v.CreatedAt,
	}
}
