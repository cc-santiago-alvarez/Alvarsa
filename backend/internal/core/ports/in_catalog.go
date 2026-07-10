package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// CatalogService es la lectura pública del catálogo (productos y categorías),
// con moldeo de campos por rol.
type CatalogService interface {
	ListProducts(ctx context.Context, role domain.Role, f ProductFilter) ([]domain.Product, error)
	GetProduct(ctx context.Context, role domain.Role, id string) (domain.Product, error)
	ListCategories(ctx context.Context) ([]domain.Category, error)
}
