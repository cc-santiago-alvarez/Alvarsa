package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type CategoryRepository interface {
	List(ctx context.Context) ([]domain.Category, error)
	GetByID(ctx context.Context, id string) (domain.Category, error)
	Create(ctx context.Context, c domain.Category) (domain.Category, error)
}
