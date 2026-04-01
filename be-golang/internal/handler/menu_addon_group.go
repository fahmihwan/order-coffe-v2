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

type MenuAddOnGroupHandler struct {
	menuAddOnGroupService service.MenuAddOnGroupServiceInterface
	jwt                 *util.JWTManager
}

type MenuAddOnGroupHandlerInterface interface {
	Routes() http.Handler
}


func NewMenuAddOnGroupHandler(menuAddOnGroupService service.MenuAddOnGroupServiceInterface, jwtm *util.JWTManager) MenuAddOnGroupHandlerInterface {
	return &MenuAddOnGroupHandler{
		menuAddOnGroupService: menuAddOnGroupService,
		jwt:                 jwtm,
	}
}

func (h *MenuAddOnGroupHandler) Routes() http.Handler {
	r := chi.NewRouter()
	
	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}

	r.With(auditMiddleware("list-menu-add-on-group", "menu-add-on-group")).Get("/", h.ListMenuAddOnGroup)
	// r.With(auditMiddleware("create-menu-add-on-group", "menu-add-on-group")).Post("/", h.CreateMenuAddOnGroup)
	// r.With(auditMiddleware("get-menu-add-on-group", "menu-add-on-group")).Get("/{id}", h.GetMenuAddOnGroupByID)
	// r.With(auditMiddleware("update-menu-add-on-group", "menu-add-on-group")).Put("/{id}", h.UpdateMenuAddOnGroup)
	// r.With(auditMiddleware("delete-menu-add-on-group", "menu-add-on-group")).Delete("/{id}", h.DeleteMenuAddOnGroup)
	return  r
}

func (h *MenuAddOnGroupHandler) ListMenuAddOnGroup(w http.ResponseWriter, r *http.Request) {

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
	categoryMenus, total, err := h.menuAddOnGroupService.ListMenuAddOnGroup(ctx, filters, search, page, limit, sortBy, orderBy)	
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}
	// fmt.Printf("Total category menus: %+v\n",categoryMenus )
	data := response.FromMenuModels(categoryMenus)

	// Calculate pagination
	pagination := response.Pagination{
		CurrentPage: page,
		From:        (page-1)*limit + 1,
		To:          (page-1)*limit + len(data),
		Pages:       (total + limit - 1) / limit,
		Total:       total,
	}

	// Write the response
	successResponse := response.NewSuccessResponseWithPagination(data, pagination)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)		
}

// func (h *MenuAddOnGroupHandler) CreateCategoryMenu(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	var req = new(request.CategoryMenuRequest)
// 	if err := request.ParseForm(r, req); err != nil {
// 		middleware.HandleValidationErrors(err, w)
// 		return
// 	}

// 	categoryMenu := req.ToCategoryMenu()
// 	createCategoryMenu, err := h.menuAddOnGroupService.CreateCategoryMenu(ctx, categoryMenu)
// 	if err != nil {
// 		http.Error(w, fmt.Sprintf("Error creating category menu: %v", err), http.StatusInternalServerError)
// 		return
// 	}
// 	response := response.NewSuccessResponse(createCategoryMenu)
// 	w.WriteHeader(http.StatusCreated)
// 	json.NewEncoder(w).Encode(response)	
// }	

// func (h *MenuAddOnGroupHandler) GetCategoryMenuByID(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	id := chi.URLParam(r, "id")

// 	categoryMenu, err := h.menuAddOnGroupService.GetCategoryMenuByID(ctx, id)
// 	if(err != nil){
// 		response := response.NewErrorResponse(err.Error())
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(response)	
// 		return
// 	}

// 	successResponse := response.NewSuccessResponse(categoryMenu)
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(successResponse)	
// }	


// func (h *MenuAddOnGroupHandler) UpdateCategoryMenu(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()

// 	var req = new(request.CategoryMenuRequest)
// 	if err := request.ParseForm(r, req); err != nil {
// 		middleware.HandleValidationErrors(err, w)
// 		return
// 	}

// 	ids := chi.URLParam(r, "id")
// 	categoryMenu := req.ToCategoryMenu()
// 	id, err := uuid.Parse(ids)
// 	if err != nil {
// 		http.Error(w, "invalid id", http.StatusBadRequest)
// 		return
// 	}

// 	categoryMenu.ID = id

// 	updateCategoryMenu, err := h.menuAddOnGroupService.UpdateCategoryMenu(ctx, categoryMenu)
// 	if err != nil {
// 		response := response.NewErrorResponse(err.Error())
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	successResponse := response.NewSuccessResponse(updateCategoryMenu)
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(successResponse)
// }	

// func (h *MenuAddOnGroupHandler) DeleteCategoryMenu(w http.ResponseWriter, r *http.Request) {
// 	ctx := r.Context()
// 	id := chi.URLParam(r, "id")

// 	err := h.menuAddOnGroupService.DeleteCategoryMenu(ctx, id)
// 	if err != nil {
// 		response := response.NewErrorResponse(err.Error())
// 		w.WriteHeader(http.StatusInternalServerError)
// 		json.NewEncoder(w).Encode(response)
// 		return
// 	}

// 	successResponse := response.NewSuccessResponse(nil)
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(successResponse)	
// }