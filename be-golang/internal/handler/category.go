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

type CategoryHandler struct {
	categoryService service.CategoryServiceInterface
	jwt         *util.JWTManager
}

type CategoryHandlerInterface interface {
	Routes() http.Handler
}

func NewCategoryHandler(categoryService service.CategoryServiceInterface, jwtm *util.JWTManager) CategoryHandlerInterface {
	return &CategoryHandler{
		categoryService: categoryService,
		jwt:            jwtm,
	}
}

func (h *CategoryHandler) Routes() http.Handler {
	r := chi.NewRouter()

	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}

	// r.Use(middleware.AuthJWT(h.jwt))

	r.With(auditMiddleware("list-category", "category")).Get("/", h.ListCategory)
	r.With(auditMiddleware("create-category", "category")).Post("/", h.CreateCategory)
	r.With(auditMiddleware("get-category", "category")).Get("/{id}", h.GetCategory)
	r.With(auditMiddleware("update-category", "category")).Put("/{id}", h.UpdateCategory)
	r.With(auditMiddleware("delete-category", "category")).Delete("/{id}", h.DeleteCategory)
	return r

}

func (h *CategoryHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req = new(request.CategoryRequest)

	if err := request.ParseURLEncodedForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	category := req.ToCategory()
	createCategory, err := h.categoryService.CreateCategory(ctx, category)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating category: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(createCategory)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *CategoryHandler) ListCategory(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	sortBy := r.URL.Query().Get("sort_by")
	orderBy := r.URL.Query().Get("order_by")
	search := r.URL.Query().Get("search")

	// Set up filters
	filters := make(map[string]string)
	filters["category_name"] = r.URL.Query().Get("category_name")

	page, err := strconv.Atoi(pageStr)
	// Parse page and limit
	if err != nil {
		page = 1 // Default to page 1 if parsing fails
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10 //Default to limit of 10 if parsing fails
	}

	categories, total, err := h.categoryService.ListCategory(ctx, filters, search, page, limit, sortBy, orderBy)
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
		To:          (page-1)*limit + len(categories),
		Pages:       (total + limit - 1) / limit,
		Total:       total,
	}

	// Create success response with pagination
	successResponse := response.NewSuccessResponseWithPagination(categories, pagination)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}

func (h *CategoryHandler) GetCategory(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	category, err := h.categoryService.GetCategoryByID(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse(category)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}

func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	// Implementation for updating a category
	ctx := r.Context()

	var req = new(request.CategoryRequest)
	if err := request.ParseURLEncodedForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}
	ids := chi.URLParam(r, "id")
	category := req.ToCategory()

	id, err := uuid.Parse(ids)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	category.ID = id

	updatedCategory, err := h.categoryService.UpdateCategory(ctx, category)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating category: %v", err), http.StatusInternalServerError)
		return
	}

	response := response.NewSuccessResponse(updatedCategory)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *CategoryHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	id := chi.URLParam(r, "id")

	err := h.categoryService.DeleteCategory(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse("Category deleted successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}
