package mongo

import (
	"context"
	"errors"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// CategoryRepo implementa ports.CategoryRepository sobre MongoDB.
type CategoryRepo struct {
	col *mongo.Collection
}

func NewCategoryRepo(db *mongo.Database) *CategoryRepo {
	return &CategoryRepo{col: db.Collection(CollCategori)}
}

func (r *CategoryRepo) List(ctx context.Context) ([]domain.Category, error) {
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: 1}})
	cur, err := r.col.Find(ctx, bson.M{"is_remove": false}, opts)
	if err != nil {
		return nil, err
	}
	var docs []categoryDoc
	if err := cur.All(ctx, &docs); err != nil {
		return nil, err
	}
	out := make([]domain.Category, len(docs))
	for i, d := range docs {
		out[i] = d.toDomain()
	}
	return out, nil
}

func (r *CategoryRepo) GetByID(ctx context.Context, id string) (domain.Category, error) {
	var d categoryDoc
	err := r.col.FindOne(ctx, bson.M{"_id": id, "is_remove": false}).Decode(&d)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return domain.Category{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Category{}, err
	}
	return d.toDomain(), nil
}

func (r *CategoryRepo) Create(ctx context.Context, c domain.Category) (domain.Category, error) {
	if _, err := r.col.InsertOne(ctx, categoryToDoc(c)); err != nil {
		return domain.Category{}, err
	}
	return c, nil
}
