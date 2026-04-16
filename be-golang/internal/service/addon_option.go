package service

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"time"

	"github.com/google/uuid"
)

var _ AddOnOptionServiceInterface = &AddOnOptionService{}

type AddOnOptionServiceInterface interface {
	CreateAddOnOption(ctx context.Context, addon *model.AddOnOption) (*model.AddOnOption, error)
	GetAddOnOptionByID(ctx context.Context, id string) (*model.AddOnOption, error)
	UpdateAddOnOption(ctx context.Context, addon *model.AddOnOption) (*model.AddOnOption, error)
	DeleteAddOnOption(ctx context.Context, id string) error
}


type AddOnOptionService struct {
	repo repository.Repository
}

func NewAddOnOptionService(repo repository.Repository) *AddOnOptionService {
	return &AddOnOptionService{
		repo: repo,
	}
}


func (s *AddOnOptionService) CreateAddOnOption(ctx context.Context, addon *model.AddOnOption) (*model.AddOnOption, error)  {
	now := time.Now()

	addon.ID, _ = uuid.NewV7()
	addon.CreatedAt = now
	addon.UpdatedAt = now

	err := s.repo.AddOnOption.Create(ctx, addon)
	if err != nil {
		return nil, fmt.Errorf("failed to create addon: %w", err)
	}

	return addon, nil
}

func (s *AddOnOptionService) GetAddOnOptionByID(ctx context.Context, id string) (*model.AddOnOption, error) {
	addon, err := s.repo.AddOnOption.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get addon by id: %w", err)
	}

	return addon, nil
}

func (s *AddOnOptionService) UpdateAddOnOption(ctx context.Context, addon *model.AddOnOption) (*model.AddOnOption, error) {
	addon.UpdatedAt = time.Now()

	err := s.repo.AddOnOption.Update(ctx, addon)
	if err != nil {
		return nil, fmt.Errorf("failed to update addon: %w", err)
	}
	return addon, nil
}


func (s *AddOnOptionService) DeleteAddOnOption(ctx context.Context, id string) error {
	err := s.repo.AddOnOption.Delete(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to delete addon: %w", err)
	}
	return nil
}