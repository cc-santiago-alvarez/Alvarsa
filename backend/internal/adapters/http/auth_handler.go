package http

import (
	"net/http"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// handleRegister da de alta un cliente (público) y abre sesión automáticamente.
func (s *Server) handleRegister(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	if _, err := s.auth.Register(r.Context(), ports.RegisterInput{Email: req.Email, Password: req.Password}); err != nil {
		writeError(w, err)
		return
	}
	// Inicia sesión tras registrarse.
	sess, err := s.auth.Login(r.Context(), ports.LoginInput{Email: req.Email, Password: req.Password})
	if err != nil {
		writeError(w, err)
		return
	}
	s.setSessionCookie(w, sess.ID, sess.ExpiresAt)
	writeJSON(w, http.StatusCreated, meDTO{Authenticated: true, Role: string(sess.Role), UserID: sess.UserID})
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := decodeJSON(r, &req); err != nil {
		writeError(w, err)
		return
	}
	sess, err := s.auth.Login(r.Context(), ports.LoginInput{Email: req.Email, Password: req.Password})
	if err != nil {
		writeError(w, err)
		return
	}
	s.setSessionCookie(w, sess.ID, sess.ExpiresAt)
	writeJSON(w, http.StatusOK, meDTO{Authenticated: true, Role: string(sess.Role), UserID: sess.UserID})
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(s.cfg.SessionCookieName); err == nil {
		_ = s.auth.Logout(r.Context(), c.Value)
	}
	s.clearSessionCookie(w)
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) handleMe(w http.ResponseWriter, r *http.Request) {
	sess, ok := sessionFrom(r.Context())
	if !ok {
		writeJSON(w, http.StatusOK, meDTO{Authenticated: false})
		return
	}
	writeJSON(w, http.StatusOK, meDTO{Authenticated: true, Role: string(sess.Role), UserID: sess.UserID})
}

func (s *Server) setSessionCookie(w http.ResponseWriter, value string, expires time.Time) {
	http.SetCookie(w, &http.Cookie{
		Name:     s.cfg.SessionCookieName,
		Value:    value,
		Path:     "/",
		Expires:  expires,
		HttpOnly: true,
		Secure:   s.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}

func (s *Server) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     s.cfg.SessionCookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   s.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})
}
