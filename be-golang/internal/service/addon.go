package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ AddOnServiceInterface = &AddOnService{}

type AddOnServiceInterface interface {
	ListAddon(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.AddOnGroup, int, error)
	CreateAddon(ctx context.Context, addon *model.AddOnGroup) (*model.AddOnGroup, error)
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

func (s *AddOnService) CreateAddon(ctx context.Context, addon *model.AddOnGroup) (*model.AddOnGroup, error)  {
	now := time.Now()

	addon.ID, _ = uuid.NewV7()
	addon.CreatedAt = now
	addon.UpdatedAt = now
	
	for i := range addon.AddOnOptions {
		addon.AddOnOptions[i].ID, _ = uuid.NewV7()
		addon.AddOnOptions[i].AddOnGroupID = addon.ID
		addon.AddOnOptions[i].CreatedAt = now
		addon.AddOnOptions[i].UpdatedAt = now
	}

	err := s.repo.AddOn.Create(ctx, addon)
	if err != nil {
		return nil, fmt.Errorf("failed to create addon: %w", err)
	}

	return addon, nil

}