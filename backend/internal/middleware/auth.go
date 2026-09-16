package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const CookieName = "pulsepoll_session"

// RequireAuth returns a middleware function that protects endpoints with JWT validation
func RequireAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		var tokenString string

		// 1. Try to read token from HTTP-Only cookie
		if cookie, err := c.Cookie(CookieName); err == nil && cookie != "" {
			tokenString = cookie
		} else {
			// 2. Fallback to Authorization header if present
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Authentication required. Please log in.",
				"status":  http.StatusUnauthorized,
			})
			return
		}

		// Parse and validate JWT token
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Session expired or invalid token. Please log in again.",
				"status":  http.StatusUnauthorized,
			})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid token claims",
				"status":  http.StatusUnauthorized,
			})
			return
		}

		subStr, ok := claims["sub"].(string)
		if !ok || subStr == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid user subject in token",
				"status":  http.StatusUnauthorized,
			})
			return
		}

		userID, err := primitive.ObjectIDFromHex(subStr)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "Unauthorized",
				"message": "Invalid user ID format",
				"status":  http.StatusUnauthorized,
			})
			return
		}

		// Attach authenticated user ID to Gin context
		c.Set("userID", userID)
		c.Next()
	}
}
