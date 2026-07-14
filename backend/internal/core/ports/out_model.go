package ports

import (
	"context"
	"io"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ModelStore abstrae el almacenamiento binario de modelos 3D (GridFS bucket
// "models"). El id (UUID) lo genera el core y se usa como _id del archivo, para
// no depender del ObjectID de Mongo.
type ModelStore interface {
	Upload(ctx context.Context, id, filename, contentType string, r io.Reader) (domain.Model, error)
	// Open abre el stream de descarga. offset>0 avanza esa cantidad de bytes
	// (para peticiones Range); el GridFSDownloadStream soporta Skip, no Seek.
	Open(ctx context.Context, id string, offset int64) (domain.ModelBlob, error)
}
