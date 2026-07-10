package mongo

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// SessionRepo implementa ports.SessionRepository sobre MongoDB. La expiración se
// refuerza con un índice TTL sobre expires_at (ver EnsureIndexes).
type SessionRepo struct {
	col *mongo.Collection
}

func NewSessionRepo(db *mongo.Database) *SessionRepo {
	return &SessionRepo{col: db.Collection(CollSessions)}
}

func (r *SessionRepo) Create(ctx context.Context, s domain.Session) (domain.Session, error) {
	if _, err := r.col.InsertOne(ctx, sessionToDoc(s)); err != nil {
		return domain.Session{}, err
	}
	return s, nil
}

func (r *SessionRepo) GetByID(ctx context.Context, id string) (domain.Session, error) {
	var d sessionDoc
	err := r.col.FindOne(ctx, bson.M{"_id": id, "is_remove": false}).Decode(&d)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return domain.Session{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Session{}, err
	}
	return d.toDomain(), nil
}

func (r *SessionRepo) SoftDelete(ctx context.Context, id string) error {
	_, err := r.col.UpdateOne(ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"is_remove": true, "updated_at": time.Now()}},
	)
	return err
}
