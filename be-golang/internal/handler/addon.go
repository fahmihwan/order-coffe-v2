package handler

import (
	"encoding/json"
	"net/http"
	"pos-coffeshop/internal/middleware"
	"pos-coffeshop/internal/response"
	"pos-coffeshop/internal/service"
	"pos-coffeshop/internal/util"
	"strconv"

	"github.com/go-chi/chi/v5"
)


type AddOnHandler struct {
	addOnService service.AddOnServiceInterface
	jwt         *util.JWTManager
}

type AddOnHandlerInterface interface {
	Routes() http.Handler
}

func NewAddOnHandler(addOnService service.AddOnServiceInterface, jwtm *util.JWTManager) AddOnHandlerInterface {
	return &AddOnHandler{
		addOnService: addOnService,
		jwt:         jwtm,
	}
}

func (h *AddOnHandler) Routes() http.Handler {
	r := chi.NewRouter()

	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}


	r.With(auditMiddleware("list-addon", "addon")).Get("/", h.ListAddOn)

	return r		
}

func (h *AddOnHandler) ListAddOn(w http.ResponseWriter, r *http.Request) {
	
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

	addons, total, err := h.addOnService.ListAddon(ctx, filters, search, page, limit, sortBy, orderBy)

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