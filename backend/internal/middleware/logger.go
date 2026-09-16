package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger returns a custom structured HTTP logger middleware
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latency := time.Since(start)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		if query != "" {
			path = path + "?" + query
		}

		log.Printf("[HTTP] %d | %13v | %s | %-7s %s",
			statusCode,
			latency,
			clientIP,
			method,
			path,
		)
	}
}
