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

type MenuRepository struct {
	db *gorm.DB
}

type MenuRepo interface {
	Create(ctx context.Context, book *model.Menu) error
	List(ctx context.Context, filter FilterMenu) (res []*model.Menu, total int, err error)
	setFilter(db *gorm.DB, filter FilterMenu) *gorm.DB
	// GetByID(ctx context.Context, id string) (*model.Menu, error)
	// Update(ctx context.Context, book *model.Menu) error
	Delete(ctx context.Context, id string) error
}

var _ MenuRepo = (*MenuRepository)(nil)

func NewMenuRepository(db *gorm.DB) *MenuRepository {
	return &MenuRepository{
		db: db,
	}
}

type FilterMenu struct {
	Pagination
	ID       	*uuid.UUID `json:"id,omitempty"`
	ImgURL      string     `json:"img_url,omitempty"`
	Name        string     `json:"name,omitempty"`
	Description *string    `json:"description,omitempty"`
	Price       *float64   `json:"price,omitempty"`
	IsActive    *bool      `json:"is_active,omitempty"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}



func (r *MenuRepository) List(ctx context.Context, filter FilterMenu) (res []*model.Menu, total int, err error) {

	funcName := "List"
	tableName := model.Menu{}.TableName()

	// Pastikan slice kosong (bukan nil)
	res = make([]*model.Menu, 0)

	// GORM pakai context (ini bukan OpenTelemetry; ini untuk cancel/timeout dari request)
	db := r.db.WithContext(ctx)

	// Operation `count`
	var count int64
	err = r.setFilter(db, filter).Model(&model.Menu{}).Count(&count).Error

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


func (r *MenuRepository) setFilter(db *gorm.DB, filter FilterMenu) *gorm.DB {
	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		db = db.Where("name ILIKE ?", like)
	}

	if filter.ID != nil && *filter.ID != uuid.Nil {
		db = db.Where("id = ?", *filter.ID)
	}

	db = db.Where("deleted_at IS NULL")

	return db
}



func (r *MenuRepository) Create(ctx context.Context, menu *model.Menu) error {

	err := r.db.WithContext(ctx).Create(menu).Error
	if err != nil {
		return fmt.Errorf("failed to create menu: %w", err)
	}
	return nil
}


// func (r *MenuRepository) GetByID(ctx context.Context, id string) (*model.Menu, error) {
// 	var menu model.Menu

// 	err := r.db.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", id).First(&menu).Error
// 	if err != nil {
// 		if err == gorm.ErrRecordNotFound {
// 			return nil, fmt.Errorf("menu not found")
// 		}
// 		return nil, fmt.Errorf("failed to get menu by id: %w", err)
// 	}

// 	return &menu, nil
// }


// func (r *MenuRepository) Update(ctx context.Context, menu *model.Menu) error {
// 	menu.UpdatedAt = time.Now()

// 	err := r.db.WithContext(ctx).Model(&model.Menu{}).Where("id = ? AND deleted_at IS NULL", menu.ID).Omit("created_at", clause.Associations).Updates(menu).Error
// 	if err != nil {
// 		return fmt.Errorf("failed to update menu: %w", err)
// 	}

// 	return nil
// }



func (r *MenuRepository) Delete(ctx context.Context, id string) error {
	err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&model.Menu{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete menu: %w", err)
	}

	return nil
}