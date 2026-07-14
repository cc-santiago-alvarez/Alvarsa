package services

import (
	"context"
	"strings"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// AdminProduct implementa ports.AdminProductService: alta/edición/baja de
// productos. Solo debe invocarse tras el middleware requireAdmin.
type AdminProduct struct {
	products   ports.ProductRepository
	categories ports.CategoryRepository
	now        func() time.Time
}

func NewAdminProduct(products ports.ProductRepository, categories ports.CategoryRepository) *AdminProduct {
	return &AdminProduct{products: products, categories: categories, now: time.Now}
}

func (s *AdminProduct) validate(ctx context.Context, in ports.ProductInput) error {
	if strings.TrimSpace(in.Name) == "" || in.Price <= 0 {
		return domain.ErrInvalidInput
	}
	if strings.TrimSpace(in.CategoryID) == "" {
		return domain.ErrInvalidInput
	}
	if _, err := s.categories.GetByID(ctx, in.CategoryID); err != nil {
		return domain.ErrInvalidInput // categoría inexistente
	}
	return nil
}

func (s *AdminProduct) Create(ctx context.Context, in ports.ProductInput) (domain.Product, error) {
	if err := s.validate(ctx, in); err != nil {
		return domain.Product{}, err
	}
	now := s.now()
	p := domain.Product{
		ID:            newID(),
		Name:          strings.TrimSpace(in.Name),
		CategoryID:    in.CategoryID,
		Price:         in.Price,
		Dims:          strings.TrimSpace(in.Dims),
		MaterialsES:   in.MaterialsES,
		MaterialsEN:   in.MaterialsEN,
		DescriptionES: in.DescriptionES,
		DescriptionEN: in.DescriptionEN,
		ImageIDs:      in.ImageIDs,
		Customization: in.Customization,
		Model3D:       in.Model3D,
		Admin:         in.Admin,
		Custom:        true,
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	return s.products.Create(ctx, p)
}

func (s *AdminProduct) Update(ctx context.Context, id string, in ports.ProductInput) (domain.Product, error) {
	if err := s.validate(ctx, in); err != nil {
		return domain.Product{}, err
	}
	existing, err := s.products.GetByID(ctx, id)
	if err != nil {
		return domain.Product{}, err
	}
	existing.Name = strings.TrimSpace(in.Name)
	existing.CategoryID = in.CategoryID
	existing.Price = in.Price
	existing.Dims = strings.TrimSpace(in.Dims)
	existing.MaterialsES = in.MaterialsES
	existing.MaterialsEN = in.MaterialsEN
	existing.DescriptionES = in.DescriptionES
	existing.DescriptionEN = in.DescriptionEN
	existing.ImageIDs = in.ImageIDs
	existing.Customization = in.Customization
	existing.Model3D = in.Model3D
	existing.Admin = in.Admin
	existing.UpdatedAt = s.now()
	return s.products.Update(ctx, existing)
}

func (s *AdminProduct) Delete(ctx context.Context, id string) error {
	return s.products.SoftDelete(ctx, id)
}
