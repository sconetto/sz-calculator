package api

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/adapters/humachi"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"golang.org/x/time/rate"

	"github.com/sconetto/sz-calculator/schema"
	"github.com/sconetto/sz-calculator/src"
)

// getCorsOrigins returns the CORS allowed origins from environment variable.
// If CORS_ORIGINS is not set, defaults to localhost development origins.
func getCorsOrigins() []string {
	envOrigins := os.Getenv("CORS_ORIGINS")
	if envOrigins == "" {
		// Configured localhost ports used for local development (check docker compose)
		return []string{"http://localhost:5173", "http://localhost:8080"}
	}
	return strings.Split(envOrigins, ",")
}

// securityHeadersMiddleware adds security headers to all responses
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "deny=()")
		next.ServeHTTP(w, r)
	})
}

// rateLimiter implements a simple per-IP rate limiter using golang.org/x/time/rate.
// It tracks requests per IP address and enforces rate limits to prevent abuse.
type rateLimiter struct {
	limiters map[string]*clientLimiter
	mu       sync.RWMutex
	rate     rate.Limit
	burst    int
}

// clientLimiter tracks a rate limiter instance and when it was last seen.
type clientLimiter struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// newRateLimiter creates a new rate limiter with the specified requests per second (rps)
// and burst size. It also starts a background goroutine to clean up stale entries.
func newRateLimiter(rps float64, burst int) *rateLimiter {
	rl := &rateLimiter{
		limiters: make(map[string]*clientLimiter),
		rate:     rate.Limit(rps),
		burst:    burst,
	}
	// Cleanup old entries periodically
	go rl.cleanup()
	return rl
}

// getLimiter retrieves or creates a rate limiter for the given IP address.
// Thread-safe: uses read-write mutex to protect the limiters map.
func (rl *rateLimiter) getLimiter(ip string) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	if _, ok := rl.limiters[ip]; !ok {
		rl.limiters[ip] = &clientLimiter{
			limiter: rate.NewLimiter(rl.rate, rl.burst),
		}
	}
	rl.limiters[ip].lastSeen = time.Now()
	return rl.limiters[ip].limiter
}

