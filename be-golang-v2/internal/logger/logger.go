package logger

import (
	"log"
	_config "pos-coffeshop/internal/config"

	"go.uber.org/zap"
)
var Logger *zap.Logger

func InitLogger() {
	var zapConfig zap.Config

	if _config.AppConfig.Mode == "release" {
		zapConfig = zap.NewDevelopmentConfig()
		zapConfig.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	}else {
		zapConfig = zap.NewProductionConfig()
		zapConfig.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	}

	zapLogger, err := zapConfig.Build()
	if err != nil {
		log.Fatal(err)
	}

	Logger = zapLogger
}



// func WriteError(span *trace.Span, err error) {
// 	if span != nil {
// 		(*span).SetAttributes(attribute.Bool("error", true))
// 		(*span).RecordError(err)
// 	}

// 	Logger.Error(err.Error())
// }

// func WriteWarn(span *trace.Span, message string) {
// 	if span != nil {
// 		(*span).AddEvent("warn", trace.WithAttributes(attribute.String("message", message)))
// 	}

// 	Logger.Warn(message)
// }

// func WriteInfo(span *trace.Span, message string) {
// 	if span != nil {
// 		(*span).AddEvent("info", trace.WithAttributes(attribute.String("message", message)))
// 	}

// 	Logger.Info(message)
// }

// func WriteDebug(span *trace.Span, message string) {
// 	if span != nil {
// 		(*span).AddEvent("debug", trace.WithAttributes(attribute.String("message", message)))
// 	}

// 	Logger.Debug(message)
// }


