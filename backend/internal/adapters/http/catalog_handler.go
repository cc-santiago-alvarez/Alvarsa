package http

import (
	"net/http"

	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

func (s *Server) handleListProducts(w http.ResponseWriter, r *http.Request) {
	role := roleFrom(r.Context())
	f := ports.ProductFilter{
		CategoryID: r.URL.Query().Get("categoryId"),
		Query:      r.URL.Query().Get("q"),
	}
	items, err := s.catalog.ListProducts(r.Context(), role, f)
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]productDTO, len(items))
	for i, p := range items {
		out[i] = toProductDTO(p, role.IsAdmin())
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) handleGetProduct(w http.ResponseWriter, r *http.Request) {
	role := roleFrom(r.Context())
	p, err := s.catalog.GetProduct(r.Context(), role, r.PathValue("id"))
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, toProductDTO(p, role.IsAdmin()))
}

func (s *Server) handleListCategories(w http.ResponseWriter, r *http.Request) {
	cats, err := s.catalog.ListCategories(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]categoryDTO, len(cats))
	for i, c := range cats {
		out[i] = toCategoryDTO(c)
	}
	writeJSON(w, http.StatusOK, out)
}
