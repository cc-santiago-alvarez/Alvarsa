package ports

import (
	"context"
	"io"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ImageStore abstrae el almacenamiento binario (GridFS). El id (UUID) lo genera
// el core y se usa como _id del archivo, para no depender del ObjectID de Mongo.
type ImageStore interface {
	Upload(ctx context.Context, id, filename, contentType string, r io.Reader) (domain.Image, error)
	Open(ctx context.Context, id string) (domain.ImageBlob, error)
}
