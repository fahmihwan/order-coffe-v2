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

type AddOnRepository struct {
	db *gorm.DB
}

func NewAddOnRepository(db *gorm.DB) *AddOnRepository {
	return &AddOnRepository{
		db: db,
	}
}

type FilterAddon struct {
	Pagination
	ID       	*uuid.UUID `json:"id,omitempty"`
	CategoryID      string     `json:"category_id,omitempty"`
	MenuID   string `json:"menu_id,omitempty"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type AddOnRepo interface {
	List(ctx context.Context, filter FilterAddon) (res []*model.AddOnGroup, total int, err error)
	// Create(ctx context.Context, addon *model.Addon) error
	setFilter(db *gorm.DB, filter FilterAddon) *gorm.DB
	// GetByID(ctx context.Context, id string) (*model.Addon, error)
	// Update(ctx context.Context, addon *model.Addon) error
	// Delete(ctx context.Context, id string) error
}


func (r *AddOnRepository) List(ctx context.Context, filter FilterAddon) (res []*model.AddOnGroup, total int, err error) {
	
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
		// Preload("CategoryMenus").
		// Preload("CategoryMenus.Menu").
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


func (r *AddOnRepository) setFilter(db *gorm.DB, filter FilterAddon) *gorm.DB {
	if filter.ID != nil {
		db = db.Where("id = ?", filter.ID)
	}
	// if filter.CategoryID != "" {
	// 	db = db.Where("category_id = ?", filter.CategoryID)
	// }
	// if filter.MenuID != "" {
	// 	db = db.Where("menu_id = ?", filter.MenuID)
	// }
	// if filter.CreatedAt != nil {
	// 	db = db.Where("created_at >= ?", filter.CreatedAt)
	// }
	// if filter.UpdatedAt != nil {
	// 	db = db.Where("updated_at >= ?", filter.UpdatedAt)
	// }
	
	db = db.Where("deleted_at IS NULL")
	
	return db
}			
