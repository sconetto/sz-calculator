package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/sconetto/sz-calculator/api"
)

// TestHealthCheckEndpoint verifies the /health endpoint responds successfully.
func TestHealthCheckEndpoint(t *testing.T) {
	router := api.SetupRouter()
	req, _ := http.NewRequest("GET", "/health", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("could not parse response json: %v", err)
	}

	if response["status"] != "ok" {
		t.Errorf("expected status 'ok', got %v", response["status"])
	}
}

// TestPiEndpoint verifies the /pi endpoint returns the correct value.
func TestPiEndpoint(t *testing.T) {
	router := api.SetupRouter()
	req, _ := http.NewRequest("GET", "/pi", nil)
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var response map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
		t.Fatalf("could not parse response json: %v", err)
	}

	if response["result"] != 3.1415926535 {
		t.Errorf("expected pi, got %v", response["result"])
	}
}

// helper function to test POST endpoints with JSON payloads
func testPostEndpoint(t *testing.T, router http.Handler, endpoint string, payload interface{}, expectedCode int, expectedResult float64) {
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", endpoint, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	if status := rr.Code; status != expectedCode {
		t.Errorf("endpoint %s returned wrong status code: got %v want %v", endpoint, status, expectedCode)
		return
	}

	if expectedCode == http.StatusOK {
		var response map[string]interface{}
		if err := json.Unmarshal(rr.Body.Bytes(), &response); err != nil {
			t.Fatalf("endpoint %s returned invalid json response: %v", endpoint, err)
		}
		if response["result"] != expectedResult {
			t.Errorf("endpoint %s returned wrong result: got %v want %v", endpoint, response["result"], expectedResult)
		}
	}
}

// TestBinaryEndpoints verifies math endpoints that take two arguments.
func TestBinaryEndpoints(t *testing.T) {
	router := api.SetupRouter()

	tests := []struct {
		endpoint string
		payload  map[string]float64
		expected float64
	}{
		{"/add", map[string]float64{"a": 10, "b": 5}, 15},
		{"/subtract", map[string]float64{"a": 10, "b": 5}, 5},
		{"/multiply", map[string]float64{"a": 10, "b": 5}, 50},
		{"/divide", map[string]float64{"a": 10, "b": 5}, 2},
		{"/power", map[string]float64{"a": 2, "b": 3}, 8},
	}

	for _, tt := range tests {
		t.Run(tt.endpoint, func(t *testing.T) {
			testPostEndpoint(t, router, tt.endpoint, tt.payload, http.StatusOK, tt.expected)
		})
	}
}

// TestUnaryEndpoints verifies math endpoints that take one argument.
func TestUnaryEndpoints(t *testing.T) {
	router := api.SetupRouter()

	tests := []struct {
		endpoint string
		payload  map[string]float64
		expected float64
	}{
		{"/negate", map[string]float64{"value": 5}, -5},
		{"/sqrt", map[string]float64{"value": 16}, 4},
		{"/square", map[string]float64{"value": 4}, 16},
	}

	for _, tt := range tests {
		t.Run(tt.endpoint, func(t *testing.T) {
			testPostEndpoint(t, router, tt.endpoint, tt.payload, http.StatusOK, tt.expected)
		})
	}
}

// TestPercentageEndpoint verifies the percentage logic.
func TestPercentageEndpoint(t *testing.T) {
	router := api.SetupRouter()
	testPostEndpoint(t, router, "/percentage", map[string]float64{"value": 200, "percent": 15}, http.StatusOK, 30)
}

// TestDivideByZero verifies the error handling when dividing by zero.
func TestDivideByZero(t *testing.T) {
	router := api.SetupRouter()
	payload := map[string]float64{"a": 10, "b": 0}
	testPostEndpoint(t, router, "/divide", payload, http.StatusBadRequest, 0)
}
