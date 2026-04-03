package service

import (
	"context"
	"fmt"
	"mime/multipart"
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/repository"
	"pos-coffeshop/internal/util"
	"time"

	"github.com/google/uuid"
)

var _ MenuServiceInteface = &MenuService{}

type MenuServiceInteface interface {
	ListMenu(ctx context.Context, filters map[string]string, search string, page, limit int, sortBy, orderBy string) ([]*model.Menu, int, error)
	CreateMenu(ctx context.Context, menu *model.Menu, file multipart.File, header *multipart.FileHeader) (*model.Menu, error)
	GetMenuByID(ctx context.Context, id string) (*model.Menu, error)
	UpdateMenu(ctx context.Context, menu *model.Menu,file multipart.File,header *multipart.FileHeader) (*model.Menu, error)
	DeleteMenu(ctx context.Context, id string) error
}

type MenuService struct {
	repo repository.Repository
}

func NewMenuService(repo repository.Repository) *MenuService {
	return &MenuService{
		repo: repo,
	}
}

func (s *MenuService) CreateMenu(ctx context.Context,menu *model.Menu,file multipart.File,header *multipart.FileHeader,) (*model.Menu, error) {

	menu.ID,_ = uuid.NewV7()

	imageURL, err := util.UploadMenuImage(file, header)
	if err != nil {
		return nil, fmt.Errorf("failed to upload image: %w", err)
	}

	menu.ImgURL = &imageURL

	// Generate a new UUID for the form
	menu.CreatedAt = time.Now()
	menu.UpdatedAt = time.Now()

	err = s.repo.Menu.Create(ctx, menu)
	if err != nil {
		return nil, fmt.Errorf("failed to create form: %w", err)
	}

	return menu, nil
}

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

func (s *MenuService) GetMenuByID(ctx context.Context, id string) (*model.Menu, error) {
	
	menu, err := s.repo.Menu.GetByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get menu by ID: %w", err)
	}
	return menu, nil
}

func (s *MenuService) UpdateMenu(ctx context.Context, menu *model.Menu,file multipart.File,header *multipart.FileHeader) (*model.Menu, error) {
	existingMenu, err := s.repo.Menu.GetByID(ctx, menu.ID.String())
	if err != nil {
		return nil, fmt.Errorf("failed to get existing menu: %w", err)
	}
	menu.UpdatedAt = time.Now()


	if file != nil && header != nil {
		imageURL, err := util.UploadMenuImage(file, header)
		if err != nil {
			return nil, fmt.Errorf("failed to upload menu image: %w", err)
		}

		if existingMenu.ImgURL != nil {
			if err := util.DeleteMenuImage(*existingMenu.ImgURL); err != nil {
				return nil, fmt.Errorf("failed to delete old menu image: %w", err)
			}
		}
		
		menu.ImgURL = &imageURL
	} else {
		menu.ImgURL = existingMenu.ImgURL
	}

	err = s.repo.Menu.Update(ctx, menu)
	if err != nil {
		return nil, fmt.Errorf("failed to update menu: %w", err)
	}
	return menu, nil
}


func (s *MenuService) DeleteMenu(ctx context.Context, id string) error {
	menu, err := s.repo.Menu.GetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("failed to get menu: %w", err)
	}

	if err := s.repo.Menu.Delete(ctx, id); err != nil {
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	if err := util.DeleteMenuImage(*menu.ImgURL); err != nil {
		return fmt.Errorf("failed to delete old menu image: %w", err)
	}
	

	return nil
}
