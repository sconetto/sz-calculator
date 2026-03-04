# SZ Calculator

[![CI](https://github.com/sconetto/sz-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/sconetto/sz-calculator/actions/workflows/ci.yml)
[![Go Version](https://img.shields.io/github/go-mod/go-version/sconetto/sz-calculator?filename=backend/go.mod)](https://github.com/sconetto/sz-calculator)
[![Node Version](https://img.shields.io/node/v/vite)](https://github.com/sconetto/sz-calculator)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.html)

SZ Calculator is a full-stack calculator app with a Go backend (Huma + Chi) and a React frontend (Vite + TypeScript). All math is executed on the backend through REST endpoints, while the frontend focuses on UX, input flow, and presentation.

## Highlights

- Backend-powered calculations for binary and unary operations
- Responsive calculator UI tuned for desktop and small mobile screens
- Calculation history stored in `sessionStorage` (max 50 entries)
- Help, history, and error modals with focus trapping for accessibility
- Loading indicators during API operations
- Error Boundary for graceful error handling
- Linting and tests for both backend and frontend
- Docker Compose support for development and production
- Rate limiting to prevent API abuse
- Graceful shutdown and HTTP timeouts

## Tech Stack

- **Backend:** Go 1.25+, Huma v2, Chi, CORS middleware, golang.org/x/time/rate
- **Frontend:** React 18, TypeScript, Vite, React Router
- **Testing:** Go `testing`, Vitest, Testing Library
- **Tooling:** ESLint, golangci-lint, Docker Compose

## Design Rationale

### Architecture Decisions

1. **Backend-Driven Calculations**
   - All mathematical operations are performed on the backend to ensure consistency and security
   - The frontend is kept as a thin UI layer, handling only basic input validation and display
   - This architecture prevents floating-point discrepancies between client and server

2. **REST API with Huma**
   - Huma provides automatic OpenAPI documentation generation
   - Type-safe request/response handling with automatic JSON marshalling
   - Built-in support for middleware (CORS, logging, recovery)

3. **React with Custom Hooks**
   - Business logic is extracted into custom hooks (`useCalculator`, `useDisplayScaling`)
   - Separation of concerns: hooks handle logic, components handle rendering
   - Co-located tests with source files for better maintainability

4. **Session-Based History**
   - History is stored in `sessionStorage` for privacy and persistence across page reloads
   - Limited to 50 entries to prevent unbounded storage growth

5. **Responsive Design**
   - CSS variables and media queries for cross-device compatibility
   - Dynamic font scaling to support various display sizes
   - Touch-friendly button sizing for mobile devices

6. **Security First**
   - Rate limiting to prevent API abuse
   - HTTP timeouts to prevent hanging connections
   - Security headers for browser-side protection
   - Input validation for all mathematical operations

### Technology Choices

- **Go + Huma**: Fast backend with minimal boilerplate, excellent for microservices
- **React + Vite**: Fast development experience with hot module replacement
- **TypeScript**: Type safety across both frontend and backend
- **Docker**: Consistent development and production environments

## Project Structure

```text
sz-calculator/
├── .github/
│   └── workflows/ci.yml             # GitHub Actions CI workflow
├── backend/
│   ├── api/api.go                  # Router setup, middleware, endpoints
│   ├── schema/schemas.go           # Request/response payload types
│   ├── src/calculator.go           # Core calculation and validation logic
│   ├── tests/
│   │   ├── api_test.go             # API-level tests
│   │   └── calculator_test.go      # Unit tests for math logic
│   ├── main.go                     # Backend entry point (port 8888)
│   ├── go.mod / go.sum
│   ├── Dockerfile
│   └── .golangci.yml              # Backend lint config
├── frontend/
│   ├── public/
│   │   └── favicon.svg             # App favicon
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── error-boundary/
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── index.ts
│   │   │   └── modal/
│   │   │       ├── Modal.tsx
│   │   │       ├── Modal.css
│   │   │       ├── Modal.test.tsx
│   │   │       └── index.ts
│   │   ├── hooks/
│   │   │   ├── useCalculator.ts
│   │   │   ├── useDisplayScaling.ts
│   │   │   ├── useCalculator.test.ts
│   │   │   ├── useDisplayScaling.test.ts
│   │   │   └── index.ts
│   │   ├── pages/calculator-page/
│   │   │   ├── CalculatorPage.tsx
│   │   │   ├── CalculatorPage.css
│   │   │   ├── CalculatorPage.test.tsx
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── api.ts
│   │   │   ├── api.test.ts
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── router.tsx
│   │   ├── index.css
│   │   └── setupTests.ts
│   ├── index.html
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── package.json
│   └── .env.development
├── .editorconfig                    # Editor configuration
├── .gitignore
├── CONTRIBUTING.md                  # Contribution guidelines
├── SECURITY.md                      # Security policy
├── dev-docker-compose.yml           # Development Docker config
├── docker-compose.yml               # Production Docker config
├── LICENSE
└── .agent.md                       # Project context/handoff notes
```

## API Endpoints

Base URL (local): `http://localhost:8888`

| Method | Path | Description | Body |
| --- | --- | --- | --- |
| GET | `/health` | Health check | - |
| GET | `/pi` | Returns pi constant | - |
| POST | `/add` | Addition | `{ "a": number, "b": number }` |
| POST | `/subtract` | Subtraction | `{ "a": number, "b": number }` |
| POST | `/multiply` | Multiplication | `{ "a": number, "b": number }` |
| POST | `/divide` | Division | `{ "a": number, "b": number }` |
| POST | `/power` | Exponentiation | `{ "a": number, "b": number }` |
| POST | `/sqrt` | Square root | `{ "value": number }` |
| POST | `/square` | Square value | `{ "value": number }` |
| POST | `/negate` | Invert sign | `{ "value": number }` |
| POST | `/percentage` | Percentage calculation | `{ "value": number, "percent": number }` |

Successful operation responses return:

```json
{
  "result": 123.45
}
```

Error responses return:

```json
{
  "detail": "error message"
}
```

Common backend validation/errors include division by zero, square root of negative values, and invalid numbers (`NaN`, `Infinity`).

## Environment Variables

### Backend

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Server listen port | `8888` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173,http://localhost:8080` |

Example:

```bash
PORT=3000 CORS_ORIGINS=http://localhost:5173,https://myapp.com go run .
```

### Frontend

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Backend API base URL | `http://localhost:8888` |

Create `frontend/.env` if needed:

```bash
VITE_API_URL=http://localhost:8888
```

## Prerequisites

- Go 1.25+
- Node.js 20+
- npm
- Docker + Docker Compose (optional, for containerized runs)

## Run Locally

### Backend (local go)

```bash
cd backend
go mod download
go run .
```

### Frontend (local vite)

```bash
cd frontend
npm install
npm run dev
```

### Access

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8888`

## Run with Docker

### Production

```bash
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8888`

### Development (hot reload)

```bash
docker compose -f dev-docker-compose.yml up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8888`

#### Observation

If needed add to the command parameter `-V`, it should allow docker to recreate
anonymous volumes instead of reusing existing ones (could be useful to clear up cache during development).

## Security Features

The backend includes several security measures:

- **HTTP Timeouts:** 15s read, 15s write, 60s idle to prevent hanging connections
- **Rate Limiting:** 5 requests/second per IP address (configurable)
- **Graceful Shutdown:** Handles SIGINT/SIGTERM for clean server shutdown
- **Security Headers:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- **CORS Configuration:** Environment-configurable allowed origins
- **Input Validation:** All mathematical operations validate for NaN/Infinity

## Quality Checks

### Backend (golang-ci checks)

```bash
cd backend
golangci-lint run --fix
go test ./...
```

### Frontend (eslint checks)

```bash
cd frontend
npm run lint
npm test -- --run
npm run build
```

## Coverage Report

### Backend (tests)

The backend uses Go's testing package with tests located in the `tests/` package. The tests cover:

- **Calculator Logic** (`src/calculator.go`): Unit tests for all mathematical operations
- **API Endpoints** (`api/api.go`): Integration tests for all REST endpoints

Run coverage:

```bash
cd backend
go test -v ./...
```

Current test coverage includes:

- Binary operations: add, subtract, multiply, divide, power
- Unary operations: negate, sqrt, square, percentage
- Input validation: NaN, Infinity, division by zero
- Error handling: All error paths

### Frontend (tests)

The frontend uses Vitest with React Testing Library. Tests cover:

- **Hooks**: `useCalculator`, `useDisplayScaling`
- **Components**: `Modal`, `CalculatorPage`
- **Utils**: API layer

Run coverage:

```bash
cd frontend
npm test -- --run
```

Current test count: **29 tests** across 5 test files

## Frontend Architecture

- **Routing:** `frontend/src/router.tsx`
- **Calculator Logic:** `frontend/src/hooks/useCalculator.ts` - State management, API calls, history
- **Display Scaling:** `frontend/src/hooks/useDisplayScaling.ts` - Dynamic font sizing
- **API Layer:** `frontend/src/utils/api.ts` - Backend communication with AbortController support
- **Error Handling:** `frontend/src/components/error-boundary/ErrorBoundary.tsx` - Catches render errors
- **Modals:** `frontend/src/components/modal/Modal.tsx` - Reusable modal with focus trapping

## History

Calculation history is stored in `sessionStorage` with a maximum of 50 entries. Oldest entries are automatically removed when the limit is exceeded.

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## Security

For security vulnerabilities, please read our [SECURITY.md](SECURITY.md) file for reporting instructions.

## License

GPLv3 - See [LICENSE](LICENSE) file for details.
