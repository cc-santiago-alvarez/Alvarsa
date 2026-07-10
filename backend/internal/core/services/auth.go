package services

import (
	"context"
	"strings"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// Auth implementa ports.AuthService con sesiones de servidor.
type Auth struct {
	users    ports.UserRepository
	sessions ports.SessionRepository
	hasher   ports.PasswordHasher
	ttl      time.Duration
	now      func() time.Time // inyectable para tests
}

func NewAuth(users ports.UserRepository, sessions ports.SessionRepository, hasher ports.PasswordHasher, ttl time.Duration) *Auth {
	return &Auth{users: users, sessions: sessions, hasher: hasher, ttl: ttl, now: time.Now}
}

// Register da de alta un cliente (rol customer). El correo debe ser único.
func (a *Auth) Register(ctx context.Context, in ports.RegisterInput) (domain.User, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))
	if email == "" || len(in.Password) < 6 {
		return domain.User{}, domain.ErrInvalidInput
	}
	hash, err := a.hasher.Hash(in.Password)
	if err != nil {
		return domain.User{}, err
	}
	now := a.now()
	u := domain.User{
		ID:           newID(),
		Email:        email,
		PasswordHash: hash,
		Role:         domain.RoleCustomer,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	return a.users.Create(ctx, u)
}

func (a *Auth) Login(ctx context.Context, in ports.LoginInput) (domain.Session, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))
	if email == "" || in.Password == "" {
		return domain.Session{}, domain.ErrInvalidCredential
	}
	u, err := a.users.GetByEmail(ctx, email)
	if err != nil {
		// No revelar si el correo existe: mismo error que credencial inválida.
		return domain.Session{}, domain.ErrInvalidCredential
	}
	if !a.hasher.Compare(u.PasswordHash, in.Password) {
		return domain.Session{}, domain.ErrInvalidCredential
	}
	now := a.now()
	sess := domain.Session{
		ID:        newID(), // UUID v4 como token opaco de sesión
		UserID:    u.ID,
		Role:      u.Role,
		ExpiresAt: now.Add(a.ttl),
		CreatedAt: now,
		UpdatedAt: now,
	}
	return a.sessions.Create(ctx, sess)
}

func (a *Auth) Logout(ctx context.Context, sessionID string) error {
	if sessionID == "" {
		return nil
	}
	return a.sessions.SoftDelete(ctx, sessionID)
}

func (a *Auth) Authenticate(ctx context.Context, sessionID string) (domain.Session, error) {
	if sessionID == "" {
		return domain.Session{}, domain.ErrUnauthorized
	}
	sess, err := a.sessions.GetByID(ctx, sessionID)
	if err != nil {
		return domain.Session{}, domain.ErrUnauthorized
	}
	if sess.Expired(a.now()) {
		_ = a.sessions.SoftDelete(ctx, sessionID)
		return domain.Session{}, domain.ErrUnauthorized
	}
	return sess, nil
}
