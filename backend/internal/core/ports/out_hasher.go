package ports

// PasswordHasher abstrae el hashing de contraseñas.
type PasswordHasher interface {
	Hash(plain string) (string, error)
	Compare(hash, plain string) bool
}
