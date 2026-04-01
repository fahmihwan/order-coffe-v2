package handler

import (
	"net/http"
	internalMiddleware "pos-coffeshop/internal/middleware"
	"pos-coffeshop/internal/util"

	"github.com/go-chi/chi/v5"
)

type Handler interface {
	Routes() http.Handler
}

type HandlerInteface struct {
	MenuHandler MenuHandlerInterface
	CategoryHandler CategoryHandlerInterface
	CategoryMenuHandler CategoryMenuHandlerInterface
	AddOnGroupHandler AddOnGroupHandlerInterface
	AddOnOptionHandler AddOnOptionHandlerInterface
	MenuAddOnGroupHandler MenuAddOnGroupHandlerInterface
}

func NewRouter(handler *HandlerInteface, jwtm *util.JWTManager) *chi.Mux {
	r := chi.NewRouter()

	r.Use(internalMiddleware.RateLimitingMiddleware)
		// serve static files from ./public
	fs := http.FileServer(http.Dir("./public"))
	r.Handle("/public/*", http.StripPrefix("/public/", fs))

	// serve uploaded files from ./uploads
	uploadFS := http.FileServer(http.Dir("./uploads"))
	r.Handle("/uploads/*", http.StripPrefix("/uploads/", uploadFS))


	// isinya banyak routing nanti rencananya
	r.Route("/menu", func(r chi.Router) {
		r.Mount("/", handler.MenuHandler.Routes())
	})

	r.Route("/category", func(r chi.Router) {
		r.Mount("/", handler.CategoryHandler.Routes())
	})

	r.Route("/category-menu", func(r chi.Router) {
		r.Mount("/", handler.CategoryMenuHandler.Routes())
	})

	r.Route("/addon-group", func(r chi.Router) {
		r.Mount("/", handler.AddOnGroupHandler.Routes())
	})

	r.Route("/addon-option", func(r chi.Router) {
		r.Mount("/", handler.AddOnOptionHandler.Routes())
	})

	r.Route("/menu-addon", func(r chi.Router) {
		r.Mount("/", handler.MenuAddOnGroupHandler.Routes())
	})


	return r
}
