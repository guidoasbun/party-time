# Party time initial idea and technologies

## Party-Time ApplicationDescription 

 

Party-Time is a comprehensive event planning web application designed to streamline the entire event management process from initial planning to execution. The platform enables event planners to create and manage various types of events (weddings, birthdays, corporate events, etc.) while providing tools for venue discovery through Google Places API integration, guest list management with Excel import capabilities, and real-time budget tracking across multiple expense categories. The application features a multi-tier user system supporting admins, planners, and guests, with secure authentication through AWS Cognito supporting both email/password registration and Google OAuth social login.

The platform offers advanced features including interactive seating chart creation, automated timeline generation based on event types, integrated chat rooms for real-time communication between all stakeholders, and AI-powered assistance for event planning guidance. Additional functionality encompasses RSVP management, email invitation systems, vendor management tools, payment processing with split payment options, and calendar integration for seamless scheduling. Built with a modern tech stack featuring FastAPI backend, Next.js frontend, and comprehensive AWS cloud infrastructure including ECS, RDS, and S3, the application emphasizes robust DevOps practices with Terraform infrastructure as code, Docker containerization, and automated CI/CD pipelines through GitHub Actions.

 

# Party-Time Features by Development Phase

## Phase 1 \- MVP (Weeks 1-8)

**Core Functionality & DevOps Foundation**

·   	**User Authentication System**

* AWS Cognito User Pools with hosted UI
  * Email/password registration and login
  * Google OAuth 2.0 social authentication  
  * Multi-tier user roles (admin, planner, guest)
  * JWT token-based API authentication

  ·   	**Event Management**

  * Create, edit, and delete events with basic details (name, type, date, location, guest count)  
  * Event types: wedding, birthday, graduation, corporate, celebration, other  
  * Basic event dashboard for planners

  ·   	**Guest List Management**

  * Manual guest entry and editing  
  * Guest contact information storage  
  * Basic guest categorization

  ·   	**RSVP System**

  * Email invitation sending via AWS SES  
  * Simple RSVP tracking (attending/not attending)  
  * Guest response management dashboard

  ·   	**Basic Venue Search**

  * Google Places API integration  
  * Search venues by location and event type  
  * Basic venue information display and selection

  ·   	**DevOps Infrastructure**

  * Complete Terraform infrastructure setup  
  * Docker containerization for local development  
  * AWS ECS with Fargate deployment  
  * AWS Cognito User Pools setup with email/password and Google OAuth
  * GitHub Actions CI/CD pipeline with automated testing  
  * Monitoring setup with CloudWatch and Sentry  
  * Secrets management with AWS Secrets Manager

## Phase 2 \- Enhanced Features (Weeks 9-11)

**Business Logic & Advanced Functionality**

·   	**Budget Tracking**

* Real-time budget monitoring with category breakdowns  
  * Expense tracking for venue, catering, decorations, etc.  
  * Budget vs. actual spending analysis

  ·   	**Vendor Management**

  * Add and manage vendors (caterers, photographers, DJs, florists)  
  * Vendor contact information and service details  
  * Basic vendor assignment to events

  ·   	**Enhanced Guest Features**

  * Additional guest information (dietary restrictions, special needs)  
  * Guest profile management  
  * RSVP with plus-one functionality

  ·   	**Timeline & Checklist**

  * Auto-generated planning timelines based on event type  
  * Customizable task checklists  
  * Deadline tracking and reminders

  ·   	**Payment Integration**

  * Stripe payment processing setup  
  * Basic deposit tracking  
  * Payment status monitoring

## Phase 3 \- Advanced Features (Weeks 12-13)

**Premium Functionality & Polish**

·   	**File Management**

* Excel guest list import with drag-and-drop interface  
  * Bulk guest data processing with Papa Parse  
  * Image upload and storage via AWS S3  
  * Photo/video sharing galleries where guests can upload content

  ·   	**Interactive Seating Charts**

  * Fabric.js-powered seating chart creator  
  * Drag-and-drop table and guest arrangement  
  * Visual seating plan export

  ·   	**Communication Features**

  * Event-specific chat rooms  
  * Real-time messaging with WebSocket integration  
  * Chat history storage and retrieval

  ·   	**AI Integration**

  * Claude AI integration for event planning assistance  
  * Automated event suggestions and recommendations  
  * AI-powered Q\&A for event-related queries

  ·   	**Calendar Integration**

  * Google Calendar two-way synchronization  
  * Event reminders and deadline notifications  
  * Shared calendar access for planners and guests

