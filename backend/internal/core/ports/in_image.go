package ports

import (
	"context"
	"io"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type ImageService interface {
	Upload(ctx context.Context, filename, contentType string, r io.Reader) (domain.Image, error)
	Get(ctx context.Context, id string) (domain.ImageBlob, error)
}
