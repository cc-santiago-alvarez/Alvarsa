package mongo

import (
	"context"
	"errors"
	"regexp"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
	"github.com/codecraftdev/alvarsa/internal/core/ports"
)

// ProductRepo implementa ports.ProductRepository sobre MongoDB.
type ProductRepo struct {
	col *mongo.Collection
}

func NewProductRepo(db *mongo.Database) *ProductRepo {
	return &ProductRepo{col: db.Collection(CollProducts)}
}

func (r *ProductRepo) List(ctx context.Context, f ports.ProductFilter) ([]domain.Product, error) {
	filter := bson.M{"is_remove": false}
	if f.CategoryID != "" {
		filter["category_id"] = f.CategoryID
	}
	if q := f.Query; q != "" {
		rx := primitiveRegex(q)
		filter["$or"] = bson.A{
			bson.M{"name": rx},
			bson.M{"materials_es": rx},
			bson.M{"materials_en": rx},
			bson.M{"description_es": rx},
			bson.M{"description_en": rx},
		}
	}
	opts := options.Find().SetSort(bson.D{{Key: "created_at", Value: -1}})
	cur, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	var docs []productDoc
	if err := cur.All(ctx, &docs); err != nil {
		return nil, err
	}
	out := make([]domain.Product, len(docs))
	for i, d := range docs {
		out[i] = d.toDomain()
	}
	return out, nil
}

func (r *ProductRepo) GetByID(ctx context.Context, id string) (domain.Product, error) {
	var d productDoc
	err := r.col.FindOne(ctx, bson.M{"_id": id, "is_remove": false}).Decode(&d)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return domain.Product{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.Product{}, err
	}
	return d.toDomain(), nil
}

func (r *ProductRepo) Create(ctx context.Context, p domain.Product) (domain.Product, error) {
	if _, err := r.col.InsertOne(ctx, productToDoc(p)); err != nil {
		return domain.Product{}, err
	}
	return p, nil
}

func (r *ProductRepo) Update(ctx context.Context, p domain.Product) (domain.Product, error) {
	res, err := r.col.ReplaceOne(ctx, bson.M{"_id": p.ID, "is_remove": false}, productToDoc(p))
	if err != nil {
		return domain.Product{}, err
	}
	if res.MatchedCount == 0 {
		return domain.Product{}, domain.ErrNotFound
	}
	return p, nil
}

func (r *ProductRepo) SoftDelete(ctx context.Context, id string) error {
	res, err := r.col.UpdateOne(ctx,
		bson.M{"_id": id, "is_remove": false},
		bson.M{"$set": bson.M{"is_remove": true, "updated_at": time.Now()}},
	)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		return domain.ErrNotFound
	}
	return nil
}

// primitiveRegex construye un filtro regex case-insensitive escapando el término.
func primitiveRegex(q string) bson.M {
	return bson.M{"$regex": regexp.QuoteMeta(q), "$options": "i"}
}
