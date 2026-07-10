package services

import "github.com/google/uuid"

// newID genera un identificador UUID v4 en formato string. Todas las colecciones
// usan _id de tipo UUID generado por la aplicación (no ObjectID de Mongo), de
// modo que el core es dueño de la identidad de las entidades.
func newID() string { return uuid.NewString() }
