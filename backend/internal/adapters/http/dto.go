package http

import (
	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// customizationDTO expone las etiquetas de personalización disponibles.
type customizationDTO struct {
	Metal  []string `json:"metal"`
	Madera []string `json:"madera"`
	Medida []string `json:"medida"`
}

// model3DDTO expone las referencias del modelo 3D para AR. Se serializa solo
// cuando el producto tiene .glb (puntero omitempty), así el frontend detecta la
// presencia de modelo por la existencia del bloque.
type model3DDTO struct {
	GLBID    string  `json:"glbId"`
	USDZID   string  `json:"usdzId"`
	PosterID string  `json:"posterId"`
	WidthCM  float64 `json:"widthCm"`
	HeightCM float64 `json:"heightCm"`
	DepthCM  float64 `json:"depthCm"`
}

// adminFieldsDTO son los campos internos; solo se incluye para admins.
type adminFieldsDTO struct {
	InternalCost  int64  `json:"internalCost"`
	WorkshopNotes string `json:"workshopNotes"`
	SupplierRef   string `json:"supplierRef"`
}

type productDTO struct {
	ID            string           `json:"id"`
	Name          string           `json:"name"`
	CategoryID    string           `json:"categoryId"`
	Price         int64            `json:"price"`
	Dims          string           `json:"dims"`
	MaterialsES   string           `json:"materialsEs"`
	MaterialsEN   string           `json:"materialsEn"`
	DescriptionES string           `json:"descriptionEs"`
	DescriptionEN string           `json:"descriptionEn"`
	ImageIDs      []string         `json:"imageIds"`
	Customization customizationDTO `json:"customization"`
	// Model3D solo se serializa cuando el producto tiene .glb.
	Model3D *model3DDTO `json:"model3d,omitempty"`
	Custom  bool        `json:"custom"`
	// Admin solo se serializa (no-nil) cuando el solicitante es admin.
	Admin *adminFieldsDTO `json:"admin,omitempty"`
}

// toProductDTO construye el DTO. includeAdmin refleja el rol; cuando es false, el
// bloque admin se omite (el core ya lo dejó vacío, doble garantía).
func toProductDTO(p domain.Product, includeAdmin bool) productDTO {
	dto := productDTO{
		ID:            p.ID,
		Name:          p.Name,
		CategoryID:    p.CategoryID,
		Price:         p.Price,
		Dims:          p.Dims,
		MaterialsES:   p.MaterialsES,
		MaterialsEN:   p.MaterialsEN,
		DescriptionES: p.DescriptionES,
		DescriptionEN: p.DescriptionEN,
		ImageIDs:      emptyIfNil(p.ImageIDs),
		Customization: customizationDTO{
			Metal:  emptyIfNil(p.Customization.Metal),
			Madera: emptyIfNil(p.Customization.Madera),
			Medida: emptyIfNil(p.Customization.Medida),
		},
		Custom: p.Custom,
	}
	if p.Model3D.GLBID != "" {
		dto.Model3D = &model3DDTO{
			GLBID:    p.Model3D.GLBID,
			USDZID:   p.Model3D.USDZID,
			PosterID: p.Model3D.PosterID,
			WidthCM:  p.Model3D.WidthCM,
			HeightCM: p.Model3D.HeightCM,
			DepthCM:  p.Model3D.DepthCM,
		}
	}
	if includeAdmin {
		dto.Admin = &adminFieldsDTO{
			InternalCost:  p.Admin.InternalCost,
			WorkshopNotes: p.Admin.WorkshopNotes,
			SupplierRef:   p.Admin.SupplierRef,
		}
	}
	return dto
}

type categoryDTO struct {
	ID      string `json:"id"`
	NameES  string `json:"nameEs"`
	NameEN  string `json:"nameEn"`
	ImageID string `json:"imageId"`
}

func toCategoryDTO(c domain.Category) categoryDTO {
	return categoryDTO{ID: c.ID, NameES: c.NameES, NameEN: c.NameEN, ImageID: c.ImageID}
}

type meDTO struct {
	Authenticated bool   `json:"authenticated"`
	Role          string `json:"role"`
	UserID        string `json:"userId"`
}

type quoteDTO struct {
	ID       string `json:"id"`
	Subtotal int64  `json:"subtotal"`
	Status   string `json:"status"`
	Contact  struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
		Email string `json:"email"`
	} `json:"contact"`
	Items []quoteItemDTO `json:"items"`
}

type quoteItemDTO struct {
	ProductID string            `json:"productId"`
	Name      string            `json:"name"`
	Price     int64             `json:"price"`
	Qty       int               `json:"qty"`
	Options   map[string]string `json:"options"`
}

func toQuoteDTO(q domain.Quote) quoteDTO {
	var dto quoteDTO
	dto.ID = q.ID
	dto.Subtotal = q.Subtotal
	dto.Status = string(q.Status)
	dto.Contact.Name = q.Contact.Name
	dto.Contact.Phone = q.Contact.Phone
	dto.Contact.Email = q.Contact.Email
	dto.Items = make([]quoteItemDTO, len(q.Items))
	for i, it := range q.Items {
		dto.Items[i] = quoteItemDTO{
			ProductID: it.ProductID, Name: it.Name, Price: it.Price, Qty: it.Qty, Options: it.Options,
		}
	}
	return dto
}

type contactDTO struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Phone       string   `json:"phone"`
	Reason      string   `json:"reason"`
	Attachments []string `json:"attachments"`
}

func toContactDTO(c domain.ContactRequest) contactDTO {
	return contactDTO{
		ID: c.ID, Name: c.Name, Phone: c.Phone, Reason: c.Reason,
		Attachments: emptyIfNil(c.Attachments),
	}
}

// emptyIfNil evita serializar null en arrays JSON vacíos.
func emptyIfNil(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}
