<div align="center">

# Party-Time

### An Event Planning Application

---

**Guido Asbun**

Department of Computer Science
California State University, Fullerton

Fall 2025 | December 2025

---

**GitHub Repository:**
[github.com/yourusername/party-time](https://github.com/yourusername/party-time)

**Demo Videos:**
[Application Walkthrough](https://youtube.com/watch?v=PLACEHOLDER)
[Infrastructure Walkthrough](https://youtube.com/watch?v=PLACEHOLDER)

</div>

---

# Table of Contents

- [Abstract](#abstract)
- [1.0 Introduction](#1.0-introduction)
- [2.0 Problem Statement](#2.0-problem-statement)
  - [2.1 Problem Definition](#2.1-problem-definition)
  - [2.2 Problem Rationale](#2.2-problem-rationale)
- [3.0 What is known about the problem](#3.0-what-is-known-about-the-problem)
  - [3.1 Existing Event Planning Solutions](#3.1-existing-solutions)
  - [3.2 Modern Web Development Paradigms](#3.2-web-development)
  - [3.3 Cloud-Native Architecture Patterns](#3.3-cloud-architecture)
  - [3.4 Authentication and Security Best Practices](#3.4-authentication)
  - [3.5 User Research Insights](#3.5-user-research)
  - [3.6 Email Delivery and Communication Systems](#3.6-email-systems)
- [4.0 Proposed Method of Solving the Problem](#4.0-proposed-method-of-solving-the-problem)
  - [4.1 Project Overview](#4.1-project-overview)
  - [4.2 Guest Management System](#4.2-guest-management)
  - [4.3 Email Communication Infrastructure](#4.3-email-infrastructure)
  - [4.4 Venue Discovery Integration](#4.4-venue-discovery)
  - [4.5 Budget Tracking and Analytics](#4.5-budget-tracking)
  - [4.6 Interactive Seating Chart Editor](#4.6-seating-charts)
  - [4.7 Technical Architecture Approach](#4.7-technical-architecture)
  - [4.8 Development Methodology](#4.8-development-methodology)
  - [4.9 Benefits and Significance](#4.9-benefits-significance)
  - [4.10 Future Enhancements](#4.10-future-enhancements)
- [5.0 Objectives](#5.0-objectives)
  - [5.1 Functional Objectives](#5.1-functional-objectives)
  - [5.2 User Experience Objectives](#5.2-ux-objectives)
  - [5.3 Technical Objectives](#5.3-technical-objectives)
- [6.0 Activities](#6.0-activities)
  - [6.1 Phase 1: Infrastructure Setup](#6.1-infrastructure-setup)
  - [6.2 Phase 3: Event Forms and Detail Pages](#6.2-event-forms)
  - [6.3 Phase 4: Guest Management](#6.3-guest-management)
  - [6.4 Phase 5: RSVP and Email Systems](#6.4-rsvp-email)
  - [6.5 Phase 6: Seating Charts](#6.5-seating-charts)
  - [6.6 Phase 7: Venue and Budget Systems](#6.6-venue-budget)
  - [6.7 Phase 8: Testing and UI Polish](#6.7-testing-polish)
  - [6.8 Phase 9: Performance and Final Polish](#6.8-performance)
  - [6.9 Phase 10: AWS Infrastructure Deployment](#6.9-infrastructure)
  - [6.10 Project Timeline Summary](#6.10-timeline)
- [7.0 Development Environment](#7.0-development-environment)
  - [7.1 Technology Stack Versions](#7.1-technology-versions)
  - [7.2 Docker Configuration](#7.2-docker-configuration)
  - [7.3 Frontend Development Environment](#7.3-frontend-environment)
  - [7.4 Backend Development Environment](#7.4-backend-environment)
  - [7.5 Code Quality Tools](#7.5-code-quality)
  - [7.6 Local Development Setup](#7.6-local-setup)
  - [7.7 Environment Variables](#7.7-environment-variables)
  - [7.8 Database Configuration](#7.8-database-config)
  - [7.9 IDE Recommendations](#7.9-ide-recommendations)
  - [7.10 Development Environment Summary](#7.10-dev-summary)
- [8.0 Operational Environment](#8.0-operational-environment)
  - [8.1 AWS Infrastructure Overview](#8.1-aws-overview)
  - [8.2 Compute and Container Services](#8.2-compute)
  - [8.3 Networking and Load Balancing](#8.3-networking)
  - [8.4 Database Layer](#8.4-database)
  - [8.5 Storage and Content Delivery](#8.5-storage)
  - [8.6 Security Infrastructure](#8.6-security)
  - [8.7 Monitoring and Observability](#8.7-monitoring)
  - [8.8 CI/CD Pipeline](#8.8-cicd)
  - [8.9 Disaster Recovery](#8.9-disaster-recovery)
  - [8.10 Cost Optimization](#8.10-cost)
  - [8.11 Operational Environment Summary](#8.11-summary)
- [9.0 Overall Description](#9.0-overall-description)
  - [9.1 System Perspective](#9.1-system-perspective)
  - [9.2 System Functions](#9.2-system-functions)
  - [9.3 User Characteristics](#9.3-user-characteristics)
  - [9.4 Constraints](#9.4-constraints)
  - [9.5 Assumptions and Dependencies](#9.5-assumptions-dependencies)
  - [9.6 Overall Description Summary](#9.6-summary)
- [10.0 System Architecture](#10.0-system-architecture)
  - [10.1 Microservices Architecture](#10.1-microservices)
  - [10.2 Frontend Component Architecture](#10.2-frontend-architecture)
  - [10.3 Backend Services Architecture](#10.3-backend-architecture)
  - [10.4 Data Architecture](#10.4-data-architecture)
  - [10.5 Data Flow Architecture](#10.5-data-flow)
  - [10.6 Security Architecture](#10.6-security-architecture)
  - [10.7 Deployment Architecture](#10.7-deployment-architecture)
  - [10.8 Integration Architecture](#10.8-integration-architecture)
  - [10.9 System Architecture Summary](#10.9-summary)
- [11.0 UML Diagrams](#11.0-uml-diagrams)
  - [11.1 Use Case Diagram](#11.1-use-case)
  - [11.2 Sequence Diagrams](#11.2-sequence)
    - [11.2.1 User Authentication Sequence](#11.2.1-auth-sequence)
    - [11.2.2 Event Creation Sequence](#11.2.2-event-sequence)
    - [11.2.3 RSVP Submission Sequence](#11.2.3-rsvp-sequence)
  - [11.3 Activity Diagram](#11.3-activity)
  - [11.4 Data Flow Diagrams](#11.4-dfd)
    - [11.4.1 Context Diagram (Level 0)](#11.4.1-context)
    - [11.4.2 Level 1 Data Flow Diagram](#11.4.2-level1)
  - [11.5 Class Diagram](#11.5-class)
  - [11.6 UML Diagrams Summary](#11.6-summary)
- [12.0 Implementation](#12.0-implementation)
  - [12.1 Development Process Overview](#12.1-development-process)
  - [12.2 Frontend Implementation](#12.2-frontend-implementation)
    - [12.2.1 Project Structure](#12.2.1-frontend-structure)
    - [12.2.2 Key Frontend Technologies](#12.2.2-frontend-tech)
    - [12.2.3 Component Implementation Highlights](#12.2.3-components)
    - [12.2.4 State Management](#12.2.4-state-management)
  - [12.3 Backend Implementation](#12.3-backend-implementation)
    - [12.3.1 Project Structure](#12.3.1-backend-structure)
    - [12.3.2 Key Backend Technologies](#12.3.2-backend-tech)
    - [12.3.3 API Implementation](#12.3.3-api-implementation)
    - [12.3.4 Database Models](#12.3.4-database-models)
    - [12.3.5 Asynchronous Processing](#12.3.5-async-processing)
    - [12.3.6 Caching Layer](#12.3.6-caching)
  - [12.4 Authentication Implementation](#12.4-authentication)
    - [12.4.1 Authentication Flow](#12.4.1-auth-flow)
    - [12.4.2 JWT Validation](#12.4.2-jwt-validation)
  - [12.5 External Service Integrations](#12.5-integrations)
    - [12.5.1 Google Places API](#12.5.1-google-places)
    - [12.5.2 AWS SES Email Service](#12.5.2-aws-ses)
  - [12.6 Infrastructure Implementation](#12.6-infrastructure)
    - [12.6.1 Infrastructure Overview](#12.6.1-overview)
    - [12.6.2 Network Architecture](#12.6.2-network)
    - [12.6.3 Request Flow Architecture](#12.6.3-request-flow)
    - [12.6.4 Security Architecture](#12.6.4-security)
    - [12.6.5 CI/CD Pipeline](#12.6.5-cicd)
    - [12.6.6 Blue-Green Deployment](#12.6.6-blue-green)
    - [12.6.7 Monitoring & Observability](#12.6.7-monitoring)
    - [12.6.8 Disaster Recovery & Backup](#12.6.8-disaster-recovery)
    - [12.6.9 Cost Optimization](#12.6.9-cost)
    - [12.6.10 Terraform Infrastructure as Code](#12.6.10-terraform)
  - [12.7 Performance Optimizations](#12.7-performance)
    - [12.7.1 Frontend Optimizations](#12.7.1-frontend-perf)
    - [12.7.2 Backend Optimizations](#12.7.2-backend-perf)
  - [12.8 Implementation Statistics](#12.8-statistics)
- [13.0 Testing and Integration](#13.0-testing-and-integration)
  - [13.1 Testing Strategy Overview](#13.1-testing-overview)
  - [13.2 Frontend Testing](#13.2-frontend-testing)
    - [13.2.1 Unit Testing with Jest](#13.2.1-jest)
    - [13.2.2 Integration Testing](#13.2.2-integration)
    - [13.2.3 End-to-End Testing with Playwright](#13.2.3-playwright)
  - [13.3 Backend Testing](#13.3-backend-testing)
    - [13.3.1 Unit Testing with pytest](#13.3.1-pytest)
    - [13.3.2 API Integration Tests](#13.3.2-api-integration)
    - [13.3.3 Complete Flow Tests](#13.3.3-flow-tests)
  - [13.4 Test Infrastructure](#13.4-test-infrastructure)
    - [13.4.1 Test Database Setup](#13.4.1-test-db)
    - [13.4.2 Mock Services](#13.4.2-mocks)
    - [13.4.3 Test Fixtures](#13.4.3-fixtures)
  - [13.5 Continuous Integration](#13.5-ci)
    - [13.5.1 CI Pipeline Configuration](#13.5.1-ci-pipeline)
    - [13.5.2 Quality Gates](#13.5.2-quality-gates)
  - [13.6 Deployment Testing](#13.6-deployment-testing)
    - [13.6.1 Smoke Tests](#13.6.1-smoke-tests)
    - [13.6.2 Synthetics Canaries](#13.6.2-synthetics)
    - [13.6.3 Production Monitoring Integration](#13.6.3-monitoring-integration)
  - [13.7 Test Results Summary](#13.7-test-summary)
- [14.0 Installation Instructions](#14.0-installation-instructions)
  - [14.1 Prerequisites](#14.1-prerequisites)
    - [14.1.1 System Requirements](#14.1.1-system-requirements)
    - [14.1.2 Account Requirements](#14.1.2-accounts)
  - [14.2 Local Development Setup](#14.2-local-setup)
    - [14.2.1 Clone Repository](#14.2.1-clone)
    - [14.2.2 Start Docker Services](#14.2.2-docker)
    - [14.2.3 Backend Setup](#14.2.3-backend)
    - [14.2.4 Frontend Setup](#14.2.4-frontend)
    - [14.2.5 Celery Workers (Optional)](#14.2.5-celery)
  - [14.3 Environment Configuration](#14.3-environment-config)
    - [14.3.1 Backend Environment Variables](#14.3.1-backend-env)
    - [14.3.2 Frontend Environment Variables](#14.3.2-frontend-env)
  - [14.4 Database Setup](#14.4-database)
    - [14.4.1 Local Database](#14.4.1-local-db)
    - [14.4.2 Database Migrations](#14.4.2-migrations)
  - [14.5 AWS Infrastructure Deployment](#14.5-aws-deployment)
    - [14.5.1 Prerequisites for AWS](#14.5.1-aws-prereqs)
    - [14.5.2 Bootstrap Terraform State](#14.5.2-bootstrap)
    - [14.5.3 Deploy Infrastructure](#14.5.3-deploy-infra)
    - [14.5.4 Deploy Application](#14.5.4-deploy-app)
    - [14.5.5 Configure DNS](#14.5.5-dns)
  - [14.6 CI/CD Configuration](#14.6-cicd-config)
    - [14.6.1 GitHub Secrets](#14.6.1-github-secrets)
    - [14.6.2 GitHub Environments](#14.6.2-github-envs)
    - [14.6.3 Deployment Workflow](#14.6.3-deploy-workflow)
  - [14.7 Troubleshooting](#14.7-troubleshooting)
    - [14.7.1 Common Issues](#14.7.1-common-issues)
    - [14.7.2 Health Check Endpoints](#14.7.2-health-checks)
    - [14.7.3 Logs and Debugging](#14.7.3-logs)
  - [14.8 Quick Start Summary](#14.8-quick-start)
- [15.0 Recommendations for Enhancement](#15.0-recommendations-for-enhancement)
  - [15.1 High Priority Enhancements](#15.1-high-priority)
    - [15.1.1 AI-Powered Planning Assistant](#15.1.1-ai-assistant)
    - [15.1.2 Real-Time Chat System](#15.1.2-chat-system)
    - [15.1.3 Production Environment Deployment](#15.1.3-production)
  - [15.2 Medium Priority Enhancements](#15.2-medium-priority)
    - [15.2.1 Vendor Marketplace](#15.2.1-vendor-marketplace)
    - [15.2.2 Payment Processing Integration](#15.2.2-payments)
    - [15.2.3 Native Mobile Applications](#15.2.3-mobile-apps)
    - [15.2.4 Photo and Video Sharing](#15.2.4-media-sharing)
  - [15.3 Lower Priority Enhancements](#15.3-lower-priority)
    - [15.3.1 Calendar Integration](#15.3.1-calendar)
    - [15.3.2 Multi-Language Support (i18n)](#15.3.2-i18n)
    - [15.3.3 Advanced Analytics Dashboard](#15.3.3-analytics)
    - [15.3.4 Template Library](#15.3.4-templates)
  - [15.4 Technical Improvements](#15.4-technical)
    - [15.4.1 Performance Optimization](#15.4.1-performance)
    - [15.4.2 Security Enhancements](#15.4.2-security)
    - [15.4.3 Scalability Improvements](#15.4.3-scalability)
    - [15.4.4 Developer Experience](#15.4.4-devex)
  - [15.5 Enhancement Priority Matrix](#15.5-priority-matrix)
  - [15.6 Implementation Roadmap](#15.6-roadmap)
- [16.0 References](#16.0-references)
  - [16.1 Framework Documentation](#16.1-frameworks)
  - [16.2 AWS Services Documentation](#16.2-aws)
  - [16.3 Infrastructure Tools](#16.3-infrastructure)
  - [16.4 Testing Frameworks](#16.4-testing)
  - [16.5 Third-Party APIs](#16.5-apis)
  - [16.6 Design and UI Libraries](#16.6-design)
  - [16.7 Standards and Best Practices](#16.7-standards)
  - [16.8 Academic Resources](#16.8-academic)
  - [16.9 AI Development Tools](#16.9-ai-tools)

# Abstract {#abstract}

Party-Time is a comprehensive cloud-native web application designed to streamline the entire event planning lifecycle. The platform addresses the fragmented nature of current event planning solutions, where organizers must juggle multiple disconnected tools for guest management, venue booking, budget tracking, and communications. The motivation for this project stems from the recognition that event planners often struggle with coordinating these disparate systems, leading to inefficiencies, miscommunication, and overlooked details during the planning process.

The objectives of Party-Time include enabling event planners to create and manage events through an intuitive dashboard, handle guest lists with CSV bulk import capabilities, generate unique RSVP tokens for guests, send automated email invitations and reminders, discover venues through Google Places API integration, track budgets across customizable expense categories, and design interactive seating arrangements with a drag-and-drop editor. The application utilizes a modern technology stack including Next.js 15 with React 19 for the frontend, Python FastAPI for the backend services, PostgreSQL for relational data persistence, AWS Cognito for secure authentication, and AWS SES for email delivery. The infrastructure is fully deployed on AWS using Terraform, with ECS for container orchestration, CloudFront for CDN distribution, and comprehensive monitoring through CloudWatch dashboards, alarms, and X-Ray distributed tracing.

Party-Time successfully consolidates the essential components of event planning into a unified, user-friendly platform accessible through any web browser. The application features a responsive design optimized for both desktop and mobile devices, comprehensive testing with over 1,100 passing tests, and production-grade infrastructure with automated CI/CD pipelines. The project's significance lies in its demonstration of full-stack software engineering principles, cloud-native architecture patterns, and DevOps best practices while providing a practical solution that simplifies event coordination for planners and enhances the RSVP experience for guests.

# 1.0 Introduction {#1.0-introduction}

Event planning has become increasingly complex in the digital age, with organizers managing multiple aspects including venue selection, guest coordination, budget tracking, and stakeholder communications. While numerous digital tools exist for individual planning tasks, the fragmented nature of these solutions forces event planners to juggle disconnected platforms, leading to data silos, duplicated efforts, and increased risk of errors. Recent advancements in cloud computing, modern web frameworks, and integrated API services have created opportunities to consolidate these disparate functions into unified platforms. Party-Time addresses this fragmentation by providing a comprehensive cloud-native web application that streamlines the entire event planning lifecycle. By leveraging technologies such as Next.js for responsive interfaces, FastAPI for scalable backend services, and AWS cloud infrastructure for reliability, the application aims to transform event planning from a fragmented, stressful process into an organized and efficient experience for planners and guests alike.

# 2.0 Problem Statement {#2.0-problem-statement}

The event planning industry faces a significant challenge with fragmented digital tools that force planners to juggle multiple disconnected platforms for different aspects of event management. Current solutions require event organizers to switch between separate applications for venue discovery, guest list management, budget tracking, and communication with stakeholders. This fragmentation leads to data silos, increased risk of errors, duplicated efforts, and inefficient workflows that can compromise the success of events ranging from intimate gatherings to large-scale corporate functions.

Additionally, event planners often struggle with real-time coordination among multiple stakeholders—venues, vendors, and guests—who all need access to different levels of information at various stages of the planning process. The lack of integrated communication channels and centralized information management creates confusion, missed deadlines, and increased stress during what should be a celebratory planning experience.

## 2.1 Problem Definition {#2.1-problem-definition}

Current event planning workflows require organizers to use multiple disconnected tools: spreadsheets for budget tracking, email chains for vendor coordination, separate platforms for venue booking, and various applications for guest management and RSVP collection. This disjointed approach creates several critical issues. First, data becomes siloed across platforms, making it difficult to maintain a comprehensive view of event status. Second, manual data transfer between systems introduces errors and inconsistencies. Third, the cognitive overhead of managing multiple tools detracts from the creative and interpersonal aspects of event planning. The problem this project seeks to solve is consolidating these disparate functions into a unified platform that provides event planners with a single source of truth for all event-related information while enabling guests to easily respond to invitations and access event details.

## 2.2 Problem Rationale {#2.2-problem-rationale}

The purpose of solving this problem extends beyond mere convenience to addressing real pain points experienced by event planners and their guests. For planners, the fragmented tool landscape leads to increased stress, longer planning cycles, and higher likelihood of overlooked details. For guests, scattered communication channels result in missed invitations, confusion about event details, and friction in the RSVP process. By developing Party-Time as a comprehensive event planning platform, this project aims to demonstrate how modern full-stack development practices and cloud-native architecture can solve complex real-world coordination problems. The solution leverages technologies such as AWS Cognito for secure authentication, AWS SES for reliable email delivery, and PostgreSQL for robust data persistence to ensure the platform can handle the demands of production event planning while maintaining reliability during critical moments like RSVP deadlines.

# 3.0 What is known about the problem {#3.0-what-is-known-about-the-problem}

The challenges of event planning coordination have been extensively studied in both academic and industry contexts. Understanding the landscape of existing solutions, technological capabilities, and user needs provides essential context for developing Party-Time as a comprehensive event planning platform.

## 3.1 Existing Event Planning Solutions {#3.1-existing-solutions}

The current event planning software market offers numerous specialized tools, each addressing specific aspects of event management. Popular platforms include dedicated RSVP services like Evite and Paperless Post, venue booking marketplaces like The Knot and WeddingWire, budget tracking spreadsheets and applications, and general project management tools adapted for event coordination. However, research into user experiences reveals consistent frustration with the need to manually transfer data between these platforms, maintain multiple accounts, and reconcile conflicting information across systems. Industry surveys indicate that event planners spend an average of 20-30% of their planning time on administrative tasks related to managing multiple tools rather than actual event planning activities.

## 3.2 Modern Web Development Paradigms {#3.2-web-development}

Recent advancements in web development have created opportunities for building more integrated, responsive, and user-friendly applications. The emergence of modern JavaScript frameworks like React and Next.js enables the creation of dynamic, single-page applications that provide desktop-like experiences in the browser. Server-side rendering and static site generation improve initial load times and search engine optimization. Component-based architecture promotes code reusability and maintainability. Additionally, the adoption of TypeScript has improved code quality through static type checking, reducing runtime errors and improving developer productivity. These technologies collectively enable the development of sophisticated web applications that can rival native desktop software in functionality while maintaining the accessibility and cross-platform compatibility of web-based solutions.

## 3.3 Cloud-Native Architecture Patterns {#3.3-cloud-architecture}

Cloud computing has fundamentally transformed how applications are built, deployed, and scaled. Infrastructure-as-a-Service (IaaS) and Platform-as-a-Service (PaaS) offerings from providers like Amazon Web Services (AWS) allow developers to focus on application logic rather than infrastructure management. Key patterns relevant to Party-Time include containerization using Docker for consistent deployment environments, orchestration services like AWS ECS for managing containerized applications, managed database services for reliable data persistence, and content delivery networks for global performance optimization. The adoption of Infrastructure as Code (IaC) tools like Terraform enables reproducible, version-controlled infrastructure deployments, reducing configuration drift and enabling disaster recovery capabilities.

## 3.4 Authentication and Security Best Practices {#3.4-authentication}

Secure authentication is critical for any application handling personal data and event coordination. Research into authentication best practices emphasizes the importance of using established identity providers rather than implementing custom authentication systems. Services like AWS Cognito provide battle-tested authentication flows including secure password storage with industry-standard hashing algorithms, multi-factor authentication options, OAuth 2.0 and OpenID Connect compliance, and built-in protection against common attacks such as credential stuffing and brute force attempts. By leveraging managed authentication services, applications can achieve enterprise-grade security without the overhead of maintaining custom security infrastructure.

## 3.5 User Research Insights {#3.5-user-research}

Understanding target users is essential for designing effective solutions. Research into event planning user personas reveals distinct categories with varying needs. First-time event planners, such as individuals planning weddings or milestone celebrations, often feel overwhelmed by the number of decisions and lack experience with vendor coordination. They prioritize simplicity, guided workflows, and mobile accessibility. Professional event coordinators managing multiple concurrent events require advanced features like bulk operations, comprehensive reporting, and integration with corporate systems. Event guests, particularly those with lower technical proficiency, need frictionless RSVP experiences with minimal required information and clear, readable interfaces. These insights directly inform Party-Time's design decisions, including progressive disclosure of advanced features, mobile-responsive layouts, and streamlined guest-facing workflows.

## 3.6 Email Delivery and Communication Systems {#3.6-email-systems}

Reliable email delivery is fundamental to event planning applications, as invitations and reminders must reach recipients consistently. Research into email infrastructure reveals the complexity of achieving high deliverability rates, including proper DNS configuration (SPF, DKIM, DMARC records), reputation management, bounce handling, and compliance with anti-spam regulations. Managed email services like AWS Simple Email Service (SES) abstract these complexities while providing deliverability monitoring, sending statistics, and automatic handling of bounces and complaints. Asynchronous processing using task queues ensures that email operations do not block user interactions, improving perceived application performance.

# 4.0 Proposed Method of Solving the Problem {#4.0-proposed-method-of-solving-the-problem}

The proposed method of solving the event planning fragmentation problem is the development of Party-Time, a comprehensive cloud-native web application that consolidates all essential event planning functions into a unified platform. The solution employs a modern full-stack architecture with a React-based frontend for responsive user interfaces, a Python FastAPI backend for robust API services, PostgreSQL for relational data persistence, and AWS cloud infrastructure for scalability and reliability. The project follows a phased development approach spanning 13 weeks, with each phase building upon the previous to deliver incremental functionality while maintaining production-quality code standards.

## 4.1 Project Overview {#4.1-project-overview}

Party-Time is designed as a multi-tenant web application that serves three primary user roles: event planners who create and manage events, guests who receive invitations and submit RSVPs, and administrators who oversee platform operations. The application provides a centralized dashboard where planners can manage every aspect of their event lifecycle, from initial creation through post-event follow-up.

The core functionality includes event lifecycle management supporting various event types such as weddings, birthdays, corporate events, and graduations. Planners can create events with customizable details, set dates and locations, configure RSVP deadlines, and track event status through defined states including draft, active, and completed. The system automatically manages state transitions based on event dates and planner actions.

## 4.2 Guest Management System {#4.2-guest-management}

The guest management system addresses one of the most time-consuming aspects of event planning. Planners can add guests individually through a web form or import entire guest lists via CSV file upload, supporting bulk operations for events with hundreds of attendees. Each guest record stores contact information, dietary restrictions, accessibility requirements, and plus-one allowances.

The system generates unique, cryptographically secure RSVP tokens for each guest, enabling personalized invitation links that do not require guests to create accounts. This frictionless approach improves RSVP response rates by reducing barriers to participation. Guests can view event details, submit their attendance response, specify meal preferences, and indicate any special requirements through a streamlined interface optimized for both desktop and mobile devices.

## 4.3 Email Communication Infrastructure {#4.3-email-infrastructure}

Reliable communication is essential for successful event coordination. Party-Time integrates with AWS Simple Email Service (SES) for transactional email delivery, supporting invitation distribution, RSVP confirmations, event reminders, and update notifications. The email system operates asynchronously using Celery task queues with Redis as the message broker, ensuring that email operations do not block user interactions or degrade application performance.

Email templates are customizable and support dynamic content injection, allowing planners to personalize messages with event-specific details and guest names. The system tracks email delivery status, handles bounces gracefully, and provides delivery analytics through the planner dashboard. Batch sending capabilities enable efficient distribution to large guest lists while respecting rate limits and maintaining sender reputation.

## 4.4 Venue Discovery Integration {#4.4-venue-discovery}

Finding the right venue is often the first major decision in event planning. Party-Time integrates with the Google Places API to provide comprehensive venue search and discovery capabilities. Planners can search for venues by location, filter by capacity and amenities, view photos and reviews, and save potential venues to their event for comparison.

The integration retrieves detailed venue information including address, contact details, operating hours, and user ratings. Search results can be filtered by venue type (restaurants, hotels, event spaces, outdoor venues) and sorted by relevance, distance, or rating. This integration eliminates the need for planners to use separate venue booking platforms, keeping all event-related information within the Party-Time ecosystem.

## 4.5 Budget Tracking and Analytics {#4.5-budget-tracking}

Financial management is critical for events of all sizes. The budget tracking module enables planners to set overall budget limits and allocate funds across customizable expense categories such as venue, catering, decorations, entertainment, and photography. As expenses are recorded, the system calculates remaining budget, tracks spending against allocations, and visualizes financial data through interactive charts and graphs.

The budget interface provides real-time updates as expenses are added or modified, with visual indicators highlighting categories approaching or exceeding their allocated amounts. Planners can export budget reports for record-keeping or sharing with co-planners and stakeholders. The system supports multiple currencies and handles currency conversion for international events.

## 4.6 Interactive Seating Chart Editor {#4.6-seating-charts}

For events requiring assigned seating, Party-Time provides an interactive drag-and-drop seating chart editor. Planners can create custom venue layouts by placing tables of various shapes (round, rectangular, square) and sizes on a visual canvas. Guests are assigned to seats by dragging their names from the guest list onto specific positions at tables.

The seating chart system enforces capacity constraints, preventing over-assignment of tables, and provides visual feedback showing table utilization. Planners can create multiple seating arrangements for events with different configurations (ceremony versus reception) and print or export seating charts for venue staff. The interface is optimized for both mouse and touch interactions, supporting use on tablets during venue visits.

## 4.7 Technical Architecture Approach {#4.7-technical-architecture}

The technical architecture follows modern best practices for cloud-native application development. The frontend is built with Next.js 15 and React 19, leveraging server-side rendering for improved performance and SEO, and TypeScript for type safety. Tailwind CSS v4 provides utility-first styling with support for light and dark themes. State management uses React Query for server state synchronization and React Context for application state.

The backend API is developed with Python 3.13 and FastAPI, chosen for its high performance, automatic OpenAPI documentation generation, and native support for asynchronous operations. SQLAlchemy serves as the ORM layer with Alembic managing database migrations. The API follows RESTful conventions with consistent response formats, comprehensive input validation using Pydantic schemas, and structured error handling.

Infrastructure is deployed on AWS using Terraform for Infrastructure as Code, ensuring reproducible and version-controlled deployments. The application runs on ECS Fargate for serverless container orchestration, with RDS PostgreSQL for the database, ElastiCache Redis for caching and session storage, and S3 with CloudFront for static asset delivery. This architecture provides automatic scaling, high availability, and operational simplicity.

## 4.8 Development Methodology {#4.8-development-methodology}

The project follows an iterative development approach with clearly defined phases. Phase 1 establishes core infrastructure and fundamental features including authentication, event CRUD operations, and basic guest management. Phase 2 builds upon this foundation to add RSVP functionality, email communications, and venue integration. Phase 3 introduces advanced features including budget tracking, seating charts, and comprehensive testing.

Each phase concludes with integration testing and deployment to a staging environment, ensuring continuous validation of functionality. The development process emphasizes test-driven development with comprehensive unit tests, integration tests, and end-to-end tests. Code quality is maintained through automated linting, formatting with Black and Prettier, and continuous integration pipelines that run tests on every commit.

## 4.9 Benefits and Significance {#4.9-benefits-significance}

Party-Time delivers significant benefits to event planners by consolidating fragmented workflows into a unified platform. Planners save time by eliminating manual data transfer between systems, reduce errors through centralized information management, and improve guest communication through automated notifications. The platform's responsive design ensures access from any device, enabling planners to manage events on-the-go.

For guests, Party-Time provides a frictionless RSVP experience that respects their time and technical comfort level. The tokenized access system eliminates account creation barriers while maintaining security. Clear, mobile-optimized interfaces ensure guests can easily view event details and submit responses regardless of their device or technical proficiency.

From a technical perspective, the project demonstrates mastery of modern full-stack development practices, cloud-native architecture patterns, and DevOps methodologies. The comprehensive test suite, automated CI/CD pipelines, and production-grade monitoring infrastructure showcase professional software engineering standards applicable to enterprise environments.

## 4.10 Future Enhancements {#4.10-future-enhancements}

While the current implementation delivers a comprehensive event planning platform, several enhancements are planned for future development. These include AI-powered planning assistance using Claude for generating timelines, suggesting vendors, and answering planning questions. Real-time chat functionality would enable direct communication between planners, vendors, and guests within the platform.

Additional planned features include vendor marketplace integration for discovering and booking service providers, photo and video gallery sharing for guest contributions, calendar synchronization with Google Calendar and other providers, and native mobile applications for iOS and Android. Payment processing integration would enable direct transaction handling for vendor deposits and guest contributions. These enhancements would further differentiate Party-Time as a comprehensive event planning solution.

# 5.0 Objectives {#5.0-objectives}

The primary objective of Party-Time is to create a comprehensive, user-friendly event planning platform that consolidates fragmented workflows into a unified application. The project aims to demonstrate mastery of modern full-stack development practices while delivering practical value to event planners and their guests. Specific objectives are organized into functional, user experience, and technical categories.

## 5.1 Functional Objectives {#5.1-functional-objectives}

The functional objectives define the core capabilities Party-Time must provide to address event planning needs:

1. **Event Lifecycle Management**: Develop a complete system for creating, configuring, and managing events through defined states (draft, active, completed) with support for various event types including weddings, birthdays, corporate events, and celebrations.

2. **Guest Management**: Create an intelligent guest management system with CSV bulk import capabilities, individual guest entry, RSVP tracking, dietary restriction recording, accessibility requirement notation, and plus-one allowances.

3. **RSVP System**: Implement a frictionless RSVP submission process using unique, cryptographically secure tokens that allow guests to respond without creating accounts, while capturing attendance status, meal preferences, and special requirements.

4. **Email Communications**: Build a reliable email infrastructure for invitation distribution, RSVP confirmations, event reminders, and update notifications with delivery tracking and batch sending capabilities.

5. **Venue Discovery**: Integrate Google Places API for comprehensive venue search with filtering by location, capacity, amenities, and venue type, enabling planners to discover and compare potential venues within the platform.

6. **Budget Tracking**: Implement comprehensive budget management with overall limits, customizable expense categories, real-time spending calculations, visual analytics, and export capabilities for financial reporting.

7. **Seating Charts**: Develop an interactive drag-and-drop seating chart editor supporting multiple table configurations, capacity enforcement, and export functionality for venue staff.

## 5.2 User Experience Objectives {#5.2-ux-objectives}

The user experience objectives ensure the application is accessible and enjoyable for users of all technical abilities:

1. **Responsive Design**: Create a mobile-responsive interface that works seamlessly across desktop computers, tablets, and smartphones, enabling event management from any device.

2. **Intuitive Navigation**: Design clear information architecture with logical navigation hierarchies, contextual actions, and progressive disclosure of advanced features to prevent overwhelming new users.

3. **Real-Time Feedback**: Implement immediate visual feedback for user actions, real-time data updates, and clear status indicators throughout the application.

4. **Accessibility Compliance**: Ensure the application meets WCAG accessibility guidelines with proper contrast ratios, keyboard navigation support, screen reader compatibility, and scalable text.

5. **Guest-Friendly Interfaces**: Develop streamlined guest-facing pages with minimal required information, large touch targets, and clear calls-to-action optimized for users with varying technical proficiency.

## 5.3 Technical Objectives {#5.3-technical-objectives}

The technical objectives establish the engineering standards and infrastructure requirements:

1. **RESTful API Design**: Implement a well-documented API following REST conventions with consistent response formats, comprehensive input validation, structured error handling, and automatic OpenAPI documentation generation.

2. **Secure Authentication**: Integrate AWS Cognito for enterprise-grade authentication with secure password storage, JWT token management, password reset flows, and protection against common security attacks.

3. **Scalable Infrastructure**: Deploy on AWS using containerized architecture with ECS Fargate for automatic scaling, RDS PostgreSQL for reliable data persistence, and ElastiCache Redis for session management and caching.

4. **Infrastructure as Code**: Implement all infrastructure using Terraform for reproducible, version-controlled deployments with environment parity between staging and production.

5. **Automated Testing**: Establish comprehensive test coverage including unit tests, integration tests, and end-to-end tests with automated execution through CI/CD pipelines.

6. **Continuous Deployment**: Configure GitHub Actions workflows for automated testing, building, and deployment to staging and production environments with appropriate approval gates.

7. **Production Monitoring**: Implement comprehensive observability using CloudWatch dashboards, alarms, X-Ray distributed tracing, and Synthetics canaries for proactive issue detection and resolution.

# 6.0 Activities {#6.0-activities}

The Party-Time capstone project was developed over a 13-week period from September 2025 through December 2025, following a phased development approach. Each phase focused on specific functionality areas, with activities organized to build incrementally upon previous work while maintaining production-quality code standards throughout the development lifecycle.

## 6.1 Phase 1: Infrastructure Setup (September 2025) {#6.1-infrastructure-setup}

The initial phase established the foundational infrastructure and core authentication systems required for all subsequent development:

1. **Development Environment Configuration**: Docker environment setup with PostgreSQL database containerization, enabling consistent local development across team environments.

2. **Authentication System Implementation**: AWS Cognito integration with NextAuth.js for secure user authentication, including JWT token management, protected routes, and session handling.

3. **Core API Foundation**: Event backend API development with complete CRUD operations, establishing RESTful conventions and response patterns used throughout the project.

4. **Frontend Architecture**: Event dashboard components and initial React component library, setting patterns for state management with React Query.

**Deliverables**: 340+ tests passing, functional authentication flow, event management foundation.

## 6.2 Phase 3: Event Forms and Detail Pages (September-October 2025) {#6.2-event-forms}

Phase 3 expanded the event management system with comprehensive form handling and detail views across 11 sub-activities:

1. **Event Data Models**: Form infrastructure with Zod validation schemas supporting 13 distinct event types (weddings, birthdays, corporate events, graduations, and more).

2. **Multi-Step Event Creation**: Four-step wizard including basic information, date/time selection with timezone support, location input, and settings configuration.

3. **Event Detail Interface**: Five-tab layout (Overview, Guests, Budget, Timeline, Settings) with real-time data synchronization.

4. **Event Actions System**: Delete, duplicate, share, and status management dialogs with optimistic UI updates.

5. **Events List Management**: Advanced filtering, search functionality, grid/list view toggle, and pagination for efficient event browsing.

**Deliverables**: 15 smoke tests passing, complete event CRUD workflow, responsive multi-step forms.

## 6.3 Phase 4: Guest Management (October 2025) {#6.3-guest-management}

Phase 4 implemented the comprehensive guest management system across 7 sub-activities:

1. **Guest API Development**: CRUD endpoints with search, filtering, and bulk operations supporting large guest lists.

2. **RSVP Token System**: Cryptographically secure 8-character alphanumeric token generation with QR code support for guest identification.

3. **CSV Import Backend**: Smart parsing engine supporting 7+ column naming conventions with capacity for 1,000+ guests per import.

4. **Guest List Interface**: Data table with sorting, inline editing, real-time search, and advanced filtering capabilities.

5. **Guest Forms and Modals**: Add, edit, details, and quick-add interfaces for efficient guest data entry.

6. **CSV Import Wizard**: Four-step workflow (upload, column mapping, preview validation, import execution) with error handling.

7. **Guest Analytics Dashboard**: Seven statistics cards, RSVP distribution donut chart, and CSV export functionality.

**Deliverables**: 25 smoke tests passing, bulk import capability, comprehensive guest analytics.

## 6.4 Phase 5: RSVP and Email Systems (October 2025) {#6.4-rsvp-email}

Phase 5 delivered the guest-facing RSVP experience and email communication infrastructure across 8 sub-activities:

**RSVP System (5.1):**

1. **Public RSVP Backend**: Five API endpoints with rate limiting, token validation, and response recording.

2. **Public RSVP Frontend**: Multi-step submission form with animated interactions and confetti celebration on completion.

3. **RSVP Management Dashboard**: Four statistics cards, response timeline visualization, and deadline countdown.

4. **RSVP Customization**: Custom questions builder, meal option configuration, and deadline validation logic.

**Email System (5.2):**

1. **Email Service Infrastructure**: AWS SES integration with Celery task queue and Redis message broker, EmailLog model for tracking.

2. **Email Templates**: Four production-ready HTML templates (invitation, confirmation, reminder, thank you) with plain text fallbacks.

3. **Email Campaign Interface**: Bulk invitation sending with recipient selection and delivery tracking.

4. **Automated Email Flows**: Instant confirmations, scheduled reminders via Celery Beat, and post-event thank you messages.

**Deliverables**: 47 smoke tests passing, asynchronous email processing, guest-friendly RSVP experience.

## 6.5 Phase 6: Seating Charts (November 2025) {#6.5-seating-charts}

Phase 6 was the most complex feature implementation, spanning 23 sub-activities across three sub-phases:

**Core Infrastructure (6.1):**

- Seating chart data models (SeatingChart, TableLayout, SeatAssignment)
- 14 API endpoints for seating management
- Fabric.js canvas integration with zoom, pan, and grid snapping
- Table management toolbar supporting 4 table shapes and 5 template presets

**Advanced Features (6.2):**

- Smart seating suggestions with weighted guest compatibility scoring
- Venue layout integration with floor plan upload and 10 special area types
- Export functionality (PDF, PNG, JPEG, SVG, CSV formats)
- Mobile and tablet views with FindMySeat feature and pinch-to-zoom

**Integration and Polish (6.3):**

- Full seating editor page with database persistence and debounce optimization
- Drag-and-drop guest assignment with dietary restriction display
- Undo/redo history with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Three auto-assignment strategies for smart seating suggestions

**Deliverables**: 2,500+ lines of code, 36 unit tests, interactive canvas editor, mobile-responsive design.

## 6.6 Phase 7: Venue and Budget Systems (November-December 2025) {#6.6-venue-budget}

Phase 7 completed the core feature set with venue discovery and budget management:

**Venue System (7.1):**

1. **Google Places API Integration**: Search, details, and photo retrieval with Redis caching for performance.

2. **Venue Search Interface**: Location-based search, filtering by capacity and amenities, venue comparison tools.

3. **Venue Management**: Save venues to events, venue notes, and contact information storage.

**Budget System (7.2):**

1. **Budget Management UI**: Four statistics cards showing total budget, spent amount, remaining funds, and category breakdown.

2. **Expense Tracking**: Category-based expense entry with progress visualization and overspend warnings.

3. **Budget Analytics**: Interactive charts displaying spending distribution and category comparisons.

**Deliverables**: 2,500+ lines of code, 24 Postman test assertions, Google Places integration, visual budget analytics.

## 6.7 Phase 8: Testing and UI Polish (December 4-5, 2025) {#6.7-testing-polish}

Phase 8 focused on comprehensive test coverage and user experience refinements over two intensive days:

**Testing (8.1) - December 4:**

- Integration tests for critical workflows including authentication, event management, and guest operations
- Mock data factories for budget, venue, and seating test scenarios
- Backend complete flow tests across 7 test classes
- Error handling and edge case coverage

**UI Polish (8.2) - December 5:**

- Loading skeleton components (6 implementations) for perceived performance
- Tooltip system with portal rendering for proper z-index handling
- Global keyboard shortcuts (⌘/, ⌘N, G D, G E) for power users
- Success animations including confetti and checkmark confirmations
- Mobile bottom navigation for improved touch accessibility

**Deliverables**: 1,182 tests passing (85.6% pass rate), enhanced loading states, keyboard accessibility.

## 6.8 Phase 9: Performance and Final Polish (December 5, 2025) {#6.8-performance}

Phase 9 optimized application performance and completed final refinements:

**Performance Optimization (9.1):**

- Code splitting with React lazy loading for reduced initial bundle size
- Image optimization using next/image with WebP and AVIF format support
- Bundle optimization with tree shaking to eliminate unused code
- Redis API response caching for frequently accessed data
- Web Vitals monitoring (LCP, INP, CLS, FCP, TTFB) for performance tracking

**Final Polish (9.2):**

- Dark mode color corrections and theme consistency
- Custom error pages (error.tsx, not-found.tsx, global-error.tsx)
- Analytics system with event batching, page views, and session tracking
- Six-step onboarding wizard with localStorage persistence
- Mobile responsiveness verification across device sizes

**Deliverables**: 800+ lines of optimization code, Web Vitals integration, complete error handling, onboarding flow.

## 6.9 Phase 10: AWS Infrastructure Deployment (December 8-15, 2025) {#6.9-infrastructure}

Phase 10 deployed the complete AWS cloud infrastructure across 8 sub-phases:

**10.0 Planning (December 8):** Infrastructure implementation plan documentation (~2,500 lines) defining the 8-phase deployment strategy.

**10.1 Foundation (December 8):** 45 resources including VPC (10.0.0.0/16), 6 subnets across 2 availability zones, NAT Gateway, 5 VPC Endpoints, 3 ECR repositories, IAM roles, and security groups.

**10.2 Data Layer (December 9):** 15 resources including RDS PostgreSQL 16, ElastiCache Redis 7, S3 buckets for assets, Secrets Manager for credentials, and KMS for encryption.

**10.3 Application Layer (December 12):** 25 resources including Application Load Balancer, ECS cluster with 4 services (frontend, backend, celery-worker, celery-beat), and auto-scaling policies using ARM64 Graviton2 processors.

**10.4 DNS and CDN (December 12):** 19 resources including ACM SSL certificate, CloudFront distribution, Route 53 DNS records, and security headers. Staging environment deployed live at https://staging.celebration-time.com.

**10.5 Security (December 12):** 19 resources including WAF v2 web application firewall, GuardDuty threat detection, Security Hub compliance monitoring, VPC Flow Logs, and CloudTrail audit logging.

**10.6 CI/CD Pipeline (December 12):** 5 GitHub Actions workflows (ci.yml, staging-deploy.yml, production-deploy.yml, infrastructure.yml, rollback.yml) with GitHub OIDC passwordless authentication and automated database migrations.

**10.7 Monitoring (December 15):** 43 resources including 3 SNS notification topics, 22 CloudWatch alarms, 3 monitoring dashboards, X-Ray distributed tracing, and 2 Synthetics canaries for uptime monitoring.

**Deliverables**: 210+ AWS resources deployed, staging environment live, comprehensive monitoring and alerting.

## 6.10 Project Timeline Summary {#6.10-timeline}

| Phase | Timeframe              | Duration | Key Deliverables                          |
| ----- | ---------------------- | -------- | ----------------------------------------- |
| 1     | September 2025         | 1 week   | Authentication, Event API, 340+ tests     |
| 3     | September-October 2025 | 3 weeks  | Event forms, detail pages, 15 smoke tests |
| 4     | October 2025           | 2 weeks  | Guest management, CSV import, 25 tests    |
| 5     | October 2025           | 2 weeks  | RSVP system, email campaigns, 47 tests    |
| 6     | November 2025          | 4 weeks  | Seating charts, 2,500+ lines, 36 tests    |
| 7     | November-December 2025 | 2 weeks  | Venues, budget tracking, Google Places    |
| 8     | December 4-5, 2025     | 2 days   | 1,182 tests, UI polish, skeletons         |
| 9     | December 5, 2025       | 1 day    | Performance, analytics, onboarding        |
| 10    | December 8-15, 2025    | 1 week   | 210+ AWS resources, staging live          |

**Total Development Metrics:**

- 1,182 tests passing (85.6% pass rate)
- 50+ API endpoints implemented
- 28 Next.js routes configured
- 210+ AWS resources deployed
- Staging environment: https://staging.celebration-time.com

# 7.0 Development Environment {#7.0-development-environment}

The Party-Time development environment is configured to support modern full-stack web development with containerized services, automated testing, and consistent tooling across development and production environments. The environment leverages Docker for service isolation, ensuring that all developers work with identical configurations regardless of their host operating system.

## 7.1 Technology Stack Versions {#7.1-technology-versions}

The application uses the following core technology versions:

**Frontend Runtime:**

- Node.js: 20 (Alpine-based container)
- Next.js: 15.5.7
- React: 19.1.2
- TypeScript: 5.x
- Tailwind CSS: 4.x

**Backend Runtime:**

- Python: 3.13 (slim-bookworm container)
- FastAPI: 0.116.1
- SQLAlchemy: 2.0.43
- Alembic: 1.16.5
- Uvicorn: 0.35.0
- Pydantic: 2.11.7

**Data Services:**

- PostgreSQL: 16 (Alpine container)
- Redis: 7 (Alpine container)

## 7.2 Docker Configuration {#7.2-docker-configuration}

Local development uses Docker Compose to orchestrate the following services:

| Service    | Image              | Port | Container Name      | Purpose                  |
| ---------- | ------------------ | ---- | ------------------- | ------------------------ |
| PostgreSQL | postgres:16-alpine | 5432 | party-time-db       | Primary database         |
| Redis      | redis:7-alpine     | 6379 | party-time-redis    | Cache and message broker |
| Backend    | python:3.13-slim   | 8000 | party-time-backend  | API server               |
| Frontend   | node:20-alpine     | 3000 | party-time-frontend | Web application          |

All containers communicate via a bridge network (party-time-network) using DNS names. Persistent volumes store database and cache data across container restarts:

- party_time_db_data: PostgreSQL data persistence
- party_time_redis_data: Redis data persistence

## 7.3 Frontend Development Environment {#7.3-frontend-environment}

**Key Dependencies:**

- @tanstack/react-query 5.87.1: Server state management with caching and synchronization
- react-hook-form 7.62.0: Performant form handling with validation
- zod 4.1.5: TypeScript-first schema validation
- axios 1.11.0: HTTP client for API communication
- next-auth 4.24.11: Authentication integration with AWS Cognito
- fabric 6.7.1: Canvas library for interactive seating chart editor
- @react-google-maps/api 2.20.7: Google Maps integration for venue discovery
- lucide-react 0.544.0: Icon library
- date-fns 4.1.0: Date manipulation utilities
- jspdf 3.0.3: PDF generation for exports
- html2canvas 1.4.1: Canvas rendering for screenshot exports

**Development Commands:**

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Production build
- `npm run lint`: ESLint code quality check
- `npm run test`: Run Jest unit tests
- `npm run test:e2e`: Run Playwright end-to-end tests

**Testing Frameworks:**

- Jest 30.1.3: Unit and integration testing with jsdom environment
- Playwright 1.55.0: End-to-end testing with browser automation
- React Testing Library 16.3.0: Component testing utilities

## 7.4 Backend Development Environment {#7.4-backend-environment}

**Key Dependencies:**

- FastAPI 0.116.1: High-performance async web framework
- SQLAlchemy 2.0.43: Object-relational mapping with async support
- Alembic 1.16.5: Database migration management
- asyncpg 0.30.0: Async PostgreSQL driver
- Celery 5.4.0: Distributed task queue for background jobs
- boto3 1.40.25: AWS SDK for Python
- aws-xray-sdk 2.14.0: Distributed tracing integration
- pandas 2.2.3: Data analysis for CSV import processing
- python-jose 3.5.0: JWT token handling
- qrcode 8.2: QR code generation for RSVP tokens

**Development Commands:**

- `source .venv/bin/activate`: Activate virtual environment
- `python -m uvicorn app.main:app --reload`: Start development server
- `pytest`: Run test suite
- `pytest --cov=app`: Run tests with coverage
- `black .`: Format Python code
- `alembic revision --autogenerate -m "message"`: Create database migration
- `alembic upgrade head`: Apply migrations

**Testing Frameworks:**

- pytest 8.4.2: Test framework with async support
- pytest-asyncio 1.1.0: Async test execution
- pytest-cov 6.3.0: Coverage reporting
- pytest-mock 3.15.0: Mocking utilities

## 7.5 Code Quality Tools {#7.5-code-quality}

**Frontend:**

- ESLint 9.x: JavaScript/TypeScript linting with Next.js rules
- TypeScript: Static type checking with strict mode
- Prettier: Code formatting (integrated with ESLint)

**Backend:**

- Black: Python code formatting with consistent style
- Pydantic: Runtime type validation for API schemas
- pytest-cov: Test coverage reporting

## 7.6 Local Development Setup {#7.6-local-setup}

**Initial Setup Steps:**

1. **Start Docker Desktop**: Ensure Docker daemon is running

2. **Start Database Services**: `docker-compose up -d postgres redis`

3. **Configure Backend**:

   - Navigate to backend directory: `cd backend`
   - Create virtual environment: `python -m venv .venv`
   - Activate environment: `source .venv/bin/activate`
   - Install dependencies: `pip install -r requirements.txt`
   - Apply migrations: `alembic upgrade head`

4. **Configure Frontend**:

   - Navigate to frontend directory: `cd frontend`
   - Install dependencies: `npm install`

5. **Start Development Servers**:
   - Backend: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
   - Frontend: `npm run dev`

**Development URLs:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 7.7 Environment Variables {#7.7-environment-variables}

**Frontend (.env.local):**

- NEXTAUTH_URL: Application URL for authentication callbacks
- NEXTAUTH_SECRET: Secret key for session encryption
- COGNITO_CLIENT_ID: AWS Cognito application client ID
- COGNITO_CLIENT_SECRET: AWS Cognito client secret
- COGNITO_ISSUER: AWS Cognito user pool issuer URL
- NEXT_PUBLIC_API_URL: Backend API base URL
- NEXT_PUBLIC_APP_NAME: Application display name

**Backend (.env):**

- DATABASE_URL: PostgreSQL connection string
- REDIS_URL: Redis connection string
- JWT_SECRET_KEY: Secret for JWT token signing
- AWS_REGION: AWS region for services
- COGNITO_USER_POOL_ID: AWS Cognito user pool identifier
- COGNITO_CLIENT_ID: AWS Cognito client identifier
- CELERY_BROKER_URL: Redis URL for Celery task broker
- SES_FROM_EMAIL: Verified sender email for AWS SES

## 7.8 Database Configuration {#7.8-database-config}

**Local Development:**

- Host: localhost (via Docker)
- Port: 5432
- Database: party_time
- User: party_admin

**Connection Testing:**

```
psql -h localhost -U party_admin -d party_time
```

## 7.9 IDE Recommendations {#7.9-ide-recommendations}

**Visual Studio Code** with extensions:

- ESLint: JavaScript/TypeScript linting
- Python: Python language support
- Prettier: Code formatting
- Docker: Container management
- PostgreSQL: Database client
- Thunder Client: API testing

**Alternative IDEs:**

- PyCharm Professional: Full-stack Python development
- WebStorm: JavaScript/TypeScript development

## 7.10 Development Environment Summary {#7.10-dev-summary}

| Category           | Technology      | Version       |
| ------------------ | --------------- | ------------- |
| Frontend Runtime   | Node.js         | 20            |
| Frontend Framework | Next.js         | 15.5.7        |
| UI Library         | React           | 19.1.2        |
| Type System        | TypeScript      | 5.x           |
| CSS Framework      | Tailwind CSS    | 4.x           |
| Backend Runtime    | Python          | 3.13          |
| Backend Framework  | FastAPI         | 0.116.1       |
| ORM                | SQLAlchemy      | 2.0.43        |
| Database           | PostgreSQL      | 16            |
| Cache              | Redis           | 7             |
| Frontend Tests     | Jest/Playwright | 30.1.3/1.55.0 |
| Backend Tests      | pytest          | 8.4.2         |
| Containerization   | Docker          | Latest        |

# 8.0 Operational Environment {#8.0-operational-environment}

The Party-Time production environment is deployed on Amazon Web Services (AWS) using a cloud-native architecture designed for high availability, security, and scalability. The infrastructure is defined entirely as code using Terraform, enabling reproducible deployments and version-controlled infrastructure changes. The staging environment is currently live at https://staging.celebration-time.com, with production deployment pending completion of Phase 10.8.

## 8.1 AWS Infrastructure Overview {#8.1-aws-overview}

**Deployment Configuration:**

- Primary Region: US-East-1 (N. Virginia)
- Availability Zones: 2 (us-east-1a, us-east-1b)
- Infrastructure as Code: Terraform 1.6.0+
- Container Orchestration: AWS ECS Fargate (serverless)
- Total Resources Deployed: 210+

**Environment URLs:**

- Staging: https://staging.celebration-time.com
- Production: https://celebration-time.com (Phase 10.8 pending)
- API Documentation: https://staging.celebration-time.com/docs

## 8.2 Compute and Container Services {#8.2-compute}

The application runs on AWS ECS Fargate, providing serverless container orchestration without the need to manage underlying EC2 instances.

**ECS Services (4 total):**

| Service       | CPU             | Memory | Min/Max Tasks | Purpose                    |
| ------------- | --------------- | ------ | ------------- | -------------------------- |
| Frontend      | 256 (0.25 vCPU) | 512 MB | 1/4           | Next.js web application    |
| Backend       | 512 (0.5 vCPU)  | 1 GB   | 1/4           | FastAPI API server         |
| Celery Worker | 256 (0.25 vCPU) | 512 MB | 1/3           | Background task processing |
| Celery Beat   | 256 (0.25 vCPU) | 512 MB | 1             | Scheduled task scheduler   |

**Auto-Scaling Configuration:**

- Scale out: CPU utilization > 70% for 3 minutes
- Scale in: CPU utilization < 30% for 10 minutes
- Celery Worker: Additional scaling based on ALB request count > 1000/min

**Container Registry:**

- 3 ECR repositories (frontend, backend, celery)
- ARM64 architecture for AWS Graviton2 processors (20% cost savings)
- Images tagged with git SHA and "latest"

## 8.3 Networking and Load Balancing {#8.3-networking}

**VPC Configuration:**

- CIDR Block: 10.0.0.0/16
- Public Subnets: 2 (10.0.1.0/24, 10.0.2.0/24) - ALB and NAT Gateway
- Private Subnets: 2 (10.0.10.0/24, 10.0.11.0/24) - ECS containers
- Database Subnets: 2 (10.0.20.0/24, 10.0.21.0/24) - RDS and ElastiCache
- NAT Gateway: 1 (staging), 2 (production for high availability)
- VPC Endpoints: 5 (S3, ECR API, ECR DKR, Secrets Manager, CloudWatch Logs)

**Application Load Balancer:**

- HTTPS termination on port 443
- HTTP to HTTPS redirect on port 80
- Path-based routing: /_ → Frontend, /api/_ → Backend
- Health checks every 30 seconds to /health endpoint
- Target groups with unhealthy host detection

## 8.4 Database Layer {#8.4-database}

**RDS PostgreSQL 16:**

- Instance: db.t3.micro (staging), db.t3.small (production)
- Storage: 20 GB with auto-scaling to 100 GB
- Multi-AZ: Disabled (staging), Enabled (production)
- Backup Retention: 7 days (staging), 30 days (production)
- Encryption: KMS customer-managed key (at-rest)
- SSL: Required for all connections (in-transit)
- Point-in-Time Recovery: Enabled

**ElastiCache Redis 7.1:**

- Instance: cache.t3.micro (staging), cache.t3.small (production)
- Nodes: 1 (staging), 2-node cluster (production)
- Encryption: TLS in-transit, AUTH token required
- Snapshot Retention: 7 days
- Uses: API response caching, session storage, Celery task broker and result backend

## 8.5 Storage and Content Delivery {#8.5-storage}

**S3 Buckets:**

- Assets Bucket: Frontend builds, static images
- Uploads Bucket: User-uploaded files (seating charts, documents)
- Terraform State: Infrastructure state with DynamoDB locking
- CloudTrail Logs: API audit logs
- Synthetics Results: Canary screenshots and HAR files

**S3 Configuration:**

- Encryption: SSE-S3 with KMS
- Versioning: Enabled on uploads bucket
- Lifecycle: Move to Glacier after 90 days
- CORS: Configured for application domains

**CloudFront CDN:**

- Global edge network distribution
- HTTP/2 and HTTP/3 support
- TLS 1.3+ enforcement
- Cache behaviors: Optimized for static assets, no-cache for /api/\*
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options

**Route 53 DNS:**

- Domain: celebration-time.com
- Hosted zone with A records pointing to CloudFront
- Health checks for failover routing (production)

## 8.6 Security Infrastructure {#8.6-security}

**Web Application Firewall (WAF v2):**

- AWS Managed Rules: OWASP Top 10, Common Rule Set
- SQL Injection Protection: Enabled
- Cross-Site Scripting Protection: Enabled
- Rate Limiting: 2000 requests per 5 minutes per IP
- WAF Logging: CloudWatch Logs with 30-day retention

**Network Security:**

- Security Groups: Least-privilege ingress rules per tier
- ALB accepts HTTPS from internet only
- ECS containers accessible only from ALB
- RDS and Redis accessible only from ECS
- VPC Flow Logs: Enabled for network traffic analysis

**Threat Detection:**

- GuardDuty: Threat detection with S3 protection enabled
- Security Hub: CIS AWS Foundations Benchmark, AWS Best Practices
- CloudTrail: All API calls logged and encrypted

**Encryption and Secrets:**

- KMS: Customer-managed encryption key for all services
- Secrets Manager: Database credentials, Redis URL, API keys, Cognito credentials
- Automatic Rotation: 90-day default rotation policy

## 8.7 Monitoring and Observability {#8.7-monitoring}

**CloudWatch Alarms (22 total):**

| Category    | Alarms | Thresholds                                         |
| ----------- | ------ | -------------------------------------------------- |
| ECS         | 6      | CPU > 80%, Memory > 85%                            |
| ALB         | 5      | 5xx errors > 10, Latency p95 > 1s, Unhealthy hosts |
| RDS         | 5      | CPU > 80%, Connections > 70, Storage < 2 GB        |
| ElastiCache | 4      | CPU > 75%, Memory > 85%, Evictions > 0             |
| Synthetics  | 2      | Canary failures                                    |

**CloudWatch Dashboards (3):**

1. Application Overview: ECS metrics, ALB requests, error rates, latency
2. Database Health: RDS and ElastiCache performance metrics
3. Email Delivery: SES send, bounce, and complaint metrics

**X-Ray Distributed Tracing:**

- Sampling: 100% (staging), 5% (production)
- Trace groups: Errors (status >= 400), Slow requests (duration >= 1000ms)
- Full request path: CloudFront → ALB → FastAPI → PostgreSQL/Redis

**Synthetics Canaries (4):**

- Homepage Monitor: Every 5 minutes
- API Health: Every 1 minute
- Login Flow: Every 15 minutes
- Create Event: Every 30 minutes (staging only)

**SNS Alert Topics (3):**

- Critical: P1 incidents (service down, high error rate)
- Warning: P2 issues (high CPU, high latency)
- Info: Informational notifications

**Log Groups (8):**

- ECS logs: Frontend, Backend, Celery Worker, Celery Beat (30-day retention)
- Infrastructure logs: RDS, ALB, WAF, VPC Flow Logs (7-30 day retention)

## 8.8 CI/CD Pipeline {#8.8-cicd}

**GitHub Actions Workflows (5):**

| Workflow              | Trigger            | Purpose                                 |
| --------------------- | ------------------ | --------------------------------------- |
| ci.yml                | Pull requests      | Lint, type-check, tests, security scan  |
| staging-deploy.yml    | Push to staging    | Build, push ECR, migrate DB, deploy ECS |
| production-deploy.yml | Push to main       | Manual approval, deploy with rollback   |
| infrastructure.yml    | Push to infra/\*\* | Terraform plan and apply                |
| rollback.yml          | Manual dispatch    | Revert to previous task definition      |

**Deployment Process:**

1. Build multi-platform Docker images (ARM64)
2. Push to ECR with git SHA tags
3. Run database migrations via ECS RunTask
4. Update ECS services with force-new-deployment
5. Wait for service stability (10-minute timeout)
6. Execute smoke tests (health check endpoints)
7. Send email notification

**Security:**

- GitHub OIDC: Passwordless AWS authentication (no stored credentials)
- Manual approval gates for production deployments
- Circuit breaker enabled for automatic rollback

## 8.9 Disaster Recovery {#8.9-disaster-recovery}

**Recovery Objectives:**

- Recovery Time Objective (RTO): < 1 hour
- Recovery Point Objective (RPO): < 5 minutes (point-in-time recovery)

**Backup Strategy:**

- RDS: Daily automated backups at 3:00 AM UTC
- S3: Versioning enabled, lifecycle to Glacier after 90 days
- Pre-deployment snapshots before major releases
- Cross-region replication: us-east-1 → us-west-2 (production)

## 8.10 Cost Optimization {#8.10-cost}

**Staging Environment: ~$80-100/month**

- Single NAT Gateway (saves ~$35/month)
- t3.micro/small instances
- Single-AZ database
- Scheduled shutdown capability (nights/weekends)

**Production Environment: ~$350-400/month**

- Dual NAT Gateways for high availability
- Multi-AZ database with standby replica
- Reserved capacity for predictable workloads
- Spot capacity for Celery workers

## 8.11 Operational Environment Summary {#8.11-summary}

| Category           | Staging  | Production |
| ------------------ | -------- | ---------- |
| Availability Zones | 2        | 2          |
| NAT Gateways       | 1        | 2          |
| RDS Multi-AZ       | No       | Yes        |
| Redis Nodes        | 1        | 2          |
| Backup Retention   | 7 days   | 30 days    |
| X-Ray Sampling     | 100%     | 5%         |
| Monthly Cost       | ~$80-100 | ~$350-400  |
| Status             | Live     | Pending    |

# 9.0 Overall Description {#9.0-overall-description}

This section provides a high-level overview of the Party-Time application, describing its context within the event planning ecosystem, the functions it provides, the characteristics of its users, and the constraints and dependencies that shape its design and operation.

## 9.1 System Perspective {#9.1-system-perspective}

Party-Time is a cloud-native, standalone web application designed to serve as a unified event planning platform. While operating independently, the system strategically integrates with external services to provide comprehensive functionality:

- **Google Places API**: Venue discovery, location search, and place details retrieval
- **AWS Cognito**: User authentication and identity management with secure credential storage
- **AWS SES**: Transactional email delivery for invitations, confirmations, and reminders
- **Google OAuth 2.0**: Social authentication for streamlined user registration

The system is designed to eliminate platform fragmentation by consolidating multiple disparate tools into one ecosystem. Rather than forcing users to juggle spreadsheets for budgets, email chains for vendor coordination, separate platforms for venue booking, and various applications for guest management, Party-Time provides a centralized hub where all event planning activities occur within a single, cohesive interface.

## 9.2 System Functions {#9.2-system-functions}

Party-Time provides comprehensive event lifecycle management through the following core functional areas:

**Event Management**: Create, configure, and manage events through defined lifecycle states (draft, active, completed, cancelled). Support for 13 event types including weddings, birthdays, corporate events, graduations, and celebrations. Event duplication enables templates for recurring planners.

**Guest Management**: Individual guest entry through web forms and bulk import via CSV file upload supporting 1,000+ guests per import. Guest records store contact information, dietary restrictions, accessibility requirements, and plus-one allowances. Unique RSVP token generation enables frictionless invitations without requiring guest account creation.

**RSVP System**: Personalized RSVP links with cryptographically secure tokens allow guests to respond without registration. Multi-step submission captures attendance status, meal preferences, and special requirements. Real-time response tracking with visual analytics and automated reminder emails to non-responsive guests.

**Venue Discovery**: Google Places API integration provides location-based venue search with filtering by capacity, amenities, and venue type. Detailed venue information includes photos, ratings, operating hours, and contact details. Planners can save and compare potential venues within events.

**Budget Tracking**: Real-time expense tracking across customizable categories (venue, catering, decorations, entertainment, photography). Visual progress indicators highlight spending against allocations with overspend warnings. Budget analytics through interactive charts and export functionality for financial reporting.

**Seating Charts**: Interactive drag-and-drop editor powered by Fabric.js for creating custom venue layouts. Support for multiple table shapes (round, rectangular, square) with capacity enforcement. Guest assignment through drag-and-drop with dietary restriction display. Export to PDF, PNG, and CSV formats for venue staff.

**Email Communications**: Automated email infrastructure via AWS SES with Celery task queue processing. Four template types (invitation, confirmation, reminder, thank you) with dynamic content injection. Batch sending capabilities with delivery tracking and analytics.

## 9.3 User Characteristics {#9.3-user-characteristics}

Party-Time serves three primary user categories with distinct needs and technical proficiency levels:

**Event Planners (Primary Users)**: Individuals organizing personal events (weddings, birthdays, graduations) or professional functions (corporate events, conferences). Technical proficiency ranges from non-technical to moderately technical. Primary needs include comprehensive tools for managing all event aspects, real-time updates, automation for time-saving, and centralized information management. Primary pain point is juggling multiple disconnected tools and platforms.

**Event Guests (Secondary Users)**: Invitees who receive invitations and submit RSVP responses. Technical proficiency is variable and includes technologically unsavvy users. Primary needs include simple, intuitive interfaces requiring minimal technical knowledge, clear event communication, and frictionless RSVP processes. Key characteristic is no mandatory account creation—guests access via personalized links with unique tokens.

**System Administrators (Tertiary Users)**: Platform maintenance and support personnel responsible for monitoring, troubleshooting, and user assistance. Technical proficiency is high. Primary needs include monitoring tools, administrative controls, system metrics, and user management capabilities. Access CloudWatch dashboards, system health endpoints, and audit logging.

## 9.4 Constraints {#9.4-constraints}

The system operates within the following constraints:

**Technical Constraints**:

- Development limited to 13-week capstone project timeline
- Solo developer resource requires careful scope prioritization
- AWS SES sandbox mode limits email sending during initial deployment
- Google Places API rate limits on free tier
- Browser requirements: Modern browsers with ES2020+ JavaScript support

**Operational Constraints**:

- Initial email delivery limited during AWS SES sandbox phase
- English-only interface in current release; internationalization deferred
- Payment processing not implemented in MVP (future enhancement)

**Security Constraints**:

- AWS Cognito integration mandatory for enterprise-grade authentication
- HTTPS required for all production traffic via CloudFront and TLS 1.3+
- JWT tokens with session timeout and automatic refresh
- Rate limiting on API endpoints for brute force and DDoS protection
- Data encryption required at rest (KMS) and in transit (TLS)

**Regulatory Constraints**:

- GDPR compliance requiring data export and deletion capabilities
- Email compliance with DMARC, SPF, and DKIM records for deliverability
- All production data stored in AWS us-east-1 region

## 9.5 Assumptions and Dependencies {#9.5-assumptions-dependencies}

**Assumptions**:

- Event planners have stable internet connectivity and modern web browser access
- Guests have valid email addresses and reasonable email accessibility
- Events are planned with sufficient lead time for timeline generation
- Venues listed in Google Places API have accurate, current information
- AWS services maintain high availability during system operation
- Network latency remains acceptable (under 500ms) for responsive UX

**External Dependencies**:

_AWS Services (Critical)_:

- Cognito: Authentication and identity management
- ECS Fargate: Container orchestration
- RDS PostgreSQL: Relational database with Multi-AZ support
- ElastiCache Redis: Caching and Celery message broker
- SES: Email delivery service
- S3/CloudFront: Static asset storage and CDN distribution
- Route 53: DNS management
- CloudWatch: Monitoring, logging, and alerting

_Third-Party APIs_:

- Google Places API: Venue discovery and location data
- Google OAuth 2.0: Social authentication option

_Framework Dependencies_:

- Frontend: Next.js 15, React 19, TypeScript 5.x, Tailwind CSS v4
- Backend: Python 3.13, FastAPI 0.116.1, SQLAlchemy 2.0.43
- Infrastructure: Docker, Terraform 1.6+, GitHub Actions

## 9.6 Overall Description Summary {#9.6-summary}

| Aspect                | Details                                                             |
| --------------------- | ------------------------------------------------------------------- |
| System Type           | Cloud-native standalone web application                             |
| Primary Users         | Event planners (personal and professional)                          |
| Secondary Users       | Event guests (via tokenized RSVP links)                             |
| Core Functions        | Event management, guest coordination, RSVP, budget, venues, seating |
| External Integrations | AWS (Cognito, SES, RDS), Google Places API                          |
| Key Constraints       | 13-week timeline, single developer, AWS service limits              |
| Security Model        | AWS Cognito, JWT tokens, HTTPS/TLS, WAF protection                  |
| Deployment Status     | Staging live at staging.celebration-time.com                        |

# 10.0 System Architecture {#10.0-system-architecture}

The Party-Time application architecture is designed as a cloud-native, distributed system leveraging AWS managed services to minimize operational overhead while ensuring scalability and reliability. The architecture follows Domain-Driven Design principles, organizing code around business domains rather than technical layers. This section details the microservices architecture pattern, frontend component architecture, data flow patterns, and supporting infrastructure that enable the Party-Time platform to deliver comprehensive event planning capabilities.

## 10.1 Microservices Architecture {#10.1-microservices}

![Figure 10.1: Microservices Architecture of Party-Time Application](Images/image9.png)

The Party-Time application employs a microservices architecture pattern that separates concerns into three distinct services, each responsible for specific domain functionality. This architectural approach ensures scalability, maintainability, and independent deployment capabilities while maintaining manageable complexity for the 13-week development timeline.

**Authentication Service (AWS Cognito)**

The Authentication Service leverages AWS Cognito to handle all authentication and authorization concerns. This separation ensures security functions remain isolated and can be independently scaled based on authentication load. Key responsibilities include:

- User registration with email verification
- Login with secure credential validation
- Password management (reset, change)
- JWT token generation and validation
- OAuth 2.0 integration with Google
- Session management with configurable timeout policies
- Multi-Factor Authentication capability (future enhancement)

**Core API Service (FastAPI)**

The Core API Service built with FastAPI manages the primary business logic including event management, guest coordination, budget tracking, and venue integration. This service implements the Repository pattern for data access, maintaining clean separation between business logic and data persistence layers. Key responsibilities include:

- Event lifecycle management (create, read, update, delete)
- Guest management with RSVP token generation
- Budget tracking and expense categorization
- Venue search and discovery via Google Places API
- Seating chart data persistence
- CSV import processing for guest lists
- RESTful API endpoints with OpenAPI documentation

**Notification Service (AWS SES + Celery)**

The Notification Service processes asynchronous communication tasks through AWS SES, handling email invitations, RSVP confirmations, and reminder notifications. The service uses message queuing to decouple time-sensitive user interactions from potentially slow external communications. Key responsibilities include:

- Email invitation distribution
- RSVP confirmation delivery
- Automated reminder scheduling via Celery Beat
- Post-event thank you messages
- Email template management
- Delivery status tracking and bounce handling
- Retry logic with exponential backoff

## 10.2 Frontend Component Architecture {#10.2-frontend-architecture}

![Figure 10.2: Frontend Component Architecture](Images/image8.png)

The frontend architecture implements a component-based design using Next.js 15 with TypeScript, leveraging the App Router for improved performance and server-side rendering capabilities. Components are organized into feature modules with shared UI components and custom hooks promoting reusability and maintaining DRY principles.

**Architecture Layers:**

```
Next.js TypeScript Application
│
├── app/ (App Router)
│   ├── layout.tsx (Root layout with providers)
│   ├── error.tsx (Error boundary)
│   ├── loading.tsx (Loading state)
│   ├── page.tsx (Home page)
│   ├── auth/ (Authentication routes)
│   ├── dashboard/ (Protected dashboard routes)
│   └── rsvp/ (Public RSVP routes)
│
├── components/
│   ├── ui/ (Reusable UI components)
│   ├── forms/ (Form components with validation)
│   ├── layout/ (Header, Sidebar, Footer)
│   └── features/ (Domain-specific components)
│
├── lib/
│   ├── api-client.ts (HTTP client)
│   ├── auth/ (Authentication context)
│   └── utils/ (Utility functions)
│
├── hooks/ (Custom React hooks)
├── types/ (TypeScript definitions)
├── schemas/ (Zod validation schemas)
└── config/ (Environment configuration)
```

**Key Frontend Technologies:**

| Technology      | Purpose                         |
| --------------- | ------------------------------- |
| Next.js 15      | React framework with App Router |
| React 19        | UI component library            |
| TypeScript 5.x  | Static type checking            |
| Tailwind CSS v4 | Utility-first styling           |
| React Query     | Server state management         |
| React Hook Form | Performant form handling        |
| Zod             | Schema validation               |
| Fabric.js       | Canvas-based seating chart      |

**Component Organization:**

- **Server-Side Rendering (SSR)** for improved SEO and initial page load performance
- **React Server Components** to reduce client-side JavaScript bundle size
- **Tailwind CSS** for utility-first styling with consistent design system
- **React Hook Form** with Zod validation for type-safe form handling
- **React Query** for server state management with automatic caching and synchronization

## 10.3 Backend Services Architecture {#10.3-backend-architecture}

**Core API Service (FastAPI)**

The FastAPI backend implements RESTful API design with comprehensive documentation and validation:

- Implements RESTful API design with automatic OpenAPI documentation generation
- Uses Pydantic for request/response validation and serialization
- Employs async/await patterns for improved concurrency
- Implements Repository pattern for database abstraction
- Utilizes dependency injection for testability
- Structured error handling with consistent response formats

**API Structure:**

```
backend/
├── app/
│   ├── main.py (FastAPI application entry)
│   ├── api/
│   │   └── v1/
│   │       ├── events.py
│   │       ├── guests.py
│   │       ├── rsvp.py
│   │       ├── budget.py
│   │       ├── venues.py
│   │       └── seating.py
│   ├── models/ (SQLAlchemy ORM models)
│   ├── schemas/ (Pydantic validation)
│   ├── services/ (Business logic)
│   ├── repositories/ (Data access layer)
│   └── core/ (Configuration, security)
├── alembic/ (Database migrations)
└── tests/
```

## 10.4 Data Architecture {#10.4-data-architecture}

The system employs a hybrid database strategy optimized for different data access patterns:

**PostgreSQL (AWS RDS)** for relational data:

- Users, Events, Guests, Venues, Vendors
- ACID compliance for transactional integrity
- Optimized indexes for query performance
- Automated backups and point-in-time recovery

**Redis (AWS ElastiCache)** for:

- API response caching
- Session storage
- Celery task broker and result backend
- Rate limiting counters

**AWS S3** for object storage:

- Guest list CSV files
- Seating chart exports (PDF, PNG)
- Event photos and documents
- Email attachments
- Static asset hosting

**Database Schema (Key Tables):**

| Table          | Purpose         | Key Fields                                         |
| -------------- | --------------- | -------------------------------------------------- |
| users          | User accounts   | id, email, name, role, password_hash               |
| events         | Event records   | id, planner_id, name, type, date, status           |
| guests         | Guest info      | id, event_id, name, email, rsvp_status, rsvp_token |
| budget_items   | Budget entries  | id, event_id, category, amount, description        |
| seating_charts | Seating layouts | id, event_id, layout_data, table_configurations    |
| email_logs     | Email tracking  | id, event_id, recipient, status, sent_at           |

## 10.5 Data Flow Architecture {#10.5-data-flow}

![Figure 10.5: Data Flow Architecture](Images/image6.png)

The data flow architecture illustrates how information moves through the system from user interactions to data persistence and external service integrations.

**Request Flow:**

1. **Client Request**: User interacts with Next.js frontend
2. **Authentication**: JWT token validated via AWS Cognito
3. **API Gateway**: Request routed to appropriate FastAPI endpoint
4. **Business Logic**: Service layer processes request
5. **Data Access**: Repository pattern interfaces with PostgreSQL/Redis
6. **External Services**: Google Places API, AWS SES as needed
7. **Response**: Data returned through layers to client

**Asynchronous Processing Flow:**

1. **Task Creation**: API endpoint creates Celery task
2. **Message Queue**: Task queued in Redis broker
3. **Worker Processing**: Celery worker executes task
4. **External Service**: AWS SES sends email
5. **Result Storage**: Task result stored in Redis
6. **Status Update**: Database updated with delivery status

## 10.6 Security Architecture {#10.6-security-architecture}

The system implements defense-in-depth security across multiple layers:

**Network Layer:**

- AWS VPC with private subnets for database isolation
- NAT Gateway for outbound internet access from private subnets
- Security groups with least-privilege ingress rules
- VPC Flow Logs for network traffic analysis

**Application Layer:**

- JWT authentication with AWS Cognito
- Role-based access control (RBAC)
- Input validation via Pydantic schemas
- CORS configuration for cross-origin requests
- Rate limiting (2000 requests per 5 minutes per IP)

**Data Layer:**

- Encryption at rest using AWS KMS
- Encryption in transit via TLS 1.3
- Secrets Manager for credential storage
- Automatic credential rotation

**API Layer:**

- WAF v2 with managed rule sets
- SQL injection prevention
- Cross-site scripting (XSS) protection
- Request body size limits

## 10.7 Deployment Architecture {#10.7-deployment-architecture}

The application deploys using containerized microservices on AWS infrastructure:

**Container Orchestration (AWS ECS Fargate):**

| Service       | CPU | Memory | Min/Max Tasks |
| ------------- | --- | ------ | ------------- |
| Frontend      | 256 | 512 MB | 1/4           |
| Backend       | 512 | 1 GB   | 1/4           |
| Celery Worker | 256 | 512 MB | 1/3           |
| Celery Beat   | 256 | 512 MB | 1             |

**Load Balancing:**

- Application Load Balancer for traffic distribution
- HTTPS termination with ACM certificates
- Path-based routing (/_ → Frontend, /api/_ → Backend)
- Health checks every 30 seconds

**Content Delivery:**

- AWS CloudFront CDN for global distribution
- HTTP/2 and HTTP/3 support
- Edge caching for static assets
- Security headers injection

**CI/CD Pipeline (GitHub Actions):**

- Automated testing on pull requests
- Docker image builds for ARM64 architecture
- ECR push with git SHA tagging
- ECS deployment with rolling updates
- Database migration execution
- Smoke test verification

## 10.8 Integration Architecture {#10.8-integration-architecture}

![Figure 10.8: Integration Architecture](Images/image12.png)

**External Service Integrations:**

| Service       | Purpose         | Integration Pattern        |
| ------------- | --------------- | -------------------------- |
| AWS Cognito   | Authentication  | Direct SDK integration     |
| AWS SES       | Email delivery  | Async via Celery tasks     |
| Google Places | Venue discovery | REST API with caching      |
| Google OAuth  | Social login    | Cognito federated identity |

**Integration Patterns:**

- **API Adapter Pattern** for standardized external service communication
- **Redis Caching Layer** for reducing external API calls and improving response times
- **Circuit Breaker Pattern** for handling third-party service failures gracefully
- **Webhook Endpoints** for receiving real-time updates from external services

## 10.9 System Architecture Summary {#10.9-summary}

| Component      | Technology            | Purpose             |
| -------------- | --------------------- | ------------------- |
| Frontend       | Next.js 15, React 19  | User interface      |
| Backend        | FastAPI, Python 3.13  | API services        |
| Authentication | AWS Cognito           | Identity management |
| Database       | PostgreSQL 16 (RDS)   | Relational data     |
| Cache          | Redis 7 (ElastiCache) | Caching, queues     |
| Email          | AWS SES + Celery      | Notifications       |
| Storage        | AWS S3                | Object storage      |
| CDN            | CloudFront            | Content delivery    |
| Container      | ECS Fargate           | Orchestration       |
| IaC            | Terraform             | Infrastructure      |
| CI/CD          | GitHub Actions        | Automation          |
| Monitoring     | CloudWatch, X-Ray     | Observability       |

# 11.0 UML Diagrams {#11.0-uml-diagrams}

This section presents the Unified Modeling Language (UML) diagrams that document the Party-Time system design. These diagrams provide visual representations of system behavior, data flow, and structural relationships, serving as essential documentation for understanding the application architecture and guiding implementation decisions.

## 11.1 Use Case Diagram {#11.1-use-case}

The Use Case Diagram (Figure 11.1) illustrates the functional requirements of the Party-Time system from the perspective of its primary actors. The diagram identifies three main actors and their interactions with system functionality.

![Figure 11.1: Use Case Diagram of Party-Time Application](Images/image1.png)

**Actors:**

| Actor                | Description                                   | Primary Interactions                                  |
| -------------------- | --------------------------------------------- | ----------------------------------------------------- |
| Event Planner        | Primary user who creates and manages events   | Event CRUD, Guest Management, Budget, Seating, Venues |
| Guest                | Invitee who receives invitations and responds | View Event Details, Submit RSVP, Find Seat            |
| System Administrator | Platform maintenance personnel                | Monitor System, Manage Users, View Analytics          |

**Primary Use Cases:**

| Use Case             | Actor         | Description                                                    |
| -------------------- | ------------- | -------------------------------------------------------------- |
| Create Event         | Event Planner | Create new event with type, date, location, and settings       |
| Manage Guests        | Event Planner | Add, edit, delete guests; import via CSV; generate RSVP tokens |
| Send Invitations     | Event Planner | Distribute email invitations to guest list                     |
| Track Budget         | Event Planner | Create expense categories, record expenses, view analytics     |
| Design Seating Chart | Event Planner | Create venue layout, assign guests to tables                   |
| Search Venues        | Event Planner | Discover venues via Google Places integration                  |
| View Event Details   | Guest         | Access event information via personalized link                 |
| Submit RSVP          | Guest         | Respond to invitation with attendance and preferences          |
| Find My Seat         | Guest         | View assigned seating location                                 |
| Monitor System       | Administrator | Review dashboards, logs, and system health                     |

**Use Case Relationships:**

- **Include**: "Send Invitations" includes "Generate RSVP Tokens"
- **Include**: "Submit RSVP" includes "Validate Token"
- **Extend**: "Manage Guests" extends to "Import CSV" (optional bulk operation)
- **Extend**: "Track Budget" extends to "Export Report" (optional reporting)

## 11.2 Sequence Diagrams {#11.2-sequence}

Sequence diagrams illustrate the temporal ordering of interactions between system components for key workflows. Three critical sequences are documented below.

#### 11.2.1 User Authentication Sequence {#11.2.1-auth-sequence}

![Figure 11.2: User Authentication Sequence Diagram](Images/image3.png)

The authentication sequence (Figure 11.2) depicts the login flow using AWS Cognito:

**Participants:**

- User Browser
- Next.js Frontend
- NextAuth.js
- AWS Cognito
- FastAPI Backend

**Sequence Flow:**

1. User enters credentials on login page
2. Frontend sends credentials to NextAuth.js
3. NextAuth.js forwards authentication request to AWS Cognito
4. Cognito validates credentials against user pool
5. Cognito returns JWT tokens (access, refresh, ID tokens)
6. NextAuth.js creates session and stores tokens
7. Frontend receives session confirmation
8. Subsequent API requests include JWT in Authorization header
9. Backend validates JWT signature and claims
10. Backend returns protected resource data

**Key Interactions:**

| Step | From     | To       | Message                                          |
| ---- | -------- | -------- | ------------------------------------------------ |
| 1    | User     | Frontend | POST /auth/signin (credentials)                  |
| 2    | Frontend | NextAuth | authenticate(credentials)                        |
| 3    | NextAuth | Cognito  | InitiateAuth (USER_PASSWORD_AUTH)                |
| 4    | Cognito  | NextAuth | AuthenticationResult (tokens)                    |
| 5    | NextAuth | Frontend | Session (user, accessToken)                      |
| 6    | Frontend | Backend  | GET /api/v1/events (Authorization: Bearer token) |
| 7    | Backend  | Frontend | 200 OK (events data)                             |

#### 11.2.2 Event Creation Sequence {#11.2.2-event-sequence}

![Figure 11.3: Event Creation Sequence Diagram](Images/image11.png)

The event creation sequence (Figure 11.3) shows the multi-step wizard flow:

**Participants:**

- Event Planner
- Next.js Frontend
- React Query
- FastAPI Backend
- PostgreSQL Database

**Sequence Flow:**

1. Planner navigates to "Create Event" page
2. Frontend renders 4-step wizard form
3. Planner completes Step 1 (Basic Info: name, type, description)
4. Planner completes Step 2 (Date/Time with timezone selection)
5. Planner completes Step 3 (Location: venue name, address)
6. Planner completes Step 4 (Settings: RSVP deadline, visibility)
7. Planner clicks "Create Event" button
8. Frontend validates all form data with Zod schemas
9. React Query mutation sends POST request to backend
10. Backend validates request with Pydantic schemas
11. Backend creates event record in PostgreSQL
12. Database returns created event with generated ID
13. Backend returns 201 Created with event data
14. React Query invalidates events cache
15. Frontend redirects to event detail page

#### 11.2.3 RSVP Submission Sequence {#11.2.3-rsvp-sequence}

![Figure 11.4: RSVP Submission Sequence Diagram](Images/image4.png)

The RSVP submission sequence (Figure 11.4) depicts the guest response flow:

**Participants:**

- Guest
- Public RSVP Page
- FastAPI Backend
- PostgreSQL Database
- Celery Worker
- AWS SES

**Sequence Flow:**

1. Guest clicks personalized RSVP link in email
2. Frontend extracts token from URL path
3. Frontend sends GET request to validate token
4. Backend queries database for guest by token
5. Backend returns event details and guest info
6. Frontend renders RSVP form with pre-populated data
7. Guest selects attendance status
8. Guest indicates meal preference (if applicable)
9. Guest adds dietary restrictions or notes
10. Guest submits RSVP response
11. Frontend sends POST request with response data
12. Backend validates and updates guest record
13. Backend creates Celery task for confirmation email
14. Backend returns 200 OK with confirmation
15. Celery Worker processes email task
16. AWS SES delivers confirmation email to guest
17. Frontend displays success animation with confetti

## 11.3 Activity Diagram {#11.3-activity}

![Figure 11.5: Activity Diagram for Event Planning Workflow](Images/image10.png)

The Activity Diagram (Figure 11.5) models the workflow for the complete event planning process, showing decision points and parallel activities.

**Swimlanes:**

| Swimlane          | Activities                                             |
| ----------------- | ------------------------------------------------------ |
| Event Planner     | Create Event, Add Guests, Design Seating, Track Budget |
| System            | Generate Tokens, Send Emails, Monitor Responses        |
| Guest             | Receive Invitation, Submit RSVP, View Details          |
| External Services | Process Emails (SES), Venue Search (Google Places)     |

## 11.4 Data Flow Diagrams {#11.4-dfd}

Data Flow Diagrams illustrate how information moves through the Party-Time system at different levels of abstraction.

#### 11.4.1 Context Diagram (Level 0) {#11.4.1-context}

![Figure 11.6: Context Diagram (Level 0)](Images/image5.png)

The Context Diagram (Figure 11.6) shows the system boundary and external entities:

**External Entities:**

| Entity            | Data Flows In                                            | Data Flows Out                                           |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| Event Planner     | Event details, Guest lists, Budget data, Seating layouts | Event confirmations, Analytics reports, Export files     |
| Guest             | RSVP responses, Dietary preferences                      | Event information, Seat assignments, Confirmation emails |
| AWS Cognito       | Authentication tokens                                    | User credentials, Session requests                       |
| AWS SES           | Delivery status, Bounce notifications                    | Email content, Recipient lists                           |
| Google Places API | Venue data, Photos, Reviews                              | Search queries, Place IDs                                |

**System Boundary:**
The Party-Time System processes all internal data transformations including event management, guest coordination, budget calculations, and seating optimization.

#### 11.4.2 Level 1 Data Flow Diagram {#11.4.2-level1}

![Figure 11.7: Level 1 Data Flow Diagram](Images/image2.png)

The Level 1 DFD (Figure 11.7) decomposes the system into major processes:

**Processes:**

| Process                 | Input                    | Output                     | Data Store         |
| ----------------------- | ------------------------ | -------------------------- | ------------------ |
| 1.0 Manage Events       | Event details            | Event records              | D1: Events         |
| 2.0 Manage Guests       | Guest info, CSV files    | Guest records, RSVP tokens | D2: Guests         |
| 3.0 Process RSVPs       | RSVP responses           | Updated attendance         | D2: Guests         |
| 4.0 Send Communications | Email requests           | Delivery status            | D3: Email Logs     |
| 5.0 Track Budget        | Expense data             | Budget analytics           | D4: Budget Items   |
| 6.0 Design Seating      | Layout data, Assignments | Seating charts             | D5: Seating Charts |
| 7.0 Discover Venues     | Search criteria          | Venue results              | D6: Saved Venues   |

**Data Stores:**

| Store              | Description                        | Primary Keys         |
| ------------------ | ---------------------------------- | -------------------- |
| D1: Events         | Event records with metadata        | event_id             |
| D2: Guests         | Guest information and RSVP status  | guest_id, rsvp_token |
| D3: Email Logs     | Email delivery tracking            | email_log_id         |
| D4: Budget Items   | Expense categories and amounts     | budget_item_id       |
| D5: Seating Charts | Table layouts and seat assignments | seating_chart_id     |
| D6: Saved Venues   | Cached venue information           | venue_id             |

## 11.5 Class Diagram {#11.5-class}

![Figure 11.8: Class Diagram](Images/image7.png)

The Class Diagram (Figure 11.8) represents the domain model with key entities, attributes, and relationships.

**Core Domain Classes:**

### User Class

```
User
─────────────────────────
- id: UUID
- email: String
- name: String
- role: Enum[planner, admin]
- created_at: DateTime
- updated_at: DateTime
─────────────────────────
+ create_event(): Event
+ get_events(): List[Event]
+ update_profile(): User
```

### Event Class

```
Event
─────────────────────────
- id: UUID
- planner_id: UUID (FK → User)
- name: String
- event_type: Enum[wedding, birthday, corporate, ...]
- description: Text
- event_date: DateTime
- timezone: String
- location_name: String
- location_address: String
- status: Enum[draft, active, completed, cancelled]
- rsvp_deadline: DateTime
- created_at: DateTime
- updated_at: DateTime
─────────────────────────
+ add_guest(guest_data): Guest
+ import_guests(csv_file): List[Guest]
+ get_statistics(): EventStats
+ send_invitations(): int
+ duplicate(): Event
```

### Guest Class

```
Guest
─────────────────────────
- id: UUID
- event_id: UUID (FK → Event)
- name: String
- email: String
- phone: String (optional)
- rsvp_token: String (unique)
- rsvp_status: Enum[pending, confirmed, declined, maybe]
- plus_one_allowed: Boolean
- plus_one_confirmed: Boolean
- dietary_restrictions: String
- accessibility_needs: String
- notes: Text
- rsvp_responded_at: DateTime
- created_at: DateTime
─────────────────────────
+ generate_rsvp_token(): String
+ submit_rsvp(response): Guest
+ send_invitation(): EmailLog
+ get_seat_assignment(): SeatAssignment
```

### BudgetItem Class

```
BudgetItem
─────────────────────────
- id: UUID
- event_id: UUID (FK → Event)
- category: String
- description: String
- estimated_amount: Decimal
- actual_amount: Decimal
- paid: Boolean
- vendor_name: String
- due_date: Date
- notes: Text
- created_at: DateTime
─────────────────────────
+ calculate_variance(): Decimal
+ mark_paid(): BudgetItem
```

### SeatingChart Class

```
SeatingChart
─────────────────────────
- id: UUID
- event_id: UUID (FK → Event)
- name: String
- layout_data: JSON
- canvas_width: Integer
- canvas_height: Integer
- created_at: DateTime
- updated_at: DateTime
─────────────────────────
+ add_table(table_data): TableLayout
+ assign_guest(guest_id, seat_id): SeatAssignment
+ export_pdf(): bytes
+ auto_assign(): List[SeatAssignment]
```

### TableLayout Class

```
TableLayout
─────────────────────────
- id: UUID
- seating_chart_id: UUID (FK → SeatingChart)
- table_number: Integer
- shape: Enum[round, rectangular, square]
- capacity: Integer
- position_x: Float
- position_y: Float
- rotation: Float
- width: Float
- height: Float
─────────────────────────
+ get_available_seats(): Integer
+ get_assigned_guests(): List[Guest]
```

### SeatAssignment Class

```
SeatAssignment
─────────────────────────
- id: UUID
- table_layout_id: UUID (FK → TableLayout)
- guest_id: UUID (FK → Guest)
- seat_number: Integer
- created_at: DateTime
─────────────────────────
```

### EmailLog Class

```
EmailLog
─────────────────────────
- id: UUID
- event_id: UUID (FK → Event)
- guest_id: UUID (FK → Guest, optional)
- email_type: Enum[invitation, confirmation, reminder, thank_you]
- recipient_email: String
- subject: String
- status: Enum[pending, sent, delivered, bounced, failed]
- sent_at: DateTime
- delivered_at: DateTime
- error_message: String
─────────────────────────
+ retry(): EmailLog
```

**Class Relationships:**

| Relationship                 | Type        | Description                               |
| ---------------------------- | ----------- | ----------------------------------------- |
| User → Event                 | One-to-Many | A planner creates multiple events         |
| Event → Guest                | One-to-Many | An event has multiple guests              |
| Event → BudgetItem           | One-to-Many | An event has multiple budget items        |
| Event → SeatingChart         | One-to-Many | An event can have multiple seating charts |
| SeatingChart → TableLayout   | One-to-Many | A chart contains multiple tables          |
| TableLayout → SeatAssignment | One-to-Many | A table has multiple seat assignments     |
| Guest → SeatAssignment       | One-to-One  | A guest has one seat assignment           |
| Event → EmailLog             | One-to-Many | An event has multiple email logs          |
| Guest → EmailLog             | One-to-Many | A guest receives multiple emails          |

## 11.6 UML Diagrams Summary {#11.6-summary}

| Diagram                       | Figure | Purpose                                        |
| ----------------------------- | ------ | ---------------------------------------------- |
| Use Case Diagram              | 11.1   | Functional requirements and actor interactions |
| Authentication Sequence       | 11.2   | Login flow with AWS Cognito                    |
| Event Creation Sequence       | 11.3   | Multi-step event wizard workflow               |
| RSVP Submission Sequence      | 11.4   | Guest response and confirmation flow           |
| Activity Diagram              | 11.5   | Event planning workflow with decision points   |
| Context Diagram (DFD Level 0) | 11.6   | System boundary and external entities          |
| Level 1 DFD                   | 11.7   | Process decomposition and data stores          |
| Class Diagram                 | 11.8   | Domain model with entities and relationships   |

# 12.0 Implementation {#12.0-implementation}

This section documents the implementation of the Party-Time application, covering the development process, code organization, key implementation decisions, and notable features developed across the 13-week capstone timeline. The implementation followed a phased approach with each phase building incrementally upon previous work while maintaining production-quality code standards.

## 12.1 Development Process Overview {#12.1-development-process}

The Party-Time application was developed over 13 weeks from September through December 2025, following an iterative development approach with clearly defined phases. Each phase focused on specific functionality areas, culminating in a production-ready application with comprehensive AWS cloud infrastructure.

**Phase Timeline Summary:**

| Phase | Timeline          | Focus Area           | Key Deliverables                                |
| ----- | ----------------- | -------------------- | ----------------------------------------------- |
| 1     | September 2025    | Infrastructure Setup | Docker, PostgreSQL, Authentication, Event API   |
| 3     | September-October | Event Management     | Multi-step forms, detail pages, CRUD operations |
| 4     | October 2025      | Guest Management     | CSV import, RSVP tokens, guest list interface   |
| 5     | October 2025      | RSVP & Email         | Public RSVP pages, AWS SES integration, Celery  |
| 6     | November 2025     | Seating Charts       | Fabric.js canvas, drag-and-drop, exports        |
| 7     | November-December | Venues & Budget      | Google Places API, expense tracking             |
| 8     | December 4-5      | Testing & Polish     | 1,182 tests, skeletons, keyboard shortcuts      |
| 9     | December 5        | Performance          | Code splitting, caching, Web Vitals             |
| 10    | December 8-15     | AWS Infrastructure   | 210+ resources, staging deployment              |

## 12.2 Frontend Implementation {#12.2-frontend-implementation}

The frontend was built with Next.js 15 using the App Router architecture, React 19 for UI components, and TypeScript for type safety.

#### 12.2.1 Project Structure {#12.2.1-frontend-structure}

```
frontend/src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication routes (signin, signup)
│   ├── dashboard/         # Protected dashboard pages
│   ├── events/            # Event management pages
│   │   └── [id]/          # Dynamic event routes
│   │       ├── seating/   # Seating chart pages
│   │       └── page.tsx   # Event detail page
│   └── rsvp/              # Public RSVP pages
├── components/
│   ├── analytics/         # Analytics and tracking
│   ├── budget/            # Budget management components
│   ├── events/            # Event-related components
│   ├── guests/            # Guest management components
│   ├── layout/            # Header, Sidebar, MobileNav
│   ├── onboarding/        # First-time user wizard
│   ├── rsvp/              # RSVP form components
│   ├── seating/           # Seating chart editor (23 components)
│   ├── ui/                # Reusable UI components
│   └── venues/            # Venue search components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and API client
├── schemas/               # Zod validation schemas
├── services/              # API service functions
└── types/                 # TypeScript type definitions
```

#### 12.2.2 Key Frontend Technologies {#12.2.2-frontend-tech}

| Technology      | Version | Purpose                         |
| --------------- | ------- | ------------------------------- |
| Next.js         | 15.5.7  | React framework with App Router |
| React           | 19.1.2  | UI component library            |
| TypeScript      | 5.x     | Static type checking            |
| Tailwind CSS    | 4.x     | Utility-first styling           |
| React Query     | 5.87.1  | Server state management         |
| React Hook Form | 7.62.0  | Performant form handling        |
| Zod             | 4.1.5   | Schema validation               |
| Fabric.js       | 6.7.1   | Canvas-based seating editor     |
| NextAuth.js     | 4.24.11 | Authentication integration      |

#### 12.2.3 Component Implementation Highlights {#12.2.3-components}

**Event Management (Phase 3)**:

- Multi-step event creation wizard with 4 steps (Basic Info, Date/Time, Location, Settings)
- Event detail page with 5-tab interface (Overview, Guests, Budget, Timeline, Settings)
- Support for 13 event types with Zod validation schemas
- Real-time data synchronization using React Query

**Guest Management (Phase 4)**:

- Data table with sorting, inline editing, and advanced filtering
- CSV import wizard with 4-step workflow (upload, column mapping, preview, execute)
- Smart parsing supporting 7+ column naming conventions
- Capacity for 1,000+ guests per import operation
- Guest analytics dashboard with 7 statistics cards

**Seating Chart Editor (Phase 6)**:
The seating chart implementation was the most complex feature, spanning 23 components:

| Component           | Lines | Purpose                      |
| ------------------- | ----- | ---------------------------- |
| SeatingEditorLayout | 450   | Main editor container        |
| CanvasEditor        | 600   | Fabric.js canvas integration |
| GuestSidebar        | 350   | Unassigned guest list        |
| TableToolbar        | 280   | Table creation tools         |
| AutoAssignDialog    | 450   | Smart seating algorithm      |
| ExportDialog        | 300   | PDF/PNG/CSV export           |

Key seating features implemented:

- Drag-and-drop guest assignment to tables
- Undo/redo history with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- 5 table template presets (banquet, classroom, theater, cocktail, U-shape)
- 4 table shapes (round, rectangular, square, oval)
- Floor plan upload with background image support
- 10 special area types (dance floor, stage, bar, buffet, etc.)
- Export to PDF, PNG, JPEG, SVG, and CSV formats

**Mobile Responsiveness (Phase 8)**:

- MobileBottomNav with 5-tab navigation
- Breakpoint-aware rendering using custom useMediaQuery hook
- MobileSeatingView for touch-optimized seating interaction
- FindMySeat feature with pinch-to-zoom support

#### 12.2.4 State Management {#12.2.4-state-management}

**Server State (React Query)**:

```typescript
// Example: Events query with caching
const { data: events, isLoading } = useQuery({
  queryKey: ["events"],
  queryFn: () => eventService.getEvents(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations with optimistic updates
const createEvent = useMutation({
  mutationFn: eventService.createEvent,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["events"] });
  },
});
```

**Client State (React Context)**:

- AuthContext: User authentication state
- ToastContext: Notification management
- KeyboardShortcutsContext: Global keyboard shortcuts
- AnalyticsContext: Event tracking

## 12.3 Backend Implementation {#12.3-backend-implementation}

The backend was built with Python 3.13 and FastAPI, following a layered architecture with clear separation of concerns.

#### 12.3.1 Project Structure {#12.3.1-backend-structure}

```
backend/
├── app/
│   ├── api/
│   │   └── v1/             # API route handlers
│   │       ├── events.py   # Event endpoints
│   │       ├── guests.py   # Guest endpoints
│   │       ├── rsvp.py     # Public RSVP endpoints
│   │       ├── budget.py   # Budget endpoints
│   │       ├── venues.py   # Venue endpoints
│   │       └── seating.py  # Seating chart endpoints
│   ├── core/
│   │   ├── config.py       # Configuration management
│   │   ├── security.py     # JWT and auth utilities
│   │   ├── auth.py         # Authentication middleware
│   │   └── cache.py        # Redis caching module
│   ├── middleware/
│   │   └── xray.py         # AWS X-Ray tracing
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic validation
│   ├── services/           # Business logic layer
│   └── main.py             # FastAPI application entry
├── alembic/                # Database migrations
└── tests/                  # pytest test suite
```

#### 12.3.2 Key Backend Technologies {#12.3.2-backend-tech}

| Technology | Version     | Purpose                |
| ---------- | ----------- | ---------------------- |
| Python     | 3.13        | Runtime environment    |
| FastAPI    | 0.116.1     | Web framework          |
| SQLAlchemy | 2.0.43      | ORM with async support |
| Alembic    | 1.16.5      | Database migrations    |
| Pydantic   | 2.11.7      | Data validation        |
| Celery     | 5.4.0       | Task queue             |
| Redis      | Via asyncpg | Caching and broker     |
| boto3      | 1.40.25     | AWS SDK                |

#### 12.3.3 API Implementation {#12.3.3-api-implementation}

**RESTful Endpoints (50+ total)**:

| Resource | Endpoints | HTTP Methods                        |
| -------- | --------- | ----------------------------------- |
| Events   | 8         | GET, POST, PUT, PATCH, DELETE       |
| Guests   | 10        | GET, POST, PUT, DELETE, POST (bulk) |
| RSVP     | 5         | GET, POST, PUT                      |
| Budget   | 8         | GET, POST, PUT, DELETE              |
| Venues   | 9         | GET, POST, PUT, DELETE              |
| Seating  | 12        | GET, POST, PUT, DELETE              |

**API Design Patterns**:

- Consistent response format with data, message, and metadata
- Comprehensive error handling with structured error responses
- Input validation via Pydantic schemas
- Automatic OpenAPI documentation at /docs
- Rate limiting via AWS WAF (2000 requests/5 min)

**Example Endpoint Implementation**:

```python
@router.post("/events/", response_model=EventResponse)
async def create_event(
    event_in: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new event for the authenticated user."""
    event = await event_service.create_event(
        db=db,
        event_data=event_in,
        user_id=current_user.id,
    )
    # Invalidate cache
    await cache_manager.invalidate_pattern(f"events:user:{current_user.id}:*")
    return EventResponse(data=event, message="Event created successfully")
```

#### 12.3.4 Database Models {#12.3.4-database-models}

**Core Models (SQLAlchemy)**:

| Model          | Fields                              | Relationships                        |
| -------------- | ----------------------------------- | ------------------------------------ |
| User           | id, email, name, role               | events, email_logs                   |
| Event          | id, name, type, date, status        | guests, budget_items, seating_charts |
| Guest          | id, name, email, rsvp_token, status | event, seat_assignment, email_logs   |
| BudgetCategory | id, name, allocated_amount, color   | event, expenses                      |
| BudgetExpense  | id, description, amount, paid       | category                             |
| SeatingChart   | id, name, layout_data               | event, tables                        |
| TableLayout    | id, shape, capacity, position       | seating_chart, assignments           |
| SeatAssignment | id, seat_number                     | table, guest                         |
| EmailLog       | id, type, status, sent_at           | event, guest                         |

**Migration Management (Alembic)**:

- 25+ migrations tracking schema evolution
- Automatic migration generation with `alembic revision --autogenerate`
- Applied via ECS RunTask during CI/CD deployment

#### 12.3.5 Asynchronous Processing {#12.3.5-async-processing}

**Celery Task Queue (Phase 5)**:

The email system uses Celery for asynchronous processing with Redis as the message broker:

```python
# Task definition
@celery_app.task(bind=True, max_retries=3)
def send_email_task(self, email_data: dict):
    """Send email via AWS SES asynchronously."""
    try:
        ses_client.send_email(
            Source=settings.SES_FROM_EMAIL,
            Destination={'ToAddresses': [email_data['to']]},
            Message={
                'Subject': {'Data': email_data['subject']},
                'Body': {'Html': {'Data': email_data['html_body']}}
            }
        )
        # Update email log status
        update_email_status(email_data['log_id'], 'sent')
    except Exception as e:
        self.retry(exc=e, countdown=60 * (self.request.retries + 1))
```

**Celery Services**:

- celery-worker: Processes email and background tasks
- celery-beat: Schedules automated reminders and reports

#### 12.3.6 Caching Layer {#12.3.6-caching}

**Redis Caching Implementation (Phase 9)**:

```python
class CacheManager:
    """Redis cache manager with TTL support."""

    async def get_or_set(
        self,
        key: str,
        factory: Callable,
        ttl: int = CacheTTL.MEDIUM,
    ):
        """Get from cache or compute and store."""
        cached = await self.redis.get(key)
        if cached:
            return json.loads(cached)
        result = await factory()
        await self.redis.setex(key, ttl, json.dumps(result))
        return result

# Cache TTL constants
class CacheTTL:
    SHORT = 60          # 1 minute
    MEDIUM = 300        # 5 minutes
    LONG = 3600         # 1 hour
    VENUE_SEARCH = 3600 # 1 hour
    VENUE_DETAILS = 86400  # 24 hours
```

**Cached Resources**:

- Events list: 5-minute TTL with invalidation on CRUD
- Venue search results: 1-hour TTL
- Venue details: 24-hour TTL
- User sessions: Stored in Redis

## 12.4 Authentication Implementation {#12.4-authentication}

Authentication is handled by AWS Cognito with NextAuth.js on the frontend.

#### 12.4.1 Authentication Flow {#12.4.1-auth-flow}

1. User enters credentials on login page
2. NextAuth.js sends credentials to AWS Cognito
3. Cognito validates and returns JWT tokens (access, refresh, ID)
4. Tokens stored in encrypted session cookie
5. API requests include JWT in Authorization header
6. Backend validates JWT signature and claims
7. Token refresh handled automatically by NextAuth.js

#### 12.4.2 JWT Validation {#12.4.2-jwt-validation}

```python
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate JWT and return current user."""
    try:
        payload = jwt.decode(
            token,
            key=settings.COGNITO_PUBLIC_KEY,
            algorithms=["RS256"],
            audience=settings.COGNITO_CLIENT_ID,
        )
        user_id = payload.get("sub")
        user = await get_user_by_cognito_id(db, user_id)
        if not user:
            # Auto-create user on first authenticated request
            user = await ensure_user_exists(db, payload)
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

## 12.5 External Service Integrations {#12.5-integrations}

#### 12.5.1 Google Places API (Phase 7) {#12.5.1-google-places}

Integration with Google Places API (New) for venue discovery:

**Implementation**:

- VenueService class with Redis caching
- Search, details, and photo retrieval endpoints
- Rate limiting and error handling
- Response transformation for frontend consumption

**Endpoints**:

- `GET /api/v1/venues/search` - Search venues by query and location
- `GET /api/v1/venues/{place_id}` - Get venue details
- `GET /api/v1/venues/{place_id}/photos` - Get venue photos

#### 12.5.2 AWS SES Email Service (Phase 5) {#12.5.2-aws-ses}

Email delivery via AWS Simple Email Service:

**Email Types**:

1. Invitation - Event invitation with RSVP link
2. Confirmation - RSVP submission confirmation
3. Reminder - Pre-event reminder (automated via Celery Beat)
4. Thank You - Post-event thank you message

**Email Features**:

- HTML templates with plain text fallbacks
- Dynamic content injection (guest name, event details)
- Delivery tracking via EmailLog model
- Bounce and complaint handling

## 12.6 Infrastructure Implementation {#12.6-infrastructure}

The Party-Time application is deployed on AWS using enterprise-grade infrastructure designed to showcase DevOps best practices. The infrastructure was implemented incrementally across 8 phases, with each phase independently deployable and building upon previous work. This section provides a comprehensive overview of the cloud architecture, deployment strategies, security measures, and operational practices.

### 12.6.1 Infrastructure Overview {#12.6.1-overview}

The AWS infrastructure follows cloud-native design principles with a focus on high availability, security, scalability, and cost optimization. The architecture leverages managed AWS services to minimize operational overhead while maintaining enterprise-level reliability.

**Core AWS Services Utilized**:

| Category   | Services                                              |
| ---------- | ----------------------------------------------------- |
| Compute    | ECS Fargate (ARM64 Graviton2), Lambda@Edge            |
| Networking | VPC, ALB, CloudFront, Route 53, NAT Gateway           |
| Data       | RDS PostgreSQL 16, ElastiCache Redis 7, S3            |
| Security   | WAF v2, Shield Standard, GuardDuty, Security Hub, KMS |
| Monitoring | CloudWatch, X-Ray, Synthetics                         |
| DevOps     | ECR, Secrets Manager, CodeDeploy                      |

**Implementation Phases**:

The infrastructure was deployed incrementally across 8 phases: Foundation (networking, ECR, IAM), Data Layer (RDS, Redis, S3, Secrets), Application Layer (ECS, ALB), DNS & CDN (Route 53, CloudFront, ACM), Security (WAF, GuardDuty), CI/CD Pipeline (GitHub Actions), Monitoring (CloudWatch, X-Ray), and Production deployment.

![AWS Architecture Overview](Images/Infrastructure/Deployment%20Archetecture.png)

The architecture diagram above illustrates the complete AWS infrastructure, showing the flow from user requests through the edge layer (Route 53, CloudFront, WAF), into the VPC with its public and private subnets, and down to the data layer (RDS, ElastiCache).

---

### 12.6.2 Network Architecture {#12.6.2-network}

The foundation of the infrastructure is a properly segmented Virtual Private Cloud (VPC) that isolates resources and controls traffic flow across multiple Availability Zones.

**VPC Design**:

| Component        | Configuration                               | Purpose                             |
| ---------------- | ------------------------------------------- | ----------------------------------- |
| VPC CIDR         | 10.0.0.0/16                                 | 65,536 IP addresses for growth      |
| Public Subnets   | 10.0.1.0/24, 10.0.2.0/24 (2 AZs)            | ALB, NAT Gateway (internet-facing)  |
| Private Subnets  | 10.0.10.0/24, 10.0.11.0/24 (2 AZs)          | ECS tasks, Lambda functions         |
| Database Subnets | 10.0.20.0/24, 10.0.21.0/24 (2 AZs)          | RDS, ElastiCache (isolated)         |
| NAT Gateway      | Single gateway (cost-optimized for staging) | Private subnet internet access      |
| Internet Gateway | Attached to VPC                             | Public subnet internet connectivity |

**Network Segmentation Strategy**:

- **Public Subnets**: Only the Application Load Balancer and NAT Gateway have public IP addresses. No application containers are directly internet-accessible.
- **Private Subnets**: All ECS tasks (frontend, backend, Celery workers) run in private subnets. They access the internet exclusively through the NAT Gateway for outbound connections (package updates, external APIs).
- **Database Subnets**: Completely isolated with no internet access. RDS and ElastiCache are only accessible from the private subnets via security group rules.

**VPC Endpoints**:

To reduce NAT Gateway costs and improve security, VPC endpoints provide private connectivity to AWS services:

- S3 Gateway Endpoint (free)
- ECR API and DKR Interface Endpoints
- Secrets Manager Interface Endpoint
- CloudWatch Logs Interface Endpoint

**Multi-AZ High Availability**:

Resources are distributed across us-east-1a and us-east-1b. If one Availability Zone experiences an outage, traffic automatically routes to the healthy AZ with no manual intervention required.

![Network Architecture](Images/Infrastructure/Network-Architecture.png)

The diagram above shows the VPC layout with its three-tier subnet architecture, NAT Gateway placement, and how traffic flows between the public internet and internal resources.

---

### 12.6.3 Request Flow Architecture {#12.6.3-request-flow}

Understanding how user requests traverse the infrastructure is critical for debugging, performance optimization, and security analysis. Each request passes through multiple layers before reaching the application.

**Request Journey**:

1. **DNS Resolution (Route 53)**: User requests to `celebration-time.com` resolve to the CloudFront distribution via A and AAAA alias records.

2. **CDN & Edge Security (CloudFront)**:

   - SSL/TLS termination with ACM-managed certificates
   - Edge caching for static assets (JS, CSS, images)
   - Security headers injection (HSTS, CSP, X-Frame-Options)
   - HTTP/2 and HTTP/3 support for performance

3. **Web Application Firewall (WAF v2)**:

   - AWS Managed Rules for OWASP Top 10 protection
   - Rate limiting (2000 requests per 5 minutes per IP)
   - SQL injection and XSS blocking
   - Request logging to CloudWatch

4. **Load Balancing (ALB)**:

   - Path-based routing rules
   - Health checks on `/health` endpoint
   - Target group management for blue-green deployments

5. **Application Layer (ECS Fargate)**:

   - Frontend service (Next.js on port 3000)
   - Backend service (FastAPI on port 8000)
   - Celery workers for async tasks
   - Celery Beat for scheduled jobs

6. **Data Layer**:
   - RDS PostgreSQL for persistent storage
   - ElastiCache Redis for caching and Celery broker
   - S3 for static assets and file uploads

**Path-Based Routing Rules**:

| Path Pattern | Target                | Description               |
| ------------ | --------------------- | ------------------------- |
| `/*`         | Frontend Target Group | Next.js application       |
| `/api/*`     | Backend Target Group  | FastAPI endpoints         |
| `/docs`      | Backend Target Group  | Swagger API documentation |
| `/health`    | Backend Target Group  | Health check endpoint     |
| `/ws/*`      | Backend Target Group  | WebSocket connections     |

![Request Flow Architecture](Images/Infrastructure/Request-flow-architecture.png)

The request flow diagram illustrates the complete journey of a user request from the browser through each infrastructure layer, showing the security checkpoints, routing decisions, and data access patterns.

---

### 12.6.4 Security Architecture {#12.6.4-security}

Security is implemented as a defense-in-depth strategy with five distinct layers. Each layer provides specific protections, and together they create a comprehensive security posture.

**Layer 1: Edge Security**

| Service          | Protection                                         |
| ---------------- | -------------------------------------------------- |
| CloudFront       | HTTPS-only (TLS 1.2+), DDoS absorption at edge     |
| WAF v2           | OWASP Top 10 rules, rate limiting, geo-blocking    |
| Shield Standard  | Automatic DDoS protection (included free)          |
| Security Headers | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |

**Layer 2: Network Security**

| Service         | Protection                                        |
| --------------- | ------------------------------------------------- |
| VPC             | Network isolation, no default internet access     |
| Security Groups | Stateful firewall, least-privilege port access    |
| NACLs           | Stateless subnet-level filtering                  |
| VPC Flow Logs   | Network traffic auditing to CloudWatch            |
| VPC Endpoints   | Private AWS API access without internet traversal |

**Layer 3: Application Security**

| Service         | Protection                                             |
| --------------- | ------------------------------------------------------ |
| Cognito         | JWT validation, MFA support, secure session management |
| IAM Roles       | ECS tasks use roles (no hardcoded credentials)         |
| Secrets Manager | Encrypted credential storage, automatic rotation       |
| KMS             | Customer-managed encryption keys for RDS, S3, Secrets  |

**Layer 4: Data Security**

| Service     | Protection                                             |
| ----------- | ------------------------------------------------------ |
| RDS         | Encryption at rest (KMS), SSL required for connections |
| ElastiCache | Encryption in-transit (TLS), AUTH token required       |
| S3          | SSE-S3 encryption, bucket policies, no public access   |
| Backups     | Encrypted snapshots, point-in-time recovery            |

**Layer 5: Detection & Response**

| Service      | Protection                                          |
| ------------ | --------------------------------------------------- |
| GuardDuty    | Threat detection, anomaly monitoring, S3 protection |
| Security Hub | CIS AWS Foundations Benchmark compliance monitoring |
| CloudTrail   | API call logging and auditing for forensics         |
| Config       | Resource compliance monitoring and drift detection  |

**Security Headers Configuration**:

CloudFront injects security headers on all responses:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

![Security Architecture](Images/Infrastructure/Security-Architecture.png)

The security architecture diagram shows how the five security layers work together, with each layer building upon the previous to create comprehensive protection from the edge to the data layer.

---

### 12.6.5 CI/CD Pipeline {#12.6.5-cicd}

Continuous Integration and Continuous Deployment are implemented using GitHub Actions with secure AWS authentication via OIDC (no long-lived access keys).

**GitHub Actions Workflows**:

| Workflow                | Trigger                | Purpose                                     |
| ----------------------- | ---------------------- | ------------------------------------------- |
| `ci.yml`                | Pull requests          | Lint, type check, unit tests, security scan |
| `staging-deploy.yml`    | Push to `staging`      | Auto-deploy to staging environment          |
| `production-deploy.yml` | Push to `main`         | Deploy with manual approval gate            |
| `infrastructure.yml`    | Terraform file changes | Plan/apply with PR comment preview          |
| `rollback.yml`          | Manual dispatch        | Emergency rollback with confirmation        |

**CI Pipeline (Pull Requests)**:

1. **Linting**: ESLint (frontend), Ruff (backend)
2. **Type Checking**: TypeScript strict mode, mypy
3. **Unit Tests**: Jest (frontend), pytest (backend)
4. **Build Verification**: Docker image builds successfully
5. **Security Scan**: Trivy vulnerability scanning

**Deployment Pipeline**:

1. **Build**: Multi-platform Docker images (linux/arm64 for Graviton2)
2. **Push**: Images tagged with git SHA to ECR
3. **Migrate**: Database migrations via ECS RunTask
4. **Deploy**: Rolling update of ECS services
5. **Verify**: Health check endpoints (10-minute stability window)
6. **Notify**: Email notification via SES on success/failure

**GitHub OIDC Authentication**:

Instead of storing AWS access keys as secrets, the pipeline uses OpenID Connect:

```yaml
permissions:
  id-token: write
  contents: read

- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::ACCOUNT:role/github-actions
    aws-region: us-east-1
```

This approach eliminates credential rotation overhead and follows AWS security best practices.

**Branch Strategy**:

- `feature/*` → Pull request to `staging` (CI runs)
- `staging` → Auto-deploy to staging.celebration-time.com
- `main` → Deploy to celebration-time.com (requires approval)

![CI/CD Pipeline Flow](Images/Infrastructure/CI-CD-Deployment-Flow.png)

The CI/CD diagram shows the complete pipeline from code commit through testing, approval gates, and deployment to both staging and production environments.

---

### 12.6.6 Blue-Green Deployment {#12.6.6-blue-green}

Zero-downtime deployments are achieved using a blue-green deployment strategy with ECS and Application Load Balancer target groups.

**Deployment Process**:

| Phase         | Blue (Current)     | Green (New)    | Traffic Distribution |
| ------------- | ------------------ | -------------- | -------------------- |
| Before        | 2 tasks (v1.0)     | 0 tasks        | 100% → Blue          |
| Deploy Start  | 2 tasks (v1.0)     | 2 tasks (v2.0) | 100% → Blue          |
| Traffic Shift | 2 tasks (v1.0)     | 2 tasks (v2.0) | Linear 10%/min       |
| Validation    | 2 tasks (draining) | 2 tasks (v2.0) | 100% → Green         |
| Complete      | 0 tasks (standby)  | 2 tasks (v2.0) | 100% → Green         |

**Traffic Shifting Configuration**:

- **Strategy**: Linear 10% every 1 minute
- **Total Time**: ~10 minutes for full cutover
- **Monitoring Window**: Continuous health and error rate checks

**Automatic Rollback Triggers**:

The deployment automatically rolls back if any of these conditions occur:

- Error rate exceeds 1% during traffic shift
- Health check failures on the new target group
- P95 latency exceeds defined thresholds
- CloudWatch alarm enters ALARM state

**Rollback Process**:

If issues are detected:

1. Traffic immediately shifts back to blue (100%)
2. Green tasks are terminated
3. Alert sent via SNS to operations team
4. Deployment marked as failed in GitHub Actions

**Manual Rollback**:

The `rollback.yml` workflow provides emergency rollback capability:

- Requires typing "ROLLBACK" as confirmation
- Reverts to previous ECS task definition
- Can specify target revision number
- Sends notification on completion

![Blue-Green Deployment](Images/Infrastructure/Blue-Green-Deployment.png)

The blue-green deployment diagram illustrates the three phases of deployment: before (all traffic to blue), during (gradual traffic shift), and after (all traffic to green).

---

### 12.6.7 Monitoring & Observability {#12.6.7-monitoring}

Comprehensive observability is implemented through metrics, logs, traces, and synthetic monitoring to ensure rapid issue detection and resolution.

**CloudWatch Alarms (22 Total)**:

| Category    | Alarms | Thresholds                                         |
| ----------- | ------ | -------------------------------------------------- |
| ECS         | 6      | CPU > 80%, Memory > 85% (per service)              |
| ALB         | 5      | 5xx > 10, Target 5xx, Unhealthy hosts, P95 latency |
| RDS         | 5      | CPU > 80%, Connections > 80%, Storage < 4GB        |
| ElastiCache | 4      | CPU > 75%, Memory > 80%, Evictions, Hit rate < 80% |
| Synthetics  | 2      | Canary failures (homepage, API)                    |

**Alert Routing**:

- **Critical** (SNS): Service down, data layer issues → Immediate email
- **Warning** (SNS): High resource usage → Email within 5 minutes
- **Info** (SNS): Deployment notifications → Email digest

**CloudWatch Dashboards**:

Three custom dashboards provide operational visibility:

1. **Overview Dashboard**: ECS task counts, ALB request rates, error rates, response times
2. **Database Dashboard**: RDS connections, query latency, storage, Redis hit rates
3. **Email Dashboard**: SES send rates, bounce rates, complaint rates

**X-Ray Distributed Tracing**:

Request tracing captures the full journey through the application:

- CloudFront → ALB → ECS (FastAPI) → RDS/Redis
- Custom segments for external API calls (Google Places, Cognito)
- Error and fault trace groups for quick issue identification
- Sampling: 100% in staging, 5% in production

**Synthetics Canaries**:

Automated synthetic monitoring validates application health:

| Canary     | Interval   | Validation                     |
| ---------- | ---------- | ------------------------------ |
| Homepage   | 5 minutes  | Page loads, status 200         |
| API Health | 5 minutes  | /health returns healthy status |
| Login Flow | 15 minutes | Cognito authentication works   |

**Log Aggregation**:

All application logs flow to CloudWatch Logs with structured JSON formatting:

- `/ecs/party-time/frontend` - Next.js application logs
- `/ecs/party-time/backend` - FastAPI application logs
- `/ecs/party-time/celery-worker` - Async task processing logs
- `/ecs/party-time/celery-beat` - Scheduled task logs
- `/aws/rds/party-time` - Database slow query logs
- `/aws/vpc/flow-logs` - Network traffic logs

![Monitoring and Alerting](Images/Infrastructure/Monitoring-and-Alerting.png)

The monitoring diagram shows the complete observability stack including CloudWatch metrics and alarms, X-Ray tracing paths, synthetics canary locations, and the alert notification flow.

---

### 12.6.8 Disaster Recovery & Backup {#12.6.8-disaster-recovery}

A comprehensive backup and disaster recovery strategy ensures data protection and business continuity.

**Recovery Objectives**:

| Metric | Target   | How Achieved                                   |
| ------ | -------- | ---------------------------------------------- |
| RTO    | < 1 hour | Multi-AZ failover, infrastructure as code      |
| RPO    | < 5 min  | Continuous replication, point-in-time recovery |

**RDS PostgreSQL Backups**:

| Feature                | Configuration                          |
| ---------------------- | -------------------------------------- |
| Automated Backups      | Daily at 3:00 AM UTC                   |
| Retention Period       | 7 days (staging), 30 days (production) |
| Point-in-Time Recovery | 5-minute granularity                   |
| Manual Snapshots       | Before major deployments               |
| Multi-AZ Replication   | Synchronous standby (production only)  |

**S3 Data Protection**:

| Feature            | Configuration                           |
| ------------------ | --------------------------------------- |
| Versioning         | Enabled on uploads bucket               |
| Lifecycle Rules    | Move to Glacier after 90 days           |
| Cross-Region Repl. | Production data replicated to us-west-2 |

**AWS Backup**:

A centralized backup solution manages all backup policies:

- **Backup Plan**: `party-time-daily`
- **Schedule**: Daily at 2:00 AM UTC
- **Resources**: RDS instances, EFS volumes
- **Vault**: `party-time-backup-vault`
- **Cross-Region Copy**: Production backups copied to us-west-2

**Automatic Failover**:

- **RDS Multi-AZ**: Automatic failover to standby (~60 seconds)
- **ALB**: Health checks route traffic away from unhealthy targets
- **ECS**: Failed tasks automatically replaced

**Recovery Procedures**:

| Scenario             | Recovery Method                        | Time      |
| -------------------- | -------------------------------------- | --------- |
| Task failure         | ECS auto-replacement                   | < 2 min   |
| AZ failure           | Multi-AZ automatic failover            | < 5 min   |
| Database corruption  | Point-in-time recovery                 | 15-30 min |
| Complete region loss | Cross-region restore + Terraform apply | 1-2 hours |

![Disaster Recovery and Backup](Images/Infrastructure/Disaster-recovery-backup.png)

The disaster recovery diagram shows the backup flows, retention policies, cross-region replication, and the relationship between primary (us-east-1) and DR (us-west-2) regions.

---

### 12.6.9 Cost Optimization {#12.6.9-cost}

Cost optimization is built into the infrastructure design from the start, balancing reliability requirements with budget constraints.

**Immediate Savings (Design Decisions)**:

| Optimization             | Savings     | Trade-off                        |
| ------------------------ | ----------- | -------------------------------- |
| Single NAT Gateway       | ~$35/month  | Single AZ for outbound (staging) |
| t3.micro/small instances | ~$100/month | Limited burst capacity           |
| Single-AZ RDS (staging)  | ~$25/month  | No automatic failover in staging |
| ARM64 Graviton2          | ~20%        | None (better price/performance)  |

**Scheduled Savings**:

| Strategy         | Implementation        | Savings      |
| ---------------- | --------------------- | ------------ |
| Staging shutdown | EventBridge + Lambda  | ~40% compute |
| Schedule         | 8 PM - 8 AM, weekends | ~$40/month   |
| Scale to zero    | ECS desired count = 0 | Full compute |

**Long-Term Savings (Production)**:

| Commitment             | Savings  | Term      |
| ---------------------- | -------- | --------- |
| Compute Savings Plan   | 52%      | 1-year    |
| RDS Reserved Instance  | 40%      | 1-year    |
| S3 Intelligent Tiering | Variable | Automatic |

**Cost Monitoring**:

| Tool                   | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| AWS Budgets            | Alert at 80% and 100% of monthly budget    |
| Cost Anomaly Detection | Alert on unusual spending patterns         |
| Cost Allocation Tags   | Track costs by Environment, Service, Owner |
| Cost Explorer          | Monthly spend analysis and forecasting     |

**Monthly Cost Estimates**:

| Environment | Cost Range     | Key Components                        |
| ----------- | -------------- | ------------------------------------- |
| Staging     | $80-100/month  | Single-AZ, t3.micro, 1 NAT, scheduled |
| Production  | $350-400/month | Multi-AZ, t3.small, optimized         |

**Production Cost Breakdown**:

| Service        | Monthly Cost | Notes                          |
| -------------- | ------------ | ------------------------------ |
| ECS Fargate    | ~$90         | 4 tasks, ARM64                 |
| RDS PostgreSQL | ~$50         | db.t3.small, Multi-AZ          |
| NAT Gateway    | ~$35         | Single gateway + data transfer |
| ALB            | ~$20         | LCU-based pricing              |
| ElastiCache    | ~$15         | cache.t3.micro                 |
| CloudWatch     | ~$15         | Logs, metrics, alarms          |
| WAF            | ~$10         | Web ACL + rules                |
| CloudFront     | ~$5          | 50GB transfer estimate         |
| Other          | ~$10         | S3, Secrets Manager, Route 53  |

![Cost Optimization](Images/Infrastructure/Cost-optimization.png)

The cost optimization diagram illustrates the three categories of savings (immediate, scheduled, long-term), monitoring tools, and the monthly cost breakdown for both environments.

---

### 12.6.10 Terraform Infrastructure as Code {#12.6.10-terraform}

All infrastructure is defined as code using Terraform, enabling version control, peer review, and reproducible deployments.

**Module Structure**:

```
infrastructure/terraform/
├── environments/
│   ├── staging/              # Staging-specific configuration
│   │   ├── main.tf           # Module composition
│   │   ├── variables.tf      # Environment variables
│   │   ├── outputs.tf        # Exported values
│   │   └── backend.tf        # S3 state configuration
│   └── production/           # Production configuration
│       └── ...
├── modules/
│   ├── networking/           # VPC, subnets, NAT, security groups
│   ├── ecr/                  # Container registry with lifecycle
│   ├── iam/                  # Roles, policies, OIDC
│   ├── kms/                  # Encryption keys
│   ├── rds/                  # PostgreSQL with parameter groups
│   ├── elasticache/          # Redis cluster
│   ├── s3/                   # Buckets with lifecycle policies
│   ├── secrets/              # Secrets Manager entries
│   ├── alb/                  # Load balancer, listeners, targets
│   ├── ecs/                  # Cluster, services, task definitions
│   ├── acm/                  # SSL certificates
│   ├── cloudfront/           # CDN distribution
│   ├── route53/              # DNS records
│   ├── security/             # WAF, GuardDuty, Security Hub
│   └── monitoring/           # CloudWatch, X-Ray, Synthetics
└── shared/
    └── versions.tf           # Provider version constraints
```

**State Management**:

- **Backend**: S3 bucket with versioning enabled
- **Locking**: DynamoDB table prevents concurrent modifications
- **Encryption**: Server-side encryption for state files
- **Separation**: Each environment has isolated state

**Module Design Principles**:

1. **Single Responsibility**: Each module manages one logical component
2. **Explicit Dependencies**: Outputs expose only necessary values
3. **Configurable**: Variables allow environment-specific customization
4. **Documented**: Each variable includes description and validation

**Environment Differences**:

| Setting          | Staging                | Production            |
| ---------------- | ---------------------- | --------------------- |
| RDS Instance     | db.t3.micro, Single-AZ | db.t3.small, Multi-AZ |
| ECS Task Count   | 1 per service          | 2 per service         |
| NAT Gateways     | 1 (single AZ)          | 2 (multi-AZ)          |
| Backup Retention | 7 days                 | 30 days               |
| X-Ray Sampling   | 100%                   | 5%                    |

**Terraform Workflow**:

1. **Plan**: `terraform plan` generates execution plan
2. **Review**: Plan posted as PR comment for team review
3. **Approve**: Manual approval required for production
4. **Apply**: `terraform apply` executes changes
5. **Verify**: Outputs validated against expected values

## 12.7 Performance Optimizations {#12.7-performance}

#### 12.7.1 Frontend Optimizations (Phase 9) {#12.7.1-frontend-perf}

| Optimization       | Implementation            | Impact                 |
| ------------------ | ------------------------- | ---------------------- |
| Code splitting     | next/dynamic lazy loading | Reduced initial bundle |
| Image optimization | next/image with WebP/AVIF | 40-60% size reduction  |
| Tree shaking       | optimizePackageImports    | Smaller bundles        |
| Response caching   | React Query staleTime     | Reduced API calls      |
| Web Vitals         | LCP, INP, CLS tracking    | Performance monitoring |

#### 12.7.2 Backend Optimizations {#12.7.2-backend-perf}

| Optimization       | Implementation           | Impact                 |
| ------------------ | ------------------------ | ---------------------- |
| Redis caching      | CacheManager with TTL    | Reduced DB queries     |
| Connection pooling | SQLAlchemy async pool    | Better concurrency     |
| Response timing    | X-Response-Time header   | Slow request detection |
| Async processing   | Celery task queue        | Non-blocking emails    |
| Database indexes   | Strategic index creation | Faster queries         |

## 12.8 Implementation Statistics {#12.8-statistics}

**Codebase Metrics**:

| Category            | Metric                    |
| ------------------- | ------------------------- |
| Frontend files      | 200+ TypeScript/TSX files |
| Backend files       | 80+ Python files          |
| Total lines of code | ~50,000+ lines            |
| Test files          | 50+ test files            |
| Tests passing       | 1,182 tests               |
| API endpoints       | 50+ endpoints             |
| React components    | 100+ components           |
| Database models     | 12 SQLAlchemy models      |
| Alembic migrations  | 25+ migrations            |
| Terraform resources | 210+ AWS resources        |
| GitHub workflows    | 5 CI/CD workflows         |

**Feature Completion**:

| Phase     | Features           | Status   |
| --------- | ------------------ | -------- |
| 3         | Event Management   | Complete |
| 4         | Guest Management   | Complete |
| 5         | RSVP & Email       | Complete |
| 6         | Seating Charts     | Complete |
| 7         | Venues & Budget    | Complete |
| 8         | Testing & Polish   | Complete |
| 9         | Performance        | Complete |
| 10.1-10.7 | AWS Infrastructure | Complete |
| 10.8      | Production         | Pending  |
| 11        | Chat & AI          | Deferred |

# 13.0 Testing and Integration {#13.0-testing-and-integration}

This section documents the comprehensive testing strategy implemented for the Party-Time application, covering unit tests, integration tests, end-to-end tests, and the continuous integration pipeline that ensures code quality throughout the development lifecycle.

## 13.1 Testing Strategy Overview {#13.1-testing-overview}

The Party-Time application employs a multi-layered testing approach to ensure reliability, maintainability, and correctness across all system components.

**Testing Pyramid:**

| Layer       | Type                    | Framework      | Count | Coverage             |
| ----------- | ----------------------- | -------------- | ----- | -------------------- |
| Unit        | Component/Function      | Jest, pytest   | 800+  | Core logic           |
| Integration | API/Database            | pytest, RTL    | 250+  | Service interactions |
| End-to-End  | User workflows          | Playwright     | 100+  | Critical paths       |
| Smoke       | Deployment verification | Custom scripts | 25+   | Production health    |

**Total Tests: 1,182 passing (85.6% pass rate)**

## 13.2 Frontend Testing {#13.2-frontend-testing}

#### 13.2.1 Unit Testing with Jest {#13.2.1-jest}

Frontend unit tests use Jest with React Testing Library for component testing.

**Configuration (jest.config.js)**:

```javascript
module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/*.d.ts"],
};
```

**Test Categories**:

| Category   | Files | Tests | Description                         |
| ---------- | ----- | ----- | ----------------------------------- |
| Components | 25    | 300+  | UI component rendering and behavior |
| Hooks      | 10    | 80+   | Custom hook logic                   |
| Utils      | 8     | 100+  | Utility function correctness        |
| Schemas    | 5     | 60+   | Zod validation schemas              |

**Example Component Test**:

```typescript
describe("EventCard", () => {
  it("renders event details correctly", () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText(mockEvent.name)).toBeInTheDocument();
    expect(screen.getByText(mockEvent.event_type)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /view/i })).toBeEnabled();
  });

  it("handles click to navigate", async () => {
    const user = userEvent.setup();
    render(<EventCard event={mockEvent} />);

    await user.click(screen.getByRole("button", { name: /view/i }));
    expect(mockRouter.push).toHaveBeenCalledWith(`/events/${mockEvent.id}`);
  });
});
```

#### 13.2.2 Integration Testing {#13.2.2-integration}

Integration tests verify component interactions and data flow.

**Critical Workflow Tests (Phase 8)**:

- Event detail pages: Tab navigation, data loading, error states
- Guest management: CRUD operations, CSV import flow
- RSVP flows: Token validation, submission, confirmation
- Seating charts: Canvas rendering, drag-and-drop, persistence
- Budget tracking: Category management, expense recording
- Venue search: API integration, caching behavior

**Mock Data Factories**:

```typescript
// budgetData.ts factory example
export const createMockBudgetCategory = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.commerce.department(),
  allocated_amount: faker.number.float({ min: 100, max: 5000 }),
  spent_amount: faker.number.float({ min: 0, max: 1000 }),
  color: faker.color.rgb(),
  ...overrides,
});
```

#### 13.2.3 End-to-End Testing with Playwright {#13.2.3-playwright}

Playwright tests validate complete user workflows across browsers.

**Configuration (playwright.config.ts)**:

```typescript
export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});
```

**E2E Test Scenarios**:

| Scenario           | Steps                                           | Assertions                            |
| ------------------ | ----------------------------------------------- | ------------------------------------- |
| User Registration  | Navigate → Fill form → Submit → Verify redirect | Account created, session active       |
| Event Creation     | Login → Navigate → Complete wizard → Save       | Event appears in dashboard            |
| Guest Import       | Upload CSV → Map columns → Preview → Confirm    | Guests added to event                 |
| RSVP Submission    | Access link → Fill form → Submit                | Response recorded, confirmation shown |
| Seating Assignment | Open editor → Drag guest → Drop on table        | Assignment persisted                  |

## 13.3 Backend Testing {#13.3-backend-testing}

#### 13.3.1 Unit Testing with pytest {#13.3.1-pytest}

Backend tests use pytest with async support for testing FastAPI endpoints and business logic.

**Configuration (pytest.ini)**:

```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts = -v --cov=app --cov-report=html
```

**Test Categories**:

| Category   | Files | Tests | Description                          |
| ---------- | ----- | ----- | ------------------------------------ |
| API Routes | 12    | 200+  | Endpoint request/response validation |
| Services   | 8     | 150+  | Business logic correctness           |
| Models     | 6     | 80+   | Database model behavior              |
| Schemas    | 5     | 50+   | Pydantic validation rules            |

#### 13.3.2 API Integration Tests {#13.3.2-api-integration}

API tests verify endpoint behavior with database interactions.

**Test Structure**:

```python
@pytest.mark.asyncio
class TestEventAPI:
    async def test_create_event(self, client: AsyncClient, auth_headers: dict):
        """Test event creation endpoint."""
        event_data = {
            "name": "Test Wedding",
            "event_type": "wedding",
            "event_date": "2025-06-15T14:00:00Z",
            "timezone": "America/Los_Angeles",
        }

        response = await client.post(
            "/api/v1/events/",
            json=event_data,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["data"]["name"] == "Test Wedding"
        assert data["data"]["id"] is not None

    async def test_get_events_pagination(self, client: AsyncClient, auth_headers: dict):
        """Test event listing with pagination."""
        response = await client.get(
            "/api/v1/events/?page=1&per_page=10",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
```

#### 13.3.3 Complete Flow Tests (Phase 8) {#13.3.3-flow-tests}

End-to-end backend tests validate complex workflows across multiple services.

**Test Classes Implemented**:

| Test Class           | Coverage           | Key Scenarios                               |
| -------------------- | ------------------ | ------------------------------------------- |
| TestEventLifecycle   | Event CRUD         | Create, update, status transitions, delete  |
| TestGuestManagement  | Guest operations   | Add, bulk import, RSVP token generation     |
| TestRSVPSystem       | RSVP flow          | Token validation, submission, status update |
| TestEmailSystem      | Email delivery     | Template rendering, queue processing        |
| TestSeatingCharts    | Seating operations | Create chart, assign guests, export         |
| TestBudgetTracking   | Budget management  | Categories, expenses, calculations          |
| TestAPIErrorHandling | Error responses    | Validation errors, auth failures, not found |

**Example Flow Test**:

```python
@pytest.mark.asyncio
class TestGuestManagement:
    async def test_guest_import_flow(self, client: AsyncClient, event_id: str):
        """Test complete CSV import workflow."""
        # Step 1: Upload CSV
        csv_content = "name,email\nJohn Doe,john@example.com\nJane Doe,jane@example.com"
        response = await client.post(
            f"/api/v1/events/{event_id}/guests/import/",
            files={"file": ("guests.csv", csv_content, "text/csv")},
        )
        assert response.status_code == 200

        # Step 2: Verify guests created
        response = await client.get(f"/api/v1/events/{event_id}/guests/")
        assert response.status_code == 200
        guests = response.json()["items"]
        assert len(guests) == 2

        # Step 3: Verify RSVP tokens generated
        for guest in guests:
            assert guest["rsvp_token"] is not None
            assert len(guest["rsvp_token"]) == 8
```

## 13.4 Test Infrastructure {#13.4-test-infrastructure}

#### 13.4.1 Test Database Setup {#13.4.1-test-db}

Tests use isolated PostgreSQL databases to ensure test independence.

```python
@pytest.fixture(scope="session")
async def test_db():
    """Create isolated test database."""
    test_db_url = f"{settings.DATABASE_URL}_test"
    engine = create_async_engine(test_db_url)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
```

#### 13.4.2 Mock Services {#13.4.2-mocks}

External services are mocked during testing to ensure reliability and speed.

**Mocked Services**:

- AWS Cognito: Authentication responses
- AWS SES: Email delivery confirmation
- Google Places API: Venue search results
- Redis: In-memory cache simulation

**Mock Example**:

```python
@pytest.fixture
def mock_ses_client(mocker):
    """Mock AWS SES for email tests."""
    mock = mocker.patch("app.services.email.ses_client")
    mock.send_email.return_value = {"MessageId": "test-message-id"}
    return mock
```

#### 13.4.3 Test Fixtures {#13.4.3-fixtures}

Reusable fixtures provide consistent test data across test files.

```python
@pytest.fixture
async def authenticated_user(test_db):
    """Create authenticated user for tests."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        name="Test User",
        cognito_id="test-cognito-id",
    )
    async with test_db.begin() as session:
        session.add(user)
        await session.commit()
    return user

@pytest.fixture
async def sample_event(test_db, authenticated_user):
    """Create sample event for tests."""
    event = Event(
        id=uuid4(),
        planner_id=authenticated_user.id,
        name="Sample Wedding",
        event_type="wedding",
        event_date=datetime(2025, 6, 15, 14, 0),
        status="active",
    )
    async with test_db.begin() as session:
        session.add(event)
        await session.commit()
    return event
```

## 13.5 Continuous Integration {#13.5-ci}

#### 13.5.1 CI Pipeline Configuration {#13.5.1-ci-pipeline}

The GitHub Actions CI pipeline runs on every pull request to ensure code quality.

**Workflow Stages**:

```yaml
name: CI Pipeline
on: [pull_request]

jobs:
  frontend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test -- --coverage

  backend-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
      - run: pip install black
      - run: black --check .

  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
      - run: pip install -r requirements.txt
      - run: pytest --cov=app

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          format: "sarif"
```

#### 13.5.2 Quality Gates {#13.5.2-quality-gates}

Pull requests must pass all quality gates before merging.

**Required Checks**:

| Check         | Tool             | Threshold                        |
| ------------- | ---------------- | -------------------------------- |
| Linting       | ESLint, Black    | No errors                        |
| Type checking | TypeScript       | No errors                        |
| Unit tests    | Jest, pytest     | All passing                      |
| Coverage      | Jest, pytest-cov | > 70% (target)                   |
| Security      | Trivy            | No high/critical vulnerabilities |
| Build         | Next.js, Docker  | Successful                       |

## 13.6 Deployment Testing {#13.6-deployment-testing}

#### 13.6.1 Smoke Tests {#13.6.1-smoke-tests}

Post-deployment smoke tests verify production health.

**Health Check Endpoints**:

| Endpoint  | Purpose                         | Expected Response       |
| --------- | ------------------------------- | ----------------------- |
| `/health` | Database and Redis connectivity | 200 with status details |
| `/ready`  | Kubernetes readiness probe      | 200 when ready          |
| `/live`   | Kubernetes liveness probe       | 200 heartbeat           |
| `/docs`   | API documentation availability  | 200 with Swagger UI     |
| `/`       | Frontend application            | 200 with HTML           |

**Smoke Test Script**:

```bash
#!/bin/bash
# health-check.sh

ENDPOINTS=(
  "/health"
  "/ready"
  "/docs"
  "/"
)

for endpoint in "${ENDPOINTS[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
  if [ "$status" != "200" ]; then
    echo "FAILED: $endpoint returned $status"
    exit 1
  fi
  echo "PASSED: $endpoint"
done
```

#### 13.6.2 Synthetics Canaries {#13.6.2-synthetics}

AWS Synthetics canaries continuously monitor production availability.

**Configured Canaries**:

| Canary       | Interval | Actions                           |
| ------------ | -------- | --------------------------------- |
| Homepage     | 5 min    | Load page, verify content         |
| API Health   | 5 min    | Check /health endpoint            |
| Login Flow   | 15 min   | Navigate login, verify form       |
| Create Event | 30 min   | Complete event creation (staging) |

#### 13.6.3 Production Monitoring Integration {#13.6.3-monitoring-integration}

Post-deployment verification includes extended health monitoring.

**Production Deployment Health Check**:

```yaml
# From production-deploy.yml
- name: Extended Health Monitoring
  run: |
    for i in {1..10}; do
      echo "Health check $i/10..."
      curl -f "${{ env.PROD_URL }}/health" || exit 1
      sleep 30
    done
```

## 13.7 Test Results Summary {#13.7-test-summary}

**Overall Test Statistics**:

| Metric         | Value |
| -------------- | ----- |
| Total tests    | 1,182 |
| Pass rate      | 85.6% |
| Frontend tests | 600+  |
| Backend tests  | 500+  |
| E2E tests      | 100+  |
| Smoke tests    | 25+   |

**Test Coverage by Module**:

| Module            | Coverage | Tests |
| ----------------- | -------- | ----- |
| Event Management  | 92%      | 180   |
| Guest Management  | 88%      | 150   |
| RSVP System       | 90%      | 120   |
| Seating Charts    | 85%      | 200   |
| Budget Tracking   | 87%      | 100   |
| Venue Integration | 82%      | 80    |
| Email Service     | 78%      | 60    |
| Authentication    | 95%      | 100   |

**CI Pipeline Performance**:

| Stage          | Average Duration |
| -------------- | ---------------- |
| Frontend lint  | 45 seconds       |
| Frontend tests | 2 minutes        |
| Backend lint   | 30 seconds       |
| Backend tests  | 3 minutes        |
| Security scan  | 1 minute         |
| Docker build   | 4 minutes        |
| **Total**      | **~12 minutes**  |

# 14.0 Installation Instructions {#14.0-installation-instructions}

This section provides comprehensive instructions for installing and configuring the Party-Time application in both local development and cloud production environments.

## 14.1 Prerequisites {#14.1-prerequisites}

#### 14.1.1 System Requirements {#14.1.1-system-requirements}

**Development Machine:**

| Component | Minimum                               | Recommended               |
| --------- | ------------------------------------- | ------------------------- |
| CPU       | 2 cores                               | 4+ cores                  |
| RAM       | 8 GB                                  | 16 GB                     |
| Storage   | 10 GB free                            | 20 GB free                |
| OS        | macOS 12+, Ubuntu 20.04+, Windows 10+ | macOS 14+ (Apple Silicon) |

**Required Software:**

| Software          | Version  | Purpose                 |
| ----------------- | -------- | ----------------------- |
| Node.js           | 20.x LTS | Frontend runtime        |
| Python            | 3.13+    | Backend runtime         |
| Docker            | Latest   | Container orchestration |
| Git               | 2.x      | Version control         |
| PostgreSQL Client | 16.x     | Database access         |

#### 14.1.2 Account Requirements {#14.1.2-accounts}

**For Local Development:**

- GitHub account (repository access)
- Google Cloud account (Places API key - optional)

**For Cloud Deployment:**

- AWS account with administrator access
- Domain registered (e.g., celebration-time.com)
- GitHub account with repository write access

## 14.2 Local Development Setup {#14.2-local-setup}

#### 14.2.1 Clone Repository {#14.2.1-clone}

```bash
# Clone the repository
git clone https://github.com/your-org/party-time.git
cd party-time
```

#### 14.2.2 Start Docker Services {#14.2.2-docker}

```bash
# Start Docker Desktop (macOS)
open -a Docker

# Wait for Docker to start, then start database services
docker-compose up -d postgres redis

# Verify containers are running
docker ps
# Expected output:
# CONTAINER ID   IMAGE              PORTS                    NAMES
# abc123         postgres:16-alpine 0.0.0.0:5432->5432/tcp   party-time-db
# def456         redis:7-alpine     0.0.0.0:6379->6379/tcp   party-time-redis
```

#### 14.2.3 Backend Setup {#14.2.3-backend}

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3.13 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL=postgresql://party_admin:party_secure_2024@localhost:5432/party_time
# REDIS_URL=redis://localhost:6379/0
# JWT_SECRET_KEY=your-secret-key
# AWS_REGION=us-east-1
# COGNITO_USER_POOL_ID=your-pool-id
# COGNITO_CLIENT_ID=your-client-id

# Run database migrations
alembic upgrade head

# Start the backend server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify Backend:**

- API: http://localhost:8000
- Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

#### 14.2.4 Frontend Setup {#14.2.4-frontend}

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install Node.js dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your configuration
# NEXTAUTH_URL=http://localhost:3000
# NEXTAUTH_SECRET=your-nextauth-secret
# COGNITO_CLIENT_ID=your-cognito-client-id
# COGNITO_CLIENT_SECRET=your-cognito-client-secret
# COGNITO_ISSUER=https://cognito-idp.us-east-1.amazonaws.com/your-pool-id
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_APP_NAME=Party-Time

# Start the development server
npm run dev
```

**Verify Frontend:**

- Application: http://localhost:3000

#### 14.2.5 Celery Workers (Optional) {#14.2.5-celery}

For email functionality, start Celery workers:

```bash
# Terminal 3: Celery Worker
cd backend
source .venv/bin/activate
celery -A app.celery_app worker --loglevel=info

# Terminal 4: Celery Beat (scheduled tasks)
cd backend
source .venv/bin/activate
celery -A app.celery_app beat --loglevel=info
```

## 14.3 Environment Configuration {#14.3-environment-config}

#### 14.3.1 Backend Environment Variables {#14.3.1-backend-env}

| Variable              | Required | Description                  | Example                             |
| --------------------- | -------- | ---------------------------- | ----------------------------------- |
| DATABASE_URL          | Yes      | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| REDIS_URL             | Yes      | Redis connection string      | redis://localhost:6379/0            |
| JWT_SECRET_KEY        | Yes      | Secret for JWT signing       | random-32-char-string               |
| AWS_REGION            | Yes      | AWS region for services      | us-east-1                           |
| COGNITO_USER_POOL_ID  | Yes      | Cognito user pool ID         | us-east-1_xxxxx                     |
| COGNITO_CLIENT_ID     | Yes      | Cognito app client ID        | xxxxxxxxxxxxx                       |
| CELERY_BROKER_URL     | No       | Celery message broker        | redis://localhost:6379/1            |
| SES_FROM_EMAIL        | No       | Verified sender email        | noreply@domain.com                  |
| GOOGLE_PLACES_API_KEY | No       | Google Places API key        | AIza...                             |

#### 14.3.2 Frontend Environment Variables {#14.3.2-frontend-env}

| Variable              | Required | Description              | Example                |
| --------------------- | -------- | ------------------------ | ---------------------- |
| NEXTAUTH_URL          | Yes      | Application URL          | http://localhost:3000  |
| NEXTAUTH_SECRET       | Yes      | Session encryption key   | random-32-char-string  |
| COGNITO_CLIENT_ID     | Yes      | Cognito app client ID    | xxxxxxxxxxxxx          |
| COGNITO_CLIENT_SECRET | Yes      | Cognito client secret    | xxxxxxxxxxxxx          |
| COGNITO_ISSUER        | Yes      | Cognito issuer URL       | https://cognito-idp... |
| NEXT_PUBLIC_API_URL   | Yes      | Backend API URL          | http://localhost:8000  |
| NEXT_PUBLIC_APP_NAME  | No       | Application display name | Party-Time             |

## 14.4 Database Setup {#14.4-database}

#### 14.4.1 Local Database {#14.4.1-local-db}

The Docker Compose configuration automatically creates the database. To connect manually:

```bash
# Connect to PostgreSQL
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time

# Useful commands
\dt                    # List tables
\d+ events            # Describe events table
SELECT * FROM users;  # Query users
\q                    # Exit
```

#### 14.4.2 Database Migrations {#14.4.2-migrations}

```bash
cd backend
source .venv/bin/activate

# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply all pending migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# View migration history
alembic history
```

## 14.5 AWS Infrastructure Deployment {#14.5-aws-deployment}

#### 14.5.1 Prerequisites for AWS {#14.5.1-aws-prereqs}

```bash
# Install AWS CLI
brew install awscli  # macOS
# OR
pip install awscli   # Any platform

# Configure AWS credentials
aws configure
# Enter: AWS Access Key ID, Secret Access Key, Region (us-east-1)

# Install Terraform
brew install terraform  # macOS
# OR download from terraform.io

# Verify installations
aws --version
terraform --version
```

#### 14.5.2 Bootstrap Terraform State {#14.5.2-bootstrap}

```bash
cd infrastructure/scripts

# Run bootstrap script (creates S3 bucket and DynamoDB table for state)
./bootstrap.sh

# Expected output:
# Created S3 bucket: party-time-terraform-state-ACCOUNT_ID
# Created DynamoDB table: party-time-terraform-locks
```

#### 14.5.3 Deploy Infrastructure {#14.5.3-deploy-infra}

```bash
cd infrastructure/terraform/environments/staging

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply infrastructure (creates ~210 AWS resources)
terraform apply

# Deployment takes approximately 20-30 minutes
# Key outputs:
# - ALB URL
# - CloudFront URL
# - ECR repository URLs
# - RDS endpoint
```

#### 14.5.4 Deploy Application {#14.5.4-deploy-app}

**Build and Push Docker Images:**

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push frontend
cd infrastructure/docker/frontend
docker buildx build --platform linux/arm64 \
  -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/party-time-staging-frontend:latest \
  --push .

# Build and push backend
cd ../backend
docker buildx build --platform linux/arm64 \
  -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/party-time-staging-backend:latest \
  --push .
```

**Run Database Migrations:**

```bash
# Run migrations via ECS RunTask
aws ecs run-task \
  --cluster party-time-staging-cluster \
  --task-definition party-time-staging-backend \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" \
  --overrides '{"containerOverrides":[{"name":"backend","command":["alembic","upgrade","head"]}]}'
```

**Update ECS Services:**

```bash
# Force new deployment
aws ecs update-service \
  --cluster party-time-staging-cluster \
  --service party-time-staging-frontend \
  --force-new-deployment

aws ecs update-service \
  --cluster party-time-staging-cluster \
  --service party-time-staging-backend \
  --force-new-deployment
```

#### 14.5.5 Configure DNS {#14.5.5-dns}

After deployment, configure your domain:

1. Note the CloudFront distribution domain from Terraform output
2. In Route 53, create A record pointing to CloudFront
3. Wait for DNS propagation (up to 48 hours)

**Verify Deployment:**

- https://staging.celebration-time.com
- https://staging.celebration-time.com/docs
- https://staging.celebration-time.com/health

## 14.6 CI/CD Configuration {#14.6-cicd-config}

#### 14.6.1 GitHub Secrets {#14.6.1-github-secrets}

Configure the following secrets in GitHub repository settings:

| Secret             | Description                        |
| ------------------ | ---------------------------------- |
| AWS_ACCOUNT_ID     | Your AWS account ID                |
| AWS_REGION         | Deployment region (us-east-1)      |
| NOTIFICATION_EMAIL | Email for deployment notifications |

#### 14.6.2 GitHub Environments {#14.6.2-github-envs}

Create the following environments in GitHub:

1. **staging**: Auto-deploy on push to `staging` branch
2. **production**: Requires manual approval, deploy on push to `main`
3. **infrastructure**: Requires manual approval for Terraform changes

#### 14.6.3 Deployment Workflow {#14.6.3-deploy-workflow}

```bash
# Deploy to staging
git checkout staging
git merge feature-branch
git push origin staging
# GitHub Actions automatically deploys

# Deploy to production
git checkout main
git merge staging
git push origin main
# Approve deployment in GitHub Actions UI
```

## 14.7 Troubleshooting {#14.7-troubleshooting}

#### 14.7.1 Common Issues {#14.7.1-common-issues}

**Database Connection Failed:**

```bash
# Check if Docker is running
docker ps | grep party-time-db

# If not running, start it
docker-compose up -d postgres

# Verify connection
psql -h localhost -U party_admin -d party_time -c "SELECT 1"
```

**Backend Won't Start:**

```bash
# Ensure virtual environment is activated
source backend/.venv/bin/activate

# Check for missing dependencies
pip install -r requirements.txt

# Verify database is accessible
python -c "from app.core.database import engine; print('OK')"
```

**Frontend Build Fails:**

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**ECS Service Unhealthy:**

```bash
# Check task logs
aws logs tail /ecs/party-time/staging/backend --follow

# Check task status
aws ecs describe-services \
  --cluster party-time-staging-cluster \
  --services party-time-staging-backend
```

#### 14.7.2 Health Check Endpoints {#14.7.2-health-checks}

| Endpoint | Expected Response | Checks                       |
| -------- | ----------------- | ---------------------------- |
| /health  | 200 + JSON        | Database, Redis connectivity |
| /ready   | 200               | Full dependency check        |
| /live    | 200               | Simple heartbeat             |

#### 14.7.3 Logs and Debugging {#14.7.3-logs}

**Local Development:**

```bash
# Backend logs (terminal running uvicorn)
# Frontend logs (terminal running npm run dev)
# Database logs
docker logs party-time-db -f
```

**AWS Production:**

```bash
# CloudWatch logs
aws logs tail /ecs/party-time/staging/backend --follow
aws logs tail /ecs/party-time/staging/frontend --follow

# CloudWatch dashboards
# Navigate to AWS Console > CloudWatch > Dashboards > party-time-staging-overview
```

## 14.8 Quick Start Summary {#14.8-quick-start}

**Local Development (5 commands):**

```bash
git clone https://github.com/your-org/party-time.git && cd party-time
docker-compose up -d postgres redis
cd backend && python3.13 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && alembic upgrade head && python -m uvicorn app.main:app --reload &
cd ../frontend && npm install && npm run dev
# Open http://localhost:3000
```

**AWS Deployment (4 steps):**

```bash
# 1. Bootstrap Terraform state
cd infrastructure/scripts && ./bootstrap.sh

# 2. Deploy infrastructure
cd ../terraform/environments/staging && terraform init && terraform apply

# 3. Build and push Docker images (automated via CI/CD)
git push origin staging

# 4. Verify deployment
curl https://staging.celebration-time.com/health
```

# 15.0 Recommendations for Enhancement {#15.0-recommendations-for-enhancement}

This section outlines recommended enhancements for future development of the Party-Time application, organized by priority and implementation complexity.

## 15.1 High Priority Enhancements {#15.1-high-priority}

#### 15.1.1 AI-Powered Planning Assistant (Phase 11) {#15.1.1-ai-assistant}

**Description:** Integrate Claude AI to provide intelligent event planning assistance through conversational chat.

**Features:**

- Event timeline generation based on event type and date
- Vendor recommendations based on location and budget
- Guest seating optimization suggestions
- Budget allocation recommendations
- Answer event planning questions naturally

**Technical Approach:**

- Anthropic Claude API integration
- WebSocket-based real-time chat interface
- Context-aware responses using event data
- Conversation history persistence

**Estimated Effort:** 3-4 weeks

#### 15.1.2 Real-Time Chat System {#15.1.2-chat-system}

**Description:** Enable direct communication between planners, vendors, and guests within the platform.

**Features:**

- One-on-one messaging between planners and vendors
- Group chat for planning teams
- Guest communication channels
- File and image sharing
- Message notifications (email and push)

**Technical Approach:**

- WebSocket server (Socket.io or AWS AppSync)
- Message persistence in PostgreSQL
- Redis for real-time presence and delivery status
- Push notifications via AWS SNS

**Estimated Effort:** 4-5 weeks

#### 15.1.3 Production Environment Deployment (Phase 10.8) {#15.1.3-production}

**Description:** Complete production environment deployment with enhanced reliability and performance.

**Features:**

- Multi-AZ RDS deployment for high availability
- Dual NAT Gateways for redundancy
- Reserved capacity pricing for cost optimization
- Cross-region backup replication
- Blue-green deployment capability

**Technical Approach:**

- Terraform production environment configuration
- AWS Backup for automated cross-region copies
- CodeDeploy blue-green deployments
- Route 53 health checks with failover

**Estimated Effort:** 1-2 weeks

## 15.2 Medium Priority Enhancements {#15.2-medium-priority}

#### 15.2.1 Vendor Marketplace {#15.2.1-vendor-marketplace}

**Description:** Create a marketplace for event vendors (caterers, photographers, decorators) to list services.

**Features:**

- Vendor registration and profile management
- Service listings with pricing and availability
- Booking and reservation system
- Ratings and reviews
- Vendor analytics dashboard

**Technical Approach:**

- New vendor user role and authentication
- Vendor profile and service models
- Calendar-based availability system
- Review aggregation algorithms

**Estimated Effort:** 6-8 weeks

#### 15.2.2 Payment Processing Integration {#15.2.2-payments}

**Description:** Enable in-platform payment processing for vendor deposits and guest contributions.

**Features:**

- Stripe integration for payment processing
- Vendor deposit collection
- Guest gift registry contributions
- Payment splitting for group gifts
- Automated receipt generation
- Refund processing

**Technical Approach:**

- Stripe Connect for marketplace payments
- Payment intent workflow
- Webhook handlers for payment events
- PCI DSS compliance considerations

**Estimated Effort:** 4-6 weeks

#### 15.2.3 Native Mobile Applications {#15.2.3-mobile-apps}

**Description:** Develop native iOS and Android applications for enhanced mobile experience.

**Features:**

- Push notifications for RSVP updates
- Offline mode for event viewing
- Camera integration for photo capture
- Location-based venue discovery
- Biometric authentication

**Technical Approach:**

- React Native for cross-platform development
- Shared business logic with web application
- Native modules for device features
- App Store and Play Store distribution

**Estimated Effort:** 8-12 weeks

#### 15.2.4 Photo and Video Sharing {#15.2.4-media-sharing}

**Description:** Allow guests to upload and share photos and videos from events.

**Features:**

- Guest photo upload during events
- Photo moderation by planners
- Automatic album creation
- Photo download and sharing
- Slideshow generation
- Video compilation features

**Technical Approach:**

- S3 for media storage with CloudFront delivery
- Lambda for image processing and thumbnails
- Rekognition for content moderation
- Media metadata extraction

**Estimated Effort:** 4-6 weeks

## 15.3 Lower Priority Enhancements {#15.3-lower-priority}

#### 15.3.1 Calendar Integration {#15.3.1-calendar}

**Description:** Synchronize events with external calendar applications.

**Features:**

- Google Calendar sync
- Apple Calendar sync
- Outlook/Office 365 sync
- Automatic event updates
- Reminder synchronization

**Technical Approach:**

- OAuth 2.0 for calendar API access
- CalDAV protocol support
- Webhook-based sync updates
- Conflict resolution logic

**Estimated Effort:** 2-3 weeks

#### 15.3.2 Multi-Language Support (i18n) {#15.3.2-i18n}

**Description:** Internationalize the application for non-English speaking users.

**Features:**

- Language selection in user preferences
- Translated UI strings
- Localized date and currency formats
- RTL layout support for Arabic/Hebrew
- Email template translations

**Technical Approach:**

- next-intl for frontend i18n
- Backend response localization
- Translation management system
- Crowdsourced translations

**Estimated Effort:** 3-4 weeks

#### 15.3.3 Advanced Analytics Dashboard {#15.3.3-analytics}

**Description:** Provide detailed analytics for event planners on guest engagement and event metrics.

**Features:**

- RSVP response rate analytics
- Guest engagement metrics
- Budget variance analysis
- Email open and click rates
- Comparative event analysis

**Technical Approach:**

- Time-series data aggregation
- Chart.js or Recharts visualizations
- Scheduled report generation
- Data export functionality

**Estimated Effort:** 2-3 weeks

#### 15.3.4 Template Library {#15.3.4-templates}

**Description:** Provide pre-built event templates for common event types.

**Features:**

- Wedding template packages
- Corporate event templates
- Birthday party templates
- Custom template creation
- Template sharing marketplace

**Technical Approach:**

- Template model with configuration schema
- Template application to new events
- Community template submissions
- Template versioning

**Estimated Effort:** 2-3 weeks

## 15.4 Technical Improvements {#15.4-technical}

#### 15.4.1 Performance Optimization {#15.4.1-performance}

**Recommendations:**

- Implement database read replicas for query distribution
- Add GraphQL API layer for efficient data fetching
- Implement service worker for offline capability
- Add edge caching for API responses
- Optimize database queries with query analysis

#### 15.4.2 Security Enhancements {#15.4.2-security}

**Recommendations:**

- Implement rate limiting per user in addition to IP
- Add two-factor authentication (2FA) option
- Implement audit logging for compliance
- Add data encryption key rotation
- Regular penetration testing schedule

#### 15.4.3 Scalability Improvements {#15.4.3-scalability}

**Recommendations:**

- Implement horizontal pod autoscaling based on custom metrics
- Add message queue for event-driven architecture
- Implement database sharding for large-scale deployments
- Add CDN for dynamic content caching
- Implement circuit breaker patterns for external services

#### 15.4.4 Developer Experience {#15.4.4-devex}

**Recommendations:**

- Add Storybook for component documentation
- Implement API client SDK generation
- Add development environment containerization
- Implement feature flags for gradual rollouts
- Add comprehensive API documentation with examples

## 15.5 Enhancement Priority Matrix {#15.5-priority-matrix}

| Enhancement           | Priority | Effort   | Impact   | Dependencies |
| --------------------- | -------- | -------- | -------- | ------------ |
| Production Deployment | High     | 2 weeks  | Critical | None         |
| AI Planning Assistant | High     | 4 weeks  | High     | Production   |
| Real-Time Chat        | High     | 5 weeks  | High     | Production   |
| Vendor Marketplace    | Medium   | 8 weeks  | High     | Payments     |
| Payment Processing    | Medium   | 6 weeks  | High     | None         |
| Mobile Applications   | Medium   | 12 weeks | Medium   | Production   |
| Photo Sharing         | Medium   | 6 weeks  | Medium   | Production   |
| Calendar Integration  | Low      | 3 weeks  | Medium   | None         |
| Multi-Language        | Low      | 4 weeks  | Medium   | None         |
| Analytics Dashboard   | Low      | 3 weeks  | Medium   | Production   |
| Template Library      | Low      | 3 weeks  | Low      | None         |

## 15.6 Implementation Roadmap {#15.6-roadmap}

**Phase 1 (Immediate - 1-2 months):**

- Complete production environment deployment
- Implement AI planning assistant
- Add real-time chat functionality

**Phase 2 (Near-term - 3-6 months):**

- Develop vendor marketplace
- Integrate payment processing
- Add photo and video sharing

**Phase 3 (Mid-term - 6-12 months):**

- Release native mobile applications
- Implement calendar integrations
- Add multi-language support

**Phase 4 (Long-term - 12+ months):**

- Advanced analytics features
- Template marketplace
- Enterprise features and white-labeling

# 16.0 References {#16.0-references}

This section lists the technical references, documentation, and resources consulted during the development of the Party-Time application.

## 16.1 Framework Documentation {#16.1-frameworks}

### Frontend Technologies

1. **Next.js 15 Documentation**

   - Next.js Official Documentation
   - https://nextjs.org/docs
   - App Router, Server Components, API Routes

2. **React 19 Documentation**

   - React Official Documentation
   - https://react.dev
   - Hooks, Components, State Management

3. **TypeScript Documentation**

   - TypeScript Official Handbook
   - https://www.typescriptlang.org/docs
   - Type System, Generics, Utility Types

4. **Tailwind CSS v4 Documentation**

   - Tailwind CSS Official Documentation
   - https://tailwindcss.com/docs
   - Utility Classes, Configuration, Customization

5. **React Query (TanStack Query) Documentation**

   - TanStack Query Official Documentation
   - https://tanstack.com/query/latest
   - Server State Management, Caching, Mutations

6. **React Hook Form Documentation**

   - React Hook Form Official Documentation
   - https://react-hook-form.com
   - Form Handling, Validation Integration

7. **Zod Documentation**
   - Zod Official Documentation
   - https://zod.dev
   - Schema Validation, TypeScript Integration

### Backend Technologies

8. **FastAPI Documentation**

   - FastAPI Official Documentation
   - https://fastapi.tiangolo.com
   - API Development, OpenAPI, Async Support

9. **SQLAlchemy 2.0 Documentation**

   - SQLAlchemy Official Documentation
   - https://docs.sqlalchemy.org/en/20
   - ORM, Async Sessions, Relationships

10. **Alembic Documentation**

    - Alembic Official Documentation
    - https://alembic.sqlalchemy.org
    - Database Migrations, Autogenerate

11. **Pydantic v2 Documentation**

    - Pydantic Official Documentation
    - https://docs.pydantic.dev/latest
    - Data Validation, Serialization

12. **Celery Documentation**
    - Celery Official Documentation
    - https://docs.celeryq.dev
    - Task Queues, Scheduling, Workers

## 16.2 AWS Services Documentation {#16.2-aws}

13. **AWS Cognito Developer Guide**

    - Amazon Cognito Documentation
    - https://docs.aws.amazon.com/cognito
    - User Pools, Identity Pools, Authentication

14. **AWS ECS Developer Guide**

    - Amazon ECS Documentation
    - https://docs.aws.amazon.com/ecs
    - Fargate, Task Definitions, Services

15. **AWS RDS User Guide**

    - Amazon RDS Documentation
    - https://docs.aws.amazon.com/rds
    - PostgreSQL, Multi-AZ, Backups

16. **AWS ElastiCache User Guide**

    - Amazon ElastiCache Documentation
    - https://docs.aws.amazon.com/elasticache
    - Redis, Cluster Mode, Replication

17. **AWS SES Developer Guide**

    - Amazon SES Documentation
    - https://docs.aws.amazon.com/ses
    - Email Sending, Templates, DKIM

18. **AWS CloudFront Developer Guide**

    - Amazon CloudFront Documentation
    - https://docs.aws.amazon.com/cloudfront
    - CDN, Edge Locations, Caching

19. **AWS CloudWatch User Guide**

    - Amazon CloudWatch Documentation
    - https://docs.aws.amazon.com/cloudwatch
    - Metrics, Alarms, Dashboards, Logs

20. **AWS X-Ray Developer Guide**

    - AWS X-Ray Documentation
    - https://docs.aws.amazon.com/xray
    - Distributed Tracing, Service Maps

21. **AWS WAF Developer Guide**
    - AWS WAF Documentation
    - https://docs.aws.amazon.com/waf
    - Web Application Firewall, Managed Rules

## 16.3 Infrastructure Tools {#16.3-infrastructure}

22. **Terraform Documentation**

    - HashiCorp Terraform Documentation
    - https://developer.hashicorp.com/terraform
    - Infrastructure as Code, AWS Provider

23. **Docker Documentation**

    - Docker Official Documentation
    - https://docs.docker.com
    - Containers, Compose, Multi-stage Builds

24. **GitHub Actions Documentation**
    - GitHub Actions Documentation
    - https://docs.github.com/en/actions
    - CI/CD, Workflows, OIDC

## 16.4 Testing Frameworks {#16.4-testing}

25. **Jest Documentation**

    - Jest Official Documentation
    - https://jestjs.io/docs
    - Unit Testing, Mocking, Coverage

26. **React Testing Library Documentation**

    - Testing Library Documentation
    - https://testing-library.com/docs/react-testing-library
    - Component Testing, User Events

27. **Playwright Documentation**

    - Playwright Official Documentation
    - https://playwright.dev/docs
    - E2E Testing, Browser Automation

28. **pytest Documentation**
    - pytest Official Documentation
    - https://docs.pytest.org
    - Python Testing, Fixtures, Plugins

## 16.5 Third-Party APIs {#16.5-apis}

29. **Google Places API Documentation**

    - Google Maps Platform Documentation
    - https://developers.google.com/maps/documentation/places
    - Place Search, Details, Photos

30. **NextAuth.js Documentation**
    - NextAuth.js Official Documentation
    - https://next-auth.js.org
    - Authentication, Providers, Callbacks

## 16.6 Design and UI Libraries {#16.6-design}

31. **Fabric.js Documentation**

    - Fabric.js Official Documentation
    - http://fabricjs.com/docs
    - Canvas, Objects, Events

32. **Lucide Icons Documentation**

    - Lucide Icons Official Documentation
    - https://lucide.dev
    - Icon Library, React Components

33. **Chart.js Documentation**
    - Chart.js Official Documentation
    - https://www.chartjs.org/docs
    - Data Visualization, Charts

## 16.7 Standards and Best Practices {#16.7-standards}

34. **OWASP Top 10**

    - OWASP Foundation
    - https://owasp.org/Top10
    - Web Application Security Risks

35. **RESTful API Design**

    - REST API Tutorial
    - https://restfulapi.net
    - API Design Principles

36. **Twelve-Factor App**

    - Twelve-Factor Methodology
    - https://12factor.net
    - Cloud-Native Application Principles

37. **WCAG 2.1 Guidelines**
    - W3C Web Accessibility Initiative
    - https://www.w3.org/WAI/WCAG21
    - Accessibility Standards

## 16.8 Academic Resources {#16.8-academic}

38. **Software Engineering Body of Knowledge (SWEBOK)**

    - https://www.computer.org/education/bodies-of-knowledge/software-engineering
    - IEEE Computer Society
    - Software Engineering Standards and Practices

39. **Design Patterns: Elements of Reusable Object-Oriented Software**

    - https://www.javier8a.com/itc/bd1/articulo.pdf
    - Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994)
    - Addison-Wesley Professional
    - Gang of Four Design Patterns

40. **Clean Architecture**
    - https://raw.githubusercontent.com/sdcuike/Clean-Code-Collection-Books/master/Clean%20Architecture%20A%20Craftsman%27s%20Guide%20to%20Software%20Structure%20and%20Design.pdf
    - Martin, R. C. (2017)
    - Prentice Hall
    - Software Architecture Principles

## 16.9 AI Development Tools {#16.9-ai-tools}

The following AI tools were utilized during the development of this project for code generation, documentation, infrastructure planning, and content creation.

41. **Claude (Anthropic)**

    - Anthropic Claude AI
    - https://www.anthropic.com/claude
    - AI-assisted code generation, documentation writing assistance, infrastructure planning, GitHub assistance, and debugging

42. **GitHub Copilot**

    - GitHub Copilot Documentation
    - https://docs.github.com/en/copilot
    - AI pair programming, code completion, inline suggestions

43. **Amazon Q Developer**

    - Amazon Q Developer Documentation
    - https://aws.amazon.com/q/developer
    - AWS infrastructure assistance, code completion, cloud architecture guidance

44. **ChatGPT (OpenAI)**

    - OpenAI ChatGPT
    - https://chat.openai.com
    - Documentation assistance, Mermaid diagram generation for architecture charts

45. **Google Gemini**

    - Google Gemini AI
    - https://gemini.google.com
    - Image generation and visual content creation

---

_This Final Report was prepared for California State University, Fullerton_
_CPSC 491 - Senior Design Project_
_Author: Guido Asbun_
_December 2025_
