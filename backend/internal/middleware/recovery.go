package middleware

import (
	"log"
	"net/http"
	"runtime/debug"

	"github.com/gin-gonic/gin"
)

// Recovery returns panic recovery middleware that sends structured 500 JSON responses
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("[PANIC RECOVERY] %v\nStack trace:\n%s", err, string(debug.Stack()))

				c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
					"error":   "Internal Server Error",
					"message": "An unexpected error occurred. Please try again later.",
					"status":  http.StatusInternalServerError,
				})
			}
		}()

		c.Next()
	}
}
