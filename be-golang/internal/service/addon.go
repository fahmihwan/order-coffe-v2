package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
)

var _ AddOnServiceInterface = &AddOnService{}

type AddOnServiceInterface interface {
	ListAddon(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.AddOnGroup, int, error)
}

type AddOnService struct {
	repo repository.Repository
}

func NewAddOnService(repo repository.Repository) *AddOnService {
	return &AddOnService{
		repo: repo,
	}
}

func (s *AddOnService) ListAddon(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.AddOnGroup, int, error) {

	offset := (page - 1) * limit

	addons, total, err := s.repo.AddOn.List(ctx, repository.FilterAddon{
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