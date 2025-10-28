# Environment Variables Configuration Guide

This document provides a comprehensive guide to all environment variables used in the Party-Time application.

---

## Table of Contents

1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Environment-Specific Files](#environment-specific-files)
4. [Setup Instructions](#setup-instructions)
5. [Security Best Practices](#security-best-practices)

---

## Backend Environment Variables

### Database Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/party_time` | Yes |
| `POSTGRES_USER` | Database username | `party_admin` | Yes |
| `POSTGRES_PASSWORD` | Database password | `party_secure_2024` | Yes |
| `POSTGRES_DB` | Database name | `party_time` | Yes |
| `POSTGRES_HOST` | Database host | `localhost` or RDS endpoint | Yes |
| `POSTGRES_PORT` | Database port | `5432` | Yes |

### Redis & Celery Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379/0` | Yes |
| `CELERY_BROKER_URL` | Celery message broker URL | `redis://localhost:6379/0` | Yes |
| `CELERY_RESULT_BACKEND` | Celery result backend URL | `redis://localhost:6379/1` | Yes |

**Note**: Database 0 for broker, database 1 for results to avoid conflicts.

### Application Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ENVIRONMENT` | Environment name | `development`, `staging`, `production` | Yes |
| `DEBUG` | Enable debug mode | `true` or `false` | Yes |
| `SECRET_KEY` | Application secret key (64+ chars) | `your-super-secret-key` | Yes |
| `API_V1_STR` | API version prefix | `/api/v1` | Yes |
| `PROJECT_NAME` | Project display name | `Party-Time` | Yes |

### JWT Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `JWT_SECRET_KEY` | JWT signing key (64+ chars) | `your-jwt-secret-key` | Yes |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` | Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` | Yes |

### AWS Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `AWS_REGION` | AWS region | `us-east-1` | Yes |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIAIOSFODNN7EXAMPLE` | Yes* |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/...` | Yes* |

**Note**: Required for SES, S3, and Cognito. Use IAM roles in production.

### AWS Cognito

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `COGNITO_USER_POOL_ID` | User pool ID | `us-east-1_XXXXXXXXX` | Yes |
| `COGNITO_CLIENT_ID` | App client ID | `1234567890abcdefghij` | Yes |
| `COGNITO_CLIENT_SECRET` | App client secret | `secret123456...` | Yes |
| `COGNITO_REGION` | Cognito region | `us-east-1` | Yes |
| `COGNITO_DOMAIN` | Cognito domain | `https://domain.auth.region.amazoncognito.com` | Yes |

### AWS SES (Email Service)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SES_FROM_EMAIL` | Sender email address | `noreply@your-domain.com` | Yes |
| `SES_FROM_NAME` | Sender display name | `Party-Time` | No |
| `SES_REGION` | SES region | `us-east-1` | Yes |

**Important**: Email must be verified in AWS SES before sending.

### Email Settings

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `EMAIL_BACKEND` | Email backend type | `aws_ses` or `console` | Yes |
| `EMAIL_ENABLED` | Enable email sending | `true` or `false` | Yes |
| `EMAIL_MAX_RETRIES` | Max retry attempts | `3` | No |
| `EMAIL_RETRY_DELAY` | Retry delay (seconds) | `300` (5 minutes) | No |
| `EMAIL_HOST` | SMTP host (fallback) | `localhost` | No |
| `EMAIL_PORT` | SMTP port (fallback) | `587` | No |
| `EMAIL_USE_TLS` | Use TLS (fallback) | `true` | No |

### AWS S3

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `S3_BUCKET_NAME` | S3 bucket name | `party-time-uploads` | No* |
| `S3_REGION` | S3 region | `us-east-1` | No* |

**Note**: Required when file upload features are enabled.

### External Services

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key | `AIzaSy...` | No* |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456.apps.googleusercontent.com` | No* |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-...` | No* |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` | No* |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` | No* |
| `CLAUDE_API_KEY` | Claude AI API key | `sk-ant-...` | No* |

**Note**: Required when respective features are enabled.

### Development Settings

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CORS_ORIGINS` | Allowed CORS origins (JSON array) | `["http://localhost:3000"]` | Yes |
| `ALLOWED_HOSTS` | Allowed host headers | `["localhost", "127.0.0.1"]` | Yes |
| `LOG_LEVEL` | Logging level | `INFO`, `DEBUG`, `WARNING`, `ERROR` | No |

### Production Security Settings

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SECURE_SSL_REDIRECT` | Force HTTPS redirect | `true` | Prod only |
| `SESSION_COOKIE_SECURE` | Secure session cookies | `true` | Prod only |
| `CSRF_COOKIE_SECURE` | Secure CSRF cookies | `true` | Prod only |
| `SENTRY_DSN` | Sentry error tracking | `https://...@sentry.io/...` | No |

---

## Frontend Environment Variables

### NextAuth Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret (32+ chars) | `your-nextauth-secret` | Yes |
| `NEXTAUTH_COOKIE_DOMAIN` | Cookie domain | `yourdomain.com` | Prod only |

### AWS Cognito (Frontend)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `COGNITO_CLIENT_ID` | App client ID | `1234567890abcdefghij` | Yes |
| `COGNITO_CLIENT_SECRET` | App client secret | `secret123456...` | Yes |
| `COGNITO_ISSUER` | Cognito issuer URL | `https://cognito-idp.region.amazonaws.com/poolid` | Yes |

### Google OAuth (Frontend)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `GOOGLE_CLIENT_ID` | Google client ID | `123456.apps.googleusercontent.com` | No* |
| `GOOGLE_CLIENT_SECRET` | Google client secret | `GOCSPX-...` | No* |

### API Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` | Yes |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

### Email Configuration (Display Only)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Support email | `support@party-time.app` | No |
| `NEXT_PUBLIC_NOREPLY_EMAIL` | No-reply email | `noreply@party-time.app` | No |

### Application Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_NAME` | Application name | `Party-Time` | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | `https://yourdomain.com` | No |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `true` or `false` | No |
| `NEXT_PUBLIC_ENABLE_ERROR_TRACKING` | Enable error tracking | `true` or `false` | No |

---

## Environment-Specific Files

### Backend

- `.env` - Development environment (gitignored, create from `.env.example`)
- `.env.example` - Template with placeholder values (committed to git)
- `.env.production.example` - Production template (committed to git)
- `.env.test` - Test environment configuration (committed to git)

### Frontend

- `.env.local` - Development environment (gitignored, create from `.env.example`)
- `.env.example` - Template with placeholder values (committed to git)
- `.env.production.example` - Production template (committed to git)

---

## Setup Instructions

### Development Setup

#### 1. Backend Setup

```bash
cd backend

# Copy example file
cp .env.example .env

# Edit .env with your values
nano .env  # or use your preferred editor

# Key values to update:
# - DATABASE_URL (if using different credentials)
# - AWS credentials (for SES, Cognito)
# - COGNITO_* values
# - GOOGLE_* values (if using OAuth)
```

#### 2. Frontend Setup

```bash
cd frontend

# Copy example file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local

# Key values to update:
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - COGNITO_* values (same as backend)
# - GOOGLE_* values (if using OAuth)
```

### Production Setup

#### 1. Backend Production

```bash
cd backend

# Copy production template
cp .env.production.example .env.production

# Edit .env.production with PRODUCTION values
# IMPORTANT: Use strong, unique secrets!

# Generate secrets:
openssl rand -hex 32  # For SECRET_KEY
openssl rand -hex 32  # For JWT_SECRET_KEY
```

#### 2. Frontend Production

```bash
cd frontend

# Copy production template
cp .env.production.example .env.production

# Edit .env.production with PRODUCTION values

# Generate NEXTAUTH_SECRET:
openssl rand -base64 32
```

---

## Security Best Practices

### 1. Secret Generation

**DO:**
- Generate unique secrets for each environment
- Use cryptographically secure random generators
- Minimum 32 characters for secrets
- Rotate secrets periodically

**DON'T:**
- Use example/placeholder values in production
- Reuse secrets across environments
- Commit `.env` files to git
- Share secrets via email/Slack

### 2. Production Checklist

- [ ] All secrets are unique and strong (64+ chars)
- [ ] AWS credentials use IAM roles (not access keys)
- [ ] Database uses strong password (20+ chars)
- [ ] CORS_ORIGINS only includes production domains
- [ ] DEBUG=false in production
- [ ] ENVIRONMENT=production
- [ ] HTTPS enforced (SECURE_SSL_REDIRECT=true)
- [ ] Secure cookies enabled
- [ ] SES sender email verified
- [ ] Error tracking configured (Sentry)

### 3. AWS SES Setup

Before sending emails in production:

1. **Verify sender email:**
   ```bash
   POST /api/v1/emails/verify
   Body: {"email": "noreply@your-domain.com"}
   ```

2. **Move out of SES Sandbox:**
   - Go to AWS SES Console
   - Request production access
   - Wait for AWS approval (~24 hours)

3. **Configure DKIM & SPF:**
   - Add DKIM records to DNS
   - Add SPF record: `v=spf1 include:amazonses.com ~all`

4. **Monitor sending limits:**
   ```bash
   GET /api/v1/emails/quota
   ```

### 4. Environment Variable Validation

The application validates required environment variables on startup. If any required variable is missing, the application will fail to start with a clear error message.

---

## Troubleshooting

### Common Issues

**1. "Email sending is disabled"**
- Check: `EMAIL_ENABLED=true` in `.env`
- Check: `SES_FROM_EMAIL` is set and verified

**2. "Redis connection refused"**
- Check: Redis container is running (`docker ps | grep redis`)
- Check: `REDIS_URL` matches container port

**3. "Database connection failed"**
- Check: PostgreSQL container is running
- Check: `DATABASE_URL` credentials match database

**4. "AWS SES error: Email not verified"**
- Verify email using `/api/v1/emails/verify` endpoint
- Check email inbox for verification link

**5. "Celery worker not processing tasks"**
- Start worker: `celery -A app.core.celery_app worker --loglevel=info`
- Check: Redis is running
- Check: `CELERY_BROKER_URL` is correct

---

## Support

For questions or issues:
- Check documentation: `documentation/`
- Review setup test: `./test_setup.sh`
- Email service test: `python test_email_setup.py`

---

**Last Updated**: October 2025
**Phase**: 5.2.1 - Email Service Setup Complete
