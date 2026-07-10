// Package ports define las interfaces (puertos) del core hexagonal, agrupadas por
// concern en archivos separados.
//
//   - Puertos de ENTRADA (in_*.go): casos de uso que expone el core y consume el
//     adaptador HTTP. El rol del solicitante se pasa explícitamente para decidir
//     la autorización (moldeo de campos) dentro del core.
//   - Puertos de SALIDA (out_*.go): interfaces que implementan los adaptadores
//     (Mongo, GridFS, hashing). Todas las lecturas excluyen IsRemove=true; el
//     "borrado" es soft-delete (marca IsRemove), nunca físico.
package ports

import (
	"context"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// LoginInput son las credenciales de acceso.
type LoginInput struct {
	Email    string
	Password string
}

// RegisterInput es el alta pública de un cliente.
type RegisterInput struct {
	Email    string
	Password string
}

type AuthService interface {
	Register(ctx context.Context, in RegisterInput) (domain.User, error)
	Login(ctx context.Context, in LoginInput) (domain.Session, error)
	Logout(ctx context.Context, sessionID string) error
	// Authenticate valida el token de sesión y devuelve la sesión vigente.
	Authenticate(ctx context.Context, sessionID string) (domain.Session, error)
}

// CreateUserInput es el alta de un usuario por parte de un admin (puede fijar rol).
type CreateUserInput struct {
	Email    string
	Password string
	Role     domain.Role
}

// AdminUserService permite al admin crear usuarios (incluidos otros admins).
type AdminUserService interface {
	Create(ctx context.Context, in CreateUserInput) (domain.User, error)
}
