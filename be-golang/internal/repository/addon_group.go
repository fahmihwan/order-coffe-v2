package repository

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AddOnGroupRepository struct {
	db *gorm.DB
}

type AddOnGroupRepo interface {
	List(ctx context.Context, filter FilterAddOnGroup) (res []*model.AddOnGroup, total int, err error)
	Create(ctx context.Context, addon *model.AddOnGroup) error
	setFilter(db *gorm.DB, filter FilterAddOnGroup) *gorm.DB
	GetByID(ctx context.Context, id string) (*model.AddOnGroup, error)
	Update(ctx context.Context, addon *model.AddOnGroup) error
	Delete(ctx context.Context, id string) error
}

var _ AddOnGroupRepo = (*AddOnGroupRepository)(nil)

func NewAddOnGroupRepository(db *gorm.DB) *AddOnGroupRepository {
	return &AddOnGroupRepository{
		db: db,
	}
}


type FilterAddOnGroup struct {
	Pagination
	ID       	*uuid.UUID `json:"id,omitempty"`
	CategoryID      string     `json:"category_id,omitempty"`
	MenuID   string `json:"menu_id,omitempty"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}




func (r *AddOnGroupRepository) List(ctx context.Context, filter FilterAddOnGroup) (res []*model.AddOnGroup, total int, err error) {
	
	funcName := "List"
	tableName := model.AddOnGroup{}.TableName()

	// Pastikan slice kosong (bukan nil)
	res = make([]*model.AddOnGroup, 0)

	// GORM pakai context (ini bukan OpenTelemetry; ini untuk cancel/timeout dari request)
	db := r.db.WithContext(ctx)

	// Operation `count`
	var count int64
	err = r.setFilter(db, filter).Model(&model.AddOnGroup{}).Count(&count).Error

	if err != nil {
		return res, total, fmt.Errorf("failed to %s %s count: %w", funcName, tableName, err)
	}

	if count == 0 {
		return
	}
	total = int(count)

	if filter.SortBy == "" {
		filter.SortBy = "id"
	}

	order := strings.ToUpper(filter.OrderBy)
	desc := order == "DESC" // default ASC kalau kosong / selain DESC

	// Operation `select`
	if err = r.setFilter(db, filter).
		Preload("AddOnOptions").
		Order(clause.OrderByColumn{
			Column: clause.Column{Name: filter.SortBy},
			Desc:   desc,
		}).
		Limit(filter.Limit).
		Offset(filter.Offset).
		Find(&res).Error; err != nil {
		return res, total, fmt.Errorf("failed to %s %s find: %w", funcName, tableName, err)
	}

	return res, total, nil
}


func (r *AddOnGroupRepository) setFilter(db *gorm.DB, filter FilterAddOnGroup) *gorm.DB {
	if filter.ID != nil {
		db = db.Where("id = ?", filter.ID)
	}
	
	db = db.Where("deleted_at IS NULL")
	
	return db
}	

func (r *AddOnGroupRepository) Create(ctx context.Context, addon *model.AddOnGroup) error {
	err := r.db.WithContext(ctx).Create(addon).Error
	if err != nil {
		return fmt.Errorf("failed to create addon group: %w", err)
	}
	return nil
}


func (r *AddOnGroupRepository) Update(ctx context.Context, addon *model.AddOnGroup) error {
	addon.UpdatedAt = time.Now()

	err := r.db.WithContext(ctx).Model(&model.AddOnGroup{}).Where("id = ? AND deleted_at IS NULL", addon.ID).Omit("created_at", clause.Associations).Updates(addon).Error
	if err != nil {
		return fmt.Errorf("failed to update addon group: %w", err)
	}
	return nil
}

func (r *AddOnGroupRepository) GetByID(ctx context.Context, id string) (*model.AddOnGroup, error) {
	var addon model.AddOnGroup

	err := r.db.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", id).Preload("AddOnOptions").First(&addon).Error
	if err != nil {
		return nil, fmt.Errorf("failed to get addon group by ID: %w", err)
	}
	return &addon, nil
}	

func (r *AddOnGroupRepository) Delete(ctx context.Context, id string) error {
	err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&model.AddOnGroup{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete addon group: %w", err)
	}
	return nil
}	