package mongo

import (
	"context"
	"errors"
	"io"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ModelStore implementa ports.ModelStore sobre GridFS (bucket "models"). El _id
// del archivo es el UUID generado por el core. Reutiliza countingReader y
// metadataContentType del paquete (definidos en image_store.go).
type ModelStore struct {
	bucket *mongo.GridFSBucket
}

func NewModelStore(db *mongo.Database) *ModelStore {
	bucket := db.GridFSBucket(options.GridFSBucket().SetName(GridFSModels))
	return &ModelStore{bucket: bucket}
}

func (s *ModelStore) Upload(ctx context.Context, id, filename, contentType string, r io.Reader) (domain.Model, error) {
	cr := &countingReader{r: r}
	opts := options.GridFSUpload().SetMetadata(bson.M{"contentType": contentType})
	if err := s.bucket.UploadFromStreamWithID(ctx, id, filename, cr, opts); err != nil {
		return domain.Model{}, err
	}
	now := time.Now()
	return domain.Model{
		ID:          id,
		Filename:    filename,
		ContentType: contentType,
		Size:        cr.n,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (s *ModelStore) Open(ctx context.Context, id string, offset int64) (domain.ModelBlob, error) {
	ds, err := s.bucket.OpenDownloadStream(ctx, id)
	if errors.Is(err, mongo.ErrFileNotFound) {
		return domain.ModelBlob{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.ModelBlob{}, err
	}
	// Size refleja siempre el tamaño total del archivo (no el del rango pedido),
	// para poder construir la cabecera Content-Range.
	file := ds.GetFile()
	if offset > 0 {
		if _, err := ds.Skip(offset); err != nil {
			_ = ds.Close()
			return domain.ModelBlob{}, err
		}
	}
	m := domain.Model{
		ID:          id,
		Filename:    file.Name,
		ContentType: metadataContentType(file.Metadata),
		Size:        file.Length,
	}
	return domain.ModelBlob{Model: m, Content: ds}, nil
}
