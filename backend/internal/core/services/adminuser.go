package services

import (
	"context"
	"strings"
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// AdminUser implementa ports.AdminUserService: alta de usuarios por un admin,
// pudiendo asignar rol (incluido admin). Protegido por requireAdmin en el router.
type AdminUser struct {
	users  ports.UserRepository
	hasher ports.PasswordHasher
	now    func() time.Time
}

func NewAdminUser(users ports.UserRepository, hasher ports.PasswordHasher) *AdminUser {
	return &AdminUser{users: users, hasher: hasher, now: time.Now}
}

func (s *AdminUser) Create(ctx context.Context, in ports.CreateUserInput) (domain.User, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))
	if email == "" || len(in.Password) < 6 {
		return domain.User{}, domain.ErrInvalidInput
	}
	role := in.Role
	if !role.Valid() {
		role = domain.RoleCustomer
	}
	hash, err := s.hasher.Hash(in.Password)
	if err != nil {
		return domain.User{}, err
	}
	now := s.now()
	u := domain.User{
		ID:           newID(),
		Email:        email,
		PasswordHash: hash,
		Role:         role,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	return s.users.Create(ctx, u)
}
