// Command seed inicializa la base de datos alvarsa con datos mínimos de PRUEBA:
// índices, unas categorías, 4 productos de ejemplo y el usuario admin inicial.
//
// No es el mecanismo de carga de datos del sistema: categorías, productos y
// usuarios se crean vía la API (endpoints admin / registro). Este comando solo
// deja un entorno usable para desarrollo y pruebas. Es idempotente.
package main

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"

	"github.com/codecraftdev/alvarsa/internal/adapters/auth"
	mongoadapter "github.com/codecraftdev/alvarsa/internal/adapters/mongo"
	"github.com/codecraftdev/alvarsa/internal/config"
	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	client, db, err := mongoadapter.Connect(ctx, cfg.MongoURI, cfg.MongoDB)
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	if err := mongoadapter.EnsureIndexes(ctx, db); err != nil {
		log.Fatalf("ensure indexes: %v", err)
	}
	log.Println("índices asegurados")

	categoryRepo := mongoadapter.NewCategoryRepo(db)
	productRepo := mongoadapter.NewProductRepo(db)
	userRepo := mongoadapter.NewUserRepo(db)

	catIDs := seedCategoriesInto(ctx, categoryRepo)
	seedProductsInto(ctx, productRepo, catIDs)
	seedAdmin(ctx, userRepo, cfg)

	log.Println("seed completado")
}

// seedCategoriesInto crea las categorías de prueba si no existen y devuelve un
// mapa nombre-ES → id para relacionar los productos.
func seedCategoriesInto(ctx context.Context, repo *mongoadapter.CategoryRepo) map[string]string {
	existing, err := repo.List(ctx)
	if err != nil {
		log.Fatalf("listar categorías: %v", err)
	}
	ids := map[string]string{}
	for _, c := range existing {
		ids[c.NameES] = c.ID
	}
	created := 0
	for _, c := range seedCategories {
		if _, ok := ids[c.NameES]; ok {
			continue
		}
		now := time.Now()
		c.ID = uuid.NewString()
		c.CreatedAt, c.UpdatedAt = now, now
		if _, err := repo.Create(ctx, c); err != nil {
			log.Fatalf("crear categoría %s: %v", c.NameES, err)
		}
		ids[c.NameES] = c.ID
		created++
	}
	log.Printf("categorías: %d creadas, %d ya existían", created, len(seedCategories)-created)
	return ids
}

func seedProductsInto(ctx context.Context, repo *mongoadapter.ProductRepo, catIDs map[string]string) {
	if existing, err := repo.List(ctx, ports.ProductFilter{}); err == nil && len(existing) > 0 {
		log.Printf("productos: %d ya existen, se omite el seed", len(existing))
		return
	}
	created := 0
	for _, sp := range seedProducts {
		categoryID, ok := catIDs[sp.categoryNameES]
		if !ok {
			log.Fatalf("categoría %q no encontrada para el producto %q", sp.categoryNameES, sp.Name)
		}
		now := time.Now()
		p := sp.Product
		p.ID = uuid.NewString()
		p.CategoryID = categoryID
		p.Customization = defaultCustomization
		p.Custom = false
		p.ImageIDs = nil
		p.CreatedAt, p.UpdatedAt = now, now
		if _, err := repo.Create(ctx, p); err != nil {
			log.Fatalf("crear producto %s: %v", p.Name, err)
		}
		created++
	}
	log.Printf("productos: %d creados", created)
}

func seedAdmin(ctx context.Context, repo *mongoadapter.UserRepo, cfg config.Config) {
	if _, err := repo.GetByEmail(ctx, cfg.SeedAdminEmail); err == nil {
		log.Printf("admin %s ya existe", cfg.SeedAdminEmail)
		return
	}
	hasher := auth.NewBcryptHasher(0)
	hash, err := hasher.Hash(cfg.SeedAdminPassword)
	if err != nil {
		log.Fatalf("hash admin: %v", err)
	}
	now := time.Now()
	admin := domain.User{
		ID:           uuid.NewString(),
		Email:        cfg.SeedAdminEmail,
		PasswordHash: hash,
		Role:         domain.RoleAdmin,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	if _, err := repo.Create(ctx, admin); err != nil {
		log.Fatalf("crear admin: %v", err)
	}
	log.Printf("admin creado: %s", cfg.SeedAdminEmail)
}
