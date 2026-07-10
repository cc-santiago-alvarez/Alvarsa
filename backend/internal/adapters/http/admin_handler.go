package http

import (
	"net/http"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// productRequest es el cuerpo para crear/editar un producto (admin).
type productRequest struct {
	Name          string   `json:"name"`
	CategoryID    string   `json:"categoryId"`
	Price         int64    `json:"price"`
	Dims          string   `json:"dims"`
	MaterialsES   string   `json:"materialsEs"`
	MaterialsEN   string   `json:"materialsEn"`
	DescriptionES string   `json:"descriptionEs"`
	DescriptionEN string   `json:"descriptionEn"`
	ImageIDs      []string `json:"imageIds"`
	Customization struct {
		Metal  []string `json:"metal"`
		Madera []string `json:"madera"`
		Medida []string `json:"medida"`
	} `json:"customization"`
	Admin struct {
		InternalCost  int64  `json:"internalCost"`
		WorkshopNotes string `json:"workshopNotes"`
		SupplierRef   string `json:"supplierRef"`
	} `json:"admin"`
}

func (req productRequest) toInput() ports.ProductInput {
	return ports.ProductInput{
		Name:          req.Name,
		CategoryID:    req.CategoryID,
		Price:         req.Price,
		Dims:          req.Dims,
		MaterialsES:   req.MaterialsES,
		MaterialsEN:   req.MaterialsEN,
		DescriptionES: req.DescriptionES,
		DescriptionEN: req.DescriptionEN,
		ImageIDs:      req.ImageIDs,
		Customization: domain.Customization{Metal: req.Customization.Metal, Madera: req.Customization.Madera, Medida: req.Customization.Medida},
		Admin:         domain.AdminFields{InternalCost: req.Admin.InternalCost, WorkshopNotes: req.Admin.WorkshopNotes, SupplierRef: req.Admin.SupplierRef},
	}
}

func (s *Server) handleCreateProduct(w http.ResponseWriter, r *http.Request) {
	var req productRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	p, err := s.adminProducts.Create(r.Context(), req.toInput())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, toProductDTO(p, true)) // el admin ve todos los campos
}

func (s *Server) handleUpdateProduct(w http.ResponseWriter, r *http.Request) {
	var req productRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	p, err := s.adminProducts.Update(r.Context(), r.PathValue("id"), req.toInput())
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusOK, toProductDTO(p, true))
}

func (s *Server) handleDeleteProduct(w http.ResponseWriter, r *http.Request) {
	if err := s.adminProducts.Delete(r.Context(), r.PathValue("id")); err != nil {
		writeError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleListQuotes(w http.ResponseWriter, r *http.Request) {
	items, err := s.quotes.List(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]quoteDTO, len(items))
	for i, q := range items {
		out[i] = toQuoteDTO(q)
	}
	writeJSON(w, http.StatusOK, out)
}

func (s *Server) handleListContacts(w http.ResponseWriter, r *http.Request) {
	items, err := s.contacts.List(r.Context())
	if err != nil {
		writeError(w, err)
		return
	}
	out := make([]contactDTO, len(items))
	for i, c := range items {
		out[i] = toContactDTO(c)
	}
	writeJSON(w, http.StatusOK, out)
}

// createUserRequest es el alta de un usuario por un admin (puede fijar rol).
type createUserRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

func (s *Server) handleCreateUser(w http.ResponseWriter, r *http.Request) {
	var req createUserRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	u, err := s.adminUsers.Create(r.Context(), ports.CreateUserInput{
		Email: req.Email, Password: req.Password, Role: domain.Role(req.Role),
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"id": u.ID, "email": u.Email, "role": string(u.Role)})
}

// createCategoryRequest es el alta de una categoría (admin).
type createCategoryRequest struct {
	NameES  string `json:"nameEs"`
	NameEN  string `json:"nameEn"`
	ImageID string `json:"imageId"`
}

func (s *Server) handleCreateCategory(w http.ResponseWriter, r *http.Request) {
	var req createCategoryRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	c, err := s.adminCategories.Create(r.Context(), ports.CategoryInput{
		NameES: req.NameES, NameEN: req.NameEN, ImageID: req.ImageID,
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, toCategoryDTO(c))
}
