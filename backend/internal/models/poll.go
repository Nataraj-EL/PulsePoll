package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChoiceType string
type PollStatus string

const (
	ChoiceTypeSingle   ChoiceType = "single"
	ChoiceTypeMultiple ChoiceType = "multiple"

	PollStatusDraft  PollStatus = "draft"
	PollStatusActive PollStatus = "active"
	PollStatusClosed PollStatus = "closed"
)

// PollOption represents a single option in a poll
type PollOption struct {
	ID   string `json:"id" bson:"id"`
	Text string `json:"text" bson:"text"`
}

// Poll represents a poll entity stored in MongoDB
type Poll struct {
	ID         primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Code       string             `json:"code" bson:"code"` // Short public identifier (e.g. "849201")
	CreatorID  primitive.ObjectID `json:"creator_id" bson:"creator_id"`
	Question   string             `json:"question" bson:"question"`
	Options    []PollOption       `json:"options" bson:"options"`
	ChoiceType ChoiceType         `json:"choice_type" bson:"choice_type"`
	Status     PollStatus         `json:"status" bson:"status"`
	CreatedAt  time.Time          `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time          `json:"updated_at" bson:"updated_at"`
}

// CreatePollRequest payload
type CreatePollRequest struct {
	Question   string     `json:"question" binding:"required"`
	Options    []string   `json:"options" binding:"required"`
	ChoiceType ChoiceType `json:"choice_type"`
	Publish    bool       `json:"publish"` // Optional flag to publish immediately upon creation
}

// PollResponse returns clean serialized poll data
type PollResponse struct {
	ID         string       `json:"id"`
	Code       string       `json:"code"`
	CreatorID  string       `json:"creator_id"`
	Question   string       `json:"question"`
	Options    []PollOption `json:"options"`
	ChoiceType ChoiceType   `json:"choice_type"`
	Status     PollStatus   `json:"status"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

func (p *Poll) ToResponse() PollResponse {
	return PollResponse{
		ID:         p.ID.Hex(),
		Code:       p.Code,
		CreatorID:  p.CreatorID.Hex(),
		Question:   p.Question,
		Options:    p.Options,
		ChoiceType: p.ChoiceType,
		Status:     p.Status,
		CreatedAt:  p.CreatedAt,
		UpdatedAt:  p.UpdatedAt,
	}
}
