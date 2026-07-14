package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

// Nombres de colección centralizados.
const (
	CollProducts = "products"
	CollCategori = "categories"
	CollUsers    = "users"
	CollSessions = "sessions"
	CollQuotes   = "quotes"
	CollContacts = "contact_requests"
	GridFSBucket = "images" // prefijo del bucket → images.files / images.chunks
	GridFSModels = "models" // prefijo del bucket de modelos 3D → models.files / models.chunks
)

// Connect abre la conexión a MongoDB, verifica con Ping y devuelve el handle de
// la base de datos indicada. El caller es responsable de cerrar el cliente.
func Connect(ctx context.Context, uri, dbName string) (*mongo.Client, *mongo.Database, error) {
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, nil, err
	}
	if err := client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return nil, nil, err
	}
	return client, client.Database(dbName), nil
}

// EnsureIndexes crea los índices necesarios de forma idempotente:
//   - users.email único (solo sobre no-eliminados)
//   - products.category para filtrar el catálogo
//   - sessions.expires_at con TTL para expiración automática
func EnsureIndexes(ctx context.Context, db *mongo.Database) error {
	// Email único. Como usamos soft-delete, el índice parcial aplica solo a
	// registros activos, permitiendo reusar el correo de uno "eliminado".
	if _, err := db.Collection(CollUsers).Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "email", Value: 1}},
		Options: options.Index().SetUnique(true).
			SetPartialFilterExpression(bson.M{"is_remove": false}),
	}); err != nil {
		return err
	}

	if _, err := db.Collection(CollProducts).Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys: bson.D{{Key: "category", Value: 1}},
	}); err != nil {
		return err
	}

	// TTL: MongoDB elimina el documento cuando expires_at < ahora.
	if _, err := db.Collection(CollSessions).Indexes().CreateOne(ctx, mongo.IndexModel{
		Keys:    bson.D{{Key: "expires_at", Value: 1}},
		Options: options.Index().SetExpireAfterSeconds(0),
	}); err != nil {
		return err
	}

	return nil
}
