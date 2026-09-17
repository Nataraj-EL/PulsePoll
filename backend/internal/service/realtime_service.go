package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"strconv"
	"time"

	"github.com/redis/go-redis/v9"
	"pulsepoll/backend/internal/models"
	"pulsepoll/backend/internal/repository"
)

type RealtimeService interface {
	RecordVoteAndPublish(ctx context.Context, pollCode string, optionIDs []string) error
	GetLiveResults(ctx context.Context, poll *models.Poll) (*models.PollResultsResponse, error)
	SubscribeEvents(ctx context.Context, pollCode string) (<-chan string, func())
}

type realtimeService struct {
	redisClient *redis.Client
	pollRepo    repository.PollRepository
	voteRepo    repository.VoteRepository
}

func NewRealtimeService(redisClient *redis.Client, pollRepo repository.PollRepository, voteRepo repository.VoteRepository) RealtimeService {
	return &realtimeService{
		redisClient: redisClient,
		pollRepo:    pollRepo,
		voteRepo:    voteRepo,
	}
}

func (s *realtimeService) countsKey(pollCode string) string {
	return fmt.Sprintf("pulsepoll:counts:%s", pollCode)
}

func (s *realtimeService) channelKey(pollCode string) string {
	return fmt.Sprintf("pulsepoll:events:%s", pollCode)
}

func (s *realtimeService) RecordVoteAndPublish(ctx context.Context, pollCode string, optionIDs []string) error {
	if s.redisClient == nil {
		log.Println("⚠️ Notice: Redis client not configured, skipping realtime Pub/Sub publish")
		return nil
	}

	key := s.countsKey(pollCode)
	pipe := s.redisClient.Pipeline()

	// Increment individual option counters
	for _, optID := range optionIDs {
		pipe.HIncrBy(ctx, key, optID, 1)
	}
	// Increment total votes counter
	pipe.HIncrBy(ctx, key, "_total", 1)

	if _, err := pipe.Exec(ctx); err != nil {
		log.Printf("Error executing Redis pipeline for poll %s: %v", pollCode, err)
	}

	// Fetch updated results to construct live broadcast event payload
	poll, err := s.pollRepo.FindByCode(ctx, pollCode)
	if err != nil || poll == nil {
		return fmt.Errorf("failed to load poll for broadcasting: %w", err)
	}

	results, err := s.GetLiveResults(ctx, poll)
	if err != nil {
		return fmt.Errorf("failed to build live results payload: %w", err)
	}

	payloadBytes, err := json.Marshal(results)
	if err != nil {
		return fmt.Errorf("failed to marshal realtime event payload: %w", err)
	}

	// Publish updated live results to Redis Pub/Sub channel
	if err := s.redisClient.Publish(ctx, s.channelKey(pollCode), string(payloadBytes)).Err(); err != nil {
		log.Printf("Error publishing to Redis channel %s: %v", s.channelKey(pollCode), err)
	}

	return nil
}

func (s *realtimeService) GetLiveResults(ctx context.Context, poll *models.Poll) (*models.PollResultsResponse, error) {
	key := s.countsKey(poll.Code)

	var optionCounts map[string]int64
	var totalVotes int64
	var err error

	if s.redisClient != nil {
		exists, err := s.redisClient.Exists(ctx, key).Result()
		if err == nil && exists > 0 {
			rawCounts, err := s.redisClient.HGetAll(ctx, key).Result()
			if err == nil && len(rawCounts) > 0 {
				optionCounts = make(map[string]int64)
				for field, valStr := range rawCounts {
					v, _ := strconv.ParseInt(valStr, 10, 64)
					if field == "_total" {
						totalVotes = v
					} else {
						optionCounts[field] = v
					}
				}
			}
		}
	}

	// Reconcile / Initialize from MongoDB if Redis counts are missing
	if optionCounts == nil {
		optionCounts, totalVotes, err = s.reconcileFromMongoDB(ctx, poll)
		if err != nil {
			return nil, fmt.Errorf("failed to reconcile live results from MongoDB: %w", err)
		}
	}

	results := make([]models.PollResultItem, 0, len(poll.Options))
	for _, opt := range poll.Options {
		vCount := optionCounts[opt.ID]
		var pct float64
		if totalVotes > 0 {
			pct = math.Round((float64(vCount)/float64(totalVotes))*1000) / 10
		}
		results = append(results, models.PollResultItem{
			OptionID:   opt.ID,
			Text:       opt.Text,
			Votes:      vCount,
			Percentage: pct,
		})
	}

	return &models.PollResultsResponse{
		PollCode:   poll.Code,
		Question:   poll.Question,
		ChoiceType: poll.ChoiceType,
		Status:     poll.Status,
		TotalVotes: totalVotes,
		Results:    results,
	}, nil
}

func (s *realtimeService) reconcileFromMongoDB(ctx context.Context, poll *models.Poll) (map[string]int64, int64, error) {
	votes, err := s.voteRepo.GetVotesByPollID(ctx, poll.ID)
	if err != nil {
		return nil, 0, err
	}

	counts := make(map[string]int64)
	var totalVotes int64 = int64(len(votes))

	for _, v := range votes {
		for _, optID := range v.OptionIDs {
			counts[optID]++
		}
	}

	// Cache reconciled counts in Redis if available
	if s.redisClient != nil {
		key := s.countsKey(poll.Code)
		fields := make(map[string]interface{})
		fields["_total"] = totalVotes
		for optID, count := range counts {
			fields[optID] = count
		}
		if len(fields) > 0 {
			_ = s.redisClient.HSet(ctx, key, fields).Err()
			_ = s.redisClient.Expire(ctx, key, 24*time.Hour).Err()
		}
	}

	return counts, totalVotes, nil
}

func (s *realtimeService) SubscribeEvents(ctx context.Context, pollCode string) (<-chan string, func()) {
	out := make(chan string, 16)
	if s.redisClient == nil {
		close(out)
		return out, func() {}
	}

	pubsub := s.redisClient.Subscribe(ctx, s.channelKey(pollCode))
	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			select {
			case out <- msg.Payload:
			default:
				// Skip if buffer full
			}
		}
		close(out)
	}()

	cleanup := func() {
		_ = pubsub.Close()
	}

	return out, cleanup
}
