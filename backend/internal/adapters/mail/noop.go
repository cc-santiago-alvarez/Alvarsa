package mail

import (
	"context"
	"log"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// Noop implementa ports.Mailer sin enviar nada. Se usa cuando no hay
// RESEND_API_KEY configurada (desarrollo), para que el backend arranque igual
// y quede constancia en el log de que la notificación no se envió.
type Noop struct{}

func NewNoop() Noop { return Noop{} }

func (Noop) SendContactNotification(_ context.Context, c domain.ContactRequest) error {
	log.Printf("mail(noop): contacto de %q — sin RESEND_API_KEY, no se envía", c.Name)
	return nil
}

func (Noop) SendQuoteNotification(_ context.Context, q domain.Quote) error {
	log.Printf("mail(noop): cotización de %q — sin RESEND_API_KEY, no se envía", q.Contact.Name)
	return nil
}
