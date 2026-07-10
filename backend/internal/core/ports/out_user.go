package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type UserRepository interface {
	GetByEmail(ctx context.Context, email string) (domain.User, error)
	GetByID(ctx context.Context, id string) (domain.User, error)
	Create(ctx context.Context, u domain.User) (domain.User, error)
}
