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


type AddOnOptionHandler struct {
	addOnOptionService service.AddOnOptionServiceInterface
	jwt               *util.JWTManager
}

type AddOnOptionHandlerInterface interface {
	Routes() http.Handler
}

func NewAddOnOptionHandler(addOnOptionService service.AddOnOptionServiceInterface, jwtm *util.JWTManager) AddOnOptionHandlerInterface {
	return &AddOnOptionHandler{
		addOnOptionService: addOnOptionService,
		jwt:         jwtm,
	}
}

func (h *AddOnOptionHandler) Routes() http.Handler {
	r := chi.NewRouter()

	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}


	r.With(auditMiddleware("list-addon-option", "addon-option")).Get("/", h.ListAddOnOption)
	r.With(auditMiddleware("create-addon-option", "addon-option")).Post("/", h.CreateAddOnOption)
	r.With(auditMiddleware("get-addon-option", "addon-option")).Get("/{id}", h.GetAddOnOptionByID)
	r.With(auditMiddleware("update-addon-option", "addon-option")).Put("/{id}", h.UpdateAddOnOption)
	r.With(auditMiddleware("delete-addon-option", "addon-option")).Delete("/{id}", h.DeleteAddOnOption)

	return r		
}

func (h *AddOnOptionHandler) ListAddOnOption(w http.ResponseWriter, r *http.Request) {
	
	ctx := r.Context()
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	sortBy := r.URL.Query().Get("sort_by")
	orderBy := r.URL.Query().Get("order_by")
	search := r.URL.Query().Get("search")


	filters := make(map[string]string)
	// filters["search"] = search

	page, err := strconv.Atoi(pageStr)
	// Parse page and limit
	if err != nil {
		page = 1 // Default to page 1 if parsing fails
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10 //Default to limit of 10 if parsing fails
	}

	addons, total, err := h.addOnOptionService.ListAddOnOption(ctx, filters, search, page, limit, sortBy, orderBy)

	if err != nil {
		http.Error(w, "Failed to list addons", http.StatusInternalServerError)
		return
	}
	pagination := response.Pagination{
		CurrentPage: page,
		From:        (page-1)*limit + 1,
		To:          (page-1)*limit + len(addons),
		Pages:       (total + limit - 1) / limit,
		Total:       total,
	}

	successResponse := response.NewSuccessResponseWithPagination(addons, pagination)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}		

func (h *AddOnOptionHandler) CreateAddOnOption(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req = new(request.AddOnOptionRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	addOnOption := req.ToAddOnOption()
	createAddOnOption, err := h.addOnOptionService.CreateAddOnOption(ctx, addOnOption)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating addOnOption: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(createAddOnOption)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)	
}

func (h *AddOnOptionHandler) GetAddOnOptionByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	addOnOption, err := h.addOnOptionService.GetAddOnOptionByID(ctx, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting addOnOption: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(addOnOption)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)	
}

func (h *AddOnOptionHandler) UpdateAddOnOption(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ids := chi.URLParam(r, "id")

	var req = new(request.AddOnOptionRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}


	addOnOption := req.ToAddOnOption()
	
	
	id, err := uuid.Parse(ids)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	addOnOption.ID = id
	updateAddOnOption, err := h.addOnOptionService.UpdateAddOnOption(ctx, addOnOption)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating addOnOption: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(updateAddOnOption)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)	
}

func (h *AddOnOptionHandler) DeleteAddOnOption(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	err := h.addOnOptionService.DeleteAddOnOption(ctx, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting addOnOption: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(nil)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)	
}