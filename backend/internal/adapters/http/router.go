package http

import "net/http"

// routes registra todas las rutas de la API usando el enrutado por método+patrón
// de Go 1.22. Las rutas admin se envuelven con requireAdmin; las de sesión con
// requireAuth. El resto son públicas (el rol solo modula los campos devueltos).
func (s *Server) routes() *http.ServeMux {
	mux := http.NewServeMux()

	// Salud
	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, _ *http.Request) {
		writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Catálogo (público, con moldeo por rol)
	mux.HandleFunc("GET /api/categories", s.handleListCategories)
	mux.HandleFunc("GET /api/products", s.handleListProducts)
	mux.HandleFunc("GET /api/products/{id}", s.handleGetProduct)

	// Creación de catálogo (solo admin)
	mux.HandleFunc("POST /api/categories", s.requireAdmin(s.handleCreateCategory))
	mux.HandleFunc("POST /api/users", s.requireAdmin(s.handleCreateUser))

	// Imágenes: lectura pública, subida admin
	mux.HandleFunc("GET /api/images/{id}", s.handleGetImage)
	mux.HandleFunc("POST /api/uploads", s.requireAdmin(s.handleUploadImage))

	// Formularios públicos
	mux.HandleFunc("POST /api/quotes", s.handleCreateQuote)
	mux.HandleFunc("POST /api/contact", s.handleCreateContact)

	// Auth
	mux.HandleFunc("POST /api/auth/register", s.handleRegister)
	mux.HandleFunc("POST /api/auth/login", s.handleLogin)
	mux.HandleFunc("POST /api/auth/logout", s.handleLogout)
	mux.HandleFunc("GET /api/auth/me", s.handleMe)

	// Gestión de productos (solo admin)
	mux.HandleFunc("POST /api/products", s.requireAdmin(s.handleCreateProduct))
	mux.HandleFunc("PUT /api/products/{id}", s.requireAdmin(s.handleUpdateProduct))
	mux.HandleFunc("DELETE /api/products/{id}", s.requireAdmin(s.handleDeleteProduct))

	// Lecturas admin-only
	mux.HandleFunc("GET /api/quotes", s.requireAdmin(s.handleListQuotes))
	mux.HandleFunc("GET /api/contact-requests", s.requireAdmin(s.handleListContacts))

	return mux
}
