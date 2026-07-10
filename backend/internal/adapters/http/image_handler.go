package http

import (
	"io"
	"net/http"
	"strconv"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

const maxUploadBytes = 15 << 20 // 15 MB por imagen

type imageDTO struct {
	ID          string `json:"id"`
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
	Size        int64  `json:"size"`
}

// handleUploadImage recibe una imagen multipart (campo "file") y la guarda en
// GridFS. Solo admin (protegido por requireAdmin en el router).
func (s *Server) handleUploadImage(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		writeError(w, domain.ErrInvalidInput)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, domain.ErrInvalidInput)
		return
	}
	defer file.Close()

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	img, err := s.images.Upload(r.Context(), header.Filename, contentType, file)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, imageDTO{
		ID: img.ID, Filename: img.Filename, ContentType: img.ContentType, Size: img.Size,
	})
}

// handleGetImage transmite el binario desde GridFS (público).
func (s *Server) handleGetImage(w http.ResponseWriter, r *http.Request) {
	blob, err := s.images.Get(r.Context(), r.PathValue("id"))
	if err != nil {
		writeError(w, err)
		return
	}
	defer blob.Content.Close()

	w.Header().Set("Content-Type", blob.ContentType)
	if blob.Size > 0 {
		w.Header().Set("Content-Length", strconv.FormatInt(blob.Size, 10))
	}
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	_, _ = io.Copy(w, blob.Content)
}
