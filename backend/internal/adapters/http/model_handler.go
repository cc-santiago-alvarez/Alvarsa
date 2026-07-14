package http

import (
	"io"
	"net/http"
	"strconv"
	"strings"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

const maxModelBytes = 50 << 20 // 50 MB por modelo 3D

type modelDTO struct {
	ID          string `json:"id"`
	Filename    string `json:"filename"`
	ContentType string `json:"contentType"`
	Size        int64  `json:"size"`
}

// handleUploadModel recibe un modelo 3D multipart (campo "file") y lo guarda en
// GridFS. Solo admin (protegido por requireAdmin en el router). El content-type
// lo deriva el core del nombre de archivo (.glb / .usdz), no del header.
func (s *Server) handleUploadModel(w http.ResponseWriter, r *http.Request) {
	// MaxBytesReader es lo único que limita de verdad el tamaño de subida:
	// ParseMultipartForm(n) solo controla cuánto se mantiene en memoria.
	r.Body = http.MaxBytesReader(w, r.Body, maxModelBytes)
	if err := r.ParseMultipartForm(maxModelBytes); err != nil {
		writeError(w, domain.ErrInvalidInput)
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, domain.ErrInvalidInput)
		return
	}
	defer file.Close()

	m, err := s.models.Upload(r.Context(), header.Filename, file)
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, modelDTO{
		ID: m.ID, Filename: m.Filename, ContentType: m.ContentType, Size: m.Size,
	})
}

// handleGetModel transmite el modelo desde GridFS (público). Implementa Range a
// mano porque el GridFSDownloadStream no es io.ReadSeeker (no sirve ServeContent).
// Scene Viewer (Android) y Quick Look (iOS) piden rangos al descargar el binario.
func (s *Server) handleGetModel(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	rangeHeader := r.Header.Get("Range")

	// Sin Range: descarga completa.
	if rangeHeader == "" {
		blob, err := s.models.Get(r.Context(), id, 0)
		if err != nil {
			writeError(w, err)
			return
		}
		defer blob.Content.Close()
		w.Header().Set("Content-Type", blob.ContentType)
		w.Header().Set("Accept-Ranges", "bytes")
		if blob.Size > 0 {
			w.Header().Set("Content-Length", strconv.FormatInt(blob.Size, 10))
		}
		w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		_, _ = io.Copy(w, blob.Content)
		return
	}

	// Con Range: primero abrimos en offset 0 para conocer el tamaño total y
	// validar el rango; luego reabrimos ya posicionado en start.
	head, err := s.models.Get(r.Context(), id, 0)
	if err != nil {
		writeError(w, err)
		return
	}
	total := head.Size
	_ = head.Content.Close()

	start, end, ok := parseByteRange(rangeHeader, total)
	if !ok {
		w.Header().Set("Content-Range", "bytes */"+strconv.FormatInt(total, 10))
		writeJSON(w, http.StatusRequestedRangeNotSatisfiable, errorBody{Error: "RANGE_NOT_SATISFIABLE"})
		return
	}

	blob, err := s.models.Get(r.Context(), id, start)
	if err != nil {
		writeError(w, err)
		return
	}
	defer blob.Content.Close()

	length := end - start + 1
	w.Header().Set("Content-Type", blob.ContentType)
	w.Header().Set("Accept-Ranges", "bytes")
	w.Header().Set("Content-Range", "bytes "+strconv.FormatInt(start, 10)+"-"+strconv.FormatInt(end, 10)+"/"+strconv.FormatInt(total, 10))
	w.Header().Set("Content-Length", strconv.FormatInt(length, 10))
	w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
	w.WriteHeader(http.StatusPartialContent)
	_, _ = io.CopyN(w, blob.Content, length)
}

// parseByteRange interpreta una cabecera "bytes=start-end" (un solo rango).
// Devuelve el rango absoluto [start,end] cerrado y ok=false si es inválido.
func parseByteRange(header string, total int64) (start, end int64, ok bool) {
	if total <= 0 || !strings.HasPrefix(header, "bytes=") {
		return 0, 0, false
	}
	spec := strings.TrimPrefix(header, "bytes=")
	if strings.Contains(spec, ",") {
		return 0, 0, false // rangos múltiples no soportados
	}
	dash := strings.IndexByte(spec, '-')
	if dash < 0 {
		return 0, 0, false
	}
	startStr, endStr := spec[:dash], spec[dash+1:]

	switch {
	case startStr == "": // sufijo: bytes=-N (últimos N bytes)
		n, err := strconv.ParseInt(endStr, 10, 64)
		if err != nil || n <= 0 {
			return 0, 0, false
		}
		if n > total {
			n = total
		}
		return total - n, total - 1, true
	default:
		start, err := strconv.ParseInt(startStr, 10, 64)
		if err != nil || start < 0 || start >= total {
			return 0, 0, false
		}
		end := total - 1
		if endStr != "" {
			e, err := strconv.ParseInt(endStr, 10, 64)
			if err != nil || e < start {
				return 0, 0, false
			}
			if e < end {
				end = e
			}
		}
		return start, end, true
	}
}
