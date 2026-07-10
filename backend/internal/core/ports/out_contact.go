package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type ContactRepository interface {
	Create(ctx context.Context, c domain.ContactRequest) (domain.ContactRequest, error)
	List(ctx context.Context) ([]domain.ContactRequest, error)
}
