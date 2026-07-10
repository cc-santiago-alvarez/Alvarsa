package http

import (
	"context"
	"net/http"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

type ctxKey int

const sessionKey ctxKey = iota

// withSession devuelve un contexto que incluye la sesión autenticada.
func withSession(ctx context.Context, s domain.Session) context.Context {
	return context.WithValue(ctx, sessionKey, s)
}

// sessionFrom extrae la sesión del contexto (ok=false si es anónimo).
func sessionFrom(ctx context.Context) (domain.Session, bool) {
	s, ok := ctx.Value(sessionKey).(domain.Session)
	return s, ok
}

// roleFrom devuelve el rol efectivo del solicitante. Anónimo → RoleCustomer,
// para que el moldeo de campos por rol trate a anónimos como usuarios generales.
func roleFrom(ctx context.Context) domain.Role {
	if s, ok := sessionFrom(ctx); ok {
		return s.Role
	}
	return domain.RoleCustomer
}

// cors habilita CORS con credenciales para el origen del frontend.
func (s *Server) cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", s.cfg.CORSOrigin)
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Vary", "Origin")
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// resolveSession intenta autenticar la sesión desde la cookie SIN exigirla, e
// inyecta la sesión en el contexto cuando es válida. Así los handlers conocen el
// rol para el moldeo por rol; las rutas protegidas lo validan con requireAuth/Admin.
func (s *Server) resolveSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie(s.cfg.SessionCookieName)
		if err == nil && c.Value != "" {
			if sess, err := s.auth.Authenticate(r.Context(), c.Value); err == nil {
				r = r.WithContext(withSession(r.Context(), sess))
			}
		}
		next.ServeHTTP(w, r)
	})
}

// requireAuth exige una sesión válida (401 en caso contrario).
func (s *Server) requireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if _, ok := sessionFrom(r.Context()); !ok {
			writeError(w, domain.ErrUnauthorized)
			return
		}
		next(w, r)
	}
}

// requireAdmin exige una sesión con rol admin (403 si es usuario general).
func (s *Server) requireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		sess, ok := sessionFrom(r.Context())
		if !ok {
			writeError(w, domain.ErrUnauthorized)
			return
		}
		if !sess.Role.IsAdmin() {
			writeError(w, domain.ErrForbidden)
			return
		}
		next(w, r)
	}
}
