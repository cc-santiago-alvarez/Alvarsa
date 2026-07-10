package services

import (
	"context"
	"testing"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// mockProductRepo es un doble en memoria del puerto de salida ProductRepository.
type mockProductRepo struct {
	items []domain.Product
}

func (m *mockProductRepo) List(_ context.Context, f ports.ProductFilter) ([]domain.Product, error) {
	if f.CategoryID == "" {
		return m.items, nil
	}
	var out []domain.Product
	for _, p := range m.items {
		if p.CategoryID == f.CategoryID {
			out = append(out, p)
		}
	}
	return out, nil
}
func (m *mockProductRepo) GetByID(_ context.Context, id string) (domain.Product, error) {
	for _, p := range m.items {
		if p.ID == id {
			return p, nil
		}
	}
	return domain.Product{}, domain.ErrNotFound
}
func (m *mockProductRepo) Create(_ context.Context, p domain.Product) (domain.Product, error) {
	m.items = append(m.items, p)
	return p, nil
}
func (m *mockProductRepo) Update(_ context.Context, p domain.Product) (domain.Product, error) {
	return p, nil
}
func (m *mockProductRepo) SoftDelete(_ context.Context, _ string) error { return nil }

type mockCategoryRepo struct{}

func (mockCategoryRepo) List(_ context.Context) ([]domain.Category, error) { return nil, nil }
func (mockCategoryRepo) GetByID(_ context.Context, _ string) (domain.Category, error) {
	return domain.Category{}, nil
}
func (mockCategoryRepo) Create(_ context.Context, c domain.Category) (domain.Category, error) {
	return c, nil
}

func sampleProduct() domain.Product {
	return domain.Product{
		ID:         "p1",
		Name:       "Mesa Fábrica",
		CategoryID: "cat-mesas",
		Price:      1890000,
		Admin: domain.AdminFields{
			InternalCost:  900000,
			WorkshopNotes: "soldar patas en X",
			SupplierRef:   "PROV-01",
		},
	}
}

// El admin debe ver los campos internos.
func TestListProducts_AdminSeesAdminFields(t *testing.T) {
	repo := &mockProductRepo{items: []domain.Product{sampleProduct()}}
	svc := NewCatalog(repo, mockCategoryRepo{})

	got, err := svc.ListProducts(context.Background(), domain.RoleAdmin, ports.ProductFilter{})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if len(got) != 1 {
		t.Fatalf("esperaba 1 producto, obtuve %d", len(got))
	}
	if got[0].Admin.InternalCost != 900000 {
		t.Errorf("el admin debería ver InternalCost, obtuve %d", got[0].Admin.InternalCost)
	}
}

// Un usuario general / anónimo NUNCA debe recibir los campos internos.
func TestListProducts_CustomerHidesAdminFields(t *testing.T) {
	repo := &mockProductRepo{items: []domain.Product{sampleProduct()}}
	svc := NewCatalog(repo, mockCategoryRepo{})

	for _, role := range []domain.Role{domain.RoleCustomer, domain.Role("")} {
		got, err := svc.ListProducts(context.Background(), role, ports.ProductFilter{})
		if err != nil {
			t.Fatalf("error inesperado: %v", err)
		}
		if got[0].Admin != (domain.AdminFields{}) {
			t.Errorf("rol %q no debería ver campos admin, obtuve %+v", role, got[0].Admin)
		}
	}
}

// Verifica que el filtro por categoría se propaga al repositorio.
func TestListProducts_FiltersByCategory(t *testing.T) {
	repo := &mockProductRepo{items: []domain.Product{
		sampleProduct(),
		{ID: "p2", Name: "Sofá", CategoryID: "cat-sofas", Price: 100},
	}}
	svc := NewCatalog(repo, mockCategoryRepo{})

	got, err := svc.ListProducts(context.Background(), domain.RoleCustomer, ports.ProductFilter{CategoryID: "cat-sofas"})
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if len(got) != 1 || got[0].CategoryID != "cat-sofas" {
		t.Errorf("el filtro por categoría falló: %+v", got)
	}
}
