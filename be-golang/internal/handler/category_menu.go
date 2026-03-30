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

type CategoryMenuHandler struct {
	categoryMenuService service.CateogoryMenuServiceInterface
	jwt                 *util.JWTManager
}

type CategoryMenuHandlerInterface interface {
	Routes() http.Handler
}


func NewCategoryMenuHandler(categoryMenuService service.CateogoryMenuServiceInterface, jwtm *util.JWTManager) CategoryMenuHandlerInterface {
	return &CategoryMenuHandler{
		categoryMenuService: categoryMenuService,
		jwt:                 jwtm,
	}
}

func (h *CategoryMenuHandler) Routes() http.Handler {
	r := chi.NewRouter()
	
	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}

	r.With(auditMiddleware("list-category-menu", "category-menu")).Get("/", h.ListCategoryMenu)
	r.With(auditMiddleware("create-category-menu", "category-menu")).Post("/", h.CreateCategoryMenu)
	r.With(auditMiddleware("get-category-menu", "category-menu")).Get("/{id}", h.GetCategoryMenuByID)
	r.With(auditMiddleware("update-category-menu", "category-menu")).Put("/{id}", h.UpdateCategoryMenu)
	r.With(auditMiddleware("delete-category-menu", "category-menu")).Delete("/{id}", h.DeleteCategoryMenu)
	return  r
}

func (h *CategoryMenuHandler) ListCategoryMenu(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()

	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	sortBy := r.URL.Query().Get("sort_by")
	orderBy := r.URL.Query().Get("order_by")
	search := r.URL.Query().Get("search")

	filters := make(map[string]string)
	// filters["category_name"] = r.URL.Query().Get("category_name")

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit < 1 {
		limit = 10
	}

	// Call the service to get the category menu list
	categoryMenus, total, err := h.categoryMenuService.ListCategoryMenu(ctx, filters, search, page, limit, sortBy, orderBy)	
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
		To:          (page-1)*limit + len(categoryMenus),
		Pages:       (total + limit - 1) / limit,
		Total:       total,
	}

	// Write the response
	successResponse := response.NewSuccessResponseWithPagination(categoryMenus, pagination)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)		
}

func (h *CategoryMenuHandler) CreateCategoryMenu(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req = new(request.CategoryMenuRequest)

	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	categoryMenu := req.ToCategoryMenu()
	createCategoryMenu, err := h.categoryMenuService.CreateCategoryMenu(ctx, categoryMenu)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating category menu: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(createCategoryMenu)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)	
}	

func (h *CategoryMenuHandler) GetCategoryMenuByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	categoryMenu, err := h.categoryMenuService.GetCategoryMenuByID(ctx, id)
	if(err != nil){
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)	
		return
	}

	successResponse := response.NewSuccessResponse(categoryMenu)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)	
}	


func (h *CategoryMenuHandler) UpdateCategoryMenu(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req = new(request.CategoryMenuRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	ids := chi.URLParam(r, "id")
	categoryMenu := req.ToCategoryMenu()

	id, err := uuid.Parse(ids)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	categoryMenu.ID = id

	updateCategoryMenu, err := h.categoryMenuService.UpdateCategoryMenu(ctx, categoryMenu)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse(updateCategoryMenu)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}	

func (h *CategoryMenuHandler) DeleteCategoryMenu(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	err := h.categoryMenuService.DeleteCategoryMenu(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse(nil)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)	
}