package domain

import "errors"

// Errores de dominio, agnósticos de infraestructura. Los adaptadores los
// traducen a códigos HTTP o de almacenamiento según corresponda.
// Convención: código en inglés, MAYÚSCULAS con guiones bajos.
var (
	ErrNotFound          = errors.New("RESOURCE_NOT_FOUND")
	ErrInvalidInput      = errors.New("INVALID_INPUT")
	ErrEmailTaken        = errors.New("EMAIL_ALREADY_TAKEN")
	ErrInvalidCredential = errors.New("INVALID_CREDENTIALS")
	ErrUnauthorized      = errors.New("UNAUTHENTICATED")
	ErrForbidden         = errors.New("FORBIDDEN")
)
