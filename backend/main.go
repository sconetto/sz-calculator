// Package main provides the entry point for the SZ Calculator backend API.
// It sets up the HTTP server, configures routing, middleware, CORS, and registers
// the various calculator operation endpoints using the Huma REST framework.
//
// The server listens on port 8888 and supports:
//   - Graceful shutdown on SIGINT/SIGTERM
//   - HTTP timeouts to prevent hanging connections
//   - Structured JSON logging via slog
package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sconetto/sz-calculator/api"
)

// getPort returns the port to listen on from the PORT environment variable,
// defaulting to 8888 if not set.
func getPort() string {
	port := os.Getenv("PORT")
	if port == "" {
		return "8888"
	}
	return port
}

// main is the entry point of the application. It initializes the structured logger,
// sets up the router with all middleware, configures the HTTP server with timeouts,
// and handles graceful shutdown when receiving interrupt signals.
func main() {
	// Initialize default structured logger
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelDebug,
	})))

	router := api.SetupRouter()

	port := getPort()

	// Configure HTTP server with timeouts to prevent hanging connections
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine to allow graceful shutdown
	go func() {
		slog.Info("Starting server on port " + port + "...")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("Server failed", "error", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		slog.Error("Server forced to shutdown", "error", err)
	}

	slog.Info("Server exited")
}
