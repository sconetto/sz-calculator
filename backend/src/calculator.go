// Package src contains the core mathematical and operational logic for the calculator.
// It implements basic operations (add, subtract, multiply, divide) as well as
// more advanced features (power, square root, percentage) and number validation.
package src

import (
	"log/slog"
	"math"

	"github.com/danielgtaylor/huma/v2"
)

// Add performs addition.
func Add(a, b float64) float64 {
	slog.Debug("performing addition", "a", a, "b", b)
	return a + b
}

// Subtract performs subtraction.
func Subtract(a, b float64) float64 {
	slog.Debug("performing subtraction", "a", a, "b", b)
	return a - b
}

// Multiply performs multiplication.
func Multiply(a, b float64) float64 {
	slog.Debug("performing multiplication", "a", a, "b", b)
	return a * b
}

// Divide performs division.
func Divide(a, b float64) (float64, error) {
	slog.Debug("performing division", "a", a, "b", b)
	if b == 0 {
		err := huma.Error400BadRequest("division by zero is not allowed")
		slog.Warn("division failed", "error", err)
		return 0, err
	}
	return a / b, nil
}

// Power performs exponentiation (a raised to the power of b).
func Power(base, exponent float64) (float64, error) {
	slog.Debug("performing power", "base", base, "exponent", exponent)
	result := math.Pow(base, exponent)
	if math.IsInf(result, 0) || math.IsNaN(result) {
		err := huma.Error400BadRequest("result overflow or undefined")
		slog.Warn("power failed", "error", err)
		return 0, err
	}
	return result, nil
}

// Sqrt performs square root (unary operation).
func Sqrt(value float64) (float64, error) {
	slog.Debug("performing square root", "value", value)
	if value < 0 {
		err := huma.Error400BadRequest("cannot calculate square root of negative number")
		slog.Warn("square root failed", "error", err)
		return 0, err
	}
	return math.Sqrt(value), nil
}

// Square performs the square of a number (unary operation).
func Square(value float64) (float64, error) {
	slog.Debug("performing square", "value", value)
	result := value * value
	if math.IsInf(result, 0) || math.IsNaN(result) {
		err := huma.Error400BadRequest("result overflow or undefined")
		slog.Warn("square failed", "error", err)
		return 0, err
	}
	return result, nil
}

// Percentage calculates percentage of a value.
func Percentage(value, percent float64) (float64, error) {
	slog.Debug("performing percentage", "value", value, "percent", percent)
	result := value * percent / 100
	if math.IsInf(result, 0) || math.IsNaN(result) {
		err := huma.Error400BadRequest("result overflow or undefined")
		slog.Warn("percentage failed", "error", err)
		return 0, err
	}
	return result, nil
}

// ValidateNumber checks if a float64 is valid (not NaN or Inf)
func ValidateNumber(v float64) error {
	if math.IsNaN(v) {
		err := huma.Error400BadRequest("invalid number: NaN")
		slog.Warn("validation failed", "error", err)
		return err
	}
	if math.IsInf(v, 0) {
		err := huma.Error400BadRequest("invalid number: infinity")
		slog.Warn("validation failed", "error", err)
		return err
	}
	return nil
}
