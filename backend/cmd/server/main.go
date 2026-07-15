// Command server arranca la API HTTP de Alvarsa. Actúa como composition root:
// construye los adaptadores (Mongo, hashing), los inyecta en los servicios del
// core y expone el adaptador HTTP.
package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/codecraftdev/alvarsa/internal/adapters/auth"
	httpadapter "github.com/codecraftdev/alvarsa/internal/adapters/http"
	"github.com/codecraftdev/alvarsa/internal/adapters/mail"
	mongoadapter "github.com/codecraftdev/alvarsa/internal/adapters/mongo"
	"github.com/codecraftdev/alvarsa/internal/config"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
	"github.com/codecraftdev/alvarsa/internal/core/services"
)

func main() {
	cfg := config.Load()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	client, db, err := mongoadapter.Connect(ctx, cfg.MongoURI, cfg.MongoDB)
	cancel()
	if err != nil {
		log.Fatalf("mongo connect: %v", err)
	}
	defer func() { _ = client.Disconnect(context.Background()) }()

	idxCtx, idxCancel := context.WithTimeout(context.Background(), 10*time.Second)
	if err := mongoadapter.EnsureIndexes(idxCtx, db); err != nil {
		log.Fatalf("ensure indexes: %v", err)
	}
	idxCancel()

	// Adaptadores de salida (implementan los puertos de salida del core).
	productRepo := mongoadapter.NewProductRepo(db)
	categoryRepo := mongoadapter.NewCategoryRepo(db)
	userRepo := mongoadapter.NewUserRepo(db)
	sessionRepo := mongoadapter.NewSessionRepo(db)
	quoteRepo := mongoadapter.NewQuoteRepo(db)
	contactRepo := mongoadapter.NewContactRepo(db)
	imageStore := mongoadapter.NewImageStore(db)
	modelStore := mongoadapter.NewModelStore(db)
	hasher := auth.NewBcryptHasher(0)

	// Correo: Resend si hay API key; si no, un noop que solo registra en el log.
	var mailer ports.Mailer
	if cfg.ResendAPIKey != "" {
		mailer = mail.NewResend(cfg.ResendAPIKey, cfg.MailFrom, cfg.MailTo)
		log.Printf("correo: Resend habilitado (from=%q to=%q)", cfg.MailFrom, cfg.MailTo)
	} else {
		mailer = mail.NewNoop()
		log.Printf("correo: RESEND_API_KEY no configurada, notificaciones deshabilitadas (noop)")
	}

	// Servicios (casos de uso).
	catalogSvc := services.NewCatalog(productRepo, categoryRepo)
	authSvc := services.NewAuth(userRepo, sessionRepo, hasher, cfg.SessionTTL)
	adminProdSvc := services.NewAdminProduct(productRepo, categoryRepo)
	adminCatSvc := services.NewAdminCategory(categoryRepo)
	adminUserSvc := services.NewAdminUser(userRepo, hasher)
	quoteSvc := services.NewQuote(quoteRepo, mailer)
	contactSvc := services.NewContact(contactRepo, mailer)
	imageSvc := services.NewImage(imageStore)
	modelSvc := services.NewModel(modelStore)

	// Adaptador HTTP (driving).
	srv := httpadapter.NewServer(httpadapter.Deps{
		Catalog:         catalogSvc,
		Auth:            authSvc,
		AdminProducts:   adminProdSvc,
		AdminCategories: adminCatSvc,
		AdminUsers:      adminUserSvc,
		Quotes:          quoteSvc,
		Contacts:        contactSvc,
		Images:          imageSvc,
		Models:          modelSvc,
		Config:          cfg,
	})

	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           srv.Handler(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	log.Printf("Alvarsa API escuchando en %s (db=%s)", cfg.HTTPAddr, cfg.MongoDB)
	if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("http server: %v", err)
	}
}
