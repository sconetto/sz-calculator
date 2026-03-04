# Contributing to SZ Calculator

Thank you for your interest in contributing to SZ Calculator!

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/sz-calculator.git
   cd sz-calculator
   ```

3. **Create a branch** for your changes:

   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Backend (Go)

```bash
cd backend
go mod download
go run .
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

## Code Style

### Backend

- Follow [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- Run linter before committing:

  ```bash
  cd backend && golangci-lint run --fix
  ```

### Frontend

- Follow ESLint rules (warnings treated as errors in CI)
- Use TypeScript strict mode
- Run linter before committing:

  ```bash
  cd frontend && npm run lint
  ```

## Testing

### Backend Tests

```bash
cd backend
go test -v ./...
```

### Frontend Tests

```bash
cd frontend
npm test -- --run
```

## Building

### Backend Build

```bash
cd backend
go build -o calculator .
```

### Frontend Build

```bash
cd frontend
npm run build
```

## Making Changes

1. Make your changes in your feature branch
2. Test locally:
   - Backend: `golangci-lint run --fix && go test ./...`
   - Frontend: `npm run lint && npm test -- --run && npm run build`

## Commit Messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Commit messages should follow this format:

```text
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Changes to the build process or auxiliary tools

### Examples

```bash
# Feature
git commit -m "feat(calculator): add percentage operation"

# Bug fix
git commit -m "fix(api): resolve division by zero validation"

# Documentation
git commit -m "docs(readme): update API endpoint documentation"

# Breaking change
git commit -m "feat(api)!: change rate limit to 5 req/s"
```

1. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request

## Pull Request Guidelines

- Fill out the PR template completely
- Include clear description of changes
- Ensure all CI checks pass
- Update documentation if needed

## Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](docs/CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

## Questions?

Feel free to open an issue for questions about contributing.
