# Party Time

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://postgresql.org/)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-AWS-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://python.org/)

> **[View Full Project Report](Deliverables/FINAL-REPORT.md)** - Comprehensive documentation including architecture, implementation details, and project analysis.
>
> **[Documentation](Deliverables/)** - Project deliverables and reports
>
> **Live Staging Environment**: [staging.celebration-time.com](https://staging.celebration-time.com)
> (Due to high AWS costs to run this deplyment, it is currently down)

## Table of Contents

- [Overview](#-overview)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Features](#-features)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## Overview

Party-Time is a comprehensive event planning web application designed to streamline the entire event management process from initial planning to execution. This 13-week capstone project provides tools for venue discovery, guest list management, budget tracking, RSVP coordination, interactive seating charts, and automated email campaigns.

**Staging Environment Live**: [staging.celebration-time.com](https://staging.celebration-time.com)

### Key Features

- **Multi-tier Authentication** - AWS Cognito with email/password and Google OAuth
- **Event Management** - Create and manage various event types (weddings, birthdays, corporate)
- **Guest List Management** - Manual entry with CSV import capabilities
- **RSVP System** - Automated invitations and response tracking
- **Venue Discovery** - Google Places API integration for venue search
- **Budget Tracking** - Real-time expense management across categories
- **Real-time Communication** - WebSocket chat rooms for stakeholders

## Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router and Turbopack
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe JavaScript development
- **Tailwind CSS v4** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Form handling and validation
- **NextAuth.js** - Authentication integration

### Backend

- **FastAPI** - Modern Python web framework
- **Python 3.13** - Latest Python runtime
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **Pydantic** - Data validation and serialization
- **PostgreSQL 16** - Relational database
- **Redis** - Caching and session management

### Infrastructure & DevOps

- **Docker** - Containerization platform
- **AWS ECS** - Container orchestration
- **AWS RDS** - Managed PostgreSQL database
- **AWS Cognito** - User authentication service
- **AWS SES** - Email delivery service
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline

### External APIs

- **Google Places API** - Venue search and location services
- **Google OAuth** - Social authentication
- **Stripe API** - Payment processing
- **AWS Services** - Cloud infrastructure integration

## Project Structure

```
party-time/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Core utilities and configurations
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript type definitions
│   ├── package.json        # Frontend dependencies
│   └── next.config.js      # Next.js configuration
├── backend/                 # FastAPI Python application
│   ├── app/
│   │   ├── api/            # API route handlers
│   │   ├── core/           # Configuration and security
│   │   ├── db/             # Database connection and models
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── services/       # Business logic services
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── pyproject.toml      # Python project configuration
├── Deliverables/            # Project deliverables and reports
│   └── FINAL-REPORT.md     # Comprehensive project documentation
├── documentation/           # Project documentation
│   ├── infrastructure-implementation-plan.md
│   ├── final-new-roadmap.md
│   └── testing-plans/
├── infrastructure/          # AWS Infrastructure (Terraform)
│   ├── docker/             # Dockerfiles for ECS deployment
│   ├── scripts/            # Deployment and migration scripts
│   └── terraform/          # IaC modules and environments
├── docker-compose.yml      # Development environment
├── test_setup.sh          # Setup verification script
└── README.md              # This file
```

## Getting Started

### Prerequisites

- **Node.js 18+** - JavaScript runtime
- **Python 3.13+** - Python runtime
- **Docker & Docker Compose** - Containerization
- **PostgreSQL** - Database (via Docker)
- **Git** - Version control

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd party-time
```

2. **Start the development database**

```bash
docker-compose up -d postgres redis
```

3. **Setup the backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head
```

4. **Setup the frontend**

```bash
cd frontend
npm install
```

5. **Verify setup**

```bash
./test_setup.sh
```

## Development

### Starting the Development Environment

**Option 1: Docker Compose (Recommended)**

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f
```

**Option 2: Manual Start**

```bash
# Terminal 1: Start database
docker-compose up -d postgres redis

# Terminal 2: Start backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### Exploring Demo Pages

Once the development environment is running, visit `/demo` to explore interactive component demos:

- **Event Management** - Event cards, filters, and list components
- **Seating & Layout** - Interactive seating charts and venue layouts
- **UI Components** - Theme switching, stats cards, animations
- **Navigation** - Sidebar and breadcrumb demos

Access at: http://localhost:3000/demo

### Available Scripts

**Frontend Commands**

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

**Backend Commands**

```bash
# Development
uvicorn app.main:app --reload  # Start FastAPI dev server
pytest                         # Run tests
pytest --coverage             # Run tests with coverage

# Code Quality
black .                       # Format code
flake8 .                     # Lint code

# Database
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                               # Apply migrations
alembic downgrade -1                              # Rollback migration
```

**Database Commands**

```bash
# Connect to development database
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time

# Reset database
docker-compose down -v postgres
docker-compose up -d postgres
```

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend `.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Backend `.env`**

```env
DATABASE_URL=postgresql://party_admin:party_secure_2024@localhost:5432/party_time
REDIS_URL=redis://localhost:6379
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-west-2
```

## Current Development Status

### Completed Phases (December 2025)

| Phase | Description                                | Status   |
| ----- | ------------------------------------------ | -------- |
| 3-4   | Event CRUD, Guest Management               | Complete |
| 5     | RSVP System & Email Integration            | Complete |
| 6     | Interactive Seating Charts                 | Complete |
| 7     | Venues & Budget Tracking                   | Complete |
| 8     | Testing Sprint & UI Polish                 | Complete |
| 9     | Performance Optimization                   | Complete |
| 10.1  | AWS Foundation (VPC, ECR, IAM)             | Complete |
| 10.2  | Data Layer (RDS, Redis, S3)                | Complete |
| 10.3  | Application Layer (ECS, ALB)               | Complete |
| 10.4  | DNS & CDN (CloudFront, Route 53)           | Complete |
| 10.5  | Security (WAF, GuardDuty, Security Hub)    | Complete |
| 10.6  | CI/CD Pipeline (GitHub Actions)            | Complete |
| 10.7  | Monitoring (CloudWatch, X-Ray, Synthetics) | Complete |

### Staging Environment Live

**URL**: [staging.celebration-time.com](https://staging.celebration-time.com)

Enterprise-grade AWS infrastructure deployed:

- **ECS Fargate** with ARM64 (Graviton2) containers
- **RDS PostgreSQL 16** with automated backups
- **CloudFront CDN** with security headers
- **GitHub Actions** CI/CD with automated deployments
- **WAF v2, GuardDuty, Security Hub** security stack
- **CloudWatch dashboards**, X-Ray tracing, Synthetics canaries

See [documentation/infrastructure-implementation-plan.md](documentation/infrastructure-implementation-plan.md) for complete details.

### Remaining

- **Phase 10.8**: Production environment deployment
- **Phase 11**: Real-time chat & Claude AI assistant

---

## Features

### Core Features (Completed)

- **User Authentication** - AWS Cognito with email/password and Google OAuth
- **Event Management** - Full CRUD with 13 event types, multi-step forms
- **Guest List Management** - Manual entry, CSV import, bulk operations
- **RSVP System** - Public portal, custom questions, meal options, deadline tracking
- **Email Campaigns** - AWS SES with templates, automated reminders, delivery tracking
- **Interactive Seating Charts** - Fabric.js canvas, drag-and-drop, auto-assignment
- **Venue Discovery** - Google Places API integration with caching
- **Budget Tracking** - Categories, expenses, utilization alerts

### Production Features (Completed)

- **AWS Infrastructure** - ECS Fargate, RDS, ElastiCache, CloudFront
- **CI/CD Pipeline** - GitHub Actions with automated deployments
- **Security** - WAF, GuardDuty, Security Hub, VPC Flow Logs
- **Monitoring** - CloudWatch dashboards, X-Ray tracing, Synthetics canaries
- **Performance** - Code splitting, lazy loading, Redis caching, Web Vitals

### Upcoming Features

- **Real-time Chat** - WebSocket communication rooms
- **AI Integration** - Claude API for event planning assistance

## Testing

### Frontend Testing

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test files
npm test -- EventCard.test.tsx
```

**Testing Stack:**

- **Jest** - Testing framework
- **React Testing Library** - Component testing utilities
- **MSW** - API mocking for integration tests
- **Jest DOM** - Custom Jest matchers

### Backend Testing

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --coverage

# Run specific test files
pytest tests/test_events.py

# Run tests in verbose mode
pytest -v
```

**Testing Stack:**

- **pytest** - Testing framework
- **pytest-asyncio** - Async testing support
- **httpx** - HTTP client for API testing
- **Factory Boy** - Test data generation

### Integration Testing

- **Database Testing** - Isolated test database with transactions
- **API Testing** - Full request/response cycle testing
- **Authentication Testing** - JWT token validation
- **Email Testing** - Mock email service integration

## Deployment

### Development Environment

```bash
# Using Docker Compose
docker-compose up -d

# Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Database: localhost:5432
```

### Production Deployment (AWS)

Full infrastructure documented at [documentation/infrastructure-implementation-plan.md](documentation/infrastructure-implementation-plan.md).

**AWS Architecture**

![AWS Architecture](Deliverables/Images/Infrastructure/Deployment%20Archetecture.png)

**Live Environments**
| Environment | URL | Status |
|-------------|-----|--------|
| Staging | [staging.celebration-time.com](https://staging.celebration-time.com) | Live |
| Production | celebration-time.com | Pending due to Costs |

**CI/CD Pipeline (GitHub Actions)**

- `ci.yml` - PR checks: lint, test, build, security scan
- `staging-deploy.yml` - Auto-deploy on push to `staging` branch
- `production-deploy.yml` - Manual approval + blue-green deploy on `main`
- `infrastructure.yml` - Terraform plan/apply with PR comments
- `rollback.yml` - Manual rollback to previous deployment

**Deployed Services**
| Service | Purpose |
|---------|---------|
| ECS Fargate (ARM64) | Container orchestration (4 services) |
| RDS PostgreSQL 16 | Database with automated backups |
| ElastiCache Redis 7 | Caching & Celery broker |
| CloudFront | CDN with security headers |
| WAF v2 | OWASP protection rules |
| GuardDuty + Security Hub | Threat detection |
| CloudWatch + X-Ray | Monitoring & tracing |
| ACM | SSL certificates |
| Route 53 | DNS (celebration-time.com) |

**Monthly Costs**

- Staging: ~$175/month (current)
- Production: ~$350-400/month (estimated)

### Environment Management

- **Development** - Local Docker environment (localhost:3000, localhost:8000)
- **Staging** - AWS ECS ([staging.celebration-time.com](https://staging.celebration-time.com))
- **Production** - AWS ECS (celebration-time.com) - pending deployment due to costs

## Development Timeline

This is a 13-week capstone project with the following milestones:

- **Weeks 1-4**: Foundation (Auth, Events, Guests, RSVP)
- **Weeks 5-8**: Core Features (Email, Venues, Budget, Testing)
- **Weeks 9-11**: Enhanced Features & Deployment
- **Weeks 12-13**: Advanced Features & Finalization

See `documentation/development-timeline.md` for detailed weekly breakdown.

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Follow coding standards (ESLint, Black)
3. Write tests for new features
4. Ensure all tests pass
5. Submit pull request with descriptive title

### Code Standards

- **TypeScript** - Strict mode enabled
- **Python** - PEP 8 compliance with Black formatter
- **React** - Functional components with hooks
- **Database** - Alembic migrations for schema changes

### Commit Message Format

```
type(scope): description

- feat: new feature
- fix: bug fix
- docs: documentation
- style: formatting
- refactor: code restructuring
- test: adding tests
- chore: maintenance
```

---

**Contact**: For questions or support, please refer to the project documentation or contact the development team.

---

⚠️ **PROPRIETARY SOFTWARE** ⚠️

This repository contains proprietary and confidential information.
All rights reserved. See LICENSE file for complete terms.

Unauthorized access, use, or distribution is strictly prohibited.

---
