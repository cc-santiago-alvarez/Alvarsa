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

// ImageStore implementa ports.ImageStore sobre GridFS. El _id del archivo es el
// UUID generado por el core (no ObjectID). El content-type se guarda en metadata.
type ImageStore struct {
	bucket *mongo.GridFSBucket
}

func NewImageStore(db *mongo.Database) *ImageStore {
	bucket := db.GridFSBucket(options.GridFSBucket().SetName(GridFSBucket))
	return &ImageStore{bucket: bucket}
}

// countingReader cuenta los bytes leídos para conocer el tamaño subido.
type countingReader struct {
	r io.Reader
	n int64
}

func (c *countingReader) Read(p []byte) (int, error) {
	n, err := c.r.Read(p)
	c.n += int64(n)
	return n, err
}

func (s *ImageStore) Upload(ctx context.Context, id, filename, contentType string, r io.Reader) (domain.Image, error) {
	cr := &countingReader{r: r}
	opts := options.GridFSUpload().SetMetadata(bson.M{"contentType": contentType})
	if err := s.bucket.UploadFromStreamWithID(ctx, id, filename, cr, opts); err != nil {
		return domain.Image{}, err
	}
	now := time.Now()
	return domain.Image{
		ID:          id,
		Filename:    filename,
		ContentType: contentType,
		Size:        cr.n,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func (s *ImageStore) Open(ctx context.Context, id string) (domain.ImageBlob, error) {
	ds, err := s.bucket.OpenDownloadStream(ctx, id)
	if errors.Is(err, mongo.ErrFileNotFound) {
		return domain.ImageBlob{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.ImageBlob{}, err
	}
	file := ds.GetFile()
	img := domain.Image{
		ID:          id,
		Filename:    file.Name,
		ContentType: metadataContentType(file.Metadata),
		Size:        file.Length,
	}
	return domain.ImageBlob{Image: img, Content: ds}, nil
}

// metadataContentType extrae el content-type de la metadata BSON del archivo.
func metadataContentType(raw bson.Raw) string {
	if len(raw) == 0 {
		return "application/octet-stream"
	}
	var meta struct {
		ContentType string `bson:"contentType"`
	}
	if err := bson.Unmarshal(raw, &meta); err != nil || meta.ContentType == "" {
		return "application/octet-stream"
	}
	return meta.ContentType
}
