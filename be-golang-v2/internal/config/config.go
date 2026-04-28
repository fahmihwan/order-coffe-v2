package config

import (
	"fmt"
	"log"
	"os"

	"github.com/caarlos0/env/v6"
	"github.com/joho/godotenv"
)


var AppConfig = struct {
	AppName     string `env:"APP_NAME"`
	AppServiceName string `env:"APP_SERVICE_NAME"`
	Mode        string `env:"APP_MODE"`
	Port        int    `env:"APP_PORT"`
	Host            string `env:"APP_HOST"`
	PDFGeneratorURL string `env:"PDF_GENERATOR_URL"`
	DBPostgre ConfigPostgre
	// DB	ConfigDB
	// OpenTelemetry OpenTelemetryConfig
	// Kafka         KafkaConfig
	// Keycloak      Keycloak
	// MongoDB       MongoDB
	// GCS           GCS
	// Redis         Redis
}{}

// type OpenTelemetryConfig struct {
// 	EndpointURL string `env:"OPEN_TELEMETRY_ENDPOINT"`
// }

type ConfigDB struct {
	Name    	string `env:"DB_NAME"  envDefault:"bei"`
	Host 	    string `env:"DB_HOST"`
	Port    	string    `env:"DB_PORT"`
	Username	string `env:"DB_USER"`
	Password 	string `env:"DB_PASSWORD"`	
}



type ConfigPostgre struct  {
	DatabaseURL string `env:"DATABASE_URL"`
	// Storage              StorageConfig
	// JWT struct {
	// 	Secret    string `mapstructure:"JWT_SECRET"`
	// 	ExpiryMin int    `mapstructure:"JWT_EXPIRY_MIN"` // menit
	// 	Issuer    string `mapstructure:"JWT_ISSUER"`
		
	// } `mapstructure:",squash"`
}


// type Keycloak struct {
// 	Secret   string `env:"KEYCLOAK_CLIENT_SECRET"`
// 	ClientID string `env:"KEYCLOAK_CLIENT_ID"`
// 	URL      string `env:"KEYCLOAK_URL"`
// 	Realm    string `env:"KEYCLOAK_REALM"`
// 	TokenURL string `env:"KEYCLOAK_TOKEN_URL"`
// }

// type KafkaConfig struct {
// 	Host      string `env:"KAFKA_HOST"`
// 	Port      string `env:"KAFKA_PORT"`
// 	GroupName string `env:"KAFKA_GROUP_NAME"`
// }



// type MongoDB struct {
// 	Host     string `env:"MONGODB_HOST"`
// 	Port     string `env:"MONGODB_PORT"`
// 	Username string `env:"MONGODB_USERNAME"`
// 	Password string `env:"MONGODB_PASSWORD"`
// 	DBName   string `env:"MONGODB_DBNAME"`
// 	Protocol string `env:"MONGODB_PROTOCOL"`
// 	Param    string `env:"MONGODB_PARAM"`
// }


// type GCS struct {
// 	BucketName         string `env:"GCS_BUCKET_NAME"`
// 	APIURI             string `env:"GCS_API_URI"`
// 	CredentialFilePath string `env:"GCS_CREDENTIAL_FILE_PATH"`
// }



// type Redis struct {
// 	Host     string `env:"REDIS_HOST"`
// 	Port     string `env:"REDIS_PORT"`
// 	Password string `env:"REDIS_PASSWORD"`
// }


func Load() {
	log.Println("Loading config file")

	if checkEnvFile("./.env"){
		if err := godotenv.Load(); err != nil {
			panic(fmt.Sprintf("Failed to load config from .env file. Error: %s", err.Error()))
		}
		log.Println("Config has been loaded!")
	} else {
		log.Print(".env File not found! Falling back to OS environment variables.")
	}
	
	if err := env.Parse(&AppConfig); err != nil {
		panic(err)
	}
}		


func checkEnvFile(path string) bool {
	info, err := os.Stat("./.env")
	if os.IsNotExist(err){
		return false
	}
	return !(info.IsDir())
}		