## Future Enhancements (Post-Capstone)

**Scalability & Market Features**

·   	**Advanced Analytics**

* Event attendance analytics  
  * Budget analysis reports  
  * Performance metrics dashboard  
  * Post-event analytics (attendance rate, engagement metrics)

  ·   	**Mobile Experience**

  * Progressive Web App (PWA) optimization  
  * Mobile-responsive design improvements  
  * QR code check-in system for contactless event entry

  ·   	**Enhanced Guest Experience**

  * Dietary restrictions and preferences tracking for catering  
  * Gift registry integration with popular registry services

  ·   	**Event Templates & Automation**

  * Pre-built templates for common event types  
  * Automated event setup based on event category  
  * Smart recommendations based on event history

  ·   	**Marketplace Features**

  * Vendor rating and review system  
  * Vendor marketplace integration  
  * Contract management tools

  ·   	**Enterprise Features**

  * White-label branding options  
  * Multi-language support (i18n)  
  * Advanced user permissions and roles

 

# Technology Stack

## Backend Infrastructure

**Python 3.13 with FastAPI Framework**

·   	**FastAPI** \- Modern, fast web framework with automatic API documentation

* Installation: pip install "fastapi\[all\]"  
  * Route structure: /api/v1/  
  * Native WebSocket support for real-time features

  ·   	**Core Dependencies**

  * **Pydantic** \- Data validation and serialization  
  * **SQLAlchemy** \- Object-relational mapping (ORM)  
  * **Alembic** \- Database migration management  
  * **python-jose** \- JWT token handling and authentication  
  * **python-multipart** \- File upload processing  
  * **boto3** \- AWS SDK for Python integration

  ·   	**Background Processing**

  * **Celery \+ Redis** \- Asynchronous task processing for email sending and notifications  
  * **AWS SQS** \- Message queuing for async task management

  ·   	**Development & Testing**

  * **pytest** \- Comprehensive testing framework  
  * **black** \- Code formatting  
  * **flake8** \- Code linting and style enforcement

## Frontend Application

**Next.js with Modern React Ecosystem**

·   	**Framework & Build Tools**

