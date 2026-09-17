package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

// EmailService defines operations for sending operational emails
type EmailService interface {
	SendWelcomeEmail(ctx context.Context, toEmail, userName string) error
}

type resendEmailService struct {
	apiKey string
	sender string
	client *http.Client
}

type resendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

// NewEmailService creates a new EmailService instance backed by Resend
func NewEmailService(apiKey string) EmailService {
	return &resendEmailService{
		apiKey: strings.TrimSpace(apiKey),
		sender: "PulsePoll <onboarding@resend.dev>",
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// SendWelcomeEmail sends a concise, polished welcome email via Resend API
func (s *resendEmailService) SendWelcomeEmail(ctx context.Context, toEmail, userName string) error {
	if s.apiKey == "" {
		log.Println("Notice: RESEND_API_KEY not set; skipping welcome email delivery")
		return nil
	}

	userName = strings.TrimSpace(userName)
	if userName == "" {
		userName = "Poll Creator"
	}

	subject := "Welcome to PulsePoll! ⚡"
	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to PulsePoll</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1117; color: #e6edf3; margin: 0; padding: 40px 20px;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%%" style="max-width: 560px; background-color: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 32px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
    <tr>
      <td style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #21262d;">
        <h1 style="color: #10b981; font-size: 28px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">⚡ PulsePoll</h1>
        <p style="color: #8b949e; font-size: 14px; margin: 4px 0 0 0;">Real-Time Interactive Polling Platform</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px 0;">
        <h2 style="color: #f0f6fc; font-size: 20px; margin: 0 0 16px 0;">Welcome aboard, %s! 👋</h2>
        <p style="color: #c9d1d9; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
          Thank you for joining PulsePoll. You are now ready to create instant live polls, gather real-time audience feedback, and visualize results with zero friction.
        </p>
        <div style="background-color: #0d1117; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 6px;">
          <p style="color: #10b981; font-weight: 600; font-size: 14px; margin: 0 0 6px 0;">🚀 Ready to launch your first poll?</p>
          <p style="color: #8b949e; font-size: 13px; margin: 0;">Create a poll in seconds and share the live link with your participants—no signup required for respondents!</p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="text-align: center; padding-top: 20px; border-top: 1px solid #21262d; color: #8b949e; font-size: 12px;">
        <p style="margin: 0;">Sent with ❤️ by the PulsePoll Team</p>
      </td>
    </tr>
  </table>
</body>
</html>`, userName)

	payload := resendEmailPayload{
		From:    s.sender,
		To:      []string{toEmail},
		Subject: subject,
		HTML:    htmlBody,
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewBuffer(jsonBytes))
	if err != nil {
		return fmt.Errorf("failed to create http request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute Resend HTTP request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("Resend API HTTP error %d: %s", resp.StatusCode, string(respBody))
	}

	log.Printf("Successfully dispatched welcome email to %s via Resend (Status %d)", toEmail, resp.StatusCode)
	return nil
}
