package domain

import "time"

// Customization son las etiquetas de personalización disponibles para una pieza,
// derivadas de OPTS del prototipo (metal / madera / medida). Cada slice contiene
// los valores de opción habilitados para ese producto.
type Customization struct {
	Metal  []string
	Madera []string
	Medida []string
}

// Model3D referencia los binarios de realidad aumentada de una pieza, subidos por
// el admin y servidos desde GridFS (bucket "models"). Es información pública: el
// frontend la necesita para renderizar el AR. Si GLBID está vacío, el producto no
// tiene modelo 3D (el frontend no muestra el botón AR). La escala física la lleva
// el propio .glb; las dimensiones en cm son informativas.
type Model3D struct {
	GLBID    string  // id GridFS del .glb (Android/web); vacío ⇒ sin AR
	USDZID   string  // id GridFS del .usdz (AR iOS); opcional
	PosterID string  // id de imagen (bucket images) como póster de carga; opcional
	WidthCM  float64 // dimensiones reales informativas
	HeightCM float64
	DepthCM  float64
}

// AdminFields agrupa la información interna del taller que SOLO el admin puede ver.
// Nunca se expone a usuarios generales ni anónimos (RBAC a nivel de campo).
type AdminFields struct {
	InternalCost  int64  // costo interno en COP
	WorkshopNotes string // notas de taller
	SupplierRef   string // referencia de proveedor
}

// Product es una pieza del catálogo. Bilingüe ES/EN. Las imágenes se referencian
// por ids de GridFS (las del prototipo eran solo demo).
type Product struct {
	ID            string
	Name          string
	CategoryID    string // UUID de Category (relación)
	Price         int64  // COP
	Dims          string
	MaterialsES   string
	MaterialsEN   string
	DescriptionES string
	DescriptionEN string
	ImageIDs      []string // ids de GridFS
	Customization Customization
	Model3D       Model3D // modelo 3D para AR (público); vacío si no tiene
	Custom        bool    // pieza creada por el admin (equivalente al flag _custom del prototipo)

	Admin AdminFields // campos admin-only

	IsRemove  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// PublicView devuelve una copia del producto sin los campos admin-only.
// La decisión de autorización vive en el dominio: los servicios llaman a este
// método para roles no-admin, garantizando que la info interna nunca sale del core.
func (p Product) PublicView() Product {
	p.Admin = AdminFields{}
	return p
}

// ViewFor devuelve el producto completo si el rol es admin, o su vista pública
// en caso contrario.
func (p Product) ViewFor(role Role) Product {
	if role.IsAdmin() {
		return p
	}
	return p.PublicView()
}
