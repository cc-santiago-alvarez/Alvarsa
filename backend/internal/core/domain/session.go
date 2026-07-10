package domain

import "time"

// Session representa una sesión de servidor. El ID es un token opaco y aleatorio
// que viaja en una cookie httpOnly. El rol se denormaliza para autorizar sin
// consultar el usuario en cada petición.
//
// La expiración se aplica además con un índice TTL de Mongo sobre ExpiresAt.
type Session struct {
	ID        string
	UserID    string
	Role      Role
	ExpiresAt time.Time
	IsRemove  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Expired indica si la sesión ya venció respecto a now.
func (s Session) Expired(now time.Time) bool {
	return now.After(s.ExpiresAt)
}
