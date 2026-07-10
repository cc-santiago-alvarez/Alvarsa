package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// ContactRepo implementa ports.ContactRepository sobre MongoDB.
type ContactRepo struct {
	col *mongo.Collection
}

func NewContactRepo(db *mongo.Database) *ContactRepo {
	return &ContactRepo{col: db.Collection(CollContacts)}
}

func (r *ContactRepo) Create(ctx context.Context, c domain.ContactRequest) (domain.ContactRequest, error) {
	if _, err := r.col.InsertOne(ctx, contactToDoc(c)); err != nil {
		return domain.ContactRequest{}, err
	}
	return c, nil
}

func (r *ContactRepo) List(ctx context.Context) ([]domain.ContactRequest, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cur, err := r.col.Find(ctx, bson.M{"is_remove": false}, opts)
	if err != nil {
		return nil, err
	}
	var docs []contactReqDoc
	if err := cur.All(ctx, &docs); err != nil {
		return nil, err
	}
	out := make([]domain.ContactRequest, len(docs))
	for i, d := range docs {
		out[i] = d.toDomain()
	}
	return out, nil
}
