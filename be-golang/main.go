package main

import (
	"fmt"
	"log"
	"net/http"
	"pos-coffeshop/internal/config"
	"pos-coffeshop/internal/handler"
	"pos-coffeshop/internal/repository"
	"pos-coffeshop/internal/service"
	"pos-coffeshop/internal/util"
	"pos-coffeshop/pkg/database"

	"time"

	"github.com/go-chi/chi/v5"
	"go.uber.org/dig"
	"gorm.io/gorm"
)



func main() {

	cfg, err := config.LoadConfig()

	// // // Create a new DI container
	container := dig.New()

	err = container.Provide(func() *config.Config { return cfg })
	if err != nil {
		panic(fmt.Sprintf("Failed to provide configuration: %v", err))
	}

	// Provide PostgreSQL database
	err = container.Provide(database.NewPostgresDB)
	if err != nil {
		panic(fmt.Sprintf("Failed to provide PostgreSQL database: %v", err))
	}
	_ = container.Invoke(func(db *gorm.DB) {
		// middleware.InitializeValidator(db)
	})

	//Provide JWT Manager
	err = container.Provide(func(cfg *config.Config) *util.JWTManager {
		exp := time.Duration(cfg.JWT.ExpiryMin) * time.Minute
		return util.NewJWTManager(cfg.JWT.Secret, cfg.JWT.Issuer, exp)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide JWTManager: %v", err))
	}
	// ===================================================
	// Provide router (chi.Mux implements http.Handler)
	provideRepositories(container)

	provideServices(container)

	provideHandler(container)

	//  provide router
	if err := container.Provide(handler.NewRouter); err != nil {
		panic(fmt.Sprintf("Failed to provide router: %v", err))
	}

	// server: minta *chi.Mux
	if err := container.Provide(func(r *chi.Mux) *http.Server {
		return &http.Server{
			Addr:    ":8080",
			Handler: r,
		}
	}); err != nil {
		panic(fmt.Sprintf("Failed to provide server: %v", err))
	}

	if err := container.Invoke(func(srv *http.Server) {
		log.Println("listening on http://localhost:8080")
		log.Fatal(srv.ListenAndServe())
	}); err != nil {
		panic(fmt.Sprintf("Failed to start server: %v", err))
	}
}


func provideRepositories(container *dig.Container) {
	var err error

	err = container.Provide(func(db *gorm.DB) repository.MenuRepository {
		return *repository.NewMenuRepository(db)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide MenuRepository: %v", err))
	}

	err = container.Provide(func(db *gorm.DB) repository.Repository {
		return repository.Repository{
			Menu: repository.NewMenuRepository(db),
		}
	})
}

func provideServices(container *dig.Container) {
	var err error

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) *service.MenuService {
		return service.NewMenuService(repo)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide BookService: %v", err))
	}

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) service.Service {
		return service.Service{
			Menu:  service.NewMenuService(repo),
		}
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide Sector: %v", err))
	}
}

func provideHandler(container *dig.Container) {
	// 1) provide semua sub-handler (nanti tinggal tambah baris di sini)
	if err := container.Provide(handler.NewMenuHandler); err != nil {
		panic(fmt.Sprintf("Failed to provide UserHandler: %v", err))
	}

	// 2) provide agregator HandlerInteface (isi field-fieldnya dari DI)
	if err := container.Provide(func(
		MenuService *service.MenuService,
		jwtManager *util.JWTManager,
	) *handler.HandlerInteface {
		return &handler.HandlerInteface{
			MenuHandler: handler.NewMenuHandler(MenuService, jwtManager),
		}
	}); err != nil {
		panic(fmt.Sprintf("Failed to provide HandlerInteface: %v", err))
	}
}
