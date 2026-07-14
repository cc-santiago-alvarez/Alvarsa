package services

import (
	"context"
	"io"
	"path/filepath"
	"strings"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Model implementa ports.ModelService sobre un ModelStore (GridFS). La subida es
// admin-only (lo protege el middleware); la lectura es pública.
type Model struct {
	store ports.ModelStore
}

func NewModel(store ports.ModelStore) *Model {
	return &Model{store: store}
}

// modelContentType deriva el MIME de la extensión del archivo. Es la whitelist
// de formatos 3D admitidos; función pura para poder testearla sin el store.
func modelContentType(filename string) (string, error) {
	switch strings.ToLower(filepath.Ext(filename)) {
	case ".glb":
		return "model/gltf-binary", nil
	case ".usdz":
		return "model/vnd.usdz+zip", nil
	default:
		return "", domain.ErrInvalidInput
	}
}

func (s *Model) Upload(ctx context.Context, filename string, r io.Reader) (domain.Model, error) {
	ct, err := modelContentType(filename)
	if err != nil {
		return domain.Model{}, err
	}
	return s.store.Upload(ctx, newID(), filename, ct, r)
}

func (s *Model) Get(ctx context.Context, id string, offset int64) (domain.ModelBlob, error) {
	if id == "" {
		return domain.ModelBlob{}, domain.ErrNotFound
	}
	return s.store.Open(ctx, id, offset)
}
