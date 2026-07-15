package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// Mailer abstrae el envío de notificaciones por correo hacia el taller.
//
// Desde el punto de vista del core el envío es best-effort: un fallo al
// notificar no invalida la operación de negocio (la cotización o el contacto
// ya quedaron persistidos). Por eso los servicios ignoran el error devuelto;
// el adaptador es responsable de registrar sus propios fallos.
type Mailer interface {
	SendContactNotification(ctx context.Context, c domain.ContactRequest) error
	SendQuoteNotification(ctx context.Context, q domain.Quote) error
}
