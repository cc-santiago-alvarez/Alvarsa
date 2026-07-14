package domain

import (
	"io"
	"time"
)

// Model es la metadata de un modelo 3D (.glb/.usdz) almacenado en GridFS. El
// contenido se transmite por streaming (no se carga entero en memoria). Es una
// entidad aparte de Image: distinto bucket, whitelist de tipos y soporte de Range.
type Model struct {
	ID          string
	Filename    string
	ContentType string
	Size        int64
	IsRemove    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ModelBlob agrupa la metadata con el stream de lectura del contenido.
// El consumidor es responsable de cerrar Content.
type ModelBlob struct {
	Model
	Content io.ReadCloser
}
