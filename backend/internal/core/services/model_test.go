package services

import (
	"context"
	"io"
	"strings"
	"testing"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// mockModelStore es un doble en memoria del puerto de salida ModelStore. Registra
// lo recibido en la última llamada para poder verificarlo.
type mockModelStore struct {
	uploaded    bool
	gotID       string
	gotFilename string
	gotCT       string
	gotOffset   int64
}

func (m *mockModelStore) Upload(_ context.Context, id, filename, contentType string, _ io.Reader) (domain.Model, error) {
	m.uploaded = true
	m.gotID, m.gotFilename, m.gotCT = id, filename, contentType
	return domain.Model{ID: id, Filename: filename, ContentType: contentType}, nil
}

func (m *mockModelStore) Open(_ context.Context, id string, offset int64) (domain.ModelBlob, error) {
	m.gotOffset = offset
	return domain.ModelBlob{
		Model:   domain.Model{ID: id, Size: 2048},
		Content: io.NopCloser(strings.NewReader("")),
	}, nil
}

// Un .glb debe derivar el content-type correcto y generar un id no vacío.
func TestModelUpload_DerivesGLBContentType(t *testing.T) {
	store := &mockModelStore{}
	svc := NewModel(store)

	m, err := svc.Upload(context.Background(), "Shelf_04_a.glb", strings.NewReader("data"))
	if err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if store.gotCT != "model/gltf-binary" {
		t.Errorf("esperaba model/gltf-binary, obtuve %q", store.gotCT)
	}
	if m.ID == "" || store.gotID == "" {
		t.Error("el core debería generar un id no vacío")
	}
}

// Un .usdz (mayúsculas incluidas) deriva el MIME de Quick Look.
func TestModelUpload_DerivesUSDZContentType(t *testing.T) {
	store := &mockModelStore{}
	svc := NewModel(store)

	if _, err := svc.Upload(context.Background(), "Chair.USDZ", strings.NewReader("data")); err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if store.gotCT != "model/vnd.usdz+zip" {
		t.Errorf("esperaba model/vnd.usdz+zip, obtuve %q", store.gotCT)
	}
}

// Una extensión no permitida se rechaza sin tocar el store.
func TestModelUpload_RejectsUnknownExtension(t *testing.T) {
	for _, name := range []string{"malware.exe", "modelo", "foto.png"} {
		store := &mockModelStore{}
		svc := NewModel(store)
		if _, err := svc.Upload(context.Background(), name, strings.NewReader("x")); err != domain.ErrInvalidInput {
			t.Errorf("%q: esperaba ErrInvalidInput, obtuve %v", name, err)
		}
		if store.uploaded {
			t.Errorf("%q: no debería haberse invocado el store", name)
		}
	}
}

// Un id vacío devuelve ErrNotFound sin tocar el store.
func TestModelGet_EmptyIDNotFound(t *testing.T) {
	svc := NewModel(&mockModelStore{})
	if _, err := svc.Get(context.Background(), "", 0); err != domain.ErrNotFound {
		t.Errorf("esperaba ErrNotFound, obtuve %v", err)
	}
}

// El offset de una petición Range se propaga al store.
func TestModelGet_PassesOffset(t *testing.T) {
	store := &mockModelStore{}
	svc := NewModel(store)
	if _, err := svc.Get(context.Background(), "m1", 1024); err != nil {
		t.Fatalf("error inesperado: %v", err)
	}
	if store.gotOffset != 1024 {
		t.Errorf("esperaba offset 1024, obtuve %d", store.gotOffset)
	}
}
