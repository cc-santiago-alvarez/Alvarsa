package main

import "github.com/codecraftdev/alvarsa/internal/core/domain"

// Datos de PRUEBA derivados del prototipo dc-runtime (CATS y BASE_PRODUCTS).
// Sin imágenes: las reales las sube el admin y se guardan en GridFS. Solo 4
// productos de ejemplo; el resto del catálogo se crea desde el panel admin.

var seedCategories = []domain.Category{
	{NameES: "Mesas", NameEN: "Tables"},
	{NameES: "Estanterías", NameEN: "Shelving"},
	{NameES: "Sofás", NameEN: "Sofas"},
	{NameES: "Dormitorio", NameEN: "Bedroom"},
	{NameES: "Almacenaje", NameEN: "Storage"},
}

// Personalización común del prototipo (OPTS): metal / madera / medida.
var defaultCustomization = domain.Customization{
	Metal:  []string{"negro", "crudo", "oxido"},
	Madera: []string{"roble", "nogal", "pino"},
	Medida: []string{"s", "l", "custom"},
}

// seedProduct asocia un producto de prueba con el nombre de su categoría, que el
// seed resuelve al CategoryID (UUID) real tras crear las categorías.
type seedProduct struct {
	domain.Product
	categoryNameES string
}

var seedProducts = []seedProduct{
	{
		categoryNameES: "Mesas",
		Product: domain.Product{
			Name: "Mesa Fábrica", Price: 1890000, Dims: "180 × 90 × 76 cm",
			MaterialsES: "Roble recuperado · Hierro fundido", MaterialsEN: "Reclaimed oak · Cast iron",
			DescriptionES: "Tablón de roble recuperado sobre patas de hierro fundido en X. Una mesa que aguanta generaciones.",
			DescriptionEN: "A slab of reclaimed oak on cast-iron X legs. Built to outlast generations.",
		},
	},
	{
		categoryNameES: "Sofás",
		Product: domain.Product{
			Name: "Sofá Curtido", Price: 2890000, Dims: "165 × 82 × 78 cm",
			MaterialsES: "Piel coñac · Nogal oscuro", MaterialsEN: "Cognac leather · Dark walnut",
			DescriptionES: "Piel coñac curtida y capitoneada sobre estructura de nogal oscuro. Envejece contigo.",
			DescriptionEN: "Tufted cognac leather over a dark walnut frame. It ages with you.",
		},
	},
	{
		categoryNameES: "Estanterías",
		Product: domain.Product{
			Name: "Estantería Riel X", Price: 980000, Dims: "80 × 40 × 90 cm",
			MaterialsES: "Nogal · Acero negro", MaterialsEN: "Walnut · Black steel",
			DescriptionES: "Tres niveles de madera sobre bastidor de acero con refuerzo en cruz. Compacta y sólida.",
			DescriptionEN: "Three wood tiers on a cross-braced steel frame. Compact and solid.",
		},
	},
	{
		categoryNameES: "Dormitorio",
		Product: domain.Product{
			Name: "Cama Duelo", Price: 2450000, Dims: "160 × 200 cm",
			MaterialsES: "Nogal macizo · Lino", MaterialsEN: "Solid walnut · Linen",
			DescriptionES: "Plataforma en nogal macizo con cabecera tapizada en lino. Descanso de líneas limpias.",
			DescriptionEN: "A solid-walnut platform with a linen-upholstered headboard. Clean-lined rest.",
		},
	},
}
