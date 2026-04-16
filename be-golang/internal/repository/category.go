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

type CategoryRepository struct {
	db *gorm.DB
}

type CategoryRepo interface {
	Create(ctx context.Context, category *model.Category) error
	List(ctx context.Context, filter FilterCategory) (res []*model.Category, total int, err error)
	setFilter(db *gorm.DB, filter FilterCategory) *gorm.DB
	GetByID(ctx context.Context, id string) (*model.Category, error)
	Update(ctx context.Context, category *model.Category) error
	Delete(ctx context.Context, id string) error
}

var _ CategoryRepo = (*CategoryRepository)(nil)

func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{
		db: db,
	}
}

type FilterCategory struct {
	Pagination
	ID       	*uuid.UUID `json:"id,omitempty"`
	CategoryName      string     `json:"category_name,omitempty"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}



func (r *CategoryRepository) List(ctx context.Context, filter FilterCategory) (res []*model.Category, total int, err error) {

	funcName := "List"
	tableName := model.Category{}.TableName()

	// Pastikan slice kosong (bukan nil)
	res = make([]*model.Category, 0)

	// GORM pakai context (ini bukan OpenTelemetry; ini untuk cancel/timeout dari request)
	db := r.db.WithContext(ctx)

	// Operation `count`
	var count int64
	err = r.setFilter(db, filter).Model(&model.Category{}).Count(&count).Error

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


func (r *CategoryRepository) setFilter(db *gorm.DB, filter FilterCategory) *gorm.DB {
	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		db = db.Where("category_name ILIKE ?", like)
	}

	if filter.ID != nil && *filter.ID != uuid.Nil {
		db = db.Where("id = ?", *filter.ID)
	}

	db = db.Where("deleted_at IS NULL")

	return db
}



func (r *CategoryRepository) Create(ctx context.Context, category *model.Category) error {

	err := r.db.WithContext(ctx).Create(category).Error
	if err != nil {
		return fmt.Errorf("failed to create category: %w", err)
	}
	return nil
}


func (r *CategoryRepository) GetByID(ctx context.Context, id string) (*model.Category, error) {
	var category model.Category

	err := r.db.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", id).First(&category).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("category not found")
		}
		return nil, fmt.Errorf("failed to get category by id: %w", err)
	}

	return &category, nil
}


func (r *CategoryRepository) Update(ctx context.Context, category *model.Category) error {
	category.UpdatedAt = time.Now()

	err := r.db.WithContext(ctx).Model(&model.Category{}).Where("id = ? AND deleted_at IS NULL", category.ID).Omit("created_at", clause.Associations).Updates(category).Error
	if err != nil {
		return fmt.Errorf("failed to update category: %w", err)
	}

	return nil
}



func (r *CategoryRepository) Delete(ctx context.Context, id string) error {
	err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&model.Category{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete category: %w", err)
	}

	return nil
}