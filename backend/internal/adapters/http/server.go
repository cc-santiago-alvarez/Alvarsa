package http

import (
	"net/http"

	"github.com/codecraftdev/alvarsa/internal/config"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Server es el adaptador HTTP (driving). Agrupa los puertos de entrada (casos de
// uso) y construye el router. No conoce MongoDB: depende solo de las interfaces.
type Server struct {
	catalog         ports.CatalogService
	auth            ports.AuthService
	adminProducts   ports.AdminProductService
	adminCategories ports.AdminCategoryService
	adminUsers      ports.AdminUserService
	quotes          ports.QuoteService
	contacts        ports.ContactService
	images          ports.ImageService
	cfg             config.Config
}

// Deps agrupa las dependencias del servidor HTTP.
type Deps struct {
	Catalog         ports.CatalogService
	Auth            ports.AuthService
	AdminProducts   ports.AdminProductService
	AdminCategories ports.AdminCategoryService
	AdminUsers      ports.AdminUserService
	Quotes          ports.QuoteService
	Contacts        ports.ContactService
	Images          ports.ImageService
	Config          config.Config
}

func NewServer(d Deps) *Server {
	return &Server{
		catalog:         d.Catalog,
		auth:            d.Auth,
		adminProducts:   d.AdminProducts,
		adminCategories: d.AdminCategories,
		adminUsers:      d.AdminUsers,
		quotes:          d.Quotes,
		contacts:        d.Contacts,
		images:          d.Images,
		cfg:             d.Config,
	}
}

// Handler devuelve el http.Handler raíz con todas las rutas y middleware globales.
func (s *Server) Handler() http.Handler {
	mux := s.routes()
	// Middleware global: CORS y resolución opcional de sesión (para conocer el rol).
	return s.cors(s.resolveSession(mux))
}
