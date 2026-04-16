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


type AddOnGroupHandler struct {
	addOnGroupService service.AddOnGroupServiceInterface
	jwt               *util.JWTManager
}

type AddOnGroupHandlerInterface interface {
	Routes() http.Handler
}

func NewAddOnGroupHandler(addOnGroupService service.AddOnGroupServiceInterface, jwtm *util.JWTManager) AddOnGroupHandlerInterface {
	return &AddOnGroupHandler{
		addOnGroupService: addOnGroupService,
		jwt:         jwtm,
	}
}

func (h *AddOnGroupHandler) Routes() http.Handler {
	r := chi.NewRouter()

	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}


	r.With(auditMiddleware("list-addon-group", "addon-group")).Get("/", h.ListAddOnGroup)
	r.With(auditMiddleware("create-addon-group", "addon-group")).Post("/", h.CreateAddOnGroup)	
	r.With(auditMiddleware("get-addon-group", "addon-group")).Get("/{id}", h.GetAddOnGroupByID)
	r.With(auditMiddleware("update-addon-group", "addon-group")).Put("/{id}", h.UpdateAddOnGroup)
	r.With(auditMiddleware("delete-addon-group", "addon-group")).Delete("/{id}", h.DeleteAddOnGroup)

	return r		
}

func (h *AddOnGroupHandler) ListAddOnGroup(w http.ResponseWriter, r *http.Request) {
	
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

	addons, total, err := h.addOnGroupService.ListAddOnGroup(ctx, filters, search, page, limit, sortBy, orderBy)

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

func (h *AddOnGroupHandler) CreateAddOnGroup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req = new(request.AddOnGroupRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	addOnGroup := req.ToAddOnGroup()
	createAddOnGroup, err := h.addOnGroupService.CreateAddOnGroup(ctx, addOnGroup)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating addOnGroup: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(createAddOnGroup)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)	
}

func (h *AddOnGroupHandler) GetAddOnGroupByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	addOnGroup, err := h.addOnGroupService.GetAddOnGroupByID(ctx, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting addOnGroup: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(addOnGroup)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)	
}

func (h *AddOnGroupHandler) UpdateAddOnGroup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ids := chi.URLParam(r, "id")

	var req = new(request.AddOnGroupRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}


	addOnGroup := req.ToAddOnGroup()
	
	
	id, err := uuid.Parse(ids)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	addOnGroup.ID = id
	updateAddOnGroup, err := h.addOnGroupService.UpdateAddOnGroup(ctx, addOnGroup)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating addOnGroup: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(updateAddOnGroup)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)	
}

func (h *AddOnGroupHandler) DeleteAddOnGroup(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	id := chi.URLParam(r, "id")

	err := h.addOnGroupService.DeleteAddOnGroup(ctx, id)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error deleting addOnGroup: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(nil)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)	
}