package domain

import "time"

// QuoteItem es una línea del carrito al momento de solicitar la cotización.
// Options guarda la personalización elegida (metal/madera/medida), congelada.
type QuoteItem struct {
	ProductID string
	Name      string
	Price     int64 // COP unitario al momento de cotizar
	Qty       int
	Options   map[string]string
}

// ContactInfo son los datos de contacto de quien solicita la cotización.
type ContactInfo struct {
	Name  string
	Phone string
	Email string
}

// QuoteStatus modela el ciclo de vida de una cotización.
type QuoteStatus string

const (
	QuoteStatusNew     QuoteStatus = "new"
	QuoteStatusContact QuoteStatus = "contacted"
	QuoteStatusClosed  QuoteStatus = "closed"
)

// Quote es una solicitud de cotización (checkout del carrito). Solo el admin
// puede listarlas.
type Quote struct {
	ID        string
	Items     []QuoteItem
	Subtotal  int64 // COP
	Contact   ContactInfo
	Status    QuoteStatus
	IsRemove  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}
