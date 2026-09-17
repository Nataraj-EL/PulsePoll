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
	apiKey        string
	sender        string
	testRecipient string
	client        *http.Client
}

type resendEmailPayload struct {
	From    string   `json:"from"`
	To      []string `json:"to"`
	Subject string   `json:"subject"`
	HTML    string   `json:"html"`
}

type resendSuccessResponse struct {
	ID string `json:"id"`
}

type resendErrorResponse struct {
	StatusCode int    `json:"statusCode"`
	Name       string `json:"name"`
	Message    string `json:"message"`
}

// NewEmailService creates a new EmailService instance backed by Resend
func NewEmailService(apiKey, sender, testRecipient string) EmailService {
	sender = strings.TrimSpace(sender)
	if sender == "" {
		sender = "PulsePoll <onboarding@resend.dev>"
	}
	return &resendEmailService{
		apiKey:        strings.TrimSpace(apiKey),
		sender:        sender,
		testRecipient: strings.TrimSpace(testRecipient),
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

	// First attempt to send to the registered user's email
	subject := "Welcome to PulsePoll! ⚡"
	err := s.dispatch(ctx, toEmail, subject, userName)
	if err == nil {
		return nil
	}

	// Handle Resend Sandbox restriction (when onboarding@resend.dev is restricted to owner email)
	errStr := err.Error()
	if strings.Contains(errStr, "only send testing emails to your own email address") || strings.Contains(errStr, "HTTP 403") {
		ownerEmail := s.testRecipient
		if ownerEmail == "" {
			// Extract owner email inside parentheses from Resend error payload if present
			if start := strings.Index(errStr, "("); start != -1 {
				if end := strings.Index(errStr[start:], ")"); end != -1 {
					ownerEmail = errStr[start+1 : start+end]
				}
			}
		}

		if ownerEmail != "" && !strings.EqualFold(ownerEmail, toEmail) {
			log.Printf("⚠️ [Resend Sandbox Mode] Cannot deliver directly to %s via onboarding@resend.dev. Rerouting test welcome email to verified owner (%s)...", toEmail, ownerEmail)
			sandboxSubject := fmt.Sprintf("Welcome to PulsePoll! ⚡ [Test for: %s]", toEmail)
			fallbackErr := s.dispatch(ctx, ownerEmail, sandboxSubject, userName)
			if fallbackErr == nil {
				log.Printf("✅ [Resend Sandbox] Welcome email successfully delivered to owner %s for signup user %s", ownerEmail, toEmail)
				return nil
			}
			return fallbackErr
		}
	}

	return err
}

func (s *resendEmailService) dispatch(ctx context.Context, recipient, subject, userName string) error {
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
        <p style="margin: 0;">Sent with ❤️ by Nataraj EL</p>
      </td>
    </tr>
  </table>
</body>
</html>`, userName)

	payload := resendEmailPayload{
		From:    s.sender,
		To:      []string{recipient},
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

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read Resend response body: %w", err)
	}

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		var errResp resendErrorResponse
		_ = json.Unmarshal(respBody, &errResp)
		if errResp.Message != "" {
			return fmt.Errorf("Resend API rejected request (HTTP %d, %s): %s", resp.StatusCode, errResp.Name, errResp.Message)
		}
		return fmt.Errorf("Resend API HTTP error %d: %s", resp.StatusCode, string(respBody))
	}

	var succResp resendSuccessResponse
	_ = json.Unmarshal(respBody, &succResp)

	log.Printf("✅ [Resend] Successfully dispatched welcome email to %s (Status %d, Email ID: %s)", recipient, resp.StatusCode, succResp.ID)
	return nil
}
