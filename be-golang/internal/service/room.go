package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ RoomServiceInterface = &RoomService{}

type RoomServiceInterface interface {
	ListRoom(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Room, int, error)
	CreateRoom(ctx context.Context, room *model.Room) (*model.Room, error)
	GetRoomByID(ctx context.Context, id string) (*model.Room, error)
	UpdateRoom(ctx context.Context, room *model.Room) (*model.Room, error)
	DeleteRoom(ctx context.Context, id string) error
}

type RoomService struct {
	repo repository.Repository
}

func NewRoomService(repo repository.Repository) *RoomService {
	return &RoomService{
		repo: repo,
	}
}

func (s *RoomService) CreateRoom(ctx context.Context, room *model.Room) (*model.Room, error) {

	room.ID,_ = uuid.NewV7()
	// Generate a new UUID for the form
	room.CreatedAt = time.Now()
	room.UpdatedAt = time.Now()

	err := s.repo.Room.Create(ctx, room)
	if err != nil {
		return nil, fmt.Errorf("failed to create room: %w", err)
	}

	return room, nil
}

func (s *RoomService) ListRoom(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Room, int, error) {

	offset := (page - 1) * limit

	rooms, total, err := s.repo.Room.List(ctx, repository.FilterRoom{
		Pagination: repository.Pagination{
			Page:    page,
			Limit:   limit,
			Offset:  offset,
			SortBy:  sortBy,
			OrderBy: orderBy,
			Search:  search,
		},
	})

	
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list rooms: %w", err)
	}

	return rooms, total, nil

}

func (s *RoomService) GetRoomByID(ctx context.Context, id string) (*model.Room, error) {

	room, err := s.repo.Room.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get room by ID: %w", err)
	}
	return room, nil
}

func (s *RoomService) UpdateRoom(ctx context.Context, room *model.Room) (*model.Room, error) {
	room.UpdatedAt = time.Now()
	err := s.repo.Room.Update(ctx, room)
	if err != nil {
		return nil, fmt.Errorf("failed to update room: %w", err)
	}
	return room, nil
}

func (s *RoomService) DeleteRoom(ctx context.Context, id string) error {
	err := s.repo.Room.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}
	return nil
}
