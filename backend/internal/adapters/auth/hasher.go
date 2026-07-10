// Package auth contiene adaptadores de salida relacionados con autenticación.
package auth

import "golang.org/x/crypto/bcrypt"

// BcryptHasher implementa ports.PasswordHasher usando bcrypt.
type BcryptHasher struct {
	cost int
}

// NewBcryptHasher crea el hasher. Si cost <= 0 usa el coste por defecto de bcrypt.
func NewBcryptHasher(cost int) *BcryptHasher {
	if cost <= 0 {
		cost = bcrypt.DefaultCost
	}
	return &BcryptHasher{cost: cost}
}

func (h *BcryptHasher) Hash(plain string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(plain), h.cost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func (h *BcryptHasher) Compare(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}
