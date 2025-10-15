# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Party-Time** is a comprehensive event planning web application designed to streamline the entire event management process from initial planning to execution. The platform enables event planners to create and manage various types of events (weddings, birthdays, corporate events, etc.) while providing tools for venue discovery through Google Places API integration, guest list management with CSV import capabilities, and real-time budget tracking across multiple expense categories.

This is a **13-week capstone project** with specific phases and deliverables, emphasizing modern development practices, AWS cloud infrastructure, and comprehensive DevOps implementation.

## Current Project Status (October 2025)

### ✅ Completed Features

- **Infrastructure**: Docker environment, PostgreSQL database, MCP servers
- **Authentication**: AWS Cognito integration, NextAuth.js setup, protected routes
- **Event Backend API**: Complete CRUD operations with validation and filtering
- **Event Dashboard**: EventCard, EventList, EventFilters components with comprehensive testing
- **Dashboard Statistics**: StatsCards, DashboardSections with real-time metrics
- **Advanced Hooks**: useEvents, useEventActions, useViewPreferences, useEventFilters
- **Testing Infrastructure**: 340+ tests passing across components, hooks, integration, and error handling
- **State Management**: React Query integration, optimistic updates, bulk operations
- **Event Form System**: Multi-step form (Basic Info, Date/Time, Settings), Zod validation, React Hook Form integration, localStorage persistence (Phase 3.1 COMPLETE)
- **Event Detail Pages**: Tabbed interface, edit system, action dialogs (delete/duplicate/share/status), smoke testing (Phase 3.2 COMPLETE)
- **Events List Page**: Full-page layout with advanced filtering, grid/list view toggle, sort options, pagination (Phase 3.2.6 COMPLETE)
- **Guest Backend**: Complete CRUD API, search, filtering, bulk operations, CSV import with smart parsing (Phase 4.1 COMPLETE)
- **Guest Management UI**: Guest list interface, forms & modals, CSV import wizard, analytics dashboard (Phase 4.2 COMPLETE)
- **RSVP Token System**: 8-character tokens, invitation links, QR code generation with theme support (Phase 4.1.2 COMPLETE)
- **Public RSVP Backend**: Token validation, event details endpoint, RSVP submission with meal preferences/dietary restrictions/plus-one handling, rate limiting (10 req/min validation, 5 req/min submission), IP tracking, response timestamps (Phase 5.1.1 COMPLETE)
- **Public RSVP Frontend Portal**: Multi-step RSVP form (5 steps: Attendance, Guest Details, Meal Preferences, Plus-One, Notes), animated buttons with auto-advance, conditional step visibility, progress tracking, celebration confirmation page with confetti, Add to Calendar, theme support (light/dark/system), mobile-responsive, auto-save to localStorage, 47/47 smoke tests passing, production build successful (Phase 5.1.2 COMPLETE)

### 🔄 Currently In Progress

- **Phase 5.1.3**: RSVP Management Dashboard - Next task

### 📋 Remaining Work

- RSVP management dashboard (Phase 5.1.3)
- RSVP customization (Phase 5.1.4)
- Email integration (Phase 5.2) - AWS SES setup, templates, automation
- Interactive Seating Charts (Phase 6) - Fabric.js canvas, table management
- Venue search (Phase 7.1) - Google Places API integration
- Budget tracking (Phase 7.2) - Budget dashboard, expense tracking
- Testing sprint (Phase 8) - Comprehensive test coverage
- Performance optimization (Phase 9) - Code splitting, caching
- AWS deployment (Phase 10) - Infrastructure setup, CI/CD pipeline
- Chat & AI systems (Phase 11) - WebSocket chat, Claude AI integration

## Project Structure

This is a full-stack application with three main components:

- **Frontend**: Next.js 15 application with TypeScript, Tailwind CSS v4, and React 19
- **Backend**: Python application using FastAPI framework with SQLAlchemy and Alembic
- **Infrastructure**: Terraform-based AWS deployment configuration (ECS, RDS, S3)
- **Documentation**: Comprehensive project specifications, development timeline, and architecture diagrams

