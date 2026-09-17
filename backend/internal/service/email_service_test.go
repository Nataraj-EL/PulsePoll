package service

import (
	"context"
	"testing"
)

func TestSendWelcomeEmailEmptyAPIKey(t *testing.T) {
	svc := NewEmailService("")
	err := svc.SendWelcomeEmail(context.Background(), "user@example.com", "Test User")
	if err != nil {
		t.Fatalf("expected no error when RESEND_API_KEY is empty, got: %v", err)
	}
}
