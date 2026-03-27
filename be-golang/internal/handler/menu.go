package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"pos-coffeshop/internal/middleware"
	"pos-coffeshop/internal/request"
	"pos-coffeshop/internal/response"
	"pos-coffeshop/internal/service"
	"pos-coffeshop/internal/util"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type MenuHandler struct {
	menuService service.MenuServiceInteface
	jwt         *util.JWTManager
}

type MenuHandlerInterface interface {
	Routes() http.Handler
}

func NewMenuHandler(menuService service.MenuServiceInteface, jwtm *util.JWTManager) MenuHandlerInterface {
	return &MenuHandler{
		menuService: menuService,
		jwt:         jwtm,
	}
}

func (h *MenuHandler) Routes() http.Handler {
	r := chi.NewRouter()

	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}

	// r.Use(middleware.AuthJWT(h.jwt))

	r.With(auditMiddleware("list-menu", "menu")).Get("/", h.LisMenu)
	// r.Get("/", h.LisMenu)
	r.With(auditMiddleware("create-menu", "menu")).Post("/", h.CreateMenu)
	r.With(auditMiddleware("get-menu", "menu")).Get("/{id}", h.GetMenu)
	r.With(auditMiddleware("update-menu", "menu")).Put("/{id}", h.UpdateMenu)
	r.With(auditMiddleware("delete-menu", "menu")).Delete("/{id}", h.DeleteMenu)
	return r

}

func (h *MenuHandler) CreateMenu(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req = new(request.MenuRequest)

	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	fmt.Print(req)

	menu := req.ToMenu()
	createMenu, err := h.menuService.CreateMenu(ctx, menu)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating form: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(createMenu)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *MenuHandler) LisMenu(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	sortBy := r.URL.Query().Get("sort_by")
	orderBy := r.URL.Query().Get("order_by")
	search := r.URL.Query().Get("search")

	// Set up filters
	filters := make(map[string]string)
	filters["name"] = r.URL.Query().Get("name")

	page, err := strconv.Atoi(pageStr)
	// Parse page and limit
	if err != nil {
		page = 1 // Default to page 1 if parsing fails
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10 //Default to limit of 10 if parsing fails
	}

	menus, total, err := h.menuService.ListMenu(ctx, filters, search, page, limit, sortBy, orderBy)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Calculate pagination
	pagination := response.Pagination{
		CurrentPage: page,
		From:        (page-1)*limit + 1,
		To:          (page-1)*limit + len(menus),
		Pages:       (total + limit - 1) / limit,
		Total:       total,
	}

	// Create success response with pagination
	successResponse := response.NewSuccessResponseWithPagination(menus, pagination)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}

func (h *MenuHandler) GetMenu(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	book, err := h.menuService.GetMenuByID(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse(book)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}

func (h *MenuHandler) UpdateMenu(w http.ResponseWriter, r *http.Request) {
	// Implementation for updating a book2
	ctx := r.Context()

	var req = new(request.MenuRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}
	ids := chi.URLParam(r, "id")
	menu := req.ToMenu()
	// id, err := strconv.ParseInt(ids, 10, 64)
	id, err := uuid.Parse(ids)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	menu.ID = id

	updatedMenu, err := h.menuService.UpdateMenu(ctx, menu)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating book: %v", err), http.StatusInternalServerError)
		return
	}

	response := response.NewSuccessResponse(updatedMenu)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *MenuHandler) DeleteMenu(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	id := chi.URLParam(r, "id")

	err := h.menuService.DeleteMenu(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse("Menu deleted successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}