## Development Commands

### Database (PostgreSQL via Docker)
```bash
# IMPORTANT: Ensure Docker Desktop is running first!
# Start Docker Desktop application if not running:
open -a Docker

# Start development database
docker-compose up -d postgres

# Verify database container is running
docker ps

# Test database connection
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time

# Run setup test
./test_setup.sh
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm run start        # Start production server
npm run lint         # Run ESLint with Next.js TypeScript config
```

### Backend (Python/FastAPI)
```bash
cd backend
source .venv/bin/activate  # Activate virtual environment (Python 3.13.5)

# Start FastAPI development server (requires PostgreSQL running)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run backend tests
pytest

# Format code
black .

# Lint code
flake8 .

# Create database migration
alembic revision --autogenerate -m "msg"

# Apply database migrations
alembic upgrade head
```

## Architecture Notes

- **Frontend**: Next.js 15 App Router with TypeScript, React Query for state management, React Hook Form for forms
- **Styling**: Tailwind CSS v4 with Material Design principles and custom theming (light/dark mode support)
- **TypeScript Config**: Uses path mapping (`@/*` → `./src/*`) and Next.js plugin
- **Linting**: ESLint with Next.js core-web-vitals and TypeScript rules
- **Backend**: FastAPI with SQLAlchemy ORM, Alembic migrations, Pydantic validation
- **Database**: PostgreSQL (AWS RDS) for relational data, DynamoDB for chat/analytics
- **Authentication**: AWS Cognito with JWT tokens and multi-tier roles (admin, planner, guest)
- **Testing**: pytest for backend, comprehensive testing framework planned
- **DevOps**: Docker containerization, Terraform IaC, GitHub Actions CI/CD

## Project Context & Timeline

**Current Status**: Week 5 - RSVP & Email Systems (Phase 5.1.1 Complete)
**Target Timeline**: 13-week capstone project (see `documentation/new-roadmap.md`)

### Development Phases:
1. **Weeks 1-8 (MVP)**: Core features with DevOps foundation
   - User authentication system (AWS Cognito + Google OAuth) ✅
   - Event management (CRUD with multiple event types) ✅
   - Guest list management (manual entry + CSV import) ✅
   - RSVP system with email notifications (AWS SES) 🔄 In Progress
   - Basic venue search (Google Places API)
   - Simple budget tracking
   - Complete Terraform infrastructure and CI/CD pipeline

2. **Weeks 9-11 (Enhanced Features)**: Business logic improvements
   - Advanced budget tracking with category breakdowns
   - Vendor management system
   - Enhanced guest features (dietary restrictions, plus-ones) ✅
   - Auto-generated planning timelines and checklists
   - Payment integration (Stripe)
   - Mobile optimization and UI polish

3. **Weeks 12-13 (Advanced Features)**: Premium functionality
   - File management (Excel import, drag-and-drop, AWS S3)
   - Interactive seating charts (Fabric.js)
   - Real-time chat rooms (WebSocket)
   - AI integration (Claude API for planning assistance)
   - Calendar integration (Google Calendar sync)

### Core Technology Stack:

**Backend Infrastructure (Python 3.13 + FastAPI)**
- **FastAPI**: Modern web framework with automatic API documentation
- **SQLAlchemy**: ORM with Alembic for database migrations
- **Pydantic**: Data validation and serialization
- **Celery + Redis**: Asynchronous task processing for emails/notifications
- **pytest**: Comprehensive testing framework with black/flake8 for code quality

**Frontend Application (Next.js + React)**
- **Next.js**: Full-stack React framework with App Router and Turbopack bundler
- **TypeScript**: Primary language with strict configuration
- **React Query**: Server state management and API calls
- **React Hook Form**: Form handling and validation
- **Tailwind CSS**: Utility-first CSS with Material Design principles
- **NextAuth.js**: Authentication integration with AWS Cognito

**Database Architecture**
- **PostgreSQL (AWS RDS)**: Primary database for relational data (users, events, guests, vendors)
- **AWS DynamoDB**: NoSQL for chat messages, activity logs, and analytics

