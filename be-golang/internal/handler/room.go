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

type RoomHandler struct {
	roomService service.RoomServiceInterface
	jwt         *util.JWTManager
}

type RoomHandlerInterface interface {
	Routes() http.Handler
}

func NewRoomHandler(roomService service.RoomServiceInterface, jwtm *util.JWTManager) RoomHandlerInterface {
	return &RoomHandler{
		roomService: roomService,
		jwt:            jwtm,
	}
}

func (h *RoomHandler) Routes() http.Handler {
	r := chi.NewRouter()

	getResourceID := func(r *http.Request) string {
		return chi.URLParam(r, "id")
	}

	auditMiddleware := func(action, resourceType string) func(http.Handler) http.Handler {
		return middleware.AuditMiddleware(action, resourceType, getResourceID)
	}

	// r.Use(middleware.AuthJWT(h.jwt))

	r.With(auditMiddleware("list-room", "room")).Get("/", h.ListRoom)
	r.With(auditMiddleware("create-room", "room")).Post("/", h.CreateRoom)
	r.With(auditMiddleware("get-room", "room")).Get("/{id}", h.GetRoom)
	r.With(auditMiddleware("update-room", "room")).Put("/{id}", h.UpdateRoom)
	r.With(auditMiddleware("delete-room", "room")).Delete("/{id}", h.DeleteRoom)
	return r

}

func (h *RoomHandler) CreateRoom(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	var req = new(request.RoomRequest)

	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}

	room := req.ToRoom()
	createRoom, err := h.roomService.CreateRoom(ctx, room)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error creating room: %v", err), http.StatusInternalServerError)
		return
	}
	response := response.NewSuccessResponse(createRoom)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

func (h *RoomHandler) ListRoom(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	sortBy := r.URL.Query().Get("sort_by")
	orderBy := r.URL.Query().Get("order_by")
	search := r.URL.Query().Get("search")

	// Set up filters
	filters := make(map[string]string)
	filters["room_name"] = r.URL.Query().Get("room_name")

	page, err := strconv.Atoi(pageStr)
	// Parse page and limit
	if err != nil {
		page = 1 // Default to page 1 if parsing fails
	}

	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10 //Default to limit of 10 if parsing fails
	}

	rooms, total, err := h.roomService.ListRoom(ctx, filters, search, page, limit, sortBy, orderBy)
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
		To:          (page-1)*limit + len(rooms),
		Pages:       (total + limit - 1) / limit,
		Total:       total,
	}

	// Create success response with pagination
	successResponse := response.NewSuccessResponseWithPagination(rooms, pagination)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}

func (h *RoomHandler) GetRoom(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	id := chi.URLParam(r, "id")

	room, err := h.roomService.GetRoomByID(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse(room)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}

func (h *RoomHandler) UpdateRoom(w http.ResponseWriter, r *http.Request) {
	// Implementation for updating a room
	ctx := r.Context()

	var req = new(request.RoomRequest)
	if err := request.ParseForm(r, req); err != nil {
		middleware.HandleValidationErrors(err, w)
		return
	}
	ids := chi.URLParam(r, "id")
	room := req.ToRoom()

	id, err := uuid.Parse(ids)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}

	room.ID = id

	updatedRoom, err := h.roomService.UpdateRoom(ctx, room)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error updating room: %v", err), http.StatusInternalServerError)
		return
	}

	response := response.NewSuccessResponse(updatedRoom)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *RoomHandler) DeleteRoom(w http.ResponseWriter, r *http.Request) {

	ctx := r.Context()
	id := chi.URLParam(r, "id")

	err := h.roomService.DeleteRoom(ctx, id)
	if err != nil {
		response := response.NewErrorResponse(err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	successResponse := response.NewSuccessResponse("Room deleted successfully")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(successResponse)
}
