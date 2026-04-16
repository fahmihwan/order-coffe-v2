package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ CategoryServiceInterface = &CategoryService{}

type CategoryServiceInterface interface {
	ListCategory(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Category, int, error)
	CreateCategory(ctx context.Context, category *model.Category) (*model.Category, error)
	GetCategoryByID(ctx context.Context, id string) (*model.Category, error)
	UpdateCategory(ctx context.Context, category *model.Category) (*model.Category, error)
	DeleteCategory(ctx context.Context, id string) error
}

type CategoryService struct {
	repo repository.Repository
}

func NewCategoryService(repo repository.Repository) *CategoryService {
	return &CategoryService{
		repo: repo,
	}
}

func (s *CategoryService) CreateCategory(ctx context.Context, category *model.Category) (*model.Category, error) {

	category.ID,_ = uuid.NewV7()
	// Generate a new UUID for the form
	category.CreatedAt = time.Now()
	category.UpdatedAt = time.Now()

	err := s.repo.Category.Create(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to create category: %w", err)
	}

	return category, nil
}

func (s *CategoryService) ListCategory(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Category, int, error) {

	offset := (page - 1) * limit

	categories, total, err := s.repo.Category.List(ctx, repository.FilterCategory{
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

	return categories, total, nil

}

func (s *CategoryService) GetCategoryByID(ctx context.Context, id string) (*model.Category, error) {

	category, err := s.repo.Category.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get category by ID: %w", err)
	}
	return category, nil
}

func (s *CategoryService) UpdateCategory(ctx context.Context, category *model.Category) (*model.Category, error) {
	category.UpdatedAt = time.Now()
	err := s.repo.Category.Update(ctx, category)
	if err != nil {
		return nil, fmt.Errorf("failed to update category: %w", err)
	}
	return category, nil
}

func (s *CategoryService) DeleteCategory(ctx context.Context, id string) error {
	err := s.repo.Category.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}
	return nil
}
