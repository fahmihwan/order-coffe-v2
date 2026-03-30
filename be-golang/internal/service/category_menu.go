package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ CateogoryMenuServiceInterface = &CategoryMenuService{}

type CateogoryMenuServiceInterface interface {
	ListCategoryMenu(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.CategoryMenu, int, error)
	CreateCategoryMenu(ctx context.Context, categoryMenu *model.CategoryMenu) (*model.CategoryMenu, error)
	GetCategoryMenuByID(ctx context.Context, id string) (*model.CategoryMenu, error)
	UpdateCategoryMenu(ctx context.Context, categoryMenu *model.CategoryMenu) (*model.CategoryMenu, error)
	DeleteCategoryMenu(ctx context.Context, id string) error
}

type CategoryMenuService struct {
	repo repository.Repository	
}

func NewCategoryMenuService(repo repository.Repository) *CategoryMenuService {
	return &CategoryMenuService{
		repo: repo,
	}
}

func (s *CategoryMenuService) ListCategoryMenu(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.CategoryMenu, int, error) {

	offset := (page - 1) * limit

	categoryMenus, total, err := s.repo.CategoryMenu.List(ctx, repository.FilterCategoryMenu{
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

	return categoryMenus, total, nil
}	

func (s *CategoryMenuService) CreateCategoryMenu(ctx context.Context, categoryMenu *model.CategoryMenu) (*model.CategoryMenu, error) {

	categoryMenu.ID, _ = uuid.NewV7()
	// Generate a new UUID for the form
	categoryMenu.CreatedAt = time.Now()
	categoryMenu.UpdatedAt = time.Now()

	err := s.repo.CategoryMenu.Create(ctx, categoryMenu)
	if err != nil {
		return nil, fmt.Errorf("failed to create category menu: %w", err)
	}

	return categoryMenu, nil
}

func (s *CategoryMenuService) GetCategoryMenuByID(ctx context.Context, id string) (*model.CategoryMenu, error) {

	categoryMenu, err := s.repo.CategoryMenu.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get category menu by ID: %w", err)
	}

	return categoryMenu, nil
}

func (s *CategoryMenuService) UpdateCategoryMenu(ctx context.Context, categoryMenu *model.CategoryMenu) (*model.CategoryMenu, error) {

	categoryMenu.UpdatedAt = time.Now()

	err := s.repo.CategoryMenu.Update(ctx, categoryMenu)
	if err != nil {
		return nil, fmt.Errorf("failed to update category menu: %w", err)
	}

	return categoryMenu, nil
}

func (s *CategoryMenuService) DeleteCategoryMenu(ctx context.Context, id string) error {

	err := s.repo.CategoryMenu.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete category menu: %w", err)
	}

	return nil
}