// cleanup runs periodically to remove stale IP entries that haven't been seen
// in over 5 minutes. Prevents memory leaks from abandoned connections.
func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	for range ticker.C {
		rl.mu.Lock()
		for ip, cl := range rl.limiters {
			if time.Since(cl.lastSeen) > time.Minute*5 {
				delete(rl.limiters, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// middleware returns an HTTP handler that enforces rate limiting on incoming requests.
// Returns 429 Too Many Requests when the limit is exceeded.
func (rl *rateLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr
		limiter := rl.getLimiter(ip)

		if !limiter.Allow() {
			w.Header().Set("Retry-After", "1")
			http.Error(w, "rate limit exceeded", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// globalRateLimiter is a singleton rate limiter instance that enforces
// a limit of 5 requests per second per IP address, with a burst capacity of 20.
var globalRateLimiter = newRateLimiter(5, 20)

// SetupRouter initializes the chi router, applies middleware, and registers
// all the calculator REST API endpoints using huma. It returns the configured router.
func SetupRouter() *chi.Mux {
	// Initialize a new chi router for handling HTTP requests
	router := chi.NewRouter()

	// Apply standard middleware for request tracing, logging, and panic recovery
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)

	// Configure Cross-Origin Resource Sharing (CORS) rules
	// Can be customized via CORS_ORIGINS environment variable (comma-separated)
	router.Use(cors.New(cors.Options{
		AllowedOrigins:   getCorsOrigins(),
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler)

	// Add security headers middleware
	router.Use(securityHeadersMiddleware)

	// Add rate limiting middleware (5 requests/sec, burst of 20)
	router.Use(globalRateLimiter.middleware)

	// Create a new Huma API instance attached to the chi router
	api := humachi.New(router, huma.DefaultConfig("SZ Calculator API", "1.0.0"))

	// Register /health endpoint to allow health checks
	huma.Register(api, huma.Operation{
		OperationID: "health-check",
		Method:      http.MethodGet,
		Path:        "/health",
		Summary:     "Health check (reports service status)",
	}, func(ctx context.Context, input *struct{}) (*schema.HealthOutput, error) {
		slog.Info("Performing health check")
		resp := &schema.HealthOutput{}
		resp.Body.Status = "ok"
		return resp, nil
	})

	// Register /pi endpoint to return the value of Pi
	huma.Register(api, huma.Operation{
		OperationID: "pi",
		Method:      http.MethodGet,
		Path:        "/pi",
		Summary:     "Get the value of Pi (approximated to 10 digits)",
	}, func(ctx context.Context, input *struct{}) (*schema.OperationOutput, error) {
		slog.Info("Returning fixed 10 digits Pi value")
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: 3.1415926535}}, nil
	})

	// Register /negate endpoint to invert the sign of a number
	huma.Register(api, huma.Operation{
		OperationID: "negate",
		Method:      http.MethodPost,
		Path:        "/negate",
		Summary:     "Invert the sign of a number",
	}, func(ctx context.Context, input *schema.UnaryOperationInput) (*schema.OperationOutput, error) {
		slog.Info("Negate endpoint called with", "value", input.Body.Value)
		if err := src.ValidateNumber(input.Body.Value); err != nil {
			slog.Error("Failed to negate number with", "value", input.Body.Value, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: -input.Body.Value}}, nil
	})

	// Register /add endpoint to add two numbers
	huma.Register(api, huma.Operation{
		OperationID: "add",
		Method:      http.MethodPost,
		Path:        "/add",
		Summary:     "Add two numbers",
	}, func(ctx context.Context, input *schema.OperationInput) (*schema.OperationOutput, error) {
		slog.Info("Add endpoint called with", "a", input.Body.A, "b", input.Body.B)
		if err := src.ValidateNumber(input.Body.A); err != nil {
			slog.Error("Failed to add numbers while validating", "a", input.Body.A, "error", err)
			return nil, err
		}
		if err := src.ValidateNumber(input.Body.B); err != nil {
			slog.Error("Failed to add numbers while validating", "b", input.Body.B, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: src.Add(input.Body.A, input.Body.B)}}, nil
	})

	// Register /subtract endpoint to subtract two numbers
	huma.Register(api, huma.Operation{
		OperationID: "subtract",
		Method:      http.MethodPost,
		Path:        "/subtract",
		Summary:     "Subtract two numbers",
	}, func(ctx context.Context, input *schema.OperationInput) (*schema.OperationOutput, error) {
		slog.Info("Subtract endpoint called with", "a", input.Body.A, "b", input.Body.B)
		if err := src.ValidateNumber(input.Body.A); err != nil {
			slog.Error("Failed to subtract numbers while validating", "a", input.Body.A, "error", err)
			return nil, err
		}
		if err := src.ValidateNumber(input.Body.B); err != nil {
			slog.Error("Failed to subtract numbers while validating", "b", input.Body.B, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: src.Subtract(input.Body.A, input.Body.B)}}, nil
	})

	// Register /multiply endpoint to multiply two numbers
	huma.Register(api, huma.Operation{
		OperationID: "multiply",
		Method:      http.MethodPost,
		Path:        "/multiply",
		Summary:     "Multiply two numbers",
	}, func(ctx context.Context, input *schema.OperationInput) (*schema.OperationOutput, error) {
		slog.Info("Multiply endpoint called with", "a", input.Body.A, "b", input.Body.B)
		if err := src.ValidateNumber(input.Body.A); err != nil {
			slog.Error("Failed to multiply numbers while validating", "a", input.Body.A, "error", err)
			return nil, err
		}
		if err := src.ValidateNumber(input.Body.B); err != nil {
			slog.Error("Failed to multiply numbers while validating", "b", input.Body.B, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: src.Multiply(input.Body.A, input.Body.B)}}, nil
	})

	// Register /divide endpoint to divide two numbers
	huma.Register(api, huma.Operation{
		OperationID: "divide",
		Method:      http.MethodPost,
		Path:        "/divide",
		Summary:     "Divide two numbers",
	}, func(ctx context.Context, input *schema.OperationInput) (*schema.OperationOutput, error) {
		slog.Info("Divide endpoint called with", "a", input.Body.A, "b", input.Body.B)
		if err := src.ValidateNumber(input.Body.A); err != nil {
			slog.Error("Failed to divide numbers while validating", "a", input.Body.A, "error", err)
			return nil, err
		}
		if err := src.ValidateNumber(input.Body.B); err != nil {
			slog.Error("Failed to divide numbers while validating", "b", input.Body.B, "error", err)
			return nil, err
		}
		result, err := src.Divide(input.Body.A, input.Body.B)
		if err != nil {
			slog.Error("Failed to divide numbers with", "a", input.Body.A, "b", input.Body.B, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: result}}, nil
	})

	// Register /power endpoint to raise a number to the power of another number
	huma.Register(api, huma.Operation{
		OperationID: "power",
		Method:      http.MethodPost,
		Path:        "/power",
		Summary:     "Raise base to exponent power",
	}, func(ctx context.Context, input *schema.OperationInput) (*schema.OperationOutput, error) {
		slog.Info("Power endpoint called with", "a", input.Body.A, "b", input.Body.B)
		if err := src.ValidateNumber(input.Body.A); err != nil {
			slog.Error("Failed to exponentiate numbers while validating", "a", input.Body.A, "error", err)
			return nil, err
		}
		if err := src.ValidateNumber(input.Body.B); err != nil {
			slog.Error("Failed to exponentiate numbers while validating", "b", input.Body.B, "error", err)
			return nil, err
		}
		result, err := src.Power(input.Body.A, input.Body.B)
		if err != nil {
			slog.Error("Failed to exponentiate numbers with", "a", input.Body.A, "b", input.Body.B, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: result}}, nil
	})

	// Register /sqrt endpoint to calculate the square root of a number
	huma.Register(api, huma.Operation{
		OperationID: "sqrt",
		Method:      http.MethodPost,
		Path:        "/sqrt",
		Summary:     "Calculate square root of a number",
	}, func(ctx context.Context, input *schema.UnaryOperationInput) (*schema.OperationOutput, error) {
		slog.Info("Sqrt endpoint called with", "value", input.Body.Value)
		if err := src.ValidateNumber(input.Body.Value); err != nil {
			slog.Error("Failed to compute the square root number while validating", "value", input.Body.Value, "error", err)
			return nil, err
		}
		result, err := src.Sqrt(input.Body.Value)
		if err != nil {
			slog.Error("Failed to compute the square root number with", "value", input.Body.Value, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: result}}, nil
	})

	// Register /square endpoint to calculate the square of a number
	huma.Register(api, huma.Operation{
		OperationID: "square",
		Method:      http.MethodPost,
		Path:        "/square",
		Summary:     "Calculate the square of a number",
	}, func(ctx context.Context, input *schema.UnaryOperationInput) (*schema.OperationOutput, error) {
		slog.Info("Square endpoint called with", "value", input.Body.Value)
		if err := src.ValidateNumber(input.Body.Value); err != nil {
			slog.Error("Failed to compute the square number while validating", "value", input.Body.Value, "error", err)
			return nil, err
		}
		result, err := src.Square(input.Body.Value)
		if err != nil {
			slog.Error("Failed to compute the square number with", "value", input.Body.Value, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: result}}, nil
	})

	// Register /percentage endpoint to calculate the percentage of a value
	huma.Register(api, huma.Operation{
		OperationID: "percentage",
		Method:      http.MethodPost,
		Path:        "/percentage",
		Summary:     "Calculate percentage of a value",
	}, func(ctx context.Context, input *schema.PercentageInput) (*schema.OperationOutput, error) {
		slog.Info("Percentage endpoint called with", "value", input.Body.Value, "percent", input.Body.Percent)
		if err := src.ValidateNumber(input.Body.Value); err != nil {
			slog.Error("Failed to compute the percentage while validating", "value", input.Body.Value, "error", err)
			return nil, err
		}
		if err := src.ValidateNumber(input.Body.Percent); err != nil {
			slog.Error("Failed to compute the percentage while validating", "percent", input.Body.Percent, "error", err)
			return nil, err
		}
		result, err := src.Percentage(input.Body.Value, input.Body.Percent)
		if err != nil {
			slog.Error("Failed to compute the percentage with", "value", input.Body.Value, "percent", input.Body.Percent, "error", err)
			return nil, err
		}
		return &schema.OperationOutput{Body: schema.CalculatorResult{Result: result}}, nil
	})

	return router
}
