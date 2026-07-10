package services

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Catalog implementa ports.CatalogService: lectura del catálogo con moldeo de
// campos por rol. La regla de autorización de campos vive aquí (en el core),
// no en el adaptador HTTP.
type Catalog struct {
	products   ports.ProductRepository
	categories ports.CategoryRepository
}

func NewCatalog(products ports.ProductRepository, categories ports.CategoryRepository) *Catalog {
	return &Catalog{products: products, categories: categories}
}

func (c *Catalog) ListProducts(ctx context.Context, role domain.Role, f ports.ProductFilter) ([]domain.Product, error) {
	items, err := c.products.List(ctx, f)
	if err != nil {
		return nil, err
	}
	out := make([]domain.Product, len(items))
	for i, p := range items {
		out[i] = p.ViewFor(role) // admin ve campos internos; el resto no
	}
	return out, nil
}

func (c *Catalog) GetProduct(ctx context.Context, role domain.Role, id string) (domain.Product, error) {
	p, err := c.products.GetByID(ctx, id)
	if err != nil {
		return domain.Product{}, err
	}
	return p.ViewFor(role), nil
}

func (c *Catalog) ListCategories(ctx context.Context) ([]domain.Category, error) {
	return c.categories.List(ctx)
}
