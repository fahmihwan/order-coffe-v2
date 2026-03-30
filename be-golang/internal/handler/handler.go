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

	// // error di book nil pointer
	// r.Route("/book", func(r chi.Router) {
	// 	// r.Mount("/", handler.BookHandler.Routes())
	// })

	return r
}
