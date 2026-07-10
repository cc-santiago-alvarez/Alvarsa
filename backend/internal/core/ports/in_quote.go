package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// QuoteInput es el checkout del carrito.
type QuoteInput struct {
	Items   []domain.QuoteItem
	Contact domain.ContactInfo
}

type QuoteService interface {
	Create(ctx context.Context, in QuoteInput) (domain.Quote, error)
	List(ctx context.Context) ([]domain.Quote, error) // admin-only
}
