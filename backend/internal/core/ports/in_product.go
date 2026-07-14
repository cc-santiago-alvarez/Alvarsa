package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ProductInput son los datos para crear/editar un producto (solo admin).
type ProductInput struct {
	Name          string
	CategoryID    string // UUID de la categoría
	Price         int64
	Dims          string
	MaterialsES   string
	MaterialsEN   string
	DescriptionES string
	DescriptionEN string
	ImageIDs      []string
	Customization domain.Customization
	Model3D       domain.Model3D
	Admin         domain.AdminFields
}

type AdminProductService interface {
	Create(ctx context.Context, in ProductInput) (domain.Product, error)
	Update(ctx context.Context, id string, in ProductInput) (domain.Product, error)
	Delete(ctx context.Context, id string) error
}