**External API Integrations**
- **Phase 1**: Google Places API, AWS SES, Stripe API, AWS Cognito
- **Phase 2**: Google Calendar API, Claude AI API, Twilio API
- **Phase 3**: OpenWeatherMap, Cloudinary, Unsplash, Calendly APIs

### AWS Cloud Infrastructure & DevOps

**Infrastructure as Code**
- **Terraform**: Complete infrastructure provisioning and management
- **Docker**: Containerization for consistent deployments
- **AWS ECS with Fargate**: Serverless container orchestration (1-3 instances with auto-scaling)
- **AWS Application Load Balancer**: Traffic distribution

**CI/CD Pipeline**
- **GitHub Actions**: Automated build, test, and deployment
- **Automated Testing**: Unit and integration test execution
- **Database Migration Strategy**: Automated Alembic migrations
- **Staging Environment**: Pre-production testing

**AWS Services Integration**
- **VPC**: Isolated network environment
- **Route 53**: DNS and domain management
- **ElastiCache**: Redis caching layer
- **Lambda**: Serverless functions for image processing and notifications
- **CloudFront**: Global CDN for static assets
- **API Gateway**: API management and throttling
- **CloudWatch + Sentry**: Monitoring and error tracking
- **Secrets Manager**: Secure credential management

**Security Implementation**
- Rate limiting, data encryption (at rest and in transit)
- CORS configuration, input validation (SQL injection/XSS prevention)
- GDPR compliance with data export/deletion capabilities
- Audit logging for administrative actions

## Phase 5.1.1: Public RSVP Backend (COMPLETED - October 2025)

### Backend Files Created:

```
✅ backend/app/schemas/rsvp.py - Pydantic schemas for RSVP endpoints
✅ backend/app/middleware/rate_limit.py - In-memory rate limiter (sliding window)
✅ backend/app/api/v1/rsvp.py - 5 public RSVP endpoints (no auth required)
✅ backend/app/services/rsvp_service.py - Enhanced with tracking methods
✅ backend/app/models/guest.py - Added meal_preference and rsvp_ip_address columns
✅ backend/alembic/versions/20251015_0356-14cfb6b4f6bd_add_meal_and_ip_to_guest.py
✅ backend/tests/test_rsvp_api.py - 11 comprehensive smoke tests
```

### Frontend Files Created:

```
✅ frontend/src/types/rsvp.types.ts - TypeScript types (strict, no 'any')
✅ frontend/src/lib/api/services/rsvp.service.ts - RSVP API client
✅ frontend/src/types/common.types.ts - Updated with RSVP endpoints
```

### Postman Testing Suite:

```
✅ postman/RSVP-API-Tests.postman_collection.json - 14 automated tests
✅ postman/RSVP-API-Local.postman_environment.json - Environment configuration
✅ backend/scripts/seed_rsvp_test_data.py - Test data generator
✅ postman/RSVP-TESTING-GUIDE.md - Comprehensive testing documentation
```

### Key Features:
- **Public Endpoints**: 5 endpoints with no authentication required
- **Rate Limiting**: 10 req/min for validation, 5 req/min for submission
- **Token System**: 8-character uppercase alphanumeric tokens
- **Tracking**: IP address and timestamp tracking for responses
- **Comprehensive Data**: Meal preferences, dietary restrictions, plus-one handling
- **Type Safety**: Full TypeScript compliance with no 'any' types
- **Testing**: 14 Postman tests with automated test scripts

### API Endpoints:
1. `GET /api/v1/rsvp/{token}/validate` - Validate RSVP token
2. `GET /api/v1/rsvp/{token}/event-details` - Get event details for RSVP page
3. `POST /api/v1/rsvp/{token}/respond` - Submit RSVP response
4. `PUT /api/v1/rsvp/{token}/preferences` - Update meal/dietary preferences
5. `PUT /api/v1/rsvp/{token}/plus-one` - Update plus-one information

## MCP (Model Context Protocol) Configuration

**Location**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Configured MCP Servers:

