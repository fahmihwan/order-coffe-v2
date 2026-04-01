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
}

func NewRouter(handler *HandlerInteface, jwtm *util.JWTManager) *chi.Mux {
	r := chi.NewRouter()

	r.Use(internalMiddleware.RateLimitingMiddleware)

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

	r.Route("/addon", func(r chi.Router) {
		r.Mount("/", handler.AddOnGroupHandler.Routes())
	})


	return r
}
