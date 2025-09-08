# Party Time

[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql)](https://postgresql.org/)
[![Infrastructure](https://img.shields.io/badge/Infrastructure-AWS-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python)](https://python.org/)

⚠️ **PROPRIETARY SOFTWARE** ⚠️

This repository contains proprietary and confidential information. 
All rights reserved. See LICENSE file for complete terms.

Unauthorized access, use, or distribution is strictly prohibited.

---

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

Party-Time is a comprehensive event planning web application designed to streamline the entire event management process from initial planning to execution. This 13-week capstone project provides tools for venue discovery, guest list management, budget tracking, and RSVP coordination.

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
├── documentation/           # Project documentation
│   ├── Party-Time-App-Description-Technologies.md
│   ├── development-timeline.md
│   └── testing-plans/
├── infrastructure/          # Terraform IaC (planned)
│   ├── terraform/
│   └── environments/
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

## Features

### Phase 1: MVP (Weeks 1-8)
- **User Authentication** - AWS Cognito with email/password and Google OAuth
- **Event Management** - CRUD operations for various event types
- **Guest List Management** - Manual entry and basic CSV import
- **RSVP System** - Email invitations and response tracking
- **Venue Search** - Google Places API integration
- **Budget Tracking** - Expense categories and real-time tracking

### Phase 2: Enhanced Features (Weeks 9-11)
- **Advanced Budget Analytics** - Category breakdowns and reporting
- **Vendor Management** - Vendor profiles and booking coordination
- **Enhanced Guest Features** - Dietary restrictions and plus-one management
- **Timeline Generation** - Auto-generated planning checklists
- **Payment Integration** - Stripe payment processing
- **Mobile Optimization** - Responsive design improvements

### Phase 3: Premium Features (Weeks 12-13)
- **Calendar Integration** - Google Calendar sync
- **Interactive Seating Charts** - Drag-and-drop seating arrangement
- **Real-time Chat** - WebSocket communication rooms
- **AI Integration** - Claude API for planning assistance
- **File Management** - AWS S3 integration for document storage

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

**Infrastructure Setup**
```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

**CI/CD Pipeline**
- **GitHub Actions** - Automated testing and deployment
- **Docker Registry** - Container image management
- **AWS ECS** - Container orchestration
- **Database Migrations** - Automated Alembic migrations

### Environment Management
- **Development** - Local Docker environment
- **Staging** - AWS ECS with RDS (planned)
- **Production** - AWS ECS with RDS, CloudFront, Route53

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

**Links**: 
- [Project Documentation](./documentation/)
- [Development Timeline](./documentation/development-timeline.md)
- [API Documentation](http://localhost:8000/docs) (when running locally)