package mongo

import (
	"time"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// Este archivo concentra el mapeo entre las entidades de dominio y los documentos
// BSON. El dominio no conoce estos tags: la persistencia vive solo aquí.
// Todos los _id son UUID en formato string (no ObjectID de Mongo).

// --- Product ---

type customizationDoc struct {
	Metal  []string `bson:"metal"`
	Madera []string `bson:"madera"`
	Medida []string `bson:"medida"`
}

type adminFieldsDoc struct {
	InternalCost  int64  `bson:"internal_cost"`
	WorkshopNotes string `bson:"workshop_notes"`
	SupplierRef   string `bson:"supplier_ref"`
}

type productDoc struct {
	ID            string           `bson:"_id"`
	Name          string           `bson:"name"`
	CategoryID    string           `bson:"category_id"`
	Price         int64            `bson:"price"`
	Dims          string           `bson:"dims"`
	MaterialsES   string           `bson:"materials_es"`
	MaterialsEN   string           `bson:"materials_en"`
	DescriptionES string           `bson:"description_es"`
	DescriptionEN string           `bson:"description_en"`
	ImageIDs      []string         `bson:"image_ids"`
	Customization customizationDoc `bson:"customization"`
	Admin         adminFieldsDoc   `bson:"admin"`
	Custom        bool             `bson:"custom"`
	IsRemove      bool             `bson:"is_remove"`
	CreatedAt     time.Time        `bson:"created_at"`
	UpdatedAt     time.Time        `bson:"updated_at"`
}

func productToDoc(p domain.Product) productDoc {
	return productDoc{
		ID:            p.ID,
		Name:          p.Name,
		CategoryID:    p.CategoryID,
		Price:         p.Price,
		Dims:          p.Dims,
		MaterialsES:   p.MaterialsES,
		MaterialsEN:   p.MaterialsEN,
		DescriptionES: p.DescriptionES,
		DescriptionEN: p.DescriptionEN,
		ImageIDs:      p.ImageIDs,
		Customization: customizationDoc(p.Customization),
		Admin:         adminFieldsDoc(p.Admin),
		Custom:        p.Custom,
		IsRemove:      p.IsRemove,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}
}

func (d productDoc) toDomain() domain.Product {
	return domain.Product{
		ID:            d.ID,
		Name:          d.Name,
		CategoryID:    d.CategoryID,
		Price:         d.Price,
		Dims:          d.Dims,
		MaterialsES:   d.MaterialsES,
		MaterialsEN:   d.MaterialsEN,
		DescriptionES: d.DescriptionES,
		DescriptionEN: d.DescriptionEN,
		ImageIDs:      d.ImageIDs,
		Customization: domain.Customization(d.Customization),
		Admin:         domain.AdminFields(d.Admin),
		Custom:        d.Custom,
		IsRemove:      d.IsRemove,
		CreatedAt:     d.CreatedAt,
		UpdatedAt:     d.UpdatedAt,
	}
}

// --- Category ---

type categoryDoc struct {
	ID        string    `bson:"_id"` // UUID
	NameES    string    `bson:"name_es"`
	NameEN    string    `bson:"name_en"`
	ImageID   string    `bson:"image_id"`
	IsRemove  bool      `bson:"is_remove"`
	CreatedAt time.Time `bson:"created_at"`
	UpdatedAt time.Time `bson:"updated_at"`
}

func categoryToDoc(c domain.Category) categoryDoc {
	return categoryDoc{
		ID:        c.ID,
		NameES:    c.NameES,
		NameEN:    c.NameEN,
		ImageID:   c.ImageID,
		IsRemove:  c.IsRemove,
		CreatedAt: c.CreatedAt,
		UpdatedAt: c.UpdatedAt,
	}
}

func (d categoryDoc) toDomain() domain.Category {
	return domain.Category{
		ID:        d.ID,
		NameES:    d.NameES,
		NameEN:    d.NameEN,
		ImageID:   d.ImageID,
		IsRemove:  d.IsRemove,
		CreatedAt: d.CreatedAt,
		UpdatedAt: d.UpdatedAt,
	}
}

// --- User ---

type userDoc struct {
	ID           string    `bson:"_id"`
	Email        string    `bson:"email"`
	PasswordHash string    `bson:"password_hash"`
	Role         string    `bson:"role"`
	IsRemove     bool      `bson:"is_remove"`
	CreatedAt    time.Time `bson:"created_at"`
	UpdatedAt    time.Time `bson:"updated_at"`
}

func userToDoc(u domain.User) userDoc {
	return userDoc{
		ID:           u.ID,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		Role:         string(u.Role),
		IsRemove:     u.IsRemove,
		CreatedAt:    u.CreatedAt,
		UpdatedAt:    u.UpdatedAt,
	}
}

func (d userDoc) toDomain() domain.User {
	return domain.User{
		ID:           d.ID,
		Email:        d.Email,
		PasswordHash: d.PasswordHash,
		Role:         domain.Role(d.Role),
		IsRemove:     d.IsRemove,
		CreatedAt:    d.CreatedAt,
		UpdatedAt:    d.UpdatedAt,
	}
}

// --- Session ---

type sessionDoc struct {
	ID        string    `bson:"_id"`
	UserID    string    `bson:"user_id"`
	Role      string    `bson:"role"`
	ExpiresAt time.Time `bson:"expires_at"`
	IsRemove  bool      `bson:"is_remove"`
	CreatedAt time.Time `bson:"created_at"`
	UpdatedAt time.Time `bson:"updated_at"`
}

func sessionToDoc(s domain.Session) sessionDoc {
	return sessionDoc{
		ID:        s.ID,
		UserID:    s.UserID,
		Role:      string(s.Role),
		ExpiresAt: s.ExpiresAt,
		IsRemove:  s.IsRemove,
		CreatedAt: s.CreatedAt,
		UpdatedAt: s.UpdatedAt,
	}
}

func (d sessionDoc) toDomain() domain.Session {
	return domain.Session{
		ID:        d.ID,
		UserID:    d.UserID,
		Role:      domain.Role(d.Role),
		ExpiresAt: d.ExpiresAt,
		IsRemove:  d.IsRemove,
		CreatedAt: d.CreatedAt,
		UpdatedAt: d.UpdatedAt,
	}
}

// --- Quote ---

type quoteItemDoc struct {
	ProductID string            `bson:"product_id"`
	Name      string            `bson:"name"`
	Price     int64             `bson:"price"`
	Qty       int               `bson:"qty"`
	Options   map[string]string `bson:"options"`
}

type quoteDoc struct {
	ID        string         `bson:"_id"`
	Items     []quoteItemDoc `bson:"items"`
	Subtotal  int64          `bson:"subtotal"`
	Contact   contactInfoDoc `bson:"contact"`
	Status    string         `bson:"status"`
	IsRemove  bool           `bson:"is_remove"`
	CreatedAt time.Time      `bson:"created_at"`
	UpdatedAt time.Time      `bson:"updated_at"`
}

type contactInfoDoc struct {
	Name  string `bson:"name"`
	Phone string `bson:"phone"`
	Email string `bson:"email"`
}

func quoteToDoc(q domain.Quote) quoteDoc {
	items := make([]quoteItemDoc, len(q.Items))
	for i, it := range q.Items {
		items[i] = quoteItemDoc{
			ProductID: it.ProductID,
			Name:      it.Name,
			Price:     it.Price,
			Qty:       it.Qty,
			Options:   it.Options,
		}
	}
	return quoteDoc{
		ID:        q.ID,
		Items:     items,
		Subtotal:  q.Subtotal,
		Contact:   contactInfoDoc(q.Contact),
		Status:    string(q.Status),
		IsRemove:  q.IsRemove,
		CreatedAt: q.CreatedAt,
		UpdatedAt: q.UpdatedAt,
	}
}

func (d quoteDoc) toDomain() domain.Quote {
	items := make([]domain.QuoteItem, len(d.Items))
	for i, it := range d.Items {
		items[i] = domain.QuoteItem{
			ProductID: it.ProductID,
			Name:      it.Name,
			Price:     it.Price,
			Qty:       it.Qty,
			Options:   it.Options,
		}
	}
	return domain.Quote{
		ID:        d.ID,
		Items:     items,
		Subtotal:  d.Subtotal,
		Contact:   domain.ContactInfo(d.Contact),
		Status:    domain.QuoteStatus(d.Status),
		IsRemove:  d.IsRemove,
		CreatedAt: d.CreatedAt,
		UpdatedAt: d.UpdatedAt,
	}
}

// --- ContactRequest ---

type contactReqDoc struct {
	ID          string    `bson:"_id"`
	Name        string    `bson:"name"`
	Phone       string    `bson:"phone"`
	Reason      string    `bson:"reason"`
	Attachments []string  `bson:"attachments"`
	IsRemove    bool      `bson:"is_remove"`
	CreatedAt   time.Time `bson:"created_at"`
	UpdatedAt   time.Time `bson:"updated_at"`
}

func contactToDoc(c domain.ContactRequest) contactReqDoc {
	return contactReqDoc{
		ID:          c.ID,
		Name:        c.Name,
		Phone:       c.Phone,
		Reason:      c.Reason,
		Attachments: c.Attachments,
		IsRemove:    c.IsRemove,
		CreatedAt:   c.CreatedAt,
		UpdatedAt:   c.UpdatedAt,
	}
}

func (d contactReqDoc) toDomain() domain.ContactRequest {
	return domain.ContactRequest{
		ID:          d.ID,
		Name:        d.Name,
		Phone:       d.Phone,
		Reason:      d.Reason,
		Attachments: d.Attachments,
		IsRemove:    d.IsRemove,
		CreatedAt:   d.CreatedAt,
		UpdatedAt:   d.UpdatedAt,
	}
}
