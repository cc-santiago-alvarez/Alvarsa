package config

import (
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

// Config agrupa la configuración del backend, cargada desde variables de entorno
// (y, en desarrollo, desde un archivo .env).
type Config struct {
	MongoURI          string
	MongoDB           string
	HTTPAddr          string
	CORSOrigin        string
	SessionTTL        time.Duration
	SessionCookieName string
	CookieSecure      bool

	SeedAdminEmail    string
	SeedAdminPassword string
}

// Load lee la configuración. Intenta cargar un .env (silencioso si no existe) y
// aplica valores por defecto sensatos.
func Load() Config {
	_ = godotenv.Load() // en producción las variables vienen del entorno

	ttlHours := envInt("SESSION_TTL_HOURS", 168) // 7 días

	return Config{
		MongoURI:          env("MONGO_URI", "mongodb://localhost:27017"),
		MongoDB:           env("MONGO_DB", "alvarsa"),
		HTTPAddr:          env("HTTP_ADDR", ":8080"),
		CORSOrigin:        env("CORS_ORIGIN", "http://localhost:3000"),
		SessionTTL:        time.Duration(ttlHours) * time.Hour,
		SessionCookieName: env("SESSION_COOKIE_NAME", "alv_session"),
		CookieSecure:      envBool("COOKIE_SECURE", false),
		SeedAdminEmail:    env("SEED_ADMIN_EMAIL", "admin@alvarsa.com"),
		SeedAdminPassword: env("SEED_ADMIN_PASSWORD", "admin123"),
	}
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func envBool(key string, def bool) bool {
	if v := os.Getenv(key); v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return def
}
