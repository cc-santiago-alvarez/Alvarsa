package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ContactInput es el formulario de contacto.
type ContactInput struct {
	Name        string
	Phone       string
	Email       string
	Reason      string
	Attachments []string
}

type ContactService interface {
	Create(ctx context.Context, in ContactInput) (domain.ContactRequest, error)
	List(ctx context.Context) ([]domain.ContactRequest, error) // admin-only
}
