package http

import (
	"net/http"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// quoteRequest es el checkout del carrito (público).
type quoteRequest struct {
	Items []struct {
		ProductID string            `json:"productId"`
		Name      string            `json:"name"`
		Price     int64             `json:"price"`
		Qty       int               `json:"qty"`
		Options   map[string]string `json:"options"`
	} `json:"items"`
	Contact struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
		Email string `json:"email"`
	} `json:"contact"`
}

func (s *Server) handleCreateQuote(w http.ResponseWriter, r *http.Request) {
	var req quoteRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	items := make([]domain.QuoteItem, len(req.Items))
	for i, it := range req.Items {
		items[i] = domain.QuoteItem{ProductID: it.ProductID, Name: it.Name, Price: it.Price, Qty: it.Qty, Options: it.Options}
	}
	q, err := s.quotes.Create(r.Context(), ports.QuoteInput{
		Items:   items,
		Contact: domain.ContactInfo{Name: req.Contact.Name, Phone: req.Contact.Phone, Email: req.Contact.Email},
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, toQuoteDTO(q))
}

// contactRequest es el formulario de contacto (público).
type contactRequest struct {
	Name        string   `json:"name"`
	Phone       string   `json:"phone"`
	Reason      string   `json:"reason"`
	Attachments []string `json:"attachments"`
}

func (s *Server) handleCreateContact(w http.ResponseWriter, r *http.Request) {
	var req contactRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	c, err := s.contacts.Create(r.Context(), ports.ContactInput{
		Name: req.Name, Phone: req.Phone, Reason: req.Reason, Attachments: req.Attachments,
	})
	if err != nil {
		writeError(w, err)
		return
	}
	writeJSON(w, http.StatusCreated, toContactDTO(c))
}