* **Next.js** \- Full-stack React framework with App Router  
  * **Turbopack** \- Fast bundler for development  
  * **ESLint** \- TypeScript linting  
  * **TypeScript** \- Primary frontend language

  ·   	**Project Structure**

  * /src directory organization  
  * Import alias configuration: @/\*  
  * Component-based architecture

  ·   	**Styling & UI**

  * **Tailwind CSS** \- Utility-first CSS framework  
  * **Material Design** principles for consistent UI  
  * **React Icons** \- Icon library (https://react-icons.github.io/react-icons/)  
  * **Framer Motion** \- Animation library

  ·   	**State Management & Forms**

  * **React Query** \- Server state management and API calls  
  * **React Context \+ useReducer** \- Global client state management  
  * **React Hook Form** \- Form handling and validation

  ·   	**Authentication**

  * **NextAuth.js** \- Authentication for Next.js applications  
  * Integration with AWS Cognito

## Database Architecture

**Hybrid Database Strategy**

·   	**PostgreSQL (AWS RDS)**

* Primary database for relational data  
  * Tables: users, events, guests, vendors, RSVPs, budgets  
  * ACID compliance for critical business data

  ·   	**AWS DynamoDB**

  * NoSQL database for flexible, scalable data  
  * Use cases: chat messages, activity logs, analytics data  
  * Serverless and auto-scaling capabilities

## Authentication & Security

**AWS Cognito Integration**

·   	**Authentication Methods**

* AWS Cognito User Pools with multiple sign-in options
  * Email/password registration and login
  * Google OAuth 2.0 social authentication
  * AWS Cognito hosted UI for unified login experience
  * Custom login/registration pages as alternative
  * JWT token-based API authentication with python-jose

  ·   	**User Roles & Permissions**

  * Admin, Planner, and Guest role hierarchy  
  * Role-based access control (RBAC)
  * Secure token storage and refresh mechanism
  * Session management and logout functionality

## File Storage & Media

**AWS S3 Ecosystem**

·   	**AWS S3 Buckets**

* Image and document storage  
  * Venue photos and event media  
  * Guest-uploaded content galleries

  ·   	**File Processing Libraries**

  * **react-dropzone** \- Drag-and-drop file uploads  
  * **Papa Parse** \- Excel/CSV processing for guest lists  
  * **Fabric.js** \- Interactive seating chart creation

## External API Integrations

**Third-Party Service Integration**

### Phase 1 APIs (MVP)

* **Google Places API** \- Venue search and discovery  
* **AWS SES** \- Transactional email delivery  
* **Stripe API** \- Payment processing and billing  
* **AWS Cognito** \- User authentication

### Phase 2 APIs (Enhanced Features)

* **Google Calendar API** \- Calendar synchronization  
* **Claude AI API** \- Intelligent event planning assistance  
* **Twilio API** \- SMS notifications

### Phase 3 APIs (Advanced Features)

* **OpenWeatherMap API** \- Weather forecasts for outdoor events  
* **Cloudinary API** \- Advanced image optimization and processing  
* **Unsplash API** \- Stock photography for event templates  
* **Calendly API** \- Vendor scheduling integration

### Future API Integrations

* **Google Geocoding API** \- Address to coordinate conversion  
* **Google Maps API** \- Enhanced location services

## DevOps & Deployment Architecture

**AWS Cloud-Native Infrastructure**

### Infrastructure as Code

* **Terraform** \- Complete infrastructure provisioning and management  
* **Docker** \- Containerization for consistent deployments  
* **docker-compose.yml** \- Local development environment

### Container Orchestration

* **AWS ECS with Fargate** \- Serverless container management  
  * Frontend: 1-3 instances with auto-scaling  
  * Backend: 1-3 instances with auto-scaling  
* **AWS Application Load Balancer** \- Traffic distribution

### CI/CD Pipeline

* **GitHub Actions** \- Automated build, test, and deployment  
* **Automated testing** \- Unit and integration test execution  
* **Staging environment** \- Pre-production testing environment  
* **Database migration strategy** \- Automated Alembic migrations

### AWS Services Integration

* **AWS VPC** \- Isolated network environment  
* **AWS Route 53** \- DNS and domain management  
* **AWS ElastiCache** \- Redis caching layer  
* **AWS Lambda** \- Serverless functions for image processing and notifications  
* **AWS CloudFront** \- Global CDN for static asset delivery  
* **API Gateway** \- API management and throttling

### Monitoring & Security

* **AWS CloudWatch** \- Application and infrastructure monitoring  
* **Sentry** \- Error tracking and performance monitoring  
* **AWS Secrets Manager** \- Secure API key and credential management

### Security Implementation

* **Rate limiting** \- API endpoint protection  
* **Data encryption** \- At rest and in transit  
* **CORS configuration** \- Cross-origin request security  
* **Input validation** \- SQL injection and XSS prevention  
* **GDPR compliance** \- Data export and deletion capabilities  
* **Audit logging** \- Administrative action tracking

## Development Environment

**Local Development Setup**

* **Docker Compose** \- Multi-service local development  
* **Hot reloading** \- Frontend and backend development servers  
* **Database seeding** \- Test data for development  
* **Environment configuration** \- Separate dev/staging/production configs

 

## Initial File Structure

 party-time/

│

├── frontend/

│   ├── src/

│   │   ├── app/

│   │   │   ├── auth/

│   │   │   │   ├── login/

│   │   │   │   │   └── page.js

│   │   │   │   ├── register/

│   │   │   │   │   └── page.js

│   │   │   │   └── layout.js

│   │   │   ├── dashboard/

│   │   │   │   ├── events/

│   │   │   │   │   └── page.js

│   │   │   │   ├── guests/

│   │   │   │   │   └── page.js

│   │   │   │   └── page.js

│   │   │   ├── events/

│   │   │   │   ├── \[id\]/

│   │   │   │   │   └── page.js

│   │   │   │   ├── create/

│   │   │   │   │   └── page.js

│   │   │   │   └── page.js

│   │   │   ├── api/

│   │   │   │   └── auth/

│   │   │   │       └── \[...nextauth\]/

│   │   │   │           └── route.js

│   │   │   ├── globals.css

│   │   │   ├── layout.js

│   │   │   └── page.js

│   │   ├── components/

│   │   │   ├── ui/

│   │   │   │   ├── Button.js

│   │   │   │   ├── Input.js

│   │   │   │   ├── Modal.js

│   │   │   │   └── Card.js

│   │   │   ├── forms/

│   │   │   │   ├── EventForm.js

│   │   │   │   ├── GuestForm.js

│   │   │   │   └── VendorForm.js

│   │   │   └── layout/

│   │   │       ├── Header.js

│   │   │       ├── Sidebar.js

│   │   │       └── Footer.js

│   │   ├── lib/

│   │   │   ├── auth.js

│   │   │   ├── api.js

│   │   │   └── utils.js

│   │   ├── hooks/

│   │   │   ├── useAuth.js

│   │   │   ├── useEvents.js

│   │   │   └── useGuests.js

│   │   ├── utils/

│   │   │   ├── constants.js

│   │   │   ├── helpers.js

│   │   │   └── validators.js

│   │   └── types/

│   │       ├── event.js

│   │       ├── user.js

│   │       └── guest.js

│   ├── public/

│   │   ├── images/

│   │   ├── icons/

│   │   └── favicon.ico

│   ├── next.config.js

│   ├── tailwind.config.js

│   ├── package.json

│   ├── package-lock.json

│   ├── .env.local

│   ├── .env.example

│   └── Dockerfile

│

├── backend/

│   ├── app/

│   │   ├── api/

│   │   │   ├── v1/

│   │   │   │   ├── auth.py

│   │   │   │   ├── events.py

│   │   │   │   ├── guests.py

│   │   │   │   ├── venues.py

│   │   │   │   ├── vendors.py

│   │   │   │   └── budget.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── core/

│   │   │   ├── config.py

│   │   │   ├── security.py

│   │   │   ├── dependencies.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── db/

│   │   │   ├── database.py

│   │   │   ├── session.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── models/

│   │   │   ├── user.py

│   │   │   ├── event.py

│   │   │   ├── guest.py

│   │   │   ├── venue.py

│   │   │   ├── vendor.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── schemas/

│   │   │   ├── user.py

│   │   │   ├── event.py

│   │   │   ├── guest.py

│   │   │   ├── venue.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── services/

│   │   │   ├── email\_service.py

│   │   │   ├── aws\_service.py

│   │   │   ├── ai\_service.py

│   │   │   ├── venue\_service.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── utils/

│   │   │   ├── helpers.py

│   │   │   ├── validators.py

│   │   │   └── \_\_init\_\_.py

│   │   ├── main.py

│   │   └── \_\_init\_\_.py

│   ├── tests/

│   │   ├── api/

│   │   │   ├── test\_auth.py

│   │   │   ├── test\_events.py

│   │   │   └── test\_guests.py

│   │   ├── services/

│   │   │   ├── test\_email\_service.py

│   │   │   └── test\_aws\_service.py

│   │   ├── conftest.py

│   │   └── \_\_init\_\_.py

│   ├── alembic/

│   │   ├── versions/

│   │   ├── env.py

│   │   ├── script.py.mako

│   │   └── alembic.ini

│   ├── requirements.txt

│   ├── requirements-dev.txt

│   ├── docker-compose.yml

│   ├── Dockerfile

│   ├── .env

│   ├── .env.example

│   └── pytest.ini

│

├── infrastructure/

│   ├── terraform/

│   │   ├── modules/

│   │   │   ├── vpc/

│   │   │   │   ├── main.tf

│   │   │   │   ├── variables.tf

│   │   │   │   └── outputs.tf

│   │   │   ├── ecs/

│   │   │   │   ├── main.tf

│   │   │   │   ├── variables.tf

│   │   │   │   └── outputs.tf

│   │   │   ├── rds/

│   │   │   │   ├── main.tf

│   │   │   │   ├── variables.tf

│   │   │   │   └── outputs.tf

│   │   │   └── s3/

│   │   │       ├── main.tf

│   │   │       ├── variables.tf

│   │   │       └── outputs.tf

│   │   ├── environments/

│   │   │   ├── dev/

│   │   │   │   ├── main.tf

│   │   │   │   ├── variables.tf

│   │   │   │   └── terraform.tfvars

│   │   │   ├── staging/

│   │   │   │   ├── main.tf

│   │   │   │   ├── variables.tf

│   │   │   │   └── terraform.tfvars

│   │   │   └── production/

│   │   │       ├── main.tf

│   │   │       ├── variables.tf

│   │   │       └── terraform.tfvars

│   │   ├── main.tf

│   │   ├── variables.tf

│   │   ├── outputs.tf

│   │   └── terraform.tfvars.example

│   ├── k8s/

│   │   ├── manifests/

│   │   │   ├── frontend-deployment.yaml

│   │   │   ├── backend-deployment.yaml

│   │   │   └── ingress.yaml

│   │   └── helm/

│   │       └── party-time/

│   │           ├── Chart.yaml

│   │           ├── values.yaml

│   │           └── templates/

│   └── scripts/

│       ├── deploy.sh

│       ├── setup-local.sh

│       └── backup.sh

│

├── docs/

│   ├── api/

│   │   ├── authentication.md

│   │   ├── events.md

│   │   └── guests.md

│   ├── architecture/

│   │   ├── aws-architecture.md

│   │   ├── database-design.md

│   │   ├── security.md

│   │   └── deployment.md

│   ├── setup/

│   │   ├── local-development.md

│   │   ├── deployment.md

│   │   └── testing.md

│   └── README.md

│

├── .github/

│   ├── workflows/

│   │   ├── ci.yml

│   │   ├── cd.yml

│   │   ├── test.yml

│   │   └── security.yml

│   ├── ISSUE\_TEMPLATE/

│   │   ├── bug\_report.md

│   │   └── feature\_request.md

│   └── pull\_request\_template.md

│

├── README.md

├── LICENSE

├── .gitignore

├── .env.example

└── docker-compose.yml

### **Essential MCPs (Already Integrated in Claude Code):**

1. **Filesystem MCP**  
   * Purpose: Navigate and edit project structure  
   * Use Case: Managing complex file organization (frontend/, backend/, infrastructure/)  
   * Priority: Critical for all development phases  
2. **Git MCP**  
   * Purpose: Version control and progress tracking  
   * Use Case: Track commits, branches, and development velocity for metrics  
   * Priority: Essential for 13-week timeline management  
3. **Playwright MCP**  
   * Purpose: End-to-end testing  
   * Use Case: Test event creation workflows, generate test metrics  
   * Priority: Medium \- useful for prototype demonstration

### **Highly Recommended MCPs:**

3. **PostgreSQL MCP**  
   * Purpose: Database schema creation and management  
   * Use Case: Implement relationships between users, events, guests, venues  
   * Priority: High \- needed for core functionality  
4. **Memory MCP**  
   * Purpose: Maintain context across development sessions  
   * Use Case: Store project decisions, architecture choices, implementation details  
   * Priority: High \- helps maintain consistency over 13 weeks

### **Optional MCPs (If Available/Time Permits):**

5. **Fetch MCP**  
   * Purpose: API endpoint testing  
   * Use Case: Test FastAPI endpoints, Google Places API integration  
   * Priority: Low \- can use other testing methods

### **Not Required:**

* **AWS MCP** \- Not needed since AWS CLI is already installed and configured locally  
* **Sequelize/Prisma MCP** \- SQLAlchemy with FastAPI is sufficient for the backend

### **Implementation Timeline:**

* **Weeks 1-4:** Focus on Filesystem, Git, and PostgreSQL MCPs  
* **Weeks 5-8:** Add Memory MCP for complex state management  
* **Weeks 9-13:** Consider testing MCPs if core features are complete

This MCP stack prioritizes simplicity while providing the essential tools needed to complete your capstone project within the 13-week timeline.

Deployment Architecture Mermaid  
[https://www.mermaidchart.com/app/projects/654bbbca-8d57-4d29-ace8-b768dfaaee49/diagrams/2c2637cd-ae27-4df6-85f5-b30daabd41cf/version/v0.1/edit](https://www.mermaidchart.com/app/projects/654bbbca-8d57-4d29-ace8-b768dfaaee49/diagrams/2c2637cd-ae27-4df6-85f5-b30daabd41cf/version/v0.1/edit) 

File Structure  
[https://www.mermaidchart.com/app/projects/654bbbca-8d57-4d29-ace8-b768dfaaee49/diagrams/5a5a3dca-7cde-453f-8f80-82bc1fa55772/version/v0.1/edit](https://www.mermaidchart.com/app/projects/654bbbca-8d57-4d29-ace8-b768dfaaee49/diagrams/5a5a3dca-7cde-453f-8f80-82bc1fa55772/version/v0.1/edit) 