// Package tests contains unit tests for the core calculator logic
// implemented in the src package.
package tests

import (
	"math"
	"testing"

	"github.com/sconetto/sz-calculator/src"
)

func TestAdd(t *testing.T) {
	tests := []struct {
		name     string
		a, b     float64
		expected float64
	}{
		{"positive numbers", 2, 3, 5},
		{"negative numbers", -5, -3, -8},
		{"mixed numbers", -5, 10, 5},
		{"zero", 0, 5, 5},
		{"decimals", 1.5, 2.5, 4.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := src.Add(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Add(%v, %v) = %v; want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestSubtract(t *testing.T) {
	tests := []struct {
		name     string
		a, b     float64
		expected float64
	}{
		{"positive numbers", 10, 3, 7},
		{"negative numbers", -5, -3, -2},
		{"mixed numbers", 10, -5, 15},
		{"zero", 5, 0, 5},
		{"decimals", 5.5, 2.0, 3.5},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := src.Subtract(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Subtract(%v, %v) = %v; want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestMultiply(t *testing.T) {
	tests := []struct {
		name     string
		a, b     float64
		expected float64
	}{
		{"positive numbers", 4, 5, 20},
		{"negative numbers", -4, -5, 20},
		{"mixed numbers", -4, 5, -20},
		{"zero", 100, 0, 0},
		{"decimals", 1.5, 2.0, 3.0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := src.Multiply(tt.a, tt.b)
			if result != tt.expected {
				t.Errorf("Multiply(%v, %v) = %v; want %v", tt.a, tt.b, result, tt.expected)
			}
		})
	}
}

func TestDivide(t *testing.T) {
	tests := []struct {
		name        string
		a, b        float64
		expected    float64
		expectError bool
	}{
		{"normal division", 10, 2, 5, false},
		{"division by zero", 10, 0, 0, true},
		{"negative division", -10, 2, -5, false},
		{"decimals", 7.5, 2.5, 3, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := src.Divide(tt.a, tt.b)
			if tt.expectError {
				if err == nil {
					t.Errorf("Divide(%v, %v) expected error; got %v", tt.a, tt.b, result)
				}
			} else {
				if err != nil {
					t.Errorf("Divide(%v, %v) unexpected error: %v", tt.a, tt.b, err)
				}
				if result != tt.expected {
					t.Errorf("Divide(%v, %v) = %v; want %v", tt.a, tt.b, result, tt.expected)
				}
			}
		})
	}
}

func TestPower(t *testing.T) {
	tests := []struct {
		name        string
		base, exp   float64
		expected    float64
		expectError bool
	}{
		{"positive exponent", 2, 3, 8, false},
		{"zero exponent", 5, 0, 1, false},
		{"negative exponent", 2, -2, 0.25, false},
		{"decimal exponent", 4, 0.5, 2, false},
		{"overflow", 10, 1000, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := src.Power(tt.base, tt.exp)
			if tt.expectError {
				if err == nil {
					t.Errorf("Power(%v, %v) expected error; got %v", tt.base, tt.exp, result)
				}
			} else {
				if err != nil {
					t.Errorf("Power(%v, %v) unexpected error: %v", tt.base, tt.exp, err)
				}
				if math.Abs(result-tt.expected) > 0.0001 {
					t.Errorf("Power(%v, %v) = %v; want %v", tt.base, tt.exp, result, tt.expected)
				}
			}
		})
	}
}

func TestSqrt(t *testing.T) {
	tests := []struct {
		name        string
		value       float64
		expected    float64
		expectError bool
	}{
		{"positive number", 16, 4, false},
		{"zero", 0, 0, false},
		{"one", 1, 1, false},
		{"decimal", 2.25, 1.5, false},
		{"negative number", -4, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := src.Sqrt(tt.value)
			if tt.expectError {
				if err == nil {
					t.Errorf("Sqrt(%v) expected error; got %v", tt.value, result)
				}
			} else {
				if err != nil {
					t.Errorf("Sqrt(%v) unexpected error: %v", tt.value, err)
				}
				if math.Abs(result-tt.expected) > 0.0001 {
					t.Errorf("Sqrt(%v) = %v; want %v", tt.value, result, tt.expected)
				}
			}
		})
	}
}

func TestPercentage(t *testing.T) {
	tests := []struct {
		name           string
		value, percent float64
		expected       float64
		expectError    bool
	}{
		{"10% of 100", 100, 10, 10, false},
		{"25% of 80", 80, 25, 20, false},
		{"50% of 50", 50, 50, 25, false},
		{"100% of 50", 50, 100, 50, false},
		{"0% of 100", 100, 0, 0, false},
		{"150% of 20", 20, 150, 30, false},
		{"overflow", math.MaxFloat64, math.MaxFloat64, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := src.Percentage(tt.value, tt.percent)
			if tt.expectError {
				if err == nil {
					t.Errorf("Percentage(%v, %v) expected error; got %v", tt.value, tt.percent, result)
				}
			} else {
				if err != nil {
					t.Errorf("Percentage(%v, %v) unexpected error: %v", tt.value, tt.percent, err)
				}
				if math.Abs(result-tt.expected) > 0.0001 {
					t.Errorf("Percentage(%v, %v) = %v; want %v", tt.value, tt.percent, result, tt.expected)
				}
			}
		})
	}
}

func TestValidateNumber(t *testing.T) {
	tests := []struct {
		name      string
		value     float64
		expectErr bool
	}{
		{"valid number", 5, false},
		{"zero", 0, false},
		{"negative", -5, false},
		{"max float", math.MaxFloat64, false},
		{"smallest float", math.SmallestNonzeroFloat64 / 10, false},
		{"NaN", math.NaN(), true},
		{"positive infinity", math.Inf(1), true},
		{"negative infinity", math.Inf(-1), true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := src.ValidateNumber(tt.value)
			if tt.expectErr && err == nil {
				t.Errorf("ValidateNumber(%v) expected error; got nil", tt.value)
			}
			if !tt.expectErr && err != nil {
				t.Errorf("ValidateNumber(%v) unexpected error: %v", tt.value, err)
			}
		})
	}
}

func TestSquare(t *testing.T) {
	tests := []struct {
		name        string
		value       float64
		expected    float64
		expectError bool
	}{
		{"positive number", 4, 16, false},
		{"negative number", -5, 25, false},
		{"zero", 0, 0, false},
		{"decimal", 1.5, 2.25, false},
		{"overflow", math.MaxFloat64, 0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := src.Square(tt.value)
			if tt.expectError {
				if err == nil {
					t.Errorf("Square(%v) expected error; got %v", tt.value, result)
				}
			} else {
				if err != nil {
					t.Errorf("Square(%v) unexpected error: %v", tt.value, err)
				}
				if math.Abs(result-tt.expected) > 0.0001 {
					t.Errorf("Square(%v) = %v; want %v", tt.value, result, tt.expected)
				}
			}
		})
	}
}
