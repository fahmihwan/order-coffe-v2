package repository

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AddOnOptionRepository struct {
	db *gorm.DB
}

type AddOnOptionRepo interface {
	Create(ctx context.Context, addon *model.AddOnOption) error
	setFilter(db *gorm.DB, filter FilterAddOnOption) *gorm.DB
	GetByID(ctx context.Context, id string) (*model.AddOnOption, error)
	Update(ctx context.Context, addon *model.AddOnOption) error
	Delete(ctx context.Context, id string) error
}

var _ AddOnOptionRepo = (*AddOnOptionRepository)(nil)

func NewAddOnOptionRepository(db *gorm.DB) *AddOnOptionRepository {
	return &AddOnOptionRepository{
		db: db,
	}
}


type FilterAddOnOption struct {
	Pagination
	ID           *uuid.UUID `json:"id,omitempty"`
	AddOnGroupID *uuid.UUID `json:"add_on_group_id,omitempty"`
	Name         *string    `json:"name,omitempty"`
	Price        *float64   `json:"price,omitempty"`
	IsActive     *bool      `json:"is_active,omitempty"`
	Type         *string    `json:"type,omitempty"`

	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}




func (r *AddOnOptionRepository) setFilter(db *gorm.DB, filter FilterAddOnOption) *gorm.DB {
	if filter.ID != nil {
		db = db.Where("id = ?", filter.ID)
	}
	if filter.AddOnGroupID != nil {
		db = db.Where("add_on_group_id = ?", filter.AddOnGroupID)
	}
	if filter.Name != nil {
		db = db.Where("name ILIKE ?", "%"+*filter.Name+"%")
	}
	if filter.Price != nil {
		db = db.Where("price = ?", filter.Price)
	}
	if filter.IsActive != nil {
		db = db.Where("is_active = ?", filter.IsActive)
	}
	if filter.Type != nil {
		db = db.Where("type = ?", filter.Type)
	}
	db = db.Where("deleted_at IS NULL")
	
	return db
}	

func (r *AddOnOptionRepository) Create(ctx context.Context, addon *model.AddOnOption) error {
	err := r.db.WithContext(ctx).Create(addon).Error
	if err != nil {
		return fmt.Errorf("failed to create addon option: %w", err)
	}
	return nil
}


func (r *AddOnOptionRepository) Update(ctx context.Context, addon *model.AddOnOption) error {
	addon.UpdatedAt = time.Now()

	err := r.db.WithContext(ctx).Model(&model.AddOnOption{}).Where("id = ? AND deleted_at IS NULL", addon.ID).Omit("created_at", clause.Associations).Updates(addon).Error
	if err != nil {
		return fmt.Errorf("failed to update addon option: %w", err)
	}
	return nil
}

func (r *AddOnOptionRepository) GetByID(ctx context.Context, id string) (*model.AddOnOption, error) {
	var addon model.AddOnOption

	err := r.db.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", id).First(&addon).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get addon option by ID: %w", err)
	}
	return &addon, nil
}	

func (r *AddOnOptionRepository) Delete(ctx context.Context, id string) error {
	err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&model.AddOnOption{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete addon option: %w", err)
	}
	return nil
}	