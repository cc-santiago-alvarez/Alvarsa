package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ProductFilter son los criterios de búsqueda del catálogo.
type ProductFilter struct {
	CategoryID string // UUID de categoría; vacío = todas
	Query      string // búsqueda de texto libre; vacío = sin filtro
}

type ProductRepository interface {
	List(ctx context.Context, f ProductFilter) ([]domain.Product, error)
	GetByID(ctx context.Context, id string) (domain.Product, error)
	Create(ctx context.Context, p domain.Product) (domain.Product, error)
	Update(ctx context.Context, p domain.Product) (domain.Product, error)
	SoftDelete(ctx context.Context, id string) error
}
