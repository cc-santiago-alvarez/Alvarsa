package ports

import (
	"context"
	"io"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ModelService es el caso de uso de modelos 3D. A diferencia de ImageService,
// Upload NO recibe el content-type del cliente: el navegador manda vacío u
// octet-stream para .glb/.usdz, así que el core lo deriva del nombre de archivo.
type ModelService interface {
	Upload(ctx context.Context, filename string, r io.Reader) (domain.Model, error)
	Get(ctx context.Context, id string, offset int64) (domain.ModelBlob, error)
}
