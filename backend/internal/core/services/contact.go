package services

import (
	"context"
	"strings"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Contact implementa ports.ContactService. Creación pública; listado admin-only.
type Contact struct {
	contacts ports.ContactRepository
	now      func() time.Time
}

func NewContact(contacts ports.ContactRepository) *Contact {
	return &Contact{contacts: contacts, now: time.Now}
}

func (s *Contact) Create(ctx context.Context, in ports.ContactInput) (domain.ContactRequest, error) {
	if strings.TrimSpace(in.Name) == "" || strings.TrimSpace(in.Reason) == "" {
		return domain.ContactRequest{}, domain.ErrInvalidInput
	}
	now := s.now()
	c := domain.ContactRequest{
		ID:          newID(),
		Name:        strings.TrimSpace(in.Name),
		Phone:       strings.TrimSpace(in.Phone),
		Email:       strings.TrimSpace(in.Email),
		Reason:      strings.TrimSpace(in.Reason),
		Attachments: in.Attachments,
		CreatedAt:   now,
		UpdatedAt:   now,
	}
	return s.contacts.Create(ctx, c)
}

func (s *Contact) List(ctx context.Context) ([]domain.ContactRequest, error) {
	return s.contacts.List(ctx)
}
