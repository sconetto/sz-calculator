// Package schema defines the standard input and output data structures (models)
// for the calculator API endpoints. It ensures strict typing when parsing JSON
// requests and returning responses using the Huma framework.
package schema

// OperationInput represents the input for a calculator operation.
type OperationInput struct {
	Body struct {
		A float64 `json:"a"`
		B float64 `json:"b"`
	}
}

// UnaryOperationInput represents input for unary operations (single operand).
type UnaryOperationInput struct {
	Body struct {
		Value float64 `json:"value"`
	}
}

// PercentageInput represents input for percentage operation.
type PercentageInput struct {
	Body struct {
		Value   float64 `json:"value"`
		Percent float64 `json:"percent"`
	}
}

// CalculatorResult represents the result payload
type CalculatorResult struct {
	Result float64 `json:"result"`
}

// OperationOutput represents the output of a calculator operation.
type OperationOutput struct {
	Body CalculatorResult
}

// HealthOutput represents the output of a health check.
type HealthOutput struct {
	Body struct {
		Status string `json:"status"`
	}
}
