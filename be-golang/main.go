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

	err = container.Provide(func(db *gorm.DB) repository.CategoryRepository {
		return *repository.NewCategoryRepository(db)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide CategoryRepository: %v", err))
	}

	err = container.Provide(func(db *gorm.DB) repository.CategoryMenuRepository {
		return *repository.NewCategoryMenuRepository(db)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide CategoryMenuRepository: %v", err))
	}

	err = container.Provide(func(db *gorm.DB) repository.AddOnGroupRepository {
		return *repository.NewAddOnGroupRepository(db)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide AddOnRepository: %v", err))
	}

	err = container.Provide(func(db *gorm.DB) repository.AddOnOptionRepository {
		return *repository.NewAddOnOptionRepository(db)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide AddOnRepository: %v", err))
	}

	err = container.Provide(func(db *gorm.DB) repository.MenuAddOnGroupRepository {
		return *repository.NewMenuAddOnGroupRepository(db)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide MenuAddOnGroupRepository: %v", err))
	}

	err = container.Provide(func(db *gorm.DB) repository.Repository {
		return repository.Repository{
			Menu:       repository.NewMenuRepository(db),
			Category:  repository.NewCategoryRepository(db),
			CategoryMenu: repository.NewCategoryMenuRepository(db),
			AddOnGroup:      repository.NewAddOnGroupRepository(db),
			AddOnOption: 	repository.NewAddOnOptionRepository(db),
			MenuAddOnGroup: repository.NewMenuAddOnGroupRepository(db),
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

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) *service.CategoryService {
		return service.NewCategoryService(repo)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide CategoryService: %v", err))
	}

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) *service.CategoryMenuService {
		return service.NewCategoryMenuService(repo)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide CategoryMenuService: %v", err))
	}

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) *service.AddOnGroupService {
		return service.NewAddOnGroupService(repo)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide AddOnService: %v", err))
	}
	

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) *service.AddOnOptionService {
		return service.NewAddOnOptionService(repo)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide AddOnService: %v", err))
	}


	err = container.Provide(func(db *gorm.DB, repo repository.Repository) *service.MenuAddOnGroupService {
		return service.NewMenuAddOnGroupService(repo)
	})

	if err != nil {
		panic(fmt.Sprintf("Failed to provide MenuAddOnGroupService: %v", err))
	}

	err = container.Provide(func(db *gorm.DB, repo repository.Repository) service.Service {
		return service.Service{
			Menu:       service.NewMenuService(repo),
			Category:   service.NewCategoryService(repo),
			CategoryMenu: service.NewCategoryMenuService(repo),
			AddOnGroup:      service.NewAddOnGroupService(repo),
			AddOnOption:     service.NewAddOnOptionService(repo),
			MenuAddOnGroup: service.NewMenuAddOnGroupService(repo),
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

	if err := container.Provide(handler.NewCategoryHandler); err != nil {
		panic(fmt.Sprintf("Failed to provide CategoryHandler: %v", err))
	}

	if err := container.Provide(handler.NewCategoryMenuHandler); err != nil {
		panic(fmt.Sprintf("Failed to provide CategoryMenuHandler: %v", err))
	}


	if err := container.Provide(handler.NewAddOnGroupHandler); err != nil {
		panic(fmt.Sprintf("Failed to provide AddOnHandler: %v", err))
	}

	if err := container.Provide(handler.NewAddOnOptionHandler); err != nil {
		panic(fmt.Sprintf("Failed to provide AddOnOptionHandler: %v", err))
	}


	if err := container.Provide(handler.NewMenuAddOnGroupHandler); err != nil {
		panic(fmt.Sprintf("Failed to provide MenuAddOnGroupHandler: %v", err))
	}


	// 2) provide agregator HandlerInteface (isi field-fieldnya dari DI)
	if err := container.Provide(func(
		MenuService *service.MenuService,
		CategoryService *service.CategoryService,
		CategoryMenuService *service.CategoryMenuService,
		AddOnGroupService *service.AddOnGroupService,
		AddOnOptionService *service.AddOnOptionService,
		MenuAddOnGroupService *service.MenuAddOnGroupService,
		jwtManager *util.JWTManager,
	) *handler.HandlerInteface {
		return &handler.HandlerInteface{
			MenuHandler:    handler.NewMenuHandler(MenuService, jwtManager),
			CategoryHandler: handler.NewCategoryHandler(CategoryService, jwtManager),
			CategoryMenuHandler: handler.NewCategoryMenuHandler(CategoryMenuService, jwtManager),
			AddOnGroupHandler: handler.NewAddOnGroupHandler(AddOnGroupService, jwtManager),
			AddOnOptionHandler: handler.NewAddOnOptionHandler(AddOnOptionService, jwtManager),
			MenuAddOnGroupHandler: handler.NewMenuAddOnGroupHandler(MenuAddOnGroupService, jwtManager),
		}
	}); err != nil {
		panic(fmt.Sprintf("Failed to provide HandlerInteface: %v", err))
	}
}
