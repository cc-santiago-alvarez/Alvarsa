package services

import (
	"context"
	"io"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Image implementa ports.ImageService sobre un ImageStore (GridFS). La subida es
// admin-only (lo protege el middleware); la lectura es pública.
type Image struct {
	store ports.ImageStore
}

func NewImage(store ports.ImageStore) *Image {
	return &Image{store: store}
}

func (s *Image) Upload(ctx context.Context, filename, contentType string, r io.Reader) (domain.Image, error) {
	return s.store.Upload(ctx, newID(), filename, contentType, r)
}

func (s *Image) Get(ctx context.Context, id string) (domain.ImageBlob, error) {
	if id == "" {
		return domain.ImageBlob{}, domain.ErrNotFound
	}
	return s.store.Open(ctx, id)
}
