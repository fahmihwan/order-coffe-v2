package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
)

var _ MenuServiceInteface = &MenuService{}

type MenuServiceInteface interface {
	ListMenu(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Menu, int, error)
	// CreateBook(ctx context.Context, book *model.Book) (*model.Book, error)
	// GetBookByID(ctx context.Context, id string) (*model.Book, error)
	// UpdateBook(ctx context.Context, book *model.Book) (*model.Book, error)
	// DeleteBook(ctx context.Context, id string) error
}

type MenuService struct {
	repo repository.Repository
}

func NewMenuService(repo repository.Repository) *MenuService {
	return &MenuService{
		repo: repo,
	}
}

// func (s *MenuService) CreateBook(ctx context.Context, book *model.Book) (*model.Book, error) {

// 	// Generate a new UUID for the form
// 	book.CreatedAt = time.Now()
// 	book.UpdatedAt = time.Now()

// 	err := s.repo.Book.Create(ctx, book)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to create form: %w", err)
// 	}

// 	return book, nil
// }

func (s *MenuService) ListMenu(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Menu, int, error) {

	offset := (page - 1) * limit

	menus, total, err := s.repo.Menu.List(ctx, repository.FilterMenu{
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
		return nil, 0, fmt.Errorf("failed to list forms: %w", err)
	}

	return menus, total, nil

}

// func (s *MenuService) GetBookByID(ctx context.Context, id string) (*model.Book, error) {

// 	book, err := s.repo.Book.GetByID(ctx, id)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to get book by ID: %w", err)
// 	}
// 	return book, nil
// }

// func (s *MenuService) UpdateBook(ctx context.Context, book *model.Book) (*model.Book, error) {
// 	book.UpdatedAt = time.Now()
// 	err := s.repo.Book.Update(ctx, book)
// 	if err != nil {
// 		return nil, fmt.Errorf("failed to update form: %w", err)
// 	}
// 	return book, nil
// }

// func (s *MenuService) DeleteBook(ctx context.Context, id string) error {
// 	err := s.repo.Book.Delete(ctx, id)
// 	if err != nil {
// 		return fmt.Errorf("failed to delete form: %w", err)
// 	}
// 	return nil
// }
