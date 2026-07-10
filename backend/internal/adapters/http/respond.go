package http

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// writeJSON serializa v como JSON con el status indicado.
func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if v != nil {
		_ = json.NewEncoder(w).Encode(v)
	}
}

// errorBody es el cuerpo estándar de error. El código sigue la convención de
// MAYÚSCULAS con guiones bajos (mismo valor que el error de dominio).
type errorBody struct {
	Error string `json:"error"`
}

// writeError traduce un error de dominio al status HTTP y código correspondiente.
func writeError(w http.ResponseWriter, err error) {
	status, code := http.StatusInternalServerError, "INTERNAL_ERROR"
	switch {
	case errors.Is(err, domain.ErrNotFound):
		status, code = http.StatusNotFound, err.Error()
	case errors.Is(err, domain.ErrInvalidInput):
		status, code = http.StatusBadRequest, err.Error()
	case errors.Is(err, domain.ErrInvalidCredential):
		status, code = http.StatusUnauthorized, err.Error()
	case errors.Is(err, domain.ErrUnauthorized):
		status, code = http.StatusUnauthorized, err.Error()
	case errors.Is(err, domain.ErrForbidden):
		status, code = http.StatusForbidden, err.Error()
	case errors.Is(err, domain.ErrEmailTaken):
		status, code = http.StatusConflict, err.Error()
	}
	writeJSON(w, status, errorBody{Error: code})
}

// decodeJSON lee y valida el cuerpo JSON de la petición.
func decodeJSON(r *http.Request, dst any) error {
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		return domain.ErrInvalidInput
	}
	return nil
}