1. **PostgreSQL MCP** (`postgresql`)
   - Package: `enhanced-postgres-mcp-server`
   - Connection: `postgresql://party_admin:party_secure_2024@localhost:5432/party_time`
   - Usage: Direct database queries, schema management, data exploration

2. **Memory MCP** (`memory`)
   - Package: `@modelcontextprotocol/server-memory`
   - Usage: Persistent context across conversations, architectural decisions, code patterns

3. **Party-Time Git MCP** (`party-time-git`)
   - Package: `mcp-server-git` (via uvx)
   - Repository: `/Users/rodrigo/code/party-time`
   - Usage: Project-specific git operations, commit tracking

4. **Fetch MCP** (`fetch`)
   - Package: `mcp-server-fetch` (via uvx)
   - Usage: HTTP requests, API testing (Google Places, AWS services, Stripe)

### Development Database (Docker PostgreSQL):
- **Purpose**: Local development only - NOT for production
- **Tables**: users, events, guests, budget_categories, expenses, vendors, event_vendors
- **Sample Data**: 3 users, 3 events, 8 guests, budget categories with expenses
- **Features**: UUID primary keys, ENUM types, triggers, comprehensive constraints

### Production Database (Week 11):
- **Service**: AWS RDS PostgreSQL 16
- **Infrastructure**: Provisioned via Terraform
- **Migration**: Schema deployed using Alembic migrations
- **Features**: Automated backups, high availability, VPC security, SSL connections

### Setup Verification:
```bash
./test_setup.sh  # Comprehensive setup test
```

**Next Steps**: Restart Claude Desktop to load MCP servers, then test connections in a new conversation.

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
**Symptoms**:
- Dashboard shows "Loading..." indefinitely
- Console errors: "Failed to retrieve events: [Errno 61] Connection refused"
- Backend logs: 500 Internal Server Error on API calls

**Solution**:
```bash
# Check if Docker is running
docker ps

# If Docker not running, start it
open -a Docker

# Wait for Docker to start (check status in Docker Desktop)
# Then verify PostgreSQL container is running
docker ps | grep party-time-db

# Test database connection
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT version();"
```

#### 2. Frontend Not Loading
**Symptoms**:
- Browser shows connection errors
- Frontend server not responding on localhost:3000

**Solution**:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies if needed
npm install

# Start development server
npm run dev
```

#### 3. Backend API Errors
**Symptoms**:
- 500 Internal Server Error responses
- Backend server not responding on localhost:8000

**Solution**:
```bash
# Navigate to backend directory
cd backend

# Activate virtual environment
source .venv/bin/activate

# Ensure PostgreSQL is running first!
docker ps | grep party-time-db

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. JWT Authentication Warnings
**Symptoms**:
- Backend logs show: "Key not found for kid: ..."
- "Google OAuth credentials not found in environment variables"

**Status**: These are non-critical warnings that don't prevent functionality. The application works despite these warnings.

### Complete Setup Verification

To verify your entire development environment is working:

```bash
# 1. Check Docker and database
docker ps | grep party-time-db
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT version();"

# 2. Start backend server (in background or separate terminal)
cd backend && source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &

# 3. Start frontend server (in background or separate terminal)
cd frontend && npm run dev &

# 4. Test API endpoint
curl http://localhost:8000/api/v1/auth/health

# 5. Open browser to verify dashboard
open http://localhost:3000/dashboard
```

### Development Workflow

**Daily Startup Procedure**:
1. Start Docker Desktop (if not already running)
2. Verify PostgreSQL container: `docker ps | grep party-time-db`
3. Start backend server: `cd backend && source .venv/bin/activate && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
4. Start frontend server: `cd frontend && npm run dev`
5. Open browser to `http://localhost:3000`

**Development URLs**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Database: localhost:5432 (PostgreSQL)

## 13-Week Development Timeline

**Current Status**: Week 5 - RSVP & Email Systems (Phase 5.1.1 Complete)

### Week-by-Week Breakdown:

**Weeks 1-4: Foundation** ✅ COMPLETE
- Week 1: Project setup, infrastructure, database schema, basic AWS Cognito auth ✅
- Week 2: Complete authentication flow, user registration, protected routes ✅
- Week 3: Event management CRUD, validation, status management ✅
- Week 4: Guest management system, CSV import basics, RSVP token generation ✅

