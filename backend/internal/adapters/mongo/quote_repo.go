package mongo

import (
	"context"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// QuoteRepo implementa ports.QuoteRepository sobre MongoDB.
type QuoteRepo struct {
	col *mongo.Collection
}

func NewQuoteRepo(db *mongo.Database) *QuoteRepo {
	return &QuoteRepo{col: db.Collection(CollQuotes)}
}

func (r *QuoteRepo) Create(ctx context.Context, q domain.Quote) (domain.Quote, error) {
	if _, err := r.col.InsertOne(ctx, quoteToDoc(q)); err != nil {
		return domain.Quote{}, err
	}
	return q, nil
}

func (r *QuoteRepo) List(ctx context.Context) ([]domain.Quote, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cur, err := r.col.Find(ctx, bson.M{"is_remove": false}, opts)
	if err != nil {
		return nil, err
	}
	var docs []quoteDoc
	if err := cur.All(ctx, &docs); err != nil {
		return nil, err
	}
	out := make([]domain.Quote, len(docs))
	for i, d := range docs {
		out[i] = d.toDomain()
	}
	return out, nil
}
