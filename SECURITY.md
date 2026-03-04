# Security Policy

## Supported Versions

The following versions of SZ Calculator are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within SZ Calculator, please send an email to the maintainer. All security vulnerabilities will be promptly addressed.

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Response Timeline

We aim to acknowledge vulnerability reports within 48 hours and provide a timeline for remediation:

- **Critical**: Fix within 24-48 hours
- **High**: Fix within 7 days
- **Medium**: Fix within 30 days
- **Low**: Fix in next release

## Security Features

The backend includes several security measures:

- HTTP request timeouts (15s read/write, 60s idle)
- Rate limiting (5 requests/second per IP)
- CORS configuration
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Input validation for all mathematical operations

## Best Practices

When deploying SZ Calculator:

1. Configure `CORS_ORIGINS` environment variable for production
2. Run behind a reverse proxy with TLS
3. Monitor rate limiting logs for suspicious activity
4. Keep dependencies up to date
