package services

import (
	"context"
	"strings"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// AdminCategory implementa ports.AdminCategoryService: alta de categorías.
// Protegido por requireAdmin en el router.
type AdminCategory struct {
	categories ports.CategoryRepository
	now        func() time.Time
}

func NewAdminCategory(categories ports.CategoryRepository) *AdminCategory {
	return &AdminCategory{categories: categories, now: time.Now}
}

func (s *AdminCategory) Create(ctx context.Context, in ports.CategoryInput) (domain.Category, error) {
	if strings.TrimSpace(in.NameES) == "" || strings.TrimSpace(in.NameEN) == "" {
		return domain.Category{}, domain.ErrInvalidInput
	}
	now := s.now()
	c := domain.Category{
		ID:        newID(),
		NameES:    strings.TrimSpace(in.NameES),
		NameEN:    strings.TrimSpace(in.NameEN),
		ImageID:   in.ImageID,
		CreatedAt: now,
		UpdatedAt: now,
	}
	return s.categories.Create(ctx, c)
}
