package domain

import "time"

// Role define el rol de un usuario para la autorización (RBAC).
type Role string

const (
	RoleAdmin    Role = "admin"
	RoleCustomer Role = "customer"
)

func (r Role) IsAdmin() bool { return r == RoleAdmin }

// Valid indica si el rol es uno de los conocidos.
func (r Role) Valid() bool { return r == RoleAdmin || r == RoleCustomer }

// User es una cuenta del sistema. El PasswordHash nunca se expone hacia afuera.
//
// IsRemove implementa soft-delete: los registros nunca se eliminan físicamente;
// se marcan con IsRemove=true y las consultas los excluyen.
type User struct {
	ID           string
	Email        string
	PasswordHash string
	Role         Role
	IsRemove     bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
