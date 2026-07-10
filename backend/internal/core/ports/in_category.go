package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// CategoryInput es el alta de una categoría (admin).
type CategoryInput struct {
	NameES  string
	NameEN  string
	ImageID string
}

// AdminCategoryService permite al admin crear categorías del catálogo.
type AdminCategoryService interface {
	Create(ctx context.Context, in CategoryInput) (domain.Category, error)
}
