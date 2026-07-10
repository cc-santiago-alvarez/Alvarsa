package domain

import (
	"io"
	"time"
)

// Image es la metadata de un binario almacenado en GridFS. El contenido se
// transmite por streaming (no se carga entero en memoria).
type Image struct {
	ID          string
	Filename    string
	ContentType string
	Size        int64
	IsRemove    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ImageBlob agrupa la metadata con el stream de lectura del contenido.
// El consumidor es responsable de cerrar Content.
type ImageBlob struct {
	Image
	Content io.ReadCloser
}
