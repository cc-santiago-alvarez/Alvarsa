package services

import (
	"context"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Quote implementa ports.QuoteService. La creación es pública (checkout del
// carrito); el listado es admin-only (lo protege el middleware en el adaptador).
type Quote struct {
	quotes ports.QuoteRepository
	now    func() time.Time
}

func NewQuote(quotes ports.QuoteRepository) *Quote {
	return &Quote{quotes: quotes, now: time.Now}
}

func (s *Quote) Create(ctx context.Context, in ports.QuoteInput) (domain.Quote, error) {
	if len(in.Items) == 0 {
		return domain.Quote{}, domain.ErrInvalidInput
	}
	var subtotal int64
	for _, it := range in.Items {
		qty := it.Qty
		if qty < 1 {
			qty = 1
		}
		subtotal += it.Price * int64(qty)
	}
	now := s.now()
	q := domain.Quote{
		ID:        newID(),
		Items:     in.Items,
		Subtotal:  subtotal,
		Contact:   in.Contact,
		Status:    domain.QuoteStatusNew,
		CreatedAt: now,
		UpdatedAt: now,
	}
	return s.quotes.Create(ctx, q)
}

func (s *Quote) List(ctx context.Context) ([]domain.Quote, error) {
	return s.quotes.List(ctx)
}
