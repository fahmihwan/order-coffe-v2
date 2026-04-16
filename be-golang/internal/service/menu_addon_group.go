package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ MenuAddOnGroupServiceInterface = &MenuAddOnGroupService{}

type MenuAddOnGroupServiceInterface interface {
	ListMenuAddOnGroup(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Menu, int, error)
	CreateMenuAddOnGroup(ctx context.Context, menuAddOn *model.MenuAddOnGroup) (*model.MenuAddOnGroup, error)
	// GetCategoryMenuByID(ctx context.Context, id string) (*model.CategoryMenu, error)
	// UpdateCategoryMenu(ctx context.Context, categoryMenu *model.CategoryMenu) (*model.CategoryMenu, error)
	GetMenuAddOnGroupByMenuID(ctx context.Context, menuID string) (*model.Menu, error)
	DeleteMenuAddGroup(ctx context.Context, id string) error
}

type MenuAddOnGroupService struct {
	repo repository.Repository	
}

func NewMenuAddOnGroupService(repo repository.Repository) *MenuAddOnGroupService {
	return &MenuAddOnGroupService{
		repo: repo,
	}
}

func (s *MenuAddOnGroupService) ListMenuAddOnGroup(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Menu, int, error) {

	offset := (page - 1) * limit

	menuAddOnGroups, total, err := s.repo.MenuAddOnGroup.List(ctx, repository.FilterMenuAddOnGroup{
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
		return nil, 0, fmt.Errorf("failed to list categories: %w", err)
	}

	return menuAddOnGroups, total, nil
}	


func (s *MenuAddOnGroupService) CreateMenuAddOnGroup(ctx context.Context, menuAddOnGroups *model.MenuAddOnGroup) (*model.MenuAddOnGroup, error) {

	menuAddOnGroups.ID, _ = uuid.NewV7()
	// Generate a new UUID for the form
	menuAddOnGroups.CreatedAt = time.Now()
	menuAddOnGroups.UpdatedAt = time.Now()

	err := s.repo.MenuAddOnGroup.Create(ctx, menuAddOnGroups)
	if err != nil {
		return nil, fmt.Errorf("failed to create category menu: %w", err)
	}

	return menuAddOnGroups, nil
}

func (s *MenuAddOnGroupService) GetMenuAddOnGroupByMenuID(ctx context.Context, id string) (*model.Menu, error) {

	menuAddOnGroup, err := s.repo.MenuAddOnGroup.GetMenuAddOnGroupByMenuID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get category menu by ID: %w", err)
	}

	return menuAddOnGroup, nil
}

// func (s *MenuAddOnGroupService) UpdateCategoryMenu(ctx context.Context, categoryMenu *model.CategoryMenu) (*model.CategoryMenu, error) {

// 	categoryMenu.UpdatedAt = time.Now()

// 	err := s.repo.CategoryMenu.Update(ctx, categoryMenu)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to update category menu: %w", err)
// 	}

// 	return categoryMenu, nil
// }

func (s *MenuAddOnGroupService) DeleteMenuAddGroup(ctx context.Context, id string) error {

	err := s.repo.MenuAddOnGroup.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete category menu: %w", err)
	}

	return nil
}