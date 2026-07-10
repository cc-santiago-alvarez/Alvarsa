package domain

import "time"

// Category es una categoría del catálogo (mesas, estanterías, sofás, etc.).
// Bilingüe ES/EN. La imagen se referencia por id de GridFS (opcional).
//
// Se identifica únicamente por ID (UUID, _id de Mongo); los productos se
// relacionan con ella por ese ID (Product.CategoryID).
type Category struct {
	ID        string // UUID
	NameES    string
	NameEN    string
	ImageID   string // id de GridFS; vacío hasta que el admin suba imagen
	IsRemove  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}
