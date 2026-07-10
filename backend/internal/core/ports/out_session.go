package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type SessionRepository interface {
	Create(ctx context.Context, s domain.Session) (domain.Session, error)
	GetByID(ctx context.Context, id string) (domain.Session, error)
	SoftDelete(ctx context.Context, id string) error
}
