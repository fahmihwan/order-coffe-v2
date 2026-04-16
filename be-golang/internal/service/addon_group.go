package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ AddOnGroupServiceInterface = &AddOnGroupService{}

type AddOnGroupServiceInterface interface {
	ListAddOnGroup(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.AddOnGroup, int, error)
	CreateAddOnGroup(ctx context.Context, addon *model.AddOnGroup) (*model.AddOnGroup, error)
	GetAddOnGroupByID(ctx context.Context, id string) (*model.AddOnGroup, error)
	UpdateAddOnGroup(ctx context.Context, addon *model.AddOnGroup) (*model.AddOnGroup, error)
	DeleteAddOnGroup(ctx context.Context, id string) error
}


type AddOnGroupService struct {
	repo repository.Repository
}

func NewAddOnGroupService(repo repository.Repository) *AddOnGroupService {
	return &AddOnGroupService{
		repo: repo,
	}
}

func (s *AddOnGroupService) ListAddOnGroup(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.AddOnGroup, int, error) {

	offset := (page - 1) * limit

	addons, total, err := s.repo.AddOnGroup.List(ctx, repository.FilterAddOnGroup{
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
		return nil, 0, fmt.Errorf("failed to list addons: %w", err)
	}

	return addons, total, nil
}	

func (s *AddOnGroupService) CreateAddOnGroup(ctx context.Context, addon *model.AddOnGroup) (*model.AddOnGroup, error)  {
	now := time.Now()

	addon.ID, _ = uuid.NewV7()
	addon.CreatedAt = now
	addon.UpdatedAt = now
	
	err := s.repo.AddOnGroup.Create(ctx, addon)
	if err != nil {
		return nil, fmt.Errorf("failed to create addon: %w", err)
	}

	return addon, nil
}

func (s *AddOnGroupService) GetAddOnGroupByID(ctx context.Context, id string) (*model.AddOnGroup, error) {
	addon, err := s.repo.AddOnGroup.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get addon by id: %w", err)
	}

	return addon, nil
}

func (s *AddOnGroupService) UpdateAddOnGroup(ctx context.Context, addon *model.AddOnGroup) (*model.AddOnGroup, error) {
	addon.UpdatedAt = time.Now()

	err := s.repo.AddOnGroup.Update(ctx, addon)
	if err != nil {
		return nil, fmt.Errorf("failed to update addon: %w", err)
	}
	return addon, nil
}


func (s *AddOnGroupService) DeleteAddOnGroup(ctx context.Context, id string) error {
	err := s.repo.AddOnGroup.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete addon: %w", err)
	}
	return nil
}