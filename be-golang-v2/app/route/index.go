package route

import (
	"fmt"
	"log"
	"log/syslog"
	"pos-coffeshop/internal/config"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)


func InitRoute(mode string) *gin.Engine {
	gin.SetMode(mode)
	ginEngine := gin.New()


	// Configure CORS only for localhost development
	if config.AppConfig.Mode == "debug" {	
		ginEngine.Use(cors.New(cors.Config{
			AllowOrigins:     []string{"*"},
			AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
			AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
			ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			MaxAge:           86400,
		}))
	}
		
	// Set up syslog writer
	if config.AppConfig.Mode == "production" {
		writer, err := syslog.New(syslog.LOG_ERR,"pos coffe")
		if err != nil {
			log.Fatalf("failed to create syslog writer: %v", err)
		}
		defer writer.Close()

		ginEngine.Use(SyslogLogger(writer))
	}

	// API V1 Group
	apiGroup := ginEngine.Group("")
	// apiGroup.Use(middleware.Auth())

	apiGroup.GET("/ping", func(gCtx *gin.Context) {
		gCtx.JSON(200, gin.H{"message": "pong"})
	})

	// Init form routes
	// InitNewsRoutes(apiGroup)

	// Init news attachment routes
	// InitNewsAttachmentRoutes(apiGroup)

	return ginEngine	
}


// SyslogLogger returns a Gin middleware that logs requests to syslog
func SyslogLogger(writer *syslog.Writer) gin.HandlerFunc {
	logger := log.New(writer, "", 0)
	isDebugMode := gin.Mode() == gin.DebugMode

	return func(c *gin.Context) {
		startTime := time.Now()
		c.Next()
		duration := time.Since(startTime)

		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method
		path := c.Request.URL.Path

		logMessage := fmt.Sprintf("%s %s %s %d %s", clientIP, method, path, statusCode, duration)

		if len(c.Errors) > 0 {
			for _, e := range c.Errors.Errors() {
				logger.Printf("ERROR: %v", e)
			}
		} else if isDebugMode || statusCode >= 400 {
			if statusCode >= 400 {
				logger.Printf("ERROR: %s", logMessage)
			} else {
				logger.Printf("INFO: %s", logMessage)
			}
		}
	}
}
