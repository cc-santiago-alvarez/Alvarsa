package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type QuoteRepository interface {
	Create(ctx context.Context, q domain.Quote) (domain.Quote, error)
	List(ctx context.Context) ([]domain.Quote, error)
}
