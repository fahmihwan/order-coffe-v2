package main

import (
	"context"
	"fmt"
	"pos-coffeshop/app/route"
	"pos-coffeshop/internal/config"
	"pos-coffeshop/internal/logger"
	"pos-coffeshop/internal/postgres"
	"time"
)

func main() {
	logger.InitLogger()

	config.Load()

	// // Initiatlize keycloak (goCloak) client
	// keycloak.InitKeycloak()

	// // Init PostgreSQL connection
	postgres.InitConnection();
	
	// tp, err := opentelemetry.InitTracerProvider()
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// // Register our TracerProvider as the global so any imported
	// // instrumentation in the future will default to using it.
	// otel.SetTracerProvider(tp)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	defer func(ctx context.Context) {
		// Do not make the application hang when it is shutdown.
		ctx, cancel = context.WithTimeout(ctx, time.Second*5)
		defer cancel()
		// if err := tp.Shutdown(ctx); err != nil {
			// log.Fatal(err)
		// }
	}(ctx)

	// // Init kafka consumers
	// kafka.InitConsumer()

	// // Init kafka producer connection pool
	// kafka.InitProducer()

	// // Initialize task scheduler
	// scheduler.Init()
	// defer scheduler.Terminate()

	// // Init kafka consumer for "report-submit" topic
	// // go reportsubmit.InitReportSubmitConsumer()

	ginMode := 	config.AppConfig.Mode
	r := route.InitRoute(ginMode)

	// r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	if config.AppConfig.Mode == "debug" {
		// Serve static files from the 'docs' directory
		r.Static("/swagger-ext", "./docs/ext")
	}

	appPort := config.AppConfig.Port
	r.Run(fmt.Sprintf(":%d", appPort))
}