**Weeks 5-6: RSVP & Email Systems** 🔄 IN PROGRESS
- Week 5: RSVP system with public portal, attendance tracking
  - Phase 5.1.1: Public RSVP Backend ✅ COMPLETE
  - Phase 5.1.2: RSVP Frontend Portal - NEXT
  - Phase 5.1.3: RSVP Management Dashboard
  - Phase 5.1.4: RSVP Customization
- Week 6: AWS SES email integration, invitation templates, bulk sending

**Weeks 7-8: Core MVP Features**
- Week 7: Google Places API integration, venue search and selection
- Week 8: Budget tracking with categories, expense management, analytics

**Weeks 9-11: Enhanced Features & Deployment**
- Week 9: UI/UX polish, mobile optimization, performance improvements
- Week 10: Comprehensive testing (unit, integration, end-to-end)
- Week 11: AWS deployment setup, CI/CD pipeline, production configuration

**Weeks 12-13: Advanced Features & Finalization**
- Week 12: Choose ONE advanced feature (seating charts, photo gallery, or calendar integration)
- Week 13: Final testing, video demo, documentation completion

### Critical Success Factors:

**Scope Management Strategy**
- **Must Have (Weeks 1-8)**: Auth ✅, Event CRUD ✅, Guest management ✅, RSVP 🔄, Email, Venue search, Budget tracking
- **Should Have (Weeks 9-11)**: Mobile optimization, Testing, AWS deployment, Performance
- **Nice-to-Have (Week 12)**: Only if ahead of schedule - Vendor management, Seating charts, AI integration

**Risk Mitigation Checkpoints**
- Week 4: If behind, skip CSV import complexity ✅ (Completed successfully)
- Week 6: If behind, use simple email instead of AWS SES
- Week 8: If behind, simplify budget to basic expense list
- Week 10: If behind, deploy to Heroku instead of AWS

**Daily Development Rhythm**
- Morning (2-3 hours): Backend development (APIs, database, business logic)
- Afternoon (2-3 hours): Frontend development (React components, forms, UI/UX)
- Evening (1 hour): Testing, documentation, next day planning

## Key Files

- `documentation/new-roadmap.md` - Complete 11-week development roadmap with detailed phase breakdown
- `documentation/Party-Time-App-Description-Technologies.md` - Complete project specification with features by phase
- `frontend/src/app/page.tsx` - Main homepage component
- `frontend/src/app/layout.tsx` - Root layout with font configuration
- `frontend/src/app/globals.css` - Global styles with Tailwind and theming
- `backend/app/main.py` - FastAPI application entry point
- `frontend/package.json` - Frontend dependencies and scripts
- `frontend/tsconfig.json` - TypeScript configuration with path mapping

## Planned File Structure

The documentation outlines a comprehensive file structure for the full application:

**Frontend Structure (`frontend/src/`)**
- `app/` - Next.js App Router pages (auth, dashboard, events, API routes)
- `components/` - Reusable UI components (ui, forms, layout)
- `lib/` - Core utilities (auth, api, utils)
- `hooks/` - Custom React hooks (useAuth, useEvents, useGuests)
- `types/` - TypeScript type definitions

**Backend Structure (`backend/app/`)**
- `api/v1/` - API route handlers (auth, events, guests, venues, vendors, budget, rsvp)
- `core/` - Configuration, security, dependencies
- `db/` - Database connection and session management
- `models/` - SQLAlchemy database models
- `schemas/` - Pydantic validation schemas
- `services/` - Business logic services (email, AWS, AI, venue, rsvp)
- `utils/` - Helper functions and validators
- `middleware/` - Custom middleware (rate limiting, authentication)

**Infrastructure (`infrastructure/`)**
- `terraform/` - Infrastructure as Code (modules for VPC, ECS, RDS, S3)
- `environments/` - Environment-specific configurations (dev, staging, production)
- `scripts/` - Deployment and setup automation
