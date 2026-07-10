package mongo

import (
	"context"
	"errors"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"

	"github.com/codecraftdev/alvarsa/internal/core/domain"
)

// UserRepo implementa ports.UserRepository sobre MongoDB.
type UserRepo struct {
	col *mongo.Collection
}

func NewUserRepo(db *mongo.Database) *UserRepo {
	return &UserRepo{col: db.Collection(CollUsers)}
}

func (r *UserRepo) GetByEmail(ctx context.Context, email string) (domain.User, error) {
	var d userDoc
	err := r.col.FindOne(ctx, bson.M{"email": strings.ToLower(email), "is_remove": false}).Decode(&d)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return domain.User{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}
	return d.toDomain(), nil
}

func (r *UserRepo) GetByID(ctx context.Context, id string) (domain.User, error) {
	var d userDoc
	err := r.col.FindOne(ctx, bson.M{"_id": id, "is_remove": false}).Decode(&d)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return domain.User{}, domain.ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}
	return d.toDomain(), nil
}

func (r *UserRepo) Create(ctx context.Context, u domain.User) (domain.User, error) {
	u.Email = strings.ToLower(strings.TrimSpace(u.Email))
	_, err := r.col.InsertOne(ctx, userToDoc(u))
	if mongo.IsDuplicateKeyError(err) {
		return domain.User{}, domain.ErrEmailTaken
	}
	if err != nil {
		return domain.User{}, err
	}
	return u, nil
}
