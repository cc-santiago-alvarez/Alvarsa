package domain

import "time"

// ContactRequest es un mensaje del formulario de contacto. Los adjuntos se
// referencian por id de GridFS. Solo el admin puede listarlas.
type ContactRequest struct {
	ID          string
	Name        string
	Phone       string
	Reason      string
	Attachments []string // ids de GridFS
	IsRemove    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
