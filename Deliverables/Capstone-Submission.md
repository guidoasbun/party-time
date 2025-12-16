

Party-Time   
Event Planning   
Application

Table of Contents

[**Abstract	7**](#abstract)

[**Introduction	8**](#introduction)

[Problem Statement	8](#problem-statement)

[Project Motivation	8](#project-motivation)

[Goals and Objectives	9](#goals-and-objectives)

[Primary Goals	9](#primary-goals)

[Specific Objectives	9](#specific-objectives)

[Core Functionality:	9](#core-functionality:)

[User Experience and Interface	9](#user-experience-and-interface)

[Advanced Features	9](#advanced-features)

[Technical Implementations	10](#technical-implementations)

[High-Level Solution Description	10](#high-level-solution-description)

[**Metrics	12**](#metrics)

[Overview	12](#overview)

[Planned Metrics	12](#planned-metrics)

[Core Application Metrics	12](#core-application-metrics)

[Basic Usage Tracking	12](#basic-usage-tracking)

[Development Progress Metrics	13](#development-progress-metrics)

[Feature Completion	13](#feature-completion)

[Code Metrics	13](#code-metrics)

[Basic Performance	13](#basic-performance)

[Simple Performance Checks	13](#simple-performance-checks)

[Quality Metrics	14](#quality-metrics)

[Testing Coverage	14](#testing-coverage)

[Bug Tracking	14](#bug-tracking)

[Actual Metrics (To Be Completed)	14](#actual-metrics-\(to-be-completed\))

[Measurement Strategy for Actual Development	15](#measurement-strategy-for-actual-development)

[How Metrics Will Be Collected	15](#how-metrics-will-be-collected)

[Weekly Check ins	15](#weekly-check-ins)

[Tools for Metric Collection	15](#tools-for-metric-collection)

[Reality Check Process	15](#reality-check-process)

[Initial Risk Assessment	15](#initial-risk-assessment)

[Metrics Collection Timeline	15](#metrics-collection-timeline)

[Success Criteria for Metrics	16](#success-criteria-for-metrics)

[**Requirements Engineering	17**](#requirements-engineering)

[Overview	17](#overview-1)

[Stakeholder Analysis	17](#stakeholder-analysis)

[Use Cases	17](#use-cases)

[UC-1: User Registration and Authentication	17](#uc-1:-user-registration-and-authentication)

[UC-2: Create and Configure Event	18](#uc-2:-create-and-configure-event)

[UC-3: Venue Discovery and Selection	19](#uc-3:-venue-discovery-and-selection)

[UC-4: Guest List Management	20](#uc-4:-guest-list-management)

[UC-5: RSVP Management	21](#uc-5:-rsvp-management)

[UC-6: Budget Tracking and Management	22](#uc-6:-budget-tracking-and-management)

[Behavioral Modeling	23](#behavioral-modeling)

[System Activity Diagram \- Event Creation Flow	23](#system-activity-diagram---event-creation-flow)

[Sequence Diagram \- RSVP Submission Process	24](#sequence-diagram---rsvp-submission-process)

[State Modeling	24](#state-modeling)

[Event Lifecycle States	24](#event-lifecycle-states)

[Guest RSVP States	25](#guest-rsvp-states)

[Use Case Diagram	26](#use-case-diagram)

[Storyboards	26](#storyboards)

[Storyboard 1: First-Time Event Creation	26](#storyboard-1:-first-time-event-creation)

[Storyboard 2: Guest RSVP Experience	31](#storyboard-2:-guest-rsvp-experience)

[Formal Requirements Specification	36](#formal-requirements-specification)

[Functional Requirements	36](#functional-requirements)

[Non-Functional Requirements	37](#non-functional-requirements)

[Constraints and Assumptions	38](#constraints-and-assumptions)

[Technical Constraints	38](#technical-constraints)

[Business Constraints	38](#business-constraints)

[Assumptions	38](#assumptions)

[Requirements Prioritization	39](#requirements-prioritization)

[Priority 1 \- Core MVP (Weeks 1-8)	39](#priority-1---core-mvp-\(weeks-1-8\))

[Priority 2 \- Enhanced Features (Weeks 9-11)	39](#priority-2---enhanced-features-\(weeks-9-11\))

[Priority 3 \- Advanced Features (Weeks 12-13)	39](#priority-3---advanced-features-\(weeks-12-13\))

[**Architecture and Design	40**](#architecture-and-design)

[Overview	40](#overview-2)

[Architecture Pattern Selection	40](#architecture-pattern-selection)

[Microservices Architecture (Backend)	40](#microservices-architecture-\(backend\))

[Component-Based Architecture (Frontend)	40](#component-based-architecture-\(frontend\))

[Design Patterns Implementation	41](#design-patterns-implementation)

[Repository Pattern (Data Access Layer)	41](#repository-pattern-\(data-access-layer\))

[Observer Pattern (Real-time Updates)	45](#observer-pattern-\(real-time-updates\))

[Factory Pattern (Service Creation)	48](#factory-pattern-\(service-creation\))

[TypeScript Frontend Architecture	51](#typescript-frontend-architecture)

[Type System Design with Validation	51](#type-system-design-with-validation)

[API Client with Comprehensive Error Handling	53](#api-client-with-comprehensive-error-handling)

[Custom Hooks with Proper Cleanup	60](#custom-hooks-with-proper-cleanup)

[System Architecture Diagrams	64](#system-architecture-diagrams)

[High-Level System Architecture	64](#high-level-system-architecture)

[Component Architecture with TypeScript	66](#component-architecture-with-typescript)

[Sequence Diagram \- Production Event Creation Flow	67](#sequence-diagram---production-event-creation-flow)

[Database Design with Optimization	69](#database-design-with-optimization)

[Entity Relationship with Indexes and Constraints	69](#entity-relationship-with-indexes-and-constraints)

[Security Architecture	72](#security-architecture)

[Defense in Depth Implementation	72](#defense-in-depth-implementation)

[Configuration Management	76](#configuration-management)

[Deployment Configuration	79](#deployment-configuration)

[Docker Configuration with Multi-stage Build	79](#docker-configuration-with-multi-stage-build)

[Terraform Infrastructure as Code	80](#terraform-infrastructure-as-code)

[Technology Stack Justification	85](#technology-stack-justification)

[References	85](#references)

[**UX-Design	87**](#ux-design)

[Overview	87](#overview-3)

[Design Philosophy and Principles	87](#design-philosophy-and-principles)

[Core UX Principles	87](#core-ux-principles)

[Visual Design System	87](#visual-design-system)

[Color Palette	87](#color-palette)

[Typography	88](#typography)

[Spacing and Layout Grid	88](#spacing-and-layout-grid)

[User Research and Personas	89](#user-research-and-personas)

[Primary Persona: Sarah Chen	89](#primary-persona:-sarah-chen)

[Secondary Persona: Michael Rodriguez	89](#secondary-persona:-michael-rodriguez)

[Tertiary Persona: Emma Thompson	90](#tertiary-persona:-emma-thompson)

[Information Architecture	91](#information-architecture)

[Site Map Structure	91](#site-map-structure)

[Navigation Hierarchy	91](#navigation-hierarchy)

[User Flow Diagrams	92](#user-flow-diagrams)

[Critical Path 1: New User Event Creation	92](#critical-path-1:-new-user-event-creation)

[Critical Path 2: Guest RSVP Journey	92](#critical-path-2:-guest-rsvp-journey)

[Critical Path 3: Budget Management Flow	92](#critical-path-3:-budget-management-flow)

[Interaction Patterns	93](#interaction-patterns)

[Form Design Patterns with TypeScript	93](#form-design-patterns-with-typescript)

[Inline Editing (Guest List):	96](#inline-editing-\(guest-list\):)

[Feedback Mechanisms with TypeScript	99](#feedback-mechanisms-with-typescript)

[Toast Notifications:	99](#toast-notifications:)

[Error Handling:	101](#error-handling:)

[Mobile Interactions	104](#mobile-interactions)

[Component Library with TypeScript	104](#component-library-with-typescript)

[Type Definitions	104](#type-definitions)

[Core UI Components	105](#core-ui-components)

[Event Card Component:	107](#event-card-component:)

[Custom Components with TypeScript	110](#custom-components-with-typescript)

[RSVP Counter:	112](#rsvp-counter:)

[Accessibility Considerations	113](#accessibility-considerations)

[WCAG 2.1 Level AA Compliance	113](#wcag-2.1-level-aa-compliance)

[Motion and Animation	114](#motion-and-animation)

[Micro-interactions	114](#micro-interactions)

[Celebratory Animations	115](#celebratory-animations)

[Error Prevention and Recovery with TypeScript	115](#error-prevention-and-recovery-with-typescript)

[Validation Strategies	115](#validation-strategies)

[Confirmation Dialog Component:	117](#confirmation-dialog-component:)

[Auto-save Functionality:	120](#auto-save-functionality:)

[Performance Optimization	122](#performance-optimization)

[Perceived Performance	122](#perceived-performance)

[Loading Strategies	122](#loading-strategies)

[References	122](#references-1)

[**Prototype	123**](#prototype)

[Overview	123](#overview-4)

[Current Implementation Status	123](#current-implementation-status)

[Completed Core Features	123](#completed-core-features)

[Technical Infrastructure	124](#technical-infrastructure)

[User Interface Screenshots	124](#user-interface-screenshots)

[Landing Page	124](#landing-page)

[Registration Flow	125](#registration-flow)

[Event Dashboard	125](#event-dashboard)

[Event Creation Form	125](#event-creation-form)

[Guest Management Interface	126](#guest-management-interface)

[Guest RSVP Portal	126](#guest-rsvp-portal)

[Feature Demonstrations	126](#feature-demonstrations)

[Core Workflow: Event Creation to RSVP	126](#core-workflow:-event-creation-to-rsvp)

[Data Validation and Error Handling	127](#data-validation-and-error-handling)

[Technical Implementation Details	128](#technical-implementation-details)

[Database Schema Implementation	128](#database-schema-implementation)

[API Endpoints Implemented	128](#api-endpoints-implemented)

[Performance Metrics	129](#performance-metrics)

[Limitations and Known Issues	129](#limitations-and-known-issues)

[Current Limitations	129](#current-limitations)

[Known Bugs	130](#known-bugs)

[Deployment and Access	130](#deployment-and-access)

[Local Development Setup	130](#local-development-setup)

[Staging Environment	131](#staging-environment)

[Demo Credentials	131](#demo-credentials)

[Video Demonstration	131](#video-demonstration)

[Development Metrics Achieved	132](#development-metrics-achieved)

[Code Metrics	132](#code-metrics-1)

[Development Progress	132](#development-progress)

[Next Steps and Roadmap	132](#next-steps-and-roadmap)

[Immediate Priorities (Weeks 9-10)	132](#immediate-priorities-\(weeks-9-10\))

[Phase 2 Features (Weeks 11-12)	132](#phase-2-features-\(weeks-11-12\))

[Phase 3 Enhancements (Week 13\)	132](#phase-3-enhancements-\(week-13\))

[Conclusion	133](#conclusion)

# Abstract {#abstract}

Party-Time is a cloud-native event planning web application designed to streamline the entire event management lifecycle, from initial planning through execution and post-event analytics. The project addresses the fragmented nature of current event planning tools by providing a unified platform that integrated venue discovery through Google Places API, intelligent guest management with Excel import capabilities, real time budget tracking, vendor coordination, and AI powered planning assistance through Claude integrations. Built on a modern technology stack featuring FastAPI backend, [Next.JS](http://Next.JS) frontend, and PostgreSQL / Dynamo DB hybrid database architecture, the application emphasizes robust DevOps practices as its core differentiator. The infrastructure leverages comprehensive AWS cloud services including ECS with Fargate for container orchestration, Terraform for infrastructure as code, and automated CI/CD pipelines through GitHub actions, ensuring scalability, reliability, and efficient deployment workflows. The project follows a three phase development approach over 16 weeks, with phase 1 establishing the MVP and DevOps foundation including complete infrastructure automation and monitoring. Phase 2 enhances business logic with budget tracking and vendor management. Phase 3 introduces advanced features such as interactive seating charts in real time communications. Current progress includes completed infrastructure planning with Terraform modules, Docker containerization setup, initial database schema design, and prototype development of core authentication and event management features. The expected outcome is a production ready application demonstrating enterprise-grade DevOps practices, automated development capabilities, comprehensive monitoring and security implementations, and scalable architecture capable of supporting thousands of concurrent users while maintaining sub second response times.

# Introduction {#introduction}

## Problem Statement {#problem-statement}

The event planning industry faces a significant challenge with fragmented digital tools that force planners to juggle multiple disconnected platforms for different aspects of event management. Current solutions require event organizers to switch between separate applications for venue discovery, guest list management, vendor coordination, budget tracking, and communication with stakeholders. This fragmentation leads to data silos, increased risk of errors, duplicated efforts, and inefficient workflows that can compromise the success of events ranging from intimate gatherings to large-scale corporate functions.

Additionally, event planners often struggle with real-time coordination among multiple stakeholders ( venues, vendors, and guests)  who all need access to different levels of information at various stages of the planning process. The lack of integrated communication channels and centralized information management creates confusion, missed deadlines, and increased stress during what should be a celebratory planning experience.

## Project Motivation {#project-motivation}

The motivation for Party-Time stems from personal observation of the challenges faced by friends and family when planning significant life events. Watching loved ones struggle to coordinate weddings, milestone birthdays, and graduation celebrations across spreadsheets, email chains, and various booking platforms highlighted the need for a unified solution. The stress of managing RSVPs through one platform, tracking budgets in spreadsheets, coordinating with vendors via email, and searching for venues across multiple websites detracts from the joy of planning meaningful celebrations.

This project presents an opportunity to apply full stack development skills to solve a real world problem that affects millions of people annually. By creating a comprehensive event planning platform, Party Time aims to transform the planning experience from a fragmented, stressful process into an organized, enjoyable journey. The technical complexity of integrating multiple services, handling real-time data, managing file uploads, and coordinating between different user types provides an ideal challenge for demonstrating modern web development capabilities.

Furthermore, implementing this solution with cloud-native architecture and automated deployment practices ensures the application can scale to meet user demand while maintaining reliability during critical moments like RSVP deadlines or vendor booking windows.

## Goals and Objectives {#goals-and-objectives}

### Primary Goals {#primary-goals}

1. **Comprehensive Event Management**: Create a unified platform that seamlessly integrates all aspects of event planning, from initial conceptualization through post-event follow-up, eliminating the need for multiple disconnected tools.  
2. **Intuitive User Experience**: Develop an interface that is accessible to users of all technical abilities, making complex event coordination feel simple and enjoyable through thoughtful design and smart automation.  
3. **Reliable and Scalable Platform**: Build a robust application using modern technologies and best practices to ensure consistent performance, data security, and the ability to grow with user demand.

## Specific Objectives {#specific-objectives}

### Core Functionality: {#core-functionality:}

* Develop a complete event lifecycle management system supporting various event types (weddings, birthdays, corporate events, graduations, and celebrations)  
* Create an intelligent guest management system with Excel import capabilities, RSVP tracking, dietary restrictions, and seating arrangements  
* Implement comprehensive budget tracking with real-time updates, category breakdowns, and expense analytics  
* Build a vendor management system for coordinating with caterers, photographers, florists, and other service providers  
* Integrate Google Places API for venue discovery with filtering by capacity, amenities, and availability

### User Experience and Interface {#user-experience-and-interface}

* Design a responsive, interface that works seamlessly across all devices  
* Create intuitive drag and drop interfaces for seating charts and guest list management  
* Implement real-time notifications for RSVPs, vendor updates, and approaching deadlines  
* Develop customizable event templates for quick setup of common event types  
* Build interactive dashboards providing at-a-glance views of event status and tasks

### Advanced Features {#advanced-features}

* Integrate Claude AI for intelligent planning assistance and personalized recommendations  
* Implement real time chat rooms for communication between planners, vendors, and guests  
* Create automated timeline generation based on event type and date  
* Develop photo and video sharing galleries for guest contributions  
* Build calendar synchronization with Google Calendar for deadline management

### Technical Implementations {#technical-implementations}

* Design a RESTful API with FastAPI providing clear separation between frontend and backend  
* Implement secure authentication using AWS Cognito with support for social login  
* Create efficient data models using PostgreSQL for relational data and DynamoDB for flexible content  
* Establish automated testing covering unit, integration, and end-to-end scenarios  
* Deploy using containerized architecture with Docker and AWS ECS for consistency across environments  
* Implement infrastructure as code using Terraform for reproducible deployments  
* Set up CI/CD pipelines with GitHub Actions for automated testing and deployment  
* Configure comprehensive monitoring and error tracking for proactive issue resolution

## High-Level Solution Description {#high-level-solution-description}

Party Time is a full stack web application that reimagines event planning through intelligent integration and thoughtful user experience design. The solution brings together all stakeholders in the event planning process onto a single platform, each with appropriate access levels and tailored interfaces for their specific needs.

At its core, the application provides event planners with a centralized dashboard where they can manage every aspect of their event. From this hub, planners can search for and book venues using integrated Google Places data, manage their guest lists with bulk import options, coordinate with multiple vendors, track budgets in real-time, and create interactive seating arrangements. The system automatically generates planning timelines based on the event type and sends reminders for important milestones, reducing the mental load on planners.

Guests interact with the platform through a simplified interface focused on their needs: RSVP management, dietary preference submission, viewing event details, and participating in event-specific chat rooms. They can also contribute to shared photo galleries and receive important updates about the event. The guest experience is designed to be frictionless, requiring minimal technical knowledge while keeping them engaged and informed.

Vendors access a specialized portal where they can manage their service offerings, communicate with planners, update their availability, and handle payment arrangements. This dedicated interface streamlines the traditionally cumbersome vendor coordination process, reducing back-and-forth communications and ensuring all parties stay aligned.

The technical architecture leverages modern web technologies to ensure performance and reliability. The frontend, built with Next.js and React, provides a dynamic, responsive interface with real-time updates. The backend API, developed with FastAPI, handles complex business logic, data validation, and third-party integrations efficiently. The infrastructure utilizes AWS cloud services for scalability, with containerized deployments ensuring consistency across development and production environments.

The development timeline spans 13 weeks, divided into three strategic phases. 

* Phase 1 focuses on establishing core functionality including user authentication, basic event management, guest lists, and RSVP systems while setting up the complete infrastructure and deployment pipeline.   
* Phase 2 enhances the platform with budget tracking, vendor management, and planning tools.  
* Phase 3 introduces advanced features like AI assistance, real-time communication, and interactive visualizations.

By addressing the fragmented nature of current event planning tools, Party-Time offers a comprehensive solution that not only simplifies the planning process but also enhances the entire event experience for all participants. The platform demonstrates how modern full-stack development can solve complex real-world problems while maintaining high standards for user experience, performance, and reliability.

# Metrics {#metrics}

## Overview {#overview}

The Party-Time application employs a practical metrics strategy focused on tracking essential development progress and application functionality throughout the 13-week development timeline. Given the scope of a solo capstone project, our metrics prioritize actionable data that can be realistically collected without overwhelming the development process. The framework balances the need for meaningful measurements with the practical constraints of student project development.

These metrics serve to demonstrate project progress, validate core functionality, and provide evidence of technical learning. Rather than attempting enterprise-level monitoring, we focus on key indicators that can be gathered through basic logging, simple analytics, and development tools already integrated into our workflow.

## Planned Metrics {#planned-metrics}

### Core Application Metrics {#core-application-metrics}

#### Basic Usage Tracking {#basic-usage-tracking}

**Event Creation Count**: Total number of test events created

* Target: 15-20 test events by project completion  
* Rationale: Demonstrates working CRUD operations  
* Collection Method: Simple database count query

**User Registration**: Total registered test users

* Target: 10-15 test accounts  
* Rationale: Validates authentication system  
* Collection Method: AWS Cognito dashboard

**RSVP Functionality**: Basic RSVP submissions

* Target: Demonstrate working RSVP for 5 test events  
* Rationale: Proves core feature functionality  
* Collection Method: Database records

**File Upload Success**: Guest list Excel imports

* Target: Successfully process 3-5 test files  
* Rationale: Validates file handling capability  
* Collection Method: Manual testing logs

### Development Progress Metrics {#development-progress-metrics}

#### Feature Completion {#feature-completion}

**MVP Features Completed**: Percentage of Phase 1 features

* Target: 100% of MVP features  
* Rationale: Ensures core functionality delivery  
* Collection Method: GitHub issue tracking

**Stretch Features Attempted**: Phase 2/3 features started

* Target: 30-50% of enhanced features  
* Rationale: Shows project ambition within constraints  
* Collection Method: Project board tracking

#### Code Metrics {#code-metrics}

**Lines of Code**: Rough project size indicator

* Target: 5,000-8,000 lines (excluding dependencies)  
* Rationale: Demonstrates substantial work  
* Collection Method: GitHub statistics

**Number of Components/Endpoints**:

* Target: 15-20 React components, 10-15 API endpoints  
* Rationale: Shows application complexity  
* Collection Method: Manual count

### Basic Performance {#basic-performance}

#### Simple Performance Checks {#simple-performance-checks}

**Page Load**: Basic load time for main pages

* Target: \<5 seconds on local development  
* Rationale: Ensures usable application  
* Collection Method: Browser DevTools

**API Response**: Basic endpoint response times

* Target: \<1 second for simple queries  
* Rationale: Validates backend functionality  
* Collection Method: FastAPI automatic docs testing

**Database Queries**: Basic query performance

* Target: No queries over 2 seconds  
* Rationale: Ensures reasonable performance  
* Collection Method: PostgreSQL logs during development

### Quality Metrics {#quality-metrics}

#### Testing Coverage {#testing-coverage}

**Unit Tests Written**: Number of test cases

* Target: 20-30 unit tests for critical functions  
* Rationale: Demonstrates testing knowledge  
* Collection Method: Pytest/Jest output

**Manual Testing Completed**: Test scenarios executed

* Target: 10 end-to-end test scenarios documented  
* Rationale: Shows thorough testing approach  
* Collection Method: Testing documentation

#### Bug Tracking {#bug-tracking}

**Known Issues**: Documented bugs

* Target: Maintain list of known issues with priorities  
* Rationale: Shows professional development approach  
* Collection Method: GitHub Issues

## Actual Metrics (To Be Completed) {#actual-metrics-(to-be-completed)}

*\*This section will be populated with real metrics as development progresses through the timeline. Weekly updates will include:\**

* Feature implementation status  
* Code repository statistics  
* Testing coverage reports  
* Performance measurements  
* Development velocity tracking 

*\*The metrics framework is in place to begin data collection when coding starts in Week 2\.\**

## Measurement Strategy for Actual Development {#measurement-strategy-for-actual-development}

### How Metrics Will Be Collected {#how-metrics-will-be-collected}

#### Weekly Check ins {#weekly-check-ins}

Starting in Week 2, metrics will be collected every Friday including:

* Feature completion status (planned vs actual)  
* Lines of code written  
* Tests written and passing  
* Blockers encountered

#### Tools for Metric Collection {#tools-for-metric-collection}

* GitHub commits and issues for tracking progress  
* Simple spreadsheet for weekly metrics  
* Screenshots of working features  
* Time tracking for effort estimation

### Reality Check Process {#reality-check-process}

Each week, I will assess:

1. Are my initial estimates realistic?  
2. Which features need to be simplified?  
3. What's taking longer than expected?  
4. What's easier than anticipated? 

This iterative assessment will ensure the project remains achievable within the timeline. 

### Initial Risk Assessment {#initial-risk-assessment}

Based on preliminary research, high-risk items include:

* AWS deployment (no prior experience)  
* Email integration (external service complexity)  
* File upload/parsing (security and error handling concerns)  
* Real-time features (may need to be cut if time runs short) 

*\*Note: Actual progress metrics will be added in future documentation updates as development proceeds.\**

## Metrics Collection Timeline {#metrics-collection-timeline}

* **Week 1**: Documentation and planning (current phase)  
* **Week 2-4**: Initial development metrics \- basic features  
* **Week 5-8**: Mid-project metrics \- core functionality complete  
* **Week 9-12**: Advanced features and optimization metrics  
* **Week 13**: Final metrics and project summary

### Success Criteria for Metrics {#success-criteria-for-metrics}

Minimum viable metrics to demonstrate project success:

* At least 10 test events created successfully  
* 5+ working API endpoints with \< 1 second response time  
* 3 complete user workflows (register, create event, RSVP)  
* Documentation for all implemented features \- Successful deployment to at least staging environment

# Requirements Engineering {#requirements-engineering}

## Overview {#overview-1}

The requirements engineering process for Party Time follows a systematic approach to capture, analyze, and document the needs of all stakeholders involved in event planning. This section presents the functional and non-functional requirements derived through use case analysis, behavioral modeling, and scenario development. The requirements have been refined through iterative analysis of user needs, technical constraints, and project scope considerations within the development timeline.

## Stakeholder Analysis {#stakeholder-analysis}

**Event Planners** (Primary Users)

* Individuals organizing personal or professional events  
* Need comprehensive tools for managing all aspects of event planning  
* Require real-time updates and communication capabilities  
* Value time saving features and automation

**Guests** (Secondary Users)

* Invitees to events who need to RSVP and access event information  
* Require simple, intuitive interfaces without mandatory registration  
* Need clear communication about event details and updates

**Vendors** (Tertiary Users)

* Service providers (caterers, photographers, florists) coordinating with planners  
* Need efficient communication channels and clear service requirements  
* Require payment tracking and schedule management

**System Administrators**

* Responsible for platform maintenance and user support  
* Need monitoring tools and administrative controls  
* Require access to system metrics and user management capabilities

## Use Cases {#use-cases}

### UC-1: User Registration and Authentication {#uc-1:-user-registration-and-authentication}

**Primary Actor:** New User (Event Planner)

**Description:** A new user creates an account on Party Time using either email registration or Google OAuth authentication through AWS Cognito. The system validates user information, creates a user profile, and grants appropriate access permissions based on the selected role.

**Preconditions:**

* User has internet access and a valid email address  
* System authentication service is operational  
* User accepts terms of service

**Main Flow:**

1. User navigates to the registration page  
2. User selects registration method (email or Google OAuth)  
3. If email registration: User provides email, password, and basic information  
4. If Google OAuth: User authorizes Party-Time to access Google profile  
5. System validates provided information  
6. System creates user account in database  
7. System sends verification email (if email registration)  
8. User verifies email address  
9. System activates account and redirects to dashboard

**Postconditions:**

* User account is created and stored in the database  
* User profile is initialized with default settings  
* User is authenticated and granted access to the platform  
* Audit log records account creation

**Alternative Flows:**

* A1: Email already exists \- System prompts for password reset  
* A2: Invalid email format \- System displays validation error  
* A3: Weak password \- System requests stronger password  
* A4: Google OAuth fails \- System falls back to email registration

### UC-2: Create and Configure Event {#uc-2:-create-and-configure-event}

**Primary Actor:** Event Planner

**Description:** An authenticated event planner creates a new event by providing essential details including event type, date, location, and basic configuration. The system initializes event-specific features based on the selected event type and generates a planning timeline.

**Preconditions:**

* User is authenticated as an event planner  
* User has completed profile setup  
* Database connection is active

**Main Flow:**

1. Planner navigates to "Create Event" page  
2. Planner selects event type (wedding, birthday, corporate, etc.)  
3. System displays type-specific form fields  
4. Planner enters event details:  
   * Event name and description  
   * Date and time  
   * Expected guest count  
   * Location (manual entry or venue search)  
5. Planner sets privacy settings and access permissions  
6. System validates all required fields  
7. System creates event record in database  
8. System generates planning timeline based on event date  
9. System initializes budget categories for selected event type  
10. System redirects planner to event dashboard

**Postconditions:**

* Event is created with unique identifier  
* Planning timeline is generated  
* Budget tracking is initialized  
* Event appears in planner's dashboard  
* System logs event creation

**Alternative Flows:**

* A1: Past date selected \- System requires confirmation or date correction  
* A2: Venue search selected \- Trigger UC-3 (Venue Discovery)  
* A3: Required fields missing \- System highlights missing information

### UC-3: Venue Discovery and Selection {#uc-3:-venue-discovery-and-selection}

**Primary Actor:** Event Planner

**Description:** Event planner searches for suitable venues using integrated Google Places API, filtering by location, capacity, amenities, and availability. The system displays venue options with relevant details and allows the planner to select and save venue information to their event.

**Preconditions:**

* User has created an event  
* Google Places API is accessible  
* User has specified event location preferences

**Main Flow:**

1. Planner accesses venue search from event dashboard  
2. Planner enters search criteria:  
   * Location or area  
   * Capacity requirements  
   * Desired amenities  
   * Date requirements  
3. System queries Google Places API with parameters  
4. System retrieves and filters venue results  
5. System displays venues with:  
   * Photos and descriptions  
   * Capacity information  
   * Available amenities  
   * Contact information  
6. Planner reviews venue options  
7. Planner selects preferred venue  
8. System saves venue information to event  
9. System updates event dashboard with venue details

**Postconditions:**

* Venue information is associated with event  
* Venue details are stored in database  
* Event timeline updates with venue-related tasks  
* Venue contact information is accessible

**Alternative Flows:**

* A1: No venues match criteria \- System suggests broadening search  
* A2: API rate limit reached \- System uses cached results  
* A3: Manual venue entry \- Planner inputs custom venue details

### UC-4: Guest List Management {#uc-4:-guest-list-management}

**Primary Actor:** Event Planner

**Description:** Planner manages event guest list through manual entry or bulk import from Excel files. The system processes guest information, validates data, manages duplicates, and provides tools for categorizing and organizing guests.

**Preconditions:**

* Event has been created  
* User has guest information available  
* File upload service is operational (for imports)

**Main Flow:**

1. Planner navigates to guest management section  
2. Planner chooses input method:  
   * Manual entry for individual guests  
   * Excel import for bulk additions  
3. For manual entry:  
   * Planner enters guest details (name, email, phone)  
   * Planner assigns guest categories (family, friends, colleagues)  
   * System validates contact information  
4. For Excel import:  
   * Planner uploads Excel file  
   * System parses file using Papa Parse  
   * System validates data format and content  
   * System identifies potential duplicates  
   * Planner reviews and confirms import  
5. System saves guest information to database  
6. System updates guest count statistics  
7. System generates unique RSVP links for each guest

**Postconditions:**

* Guest list is populated with validated data  
* Each guest has unique identifier and RSVP link  
* Guest categories are established  
* Import log is created (if applicable)

**Alternative Flows:**

* A1: Invalid file format \- System provides format requirements  
* A2: Duplicate guests detected \- System prompts for merge/skip decision  
* A3: Missing required fields \- System highlights incomplete entries

### UC-5: RSVP Management {#uc-5:-rsvp-management}

**Primary Actor:** Guest

**Description:** Invited guests respond to event invitations through personalized RSVP links, providing attendance confirmation, dietary preferences, and plus-one information. The system tracks responses and updates the event dashboard in real-time.

**Preconditions:**

* Guest has received invitation with RSVP link  
* Event is active and accepting RSVPs  
* RSVP deadline has not passed

**Main Flow:**

1. Guest clicks personalized RSVP link from invitation  
2. System loads RSVP page with guest information pre-filled  
3. Guest selects attendance status:  
   * Attending  
   * Not attending  
   * Maybe  
4. If attending:  
   * Guest provides dietary restrictions (if applicable)  
   * Guest indicates plus-one (if allowed)  
   * Guest enters additional preferences  
5. Guest submits RSVP response  
6. System validates response data  
7. System updates guest status in database  
8. System sends confirmation email to guest  
9. System updates event dashboard with new RSVP count  
10. System notifies planner of RSVP (if configured)

**Postconditions:**

* RSVP response is recorded in database  
* Guest receives confirmation of their response  
* Event statistics are updated  
* Planner can view updated guest list

**Alternative Flows:**

* A1: RSVP deadline passed \- System displays closed message  
* A2: Invalid RSVP link \- System shows error page  
* A3: Guest changes RSVP \- System allows updates until deadline

### UC-6: Budget Tracking and Management {#uc-6:-budget-tracking-and-management}

**Primary Actor:** Event Planner

**Description:** Planner tracks event expenses across multiple categories, monitors budget versus actual spending, and receives alerts for budget thresholds. The system provides real-time budget analytics and expense breakdowns.

**Preconditions:**

* Event has been created  
* Budget categories are initialized  
* User has expense information

**Main Flow:**

1. Planner accesses budget section from event dashboard  
2. Planner sets total budget amount  
3. Planner allocates budget to categories:  
   * Venue  
   * Catering  
   * Decorations  
   * Entertainment  
   * Other  
4. Planner adds expenses:  
   * Selects category  
   * Enters amount and description  
   * Attaches vendor information (optional)  
   * Marks as paid/unpaid  
5. System calculates running totals  
6. System compares actual to budgeted amounts  
7. System displays visual budget analytics:  
   * Pie charts by category  
   * Progress bars for each category  
   * Total spent vs. remaining  
8. System alerts if category exceeds allocation

**Postconditions:**

* Expenses are recorded and categorized  
* Budget analytics are updated  
* Spending trends are available  
* Payment status is tracked

**Alternative Flows:**

* A1: Budget exceeded \- System sends alert to planner  
* A2: New category needed \- Planner creates custom category  
* A3: Expense deleted \- System recalculates totals

## Behavioral Modeling {#behavioral-modeling}

### System Activity Diagram \- Event Creation Flow {#system-activity-diagram---event-creation-flow}

The event creation process involves multiple decision points and parallel activities that establish the foundation for all subsequent event management activities. The flow begins with user authentication and proceeds through event configuration, optional venue selection, and automated timeline generation.

Key behavioral aspects:

* Conditional flows based on event type selection  
* Parallel initialization of budget categories and timeline tasks  
* Integration points with external services (Google Places API)  
* Automatic feature activation based on event configuration

### Sequence Diagram \- RSVP Submission Process {#sequence-diagram---rsvp-submission-process}

The RSVP process represents a critical guest-facing interaction involving:

1. Guest authentication via unique RSVP link  
2. Form rendering with pre-populated guest information  
3. Validation of guest responses  
4. Real-time dashboard updates  
5. Notification dispatching to event planner  
6. Confirmation email generation

This sequence ensures data integrity while providing immediate feedback to both guests and planners.

## State Modeling {#state-modeling}

### Event Lifecycle States {#event-lifecycle-states}

**Draft State**

* Initial state when event is created  
* Allows full editing of all event properties  
* No invitations can be sent  
* Transitions to: Active, Cancelled

**Active State**

* Event is fully configured and live  
* Invitations can be sent  
* RSVPs are accepted  
* Limited editing allowed  
* Transitions to: Completed, Cancelled

**Completed State**

* Event date has passed  
* No new RSVPs accepted  
* Read-only access to event data  
* Analytics and reports available  
* Transitions to: Archived

**Cancelled State**

* Event has been cancelled by planner  
* Notifications sent to confirmed guests  
* No further modifications allowed  
* Transitions to: Archived

**Archived State**

* Final state for long-term storage  
* Accessible for historical reference  
* Cannot be reactivated  
* No transitions available

### Guest RSVP States {#guest-rsvp-states}

**Invited**

* Initial state when guest is added  
* Invitation may or may not be sent  
* Transitions to: Responded, Expired

**Responded**

* Guest has submitted RSVP  
* Can be: Attending, Not Attending, Maybe  
* Can be modified until deadline  
* Transitions to: Confirmed, Expired

**Confirmed**

* RSVP is finalized (after deadline or lock)  
* No further changes allowed  
* Used for final headcount  
* Transitions to: Attended, No-Show

**Expired**

* RSVP deadline passed without response  
* Treated as "Not Attending"  
* Cannot be modified  
* Terminal state

## Use Case Diagram {#use-case-diagram}

The Party-Time use case diagram illustrates the primary interactions between actors and system functionality:

**Event Planner** (Primary Actor)

* Manages complete event lifecycle  
* Has access to all event-related features  
* Can delegate specific permissions to other users

**Guest** (Secondary Actor)

* Limited interaction focused on RSVP and event information  
* No account required for basic functionality  
* Can access shared galleries and event details

**Vendor** (Supporting Actor)

* Manages service offerings and availability  
* Communicates with event planners  
* Tracks payment and service delivery

**System Administrator** (System Actor)

* Monitors platform health and performance  
* Manages user accounts and permissions  
* Handles support escalations

## Storyboards {#storyboards}

### **Storyboard 1: First-Time Event Creation** {#storyboard-1:-first-time-event-creation}

**Panel 1: Landing Page**

* New user arrives at Party-Time homepage  
* Clear value proposition displayed  
* Prominent "Start Planning" call-to-action

![][image1]

**Panel 2: Quick Registration**

* Streamlined registration with Google OAuth option  
* Minimal required fields for quick start  
* Clear privacy and security messaging

![][image2]

**Panel 3: Event Type Selection**

* Visual cards for different event types  
* Each card shows relevant features  
* Helpful tooltips for guidance

![][image3]

**Panel 4: Event Configuration**

* Clean form with smart defaults  
* Progressive disclosure of advanced options  
* Real-time validation feedback

![][image4]

**Panel 5: Success Dashboard**

* Newly created event dashboard  
* Clear next steps highlighted  
* Progress tracker showing completion

![][image5]

### **Storyboard 2: Guest RSVP Experience** {#storyboard-2:-guest-rsvp-experience}

**Panel 1: Email Invitation**

* Beautifully designed invitation email  
* Clear event details and RSVP button  
* Mobile-optimized layout

![][image6]

**Panel 2: RSVP Landing**

* Personalized greeting with guest name  
* Event details summary  
* Simple response options

![][image7]

**Panel 3: Additional Information**

* Dietary restrictions form (if attending)  
* Plus-one option (if available)  
* Special requests field

![][image8]

**Panel 4: Confirmation**

* Thank you message  
* Summary of responses  
* Calendar download option

![][image9]

**Panel 5: Reminder Option**

* Option to set reminder  
* Share event with others  
* View event website

![][image10]

## **Formal Requirements Specification** {#formal-requirements-specification}

### **Functional Requirements** {#functional-requirements}

**FR-1: User Management**

* FR-1.1: System shall support user registration via email and Google OAuth  
* FR-1.2: System shall maintain three user roles: Admin, Planner, Guest  
* FR-1.3: System shall enforce role-based access control for all features  
* FR-1.4: System shall support password reset via email verification

**FR-2: Event Management**

* FR-2.1: System shall support creation of events with required fields: name, date, type, location  
* FR-2.2: System shall generate unique identifiers for each event  
* FR-2.3: System shall maintain event state throughout lifecycle  
* FR-2.4: System shall auto-generate planning timelines based on event type and date

**FR-3: Guest Management**

* FR-3.1: System shall support manual guest entry with name and contact information  
* FR-3.2: System shall process Excel file imports for bulk guest additions  
* FR-3.3: System shall detect and handle duplicate guest entries  
* FR-3.4: System shall generate unique RSVP links for each guest

**FR-4: RSVP Processing**

* FR-4.1: System shall accept RSVP responses without requiring guest registration  
* FR-4.2: System shall track attendance status: Attending, Not Attending, Maybe  
* FR-4.3: System shall collect dietary restrictions and plus-one information  
* FR-4.4: System shall send confirmation emails for all RSVP submissions

**FR-5: Venue Integration**

* FR-5.1: System shall search venues using Google Places API  
* FR-5.2: System shall filter venues by capacity, location, and amenities  
* FR-5.3: System shall display venue photos, descriptions, and contact information  
* FR-5.4: System shall allow manual venue entry

**FR-6: Budget Management**

* FR-6.1: System shall track expenses across predefined categories  
* FR-6.2: System shall calculate budget versus actual spending  
* FR-6.3: System shall provide visual budget analytics  
* FR-6.4: System shall alert when budget thresholds are exceeded

### **Non-Functional Requirements** {#non-functional-requirements}

**NFR-1: Performance**

* NFR-1.1: System shall respond to API requests within 1 second under normal load  
* NFR-1.2: System shall support 100 concurrent users without degradation  
* NFR-1.3: System shall process Excel imports up to 500 guests within 10 seconds  
* NFR-1.4: Web pages shall load within 3 seconds on 4G connections

**NFR-2: Security**

* NFR-2.1: System shall encrypt all data in transit using TLS 1.3  
* NFR-2.2: System shall hash passwords using bcrypt with minimum 10 rounds  
* NFR-2.3: System shall implement rate limiting on authentication endpoints  
* NFR-2.4: System shall sanitize all user inputs to prevent injection attacks

**NFR-3: Reliability**

* NFR-3.1: System shall maintain 99% uptime during development phase  
* NFR-3.2: System shall implement automatic backup every 24 hours  
* NFR-3.3: System shall gracefully handle third-party API failures  
* NFR-3.4: System shall log all errors for debugging purposes

**NFR-4: Usability**

* NFR-4.1: System shall be fully responsive across desktop, tablet, and mobile devices  
* NFR-4.2: System shall follow WCAG 2.1 Level AA accessibility guidelines  
* NFR-4.3: System shall provide clear error messages and recovery instructions  
* NFR-4.4: Core workflows shall require no more than 5 clicks to complete

**NFR-5: Compatibility**

* NFR-5.1: System shall support Chrome, Firefox, Safari, and Edge browsers  
* NFR-5.2: System shall function on browsers released within last 2 years  
* NFR-5.3: System shall support Excel files in .xlsx and .csv formats  
* NFR-5.4: System shall integrate with Google Calendar via standard APIs

## **Constraints and Assumptions** {#constraints-and-assumptions}

### **Technical Constraints** {#technical-constraints}

* Development limited to 13-week timeline  
* Single developer resource  
* AWS free tier limitations for infrastructure  
* API rate limits for Google Places (free tier)  
* Database storage limited to 20GB initially

### **Business Constraints** {#business-constraints}

* No payment processing in MVP (deferred to Phase 2\)  
* Limited to English language interface initially  
* Maximum 50 vendors per event in initial release  
* Email sending limited to 100/day via AWS SES sandbox

### **Assumptions** {#assumptions}

* Users have stable internet connectivity  
* Event planners are comfortable with web applications  
* Guests have valid email addresses for RSVP  
* Events are planned at least 2 weeks in advance  
* Venues listed in Google Places have accurate information

## Requirements Prioritization {#requirements-prioritization}

### **Priority 1 \- Core MVP (Weeks 1-8)** {#priority-1---core-mvp-(weeks-1-8)}

* User authentication and authorization  
* Basic event creation and management  
* Guest list with manual entry  
* Simple RSVP system  
* Email invitations  
* Basic venue search

### **Priority 2 \- Enhanced Features (Weeks 9-11)** {#priority-2---enhanced-features-(weeks-9-11)}

* Excel import for guest lists  
* Budget tracking  
* Vendor management  
* Timeline generation  
* Enhanced RSVP with dietary restrictions

### **Priority 3 \- Advanced Features (Weeks 12-13)** {#priority-3---advanced-features-(weeks-12-13)}

* Interactive seating charts  
* Real-time chat  
* AI planning assistance  
* Photo galleries  
* Calendar synchronization

# Architecture and Design {#architecture-and-design}

## **Overview** {#overview-2}

The Party-Time application adopts a **Microservices Architecture** pattern for the backend combined with a **Component-Based Architecture** for the frontend, creating a distributed system that balances development simplicity with scalability potential. This architectural approach enables independent deployment of services, clear separation of concerns, and the flexibility to evolve different parts of the system at different rates. The design leverages modern cloud-native patterns while maintaining pragmatic boundaries suitable for a 13-week development timeline.

## **Architecture Pattern Selection** {#architecture-pattern-selection}

### **Microservices Architecture (Backend)** {#microservices-architecture-(backend)}

The backend implements a simplified microservices architecture with three core services:

**Core API Service**: Handles primary business logic including event management, guest lists, and RSVP processing. Built with FastAPI, this service manages the majority of user-facing functionality and coordinates with other services through well-defined interfaces.

**Authentication Service**: Manages user authentication and authorization through AWS Cognito integration. This separation ensures security concerns are isolated and can be independently scaled based on authentication load.

**Notification Service**: Processes asynchronous tasks such as email sending, reminders, and real-time updates. Utilizes message queuing to decouple time-sensitive user interactions from potentially slow external communications.

**Justification**: While a monolithic architecture might seem simpler for a student project, the microservices approach provides valuable learning opportunities with AWS services and demonstrates understanding of modern architectural patterns. The limited number of services (3) keeps complexity manageable while still showcasing distributed system design principles (Richardson, 2018).

### **Component-Based Architecture (Frontend)** {#component-based-architecture-(frontend)}

The frontend leverages Next.js's component-based architecture with TypeScript for type safety and clear separation between:

* **Presentation Components**: Strongly-typed reusable UI elements that receive props and render views  
* **Container Components**: Smart components with typed state management and business logic  
* **Page Components**: Top-level components with Next.js page props and routing types  
* **Utility Modules**: Type-safe shared functions for API calls, validation, and data transformation

**Justification**: Component-based architecture combined with TypeScript's static typing provides compile-time error detection, enhanced IDE support, and self-documenting code through interfaces. This approach reduces runtime errors by 15-20% and makes the codebase more maintainable (Microsoft, 2023).

## **Design Patterns Implementation** {#design-patterns-implementation}

### **Repository Pattern (Data Access Layer)** {#repository-pattern-(data-access-layer)}

The Repository Pattern abstracts database operations behind a clean interface with proper error handling and async support:

from typing import Optional, List  
from abc import ABC, abstractmethod  
import logging  
from sqlalchemy.ext.asyncio import AsyncSession  
from sqlalchemy import select, update, delete  
from app.schemas import EventCreateSchema, EventUpdateSchema  
from app.models import EventModel  
from app.core.exceptions import RepositoryException, NotFoundError

logger \= logging.getLogger(\_\_name\_\_)

class EventRepository(ABC):  
   """Abstract repository interface for dependency inversion"""  
    
   @abstractmethod  
   async def create\_event(self, event\_data: EventCreateSchema) \-\> EventModel:  
       """Create a new event"""  
       pass  
    
   @abstractmethod  
   async def get\_event\_by\_id(self, event\_id: str) \-\> Optional\[EventModel\]:  
       """Retrieve event by ID"""  
       pass  
    
   @abstractmethod  
   async def update\_event(self, event\_id: str, updates: EventUpdateSchema) \-\> EventModel:  
       """Update existing event"""  
       pass  
    
   @abstractmethod  
   async def delete\_event(self, event\_id: str) \-\> bool:  
       """Delete event by ID"""  
       pass  
    
   @abstractmethod  
   async def list\_events(self, user\_id: str, limit: int \= 10, offset: int \= 0) \-\> List\[EventModel\]:  
       """List user's events with pagination"""  
       pass

class SQLEventRepository(EventRepository):  
   """Concrete implementation with proper error handling and logging"""  
    
   def \_\_init\_\_(self, session: AsyncSession):  
       self.session \= session  
    
   async def create\_event(self, event\_data: EventCreateSchema) \-\> EventModel:  
       try:  
           event \= EventModel(\*\*event\_data.dict())  
           self.session.add(event)  
           await self.session.commit()  
           await self.session.refresh(event)  
           logger.info(f"Created event with ID: {event.id}")  
           return event  
       except Exception as e:  
           await self.session.rollback()  
           logger.error(f"Failed to create event: {str(e)}")  
           raise RepositoryException(f"Could not create event: {str(e)}")  
    
   async def get\_event\_by\_id(self, event\_id: str) \-\> Optional\[EventModel\]:  
       try:  
           result \= await self.session.execute(  
               select(EventModel).where(EventModel.id \== event\_id)  
           )  
           event \= result.scalar\_one\_or\_none()  
           if not event:  
               logger.warning(f"Event not found: {event\_id}")  
           return event  
       except Exception as e:  
           logger.error(f"Failed to fetch event {event\_id}: {str(e)}")  
           raise RepositoryException(f"Could not fetch event: {str(e)}")  
    
   async def update\_event(self, event\_id: str, updates: EventUpdateSchema) \-\> EventModel:  
       try:  
           event \= await self.get\_event\_by\_id(event\_id)  
           if not event:  
               raise NotFoundError(f"Event {event\_id} not found")  
            
           update\_data \= updates.dict(exclude\_unset\=True)  
           for field, value in update\_data.items():  
               setattr(event, field, value)  
            
           await self.session.commit()  
           await self.session.refresh(event)  
           logger.info(f"Updated event: {event\_id}")  
           return event  
       except NotFoundError:  
           raise  
       except Exception as e:  
           await self.session.rollback()  
           logger.error(f"Failed to update event {event\_id}: {str(e)}")  
           raise RepositoryException(f"Could not update event: {str(e)}")  
    
   async def delete\_event(self, event\_id: str) \-\> bool:  
       try:  
           result \= await self.session.execute(  
               delete(EventModel).where(EventModel.id \== event\_id)  
           )  
           await self.session.commit()  
           deleted \= result.rowcount \> 0  
           if deleted:  
               logger.info(f"Deleted event: {event\_id}")  
           else:  
               logger.warning(f"Event not found for deletion: {event\_id}")  
           return deleted  
       except Exception as e:  
           await self.session.rollback()  
           logger.error(f"Failed to delete event {event\_id}: {str(e)}")  
           raise RepositoryException(f"Could not delete event: {str(e)}")  
    
   async def list\_events(self, user\_id: str, limit: int \= 10, offset: int \= 0) \-\> List\[EventModel\]:  
       try:  
           result \= await self.session.execute(  
               select(EventModel)  
               .where(EventModel.planner\_id \== user\_id)  
               .limit(limit)  
               .offset(offset)  
               .order\_by(EventModel.created\_at.desc())  
           )  
           return list(result.scalars().all())  
       except Exception as e:  
           logger.error(f"Failed to list events for user {user\_id}: {str(e)}")  
           raise RepositoryException(f"Could not list events: {str(e)}")

### **Observer Pattern (Real-time Updates)** {#observer-pattern-(real-time-updates)}

The Observer Pattern manages real-time notifications with proper cleanup and error handling:

// Observer pattern with memory leak prevention and error handling  
interface Observer\<T\> {  
 id: string;  
 update(eventType: EventType, data: T): void;  
 onError?: (error: Error) \=\> void;  
}

interface Subscription {  
 unsubscribe: () \=\> void;  
}

class EventObservable\<T\> {  
 private observers \= new Map\<string, Observer\<T\>\>();  
 private errorHandlers \= new Map\<string, (error: Error) \=\> void\>();

 attach(observer: Observer\<T\>): Subscription {  
   this.observers.set(observer.id, observer);  
    
   if (observer.onError) {  
     this.errorHandlers.set(observer.id, observer.onError);  
   }  
    
   // Return subscription object for clean unsubscribe  
   return {  
     unsubscribe: () \=\> this.detach(observer.id)  
   };  
 }

 detach(observerId: string): void {  
   this.observers.delete(observerId);  
   this.errorHandlers.delete(observerId);  
 }

 notify(eventType: EventType, data: T): void {  
   const errors: Array\<{ observerId: string; error: Error }\> \= \[\];

   this.observers.forEach((observer) \=\> {  
     try {  
       observer.update(eventType, data);  
     } catch (error) {  
       const err \= error instanceof Error ? error : new Error(String(error));  
       console.error(\`Observer ${observer.id} failed:\`, err);  
       errors.push({ observerId: observer.id, error: err });  
        
       const errorHandler \= this.errorHandlers.get(observer.id);  
       if (errorHandler) {  
         errorHandler(err);  
       }  
     }  
   });

   // Log aggregated errors for monitoring  
   if (errors.length \> 0) {  
     console.error('Observer notification errors:', errors);  
   }  
 }

 clear(): void {  
   this.observers.clear();  
   this.errorHandlers.clear();  
 }

 getObserverCount(): number {  
   return this.observers.size;  
 }  
}

// Usage example with cleanup  
class RSVPObserver implements Observer\<RSVPData\> {  
 id \= crypto.randomUUID();  
  update(eventType: EventType, data: RSVPData): void {  
   // Update dashboard when RSVP received  
   console.log(\`RSVP received: ${data.guestName}\`);  
 }  
  onError(error: Error): void {  
   // Handle errors gracefully  
   console.error('RSVP observer error:', error);  
 }  
}

### **Factory Pattern (Service Creation)** {#factory-pattern-(service-creation)}

The Factory Pattern with dependency injection and proper error handling:

// Service factory with dependency injection and error handling  
interface NotifierConfig {  
 apiKey?: string;  
 endpoint?: string;  
 timeout?: number;  
}

interface Notifier {  
 send(message: NotificationMessage): Promise\<void\>;  
 validateConfig(): boolean;  
}

class EmailNotifier implements Notifier {  
 constructor(private config: NotifierConfig) {  
   if (\!this.validateConfig()) {  
     throw new Error('Invalid EmailNotifier configuration');  
   }  
 }

 validateConfig(): boolean {  
   return \!\!(this.config.apiKey && this.config.endpoint);  
 }

 async send(message: NotificationMessage): Promise\<void\> {  
   try {  
     const response \= await fetch(this.config.endpoint\!, {  
       method: 'POST',  
       headers: {  
         'Authorization': \`Bearer ${this.config.apiKey}\`,  
         'Content-Type': 'application/json',  
       },  
       body: JSON.stringify(message),  
       signal: AbortSignal.timeout(this.config.timeout || 5orden),  
     });

     if (\!response.ok) {  
       throw new Error(\`Email send failed: ${response.statusText}\`);  
     }  
   } catch (error) {  
     console.error('Email notification failed:', error);  
     throw new NotificationError('Failed to send email', error);  
   }  
 }  
}

class SMSNotifier implements Notifier {  
 constructor(private config: NotifierConfig) {  
   if (\!this.validateConfig()) {  
     throw new Error('Invalid SMSNotifier configuration');  
   }  
 }

 validateConfig(): boolean {  
   return \!\!(this.config.apiKey && this.config.endpoint);  
 }

 async send(message: NotificationMessage): Promise\<void\> {  
   // SMS implementation  
 }  
}

// Factory with configuration validation  
class NotificationFactory {  
 private static notifiers \= new Map\<NotificationType, new (config: NotifierConfig) \=\> Notifier\>(\[  
   \[NotificationType.EMAIL, EmailNotifier\],  
   \[NotificationType.SMS, SMSNotifier\],  
 \]);

 static createNotifier(type: NotificationType, config: NotifierConfig): Notifier {  
   const NotifierClass \= this.notifiers.get(type);  
    
   if (\!NotifierClass) {  
     throw new Error(\`Unknown notifier type: ${type}\`);  
   }

   try {  
     return new NotifierClass(config);  
   } catch (error) {  
     throw new Error(\`Failed to create ${type} notifier: ${error}\`);  
   }  
 }

 static registerNotifier(type: NotificationType, notifierClass: new (config: NotifierConfig) \=\> Notifier): void {  
   this.notifiers.set(type, notifierClass);  
 }  
}

// Custom error class for better error handling  
class NotificationError extends Error {  
 constructor(message: string, public cause?: unknown) {  
   super(message);  
   this.name \= 'NotificationError';  
 }  
}

## **TypeScript Frontend Architecture** {#typescript-frontend-architecture}

### **Type System Design with Validation** {#type-system-design-with-validation}

// Core type definitions with runtime validation  
import { z } from 'zod';

// Zod schemas for runtime validation  
export const UserSchema \= z.object({  
 id: z.string().uuid(),  
 email: z.string().email(),  
 name: z.string().min(1).max(100),  
 role: z.enum(\['admin', 'planner', 'guest'\]),  
 createdAt: z.date(),  
 updatedAt: z.date(),  
});

export const EventSchema \= z.object({  
 id: z.string().uuid(),  
 plannerId: z.string().uuid(),  
 name: z.string().min(1).max(200),  
 type: z.enum(\['wedding', 'birthday', 'corporate', 'graduation', 'celebration', 'other'\]),  
 date: z.date().min(new Date()),  
 status: z.enum(\['draft', 'active', 'completed', 'cancelled'\]),  
 venue: z.object({  
   id: z.string(),  
   name: z.string(),  
   address: z.string(),  
   capacity: z.number().positive(),  
 }).optional(),  
 guestCount: z.number().min(0).max(1000),  
 budget: z.object({  
   total: z.number().positive(),  
   spent: z.number().min(0),  
   categories: z.array(z.object({  
     name: z.string(),  
     allocated: z.number(),  
     spent: z.number(),  
   })),  
 }).optional(),  
 createdAt: z.date(),  
 updatedAt: z.date(),  
});

// TypeScript types derived from Zod schemas  
export type User \= z.infer\<typeof UserSchema\>;  
export type Event \= z.infer\<typeof EventSchema\>;

// API Response wrapper types with discriminated unions  
export type ApiResponse\<T\> \=  
 | { success: true; data: T; meta: ResponseMeta }  
 | { success: false; error: ApiError; meta: ResponseMeta };

export interface ResponseMeta {  
 timestamp: string;  
 version: string;  
 requestId: string;  
 duration?: number;  
}

export interface ApiError {  
 code: string;  
 message: string;  
 details?: unknown;  
 field?: string;  
}

// Form validation types  
export const EventFormSchema \= z.object({  
 name: z.string().min(1, 'Event name is required').max(200),  
 type: z.enum(\['wedding', 'birthday', 'corporate', 'graduation', 'celebration', 'other'\]),  
 date: z.string().datetime(),  
 location: z.string().min(1, 'Location is required'),  
 expectedGuests: z.number().positive('Must have at least 1 guest').max(1000),  
 description: z.string().max(1000).optional(),  
});

export type EventFormData \= z.infer\<typeof EventFormSchema\>;

### **API Client with Comprehensive Error Handling** {#api-client-with-comprehensive-error-handling}

// api/client.ts \- Production-ready API client  
import { z } from 'zod';

interface ApiClientConfig {  
 baseUrl: string;  
 timeout?: number;  
 retries?: number;  
 onUnauthorized?: () \=\> void;  
}

class ApiError extends Error {  
 constructor(  
   message: string,  
   public statusCode: number,  
   public code?: string,  
   public details?: unknown  
 ) {  
   super(message);  
   this.name \= 'ApiError';  
 }  
}

class ApiClient {  
 private baseUrl: string;  
 private timeout: number;  
 private retries: number;  
 private abortControllers \= new Map\<string, AbortController\>();  
 private onUnauthorized?: () \=\> void;

 constructor(config: ApiClientConfig) {  
   this.baseUrl \= config.baseUrl;  
   this.timeout \= config.timeout || 10000;  
   this.retries \= config.retries || 3;  
   this.onUnauthorized \= config.onUnauthorized;  
 }

 private async request\<T\>(  
   endpoint: string,  
   options: RequestInit \= {},  
   schema?: z.ZodSchema\<T\>,  
   retryCount \= 0  
 ): Promise\<ApiResponse\<T\>\> {  
   const requestId \= crypto.randomUUID();  
   const controller \= new AbortController();  
   this.abortControllers.set(requestId, controller);

   const timeoutId \= setTimeout(() \=\> controller.abort(), this.timeout);  
   const startTime \= performance.now();

   try {  
     const token \= this.getAuthToken();  
     const response \= await fetch(\`${this.baseUrl}${endpoint}\`, {  
       ...options,  
       signal: controller.signal,  
       headers: {  
         'Content-Type': 'application/json',  
         'X-Request-ID': requestId,  
         ...(token && { Authorization: \`Bearer ${token}\` }),  
         ...options.headers,  
       },  
     });

     clearTimeout(timeoutId);  
     this.abortControllers.delete(requestId);

     const duration \= performance.now() \- startTime;

     // Handle unauthorized  
     if (response.status \=== 401) {  
       this.onUnauthorized?.();  
       throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');  
     }

     // Handle rate limiting with retry  
     if (response.status \=== 429 && retryCount \< this.retries) {  
       const retryAfter \= response.headers.get('Retry-After');  
       const delay \= retryAfter ? parseInt(retryAfter) \* 1000 : Math.pow(2, retryCount) \* 1000;  
        
       await new Promise(resolve \=\> setTimeout(resolve, delay));  
       return this.request(endpoint, options, schema, retryCount \+ 1);  
     }

     if (\!response.ok) {  
       const errorData \= await response.json().catch(() \=\> ({}));  
       throw new ApiError(  
         errorData.message || \`HTTP ${response.status}\`,  
         response.status,  
         errorData.code,  
         errorData.details  
       );  
     }

     const data \= await response.json();  
      
     // Validate response data if schema provided  
     if (schema) {  
       try {  
         const validated \= schema.parse(data.data);  
         data.data \= validated;  
       } catch (error) {  
         console.error('Response validation failed:', error);  
         throw new ApiError('Invalid response format', 500, 'VALIDATION\_ERROR', error);  
       }  
     }

     return {  
       success: true,  
       data: data.data,  
       meta: {  
         timestamp: new Date().toISOString(),  
         version: '1.0',  
         requestId,  
         duration,  
       },  
     };  
   } catch (error) {  
     clearTimeout(timeoutId);  
     this.abortControllers.delete(requestId);

     if (error instanceof ApiError) {  
       return {  
         success: false,  
         error: {  
           code: error.code || 'API\_ERROR',  
           message: error.message,  
           details: error.details,  
         },  
         meta: {  
           timestamp: new Date().toISOString(),  
           version: '1.0',  
           requestId,  
         },  
       };  
     }

     if (error instanceof Error) {  
       if (error.name \=== 'AbortError') {  
         throw new ApiError('Request timeout', 408, 'TIMEOUT');  
       }  
       throw new ApiError(error.message, 500, 'NETWORK\_ERROR');  
     }

     throw error;  
   }  
 }

 private getAuthToken(): string | null {  
   // Get token from secure storage  
   return localStorage.getItem('auth\_token');  
 }

 async get\<T\>(endpoint: string, params?: Record\<string, any\>, schema?: z.ZodSchema\<T\>): Promise\<ApiResponse\<T\>\> {  
   const queryString \= params ? \`?${new URLSearchParams(params).toString()}\` : '';  
   return this.request\<T\>(\`${endpoint}${queryString}\`, { method: 'GET' }, schema);  
 }

 async post\<T, D\>(endpoint: string, data: D, schema?: z.ZodSchema\<T\>): Promise\<ApiResponse\<T\>\> {  
   return this.request\<T\>(endpoint, {  
     method: 'POST',  
     body: JSON.stringify(data),  
   }, schema);  
 }

 async put\<T, D\>(endpoint: string, data: D, schema?: z.ZodSchema\<T\>): Promise\<ApiResponse\<T\>\> {  
   return this.request\<T\>(endpoint, {  
     method: 'PUT',  
     body: JSON.stringify(data),  
   }, schema);  
 }

 async delete\<T\>(endpoint: string, schema?: z.ZodSchema\<T\>): Promise\<ApiResponse\<T\>\> {  
   return this.request\<T\>(endpoint, { method: 'DELETE' }, schema);  
 }

 cancelRequest(requestId: string): void {  
   const controller \= this.abortControllers.get(requestId);  
   if (controller) {  
     controller.abort();  
     this.abortControllers.delete(requestId);  
   }  
 }

 cancelAllRequests(): void {  
   this.abortControllers.forEach(controller \=\> controller.abort());  
   this.abortControllers.clear();  
 }  
}

export default ApiClient;

### **Custom Hooks with Proper Cleanup** {#custom-hooks-with-proper-cleanup}

// hooks/useEvents.ts  
import { useState, useCallback, useEffect, useRef } from 'react';  
import { Event, EventFormData } from '@/types';  
import { apiClient } from '@/lib/api-client';  
import { EventSchema } from '@/schemas';  
import { z } from 'zod';

interface UseEventsOptions {  
 autoFetch?: boolean;  
 onError?: (error: Error) \=\> void;  
}

interface UseEventsReturn {  
 events: Event\[\];  
 loading: boolean;  
 error: Error | null;  
 fetchEvents: () \=\> Promise\<void\>;  
 createEvent: (data: EventFormData) \=\> Promise\<Event | null\>;  
 updateEvent: (id: string, data: Partial\<EventFormData\>) \=\> Promise\<Event | null\>;  
 deleteEvent: (id: string) \=\> Promise\<boolean\>;  
 refetch: () \=\> Promise\<void\>;  
}

export function useEvents(options: UseEventsOptions \= {}): UseEventsReturn {  
 const { autoFetch \= true, onError } \= options;  
  const \[events, setEvents\] \= useState\<Event\[\]\>(\[\]);  
 const \[loading, setLoading\] \= useState(false);  
 const \[error, setError\] \= useState\<Error | null\>(null);  
  const abortControllerRef \= useRef\<AbortController | null\>(null);  
 const isMountedRef \= useRef(true);

 const handleError \= useCallback((err: unknown) \=\> {  
   const error \= err instanceof Error ? err : new Error(String(err));  
   if (isMountedRef.current) {  
     setError(error);  
     onError?.(error);  
   }  
   return error;  
 }, \[onError\]);

 const fetchEvents \= useCallback(async () \=\> {  
   // Cancel any in-flight requests  
   if (abortControllerRef.current) {  
     abortControllerRef.current.abort();  
   }

   abortControllerRef.current \= new AbortController();  
    
   setLoading(true);  
   setError(null);

   try {  
     const response \= await apiClient.get\<Event\[\]\>(  
       '/events',  
       undefined,  
       z.array(EventSchema)  
     );

     if (\!isMountedRef.current) return;

     if (response.success) {  
       setEvents(response.data);  
     } else {  
       throw new Error(response.error.message);  
     }  
   } catch (err) {  
     if (err instanceof Error && err.name \=== 'AbortError') {  
       return; // Ignore abort errors  
     }  
     handleError(err);  
   } finally {  
     if (isMountedRef.current) {  
       setLoading(false);  
     }  
   }  
 }, \[handleError\]);

 const createEvent \= useCallback(async (data: EventFormData): Promise\<Event | null\> \=\> {  
   setError(null);  
    
   try {  
     const response \= await apiClient.post\<Event, EventFormData\>(  
       '/events',  
       data,  
       EventSchema  
     );

     if (response.success) {  
       setEvents(prev \=\> \[...prev, response.data\]);  
       return response.data;  
     } else {  
       throw new Error(response.error.message);  
     }  
   } catch (err) {  
     handleError(err);  
     return null;  
   }  
 }, \[handleError\]);

 const updateEvent \= useCallback(async (id: string, data: Partial\<EventFormData\>): Promise\<Event | null\> \=\> {  
   setError(null);  
    
   try {  
     const response \= await apiClient.put\<Event, Partial\<EventFormData\>\>(  
       \`/events/${id}\`,  
       data,  
       EventSchema  
     );

     if (response.success) {  
       setEvents(prev \=\> prev.map(e \=\> e.id \=== id ? response.data : e));  
       return response.data;  
     } else {  
       throw new Error(response.error.message);  
     }  
   } catch (err) {  
     handleError(err);  
     return null;  
   }  
 }, \[handleError\]);

 const deleteEvent \= useCallback(async (id: string): Promise\<boolean\> \=\> {  
   setError(null);  
    
   try {  
     const response \= await apiClient.delete(\`/events/${id}\`);

     if (response.success) {  
       setEvents(prev \=\> prev.filter(e \=\> e.id \!== id));  
       return true;  
     } else {  
       throw new Error(response.error.message);  
     }  
   } catch (err) {  
     handleError(err);  
     return false;  
   }  
 }, \[handleError\]);

 // Auto-fetch on mount if enabled  
 useEffect(() \=\> {  
   if (autoFetch) {  
     fetchEvents();  
   }

   return () \=\> {  
     isMountedRef.current \= false;  
     if (abortControllerRef.current) {  
       abortControllerRef.current.abort();  
     }  
   };  
 }, \[autoFetch\]); // fetchEvents excluded to prevent re-fetch on every render

 return {  
   events,  
   loading,  
   error,  
   fetchEvents,  
   createEvent,  
   updateEvent,  
   deleteEvent,  
   refetch: fetchEvents,  
 };  
}

## **System Architecture Diagrams** {#system-architecture-diagrams}

### **High-Level System Architecture** {#high-level-system-architecture}

![][image11]

### **Component Architecture with TypeScript** {#component-architecture-with-typescript}

Next.js TypeScript Application  
│  
├── app/ (App Router)  
│   ├── layout.tsx (Root layout with providers)  
│   ├── error.tsx (Error boundary)  
│   ├── loading.tsx (Loading state)  
│   ├── page.tsx (Home page)  
│   ├── auth/  
│   │   ├── login/  
│   │   │   ├── page.tsx  
│   │   │   └── loading.tsx  
│   │   └── register/  
│   │       └── page.tsx  
│   ├── dashboard/  
│   │   ├── layout.tsx (Dashboard layout)  
│   │   ├── page.tsx  
│   │   └── events/  
│   │       ├── \[id\]/  
│   │       │   └── page.tsx  
│   │       └── create/  
│   │           └── page.tsx  
│   └── api/  
│       └── \[...route\]/  
│           └── route.ts (API proxy)  
│  
├── components/  
│   ├── ui/  
│   │   ├── Button/  
│   │   │   ├── Button.tsx  
│   │   │   ├── Button.test.tsx  
│   │   │   └── index.ts  
│   │   ├── Input/  
│   │   ├── Modal/  
│   │   └── LoadingSpinner/  
│   ├── forms/  
│   │   ├── EventForm/  
│   │   ├── GuestForm/  
│   │   └── shared/  
│   ├── layout/  
│   │   ├── Header/  
│   │   ├── Sidebar/  
│   │   └── Footer/  
│   └── features/  
│       ├── events/  
│       ├── guests/  
│       └── budget/  
│  
├── lib/  
│   ├── api-client.ts  
│   ├── auth/  
│   │   ├── context.tsx  
│   │   └── provider.tsx  
│   ├── utils/  
│   └── validators/  
│  
├── hooks/  
│   ├── useAuth.ts  
│   ├── useEvents.ts  
│   ├── useDebounce.ts  
│   └── useLocalStorage.ts  
│  
├── types/  
│   ├── index.ts  
│   ├── api.types.ts  
│   └── components.types.ts  
│  
├── schemas/  
│   ├── event.schema.ts  
│   ├── user.schema.ts  
│   └── guest.schema.ts  
│  
└── config/  
    ├── environment.ts  
    └── constants.ts

### **Sequence Diagram \- Production Event Creation Flow** {#sequence-diagram---production-event-creation-flow}

![][image12]

## **Database Design with Optimization** {#database-design-with-optimization}

### **Entity Relationship with Indexes and Constraints** {#entity-relationship-with-indexes-and-constraints}

\-- Optimized PostgreSQL schema with proper indexes and constraints  
CREATE TABLE users (  
   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
   email VARCHAR(255) UNIQUE NOT NULL,  
   name VARCHAR(100) NOT NULL,  
   role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'planner', 'guest')),  
   password\_hash VARCHAR(255),  
   email\_verified BOOLEAN DEFAULT FALSE,  
   created\_at TIMESTAMPTZ DEFAULT NOW(),  
   updated\_at TIMESTAMPTZ DEFAULT NOW(),  
   deleted\_at TIMESTAMPTZ,  
    
   INDEX idx\_users\_email (email),  
   INDEX idx\_users\_role (role),  
   INDEX idx\_users\_created\_at (created\_at DESC)  
);

CREATE TABLE events (  
   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
   planner\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  
   venue\_id UUID REFERENCES venues(id) ON DELETE SET NULL,  
   name VARCHAR(200) NOT NULL,  
   type VARCHAR(20) NOT NULL,  
   date TIMESTAMPTZ NOT NULL,  
   status VARCHAR(20) DEFAULT 'draft',  
   guest\_count INTEGER DEFAULT 0,  
   description TEXT,  
   settings JSONB DEFAULT '{}',  
   created\_at TIMESTAMPTZ DEFAULT NOW(),  
   updated\_at TIMESTAMPTZ DEFAULT NOW(),  
   deleted\_at TIMESTAMPTZ,  
    
   INDEX idx\_events\_planner\_id (planner\_id),  
   INDEX idx\_events\_date (date),  
   INDEX idx\_events\_status (status),  
   INDEX idx\_events\_type\_status (type, status),  
   INDEX idx\_events\_created\_at (created\_at DESC),  
    
   CONSTRAINT check\_date\_future CHECK (date \> NOW()),  
   CONSTRAINT check\_guest\_count CHECK (guest\_count \>= 0 AND guest\_count \<= 10000)  
);

CREATE TABLE guests (  
   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
   event\_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,  
   name VARCHAR(100) NOT NULL,  
   email VARCHAR(255),  
   phone VARCHAR(20),  
   rsvp\_status VARCHAR(20) DEFAULT 'pending',  
   rsvp\_token UUID UNIQUE DEFAULT gen\_random\_uuid(),  
   dietary\_restrictions JSONB DEFAULT '\[\]',  
   plus\_one BOOLEAN DEFAULT FALSE,  
   table\_number INTEGER,  
   responded\_at TIMESTAMPTZ,  
   created\_at TIMESTAMPTZ DEFAULT NOW(),  
   updated\_at TIMESTAMPTZ DEFAULT NOW(),  
    
   INDEX idx\_guests\_event\_id (event\_id),  
   INDEX idx\_guests\_rsvp\_token (rsvp\_token),  
   INDEX idx\_guests\_rsvp\_status (rsvp\_status),  
   INDEX idx\_guests\_email (email),  
    
   CONSTRAINT check\_rsvp\_status CHECK (  
       rsvp\_status IN ('pending', 'attending', 'not\_attending', 'maybe')  
   )  
);

\-- Audit log table for compliance  
CREATE TABLE audit\_log (  
   id UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
   user\_id UUID REFERENCES users(id),  
   action VARCHAR(50) NOT NULL,  
   entity\_type VARCHAR(50) NOT NULL,  
   entity\_id UUID NOT NULL,  
   old\_data JSONB,  
   new\_data JSONB,  
   ip\_address INET,  
   user\_agent TEXT,  
   created\_at TIMESTAMPTZ DEFAULT NOW(),  
    
   INDEX idx\_audit\_user\_id (user\_id),  
   INDEX idx\_audit\_entity (entity\_type, entity\_id),  
   INDEX idx\_audit\_created\_at (created\_at DESC)  
);

\-- Function for automatic updated\_at  
CREATE OR REPLACE FUNCTION update\_updated\_at\_column()  
RETURNS TRIGGER AS $$  
BEGIN  
   NEW.updated\_at \= NOW();  
   RETURN NEW;  
END;  
$$ language 'plpgsql';

CREATE TRIGGER update\_users\_updated\_at BEFORE UPDATE ON users  
   FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_events\_updated\_at BEFORE UPDATE ON events  
   FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

CREATE TRIGGER update\_guests\_updated\_at BEFORE UPDATE ON guests  
   FOR EACH ROW EXECUTE FUNCTION update\_updated\_at\_column();

## **Security Architecture** {#security-architecture}

### **Defense in Depth Implementation** {#defense-in-depth-implementation}

// security/middleware.ts  
import { NextRequest, NextResponse } from 'next/server';  
import { RateLimiter } from '@/lib/rate-limiter';  
import { validateToken } from '@/lib/auth';  
import { sanitizeInput } from '@/lib/sanitizer';

// Content Security Policy  
const CSP\_HEADER \= \`  
 default-src 'self';  
 script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;  
 style-src 'self' 'unsafe-inline';  
 img-src 'self' data: https:;  
 font-src 'self' data:;  
 connect-src 'self' https://api.partytime.app;  
 frame-ancestors 'none';  
 base-uri 'self';  
 form-action 'self';  
\`.replace(/\\n/g, '');

// Security headers middleware  
export async function securityMiddleware(request: NextRequest): Promise\<NextResponse\> {  
 const response \= NextResponse.next();

 // Security headers  
 response.headers.set('X-Content-Type-Options', 'nosniff');  
 response.headers.set('X-Frame-Options', 'DENY');  
 response.headers.set('X-XSS-Protection', '1; mode=block');  
 response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');  
 response.headers.set('Content-Security-Policy', CSP\_HEADER);  
 response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');  
 response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

 return response;  
}

// Rate limiting implementation  
class RateLimiter {  
 private attempts \= new Map\<string, { count: number; resetTime: number }\>();  
 private readonly maxAttempts: number;  
 private readonly windowMs: number;

 constructor(maxAttempts \= 10, windowMs \= 60000) {  
   this.maxAttempts \= maxAttempts;  
   this.windowMs \= windowMs;  
 }

 async checkLimit(identifier: string): Promise\<boolean\> {  
   const now \= Date.now();  
   const userAttempts \= this.attempts.get(identifier);

   if (\!userAttempts || now \> userAttempts.resetTime) {  
     this.attempts.set(identifier, {  
       count: 1,  
       resetTime: now \+ this.windowMs,  
     });  
     return true;  
   }

   if (userAttempts.count \>= this.maxAttempts) {  
     return false;  
   }

   userAttempts.count\++;  
   return true;  
 }

 reset(identifier: string): void {  
   this.attempts.delete(identifier);  
 }  
}

// Input sanitization  
export function sanitizeInput\<T extends Record\<string, any\>\>(input: T): T {  
 const sanitized \= {} as T;  
  for (const \[key, value\] of Object.entries(input)) {  
   if (typeof value \=== 'string') {  
     // Remove script tags and dangerous HTML  
     sanitized\[key as keyof T\] \= value  
       .replace(/\<script\\b\[^\<\]\*(?:(?\!\<**\\/**script\>)\<\[^\<\]\*)\*\<**\\/**script\>/gi, '')  
       .replace(/\<iframe\\b\[^\<\]\*(?:(?\!\<**\\/**iframe\>)\<\[^\<\]\*)\*\<**\\/**iframe\>/gi, '')  
       .replace(/javascript:/gi, '')  
       .replace(/on\\w\+\\s\*\=/gi, '') as T\[keyof T\];  
   } else if (typeof value \=== 'object' && value \!== null) {  
     sanitized\[key as keyof T\] \= sanitizeInput(value);  
   } else {  
     sanitized\[key as keyof T\] \= value;  
   }  
 }  
  return sanitized;  
}

// Authentication middleware  
export async function authMiddleware(request: NextRequest): Promise\<NextResponse | null\> {  
 const token \= request.headers.get('authorization')?.replace('Bearer ', '');

 if (\!token) {  
   return NextResponse.json(  
     { error: 'Authentication required' },  
     { status: 401 }  
   );  
 }

 try {  
   const user \= await validateToken(token);  
    
   // Add user to request headers for downstream use  
   const requestHeaders \= new Headers(request.headers);  
   requestHeaders.set('x-user-id', user.id);  
   requestHeaders.set('x-user-role', user.role);

   return NextResponse.next({  
     request: {  
       headers: requestHeaders,  
     },  
   });  
 } catch (error) {  
   return NextResponse.json(  
     { error: 'Invalid or expired token' },  
     { status: 403 }  
   );  
 }  
}

## **Configuration Management** {#configuration-management}

// config/environment.ts  
import { z } from 'zod';

// Environment variable schema  
const envSchema \= z.object({  
 // App config  
 NODE\_ENV: z.enum(\['development', 'production', 'test'\]),  
 NEXT\_PUBLIC\_APP\_URL: z.string().url(),  
 NEXT\_PUBLIC\_API\_URL: z.string().url(),  
  // Database  
 DATABASE\_URL: z.string(),  
 DATABASE\_POOL\_SIZE: z.string().transform(Number).default('10'),  
  // AWS  
 AWS\_REGION: z.string(),  
 AWS\_ACCESS\_KEY\_ID: z.string(),  
 AWS\_SECRET\_ACCESS\_KEY: z.string(),  
 AWS\_S3\_BUCKET: z.string(),  
  // Auth  
 JWT\_SECRET: z.string().min(32),  
 JWT\_EXPIRY: z.string().default('15m'),  
 REFRESH\_TOKEN\_EXPIRY: z.string().default('7d'),  
  // External APIs  
 GOOGLE\_PLACES\_API\_KEY: z.string(),  
 STRIPE\_SECRET\_KEY: z.string().optional(),  
 CLAUDE\_API\_KEY: z.string().optional(),  
  // Monitoring  
 SENTRY\_DSN: z.string().optional(),  
 LOG\_LEVEL: z.enum(\['debug', 'info', 'warn', 'error'\]).default('info'),  
});

// Validate and export configuration  
const processEnv \= process.env as Record\<string, string | undefined\>;

export const config \= (() \=\> {  
 try {  
   const env \= envSchema.parse(processEnv);  
    
   return {  
     env: env.NODE\_ENV,  
     isProduction: env.NODE\_ENV \=== 'production',  
     isDevelopment: env.NODE\_ENV \=== 'development',  
     isTest: env.NODE\_ENV \=== 'test',  
      
     app: {  
       url: env.NEXT\_PUBLIC\_APP\_URL,  
       apiUrl: env.NEXT\_PUBLIC\_API\_URL,  
     },  
      
     database: {  
       url: env.DATABASE\_URL,  
       poolSize: env.DATABASE\_POOL\_SIZE,  
     },  
      
     aws: {  
       region: env.AWS\_REGION,  
       credentials: {  
         accessKeyId: env.AWS\_ACCESS\_KEY\_ID,  
         secretAccessKey: env.AWS\_SECRET\_ACCESS\_KEY,  
       },  
       s3Bucket: env.AWS\_S3\_BUCKET,  
     },  
      
     auth: {  
       jwtSecret: env.JWT\_SECRET,  
       jwtExpiry: env.JWT\_EXPIRY,  
       refreshTokenExpiry: env.REFRESH\_TOKEN\_EXPIRY,  
     },  
      
     apis: {  
       googlePlaces: env.GOOGLE\_PLACES\_API\_KEY,  
       stripe: env.STRIPE\_SECRET\_KEY,  
       claude: env.CLAUDE\_API\_KEY,  
     },  
      
     monitoring: {  
       sentryDsn: env.SENTRY\_DSN,  
       logLevel: env.LOG\_LEVEL,  
     },  
   } as const;  
 } catch (error) {  
   console.error('Invalid environment configuration:', error);  
   throw new Error('Failed to load environment configuration');  
 }  
})();

## **Deployment Configuration** {#deployment-configuration}

### **Docker Configuration with Multi-stage Build** {#docker-configuration-with-multi-stage-build}

\# Frontend Dockerfile with security best practices  
FROM node:18-alpine AS deps  
RUN apk add \--no-cache libc6-compat  
WORKDIR /app

\# Copy dependency files  
*COPY* *package.json* *package-lock.json* *./*  
*RUN* *npm* *ci* *\--only=production*

\# Build stage  
*FROM* *node:18-alpine* *AS* *builder*  
*WORKDIR* */app*  
*COPY* *package.json* *package-lock.json* *./*  
*RUN* *npm* *ci*  
*COPY* *.* *.*

\# Set build-time variables  
*ARG* *NEXT\_PUBLIC\_API\_URL*  
*ENV* *NEXT\_PUBLIC\_API\_URL=$NEXT\_PUBLIC\_API\_URL*

*RUN* *npm* *run* *build*

\# Production stage  
*FROM* *node:18-alpine* *AS* *runner*  
*WORKDIR* */app*

\# Security: Run as non-root user  
*RUN* *addgroup* *\--system* *\--gid* *1001* *nodejs*  
*RUN* *adduser* *\--system* *\--uid* *1001* *nextjs*

\# Copy built application  
*COPY* *\--from=builder* */app/public* *./public*  
*COPY* *\--from=builder* *\--chown=nextjs:nodejs* */app/.next/standalone* *./*  
*COPY* *\--from=builder* *\--chown=nextjs:nodejs* */app/.next/static* *./.next/static*

*USER* *nextjs*

*EXPOSE* *3000*  
*ENV* *PORT* *3000*  
*ENV* *NODE\_ENV* *production*

\# Health check  
*HEALTHCHECK* *\--interval=30s* *\--timeout=3s* *\--start-period=5s* *\--retries=3* *\\*  
 *CMD* *node* *healthcheck.js*

*CMD* *\["node",* *"server.js"\]*

### **Terraform Infrastructure as Code** {#terraform-infrastructure-as-code}

\# terraform/modules/ecs/main.tf  
resource "aws\_ecs\_cluster" "main" {  
 name \= "${var.project\_name}-cluster"

 setting {  
   name  \= "containerInsights"  
   value \= "enabled"  
 }

 tags \= var.tags  
}

resource "aws\_ecs\_task\_definition" "app" {  
 family                   \= "${var.project\_name}-app"  
 requires\_compatibilities \= \["FARGATE"\]  
 network\_mode            \= "awsvpc"  
 cpu                     \= var.cpu  
 memory                  \= var.memory  
 execution\_role\_arn      \= aws\_iam\_role.ecs\_task\_execution.arn  
 task\_role\_arn          \= aws\_iam\_role.ecs\_task.arn

 container\_definitions \= jsonencode(\[  
   {  
     name  \= "app"  
     image \= "${var.ecr\_repository\_url}:${var.image\_tag}"  
      
     essential \= true  
      
     portMappings \= \[  
       {  
         containerPort \= var.container\_port  
         protocol      \= "tcp"  
       }  
     \]  
      
     environment \= \[  
       {  
         name  \= "NODE\_ENV"  
         value \= var.environment  
       }  
     \]  
      
     secrets \= \[  
       {  
         name      \= "DATABASE\_URL"  
         valueFrom \= aws\_secretsmanager\_secret.database\_url.arn  
       }  
     \]  
      
     logConfiguration \= {  
       logDriver \= "awslogs"  
       options \= {  
         "awslogs-group"         \= aws\_cloudwatch\_log\_group.app.name  
         "awslogs-region"        \= var.region  
         "awslogs-stream-prefix" \= "ecs"  
       }  
     }  
      
     healthCheck \= {  
       command     \= \["CMD-SHELL", "curl \-f http://localhost:${var.container\_port}/health || exit 1"\]  
       interval    \= 30  
       timeout     \= 5  
       retries     \= 3  
       startPeriod \= 60  
     }  
   }  
 \])

 tags \= var.tags  
}

resource "aws\_ecs\_service" "app" {  
 name            \= "${var.project\_name}-service"  
 cluster         \= aws\_ecs\_cluster.main.id  
 task\_definition \= aws\_ecs\_task\_definition.app.arn  
 desired\_count   \= var.desired\_count  
 launch\_type     \= "FARGATE"

 network\_configuration {  
   security\_groups  \= \[aws\_security\_group.ecs\_tasks.id\]  
   subnets         \= var.private\_subnet\_ids  
   assign\_public\_ip \= false  
 }

 load\_balancer {  
   target\_group\_arn \= aws\_lb\_target\_group.app.arn  
   container\_name   \= "app"  
   container\_port   \= var.container\_port  
 }

 deployment\_configuration {  
   maximum\_percent         \= 200  
   minimum\_healthy\_percent \= 100  
    
   deployment\_circuit\_breaker {  
     enable   \= true  
     rollback \= true  
   }  
 }

 service\_registries {  
   registry\_arn \= aws\_service\_discovery\_service.app.arn  
 }

 depends\_on \= \[  
   aws\_lb\_listener.app  
 \]

 tags \= var.tags  
}

\# Auto-scaling configuration  
resource "aws\_appautoscaling\_target" "ecs" {  
 max\_capacity       \= var.max\_capacity  
 min\_capacity       \= var.min\_capacity  
 resource\_id        \= "service/${aws\_ecs\_cluster.main.name}/${aws\_ecs\_service.app.name}"  
 scalable\_dimension \= "ecs:service:DesiredCount"  
 service\_namespace  \= "ecs"  
}

resource "aws\_appautoscaling\_policy" "cpu" {  
 name               \= "${var.project\_name}-cpu-scaling"  
 policy\_type        \= "TargetTrackingScaling"  
 resource\_id        \= aws\_appautoscaling\_target.ecs.resource\_id  
 scalable\_dimension \= aws\_appautoscaling\_target.ecs.scalable\_dimension  
 service\_namespace  \= aws\_appautoscaling\_target.ecs.service\_namespace

 target\_tracking\_scaling\_policy\_configuration {  
   predefined\_metric\_specification {  
     predefined\_metric\_type \= "ECSServiceAverageCPUUtilization"  
   }  
   target\_value \= 70.0  
 }  
}

## **Technology Stack Justification** {#technology-stack-justification}

**TypeScript (Frontend Language)** TypeScript provides static typing that catches errors at compile-time rather than runtime, reducing bugs by 15-20% according to studies. It offers superior IDE support with IntelliSense, automated refactoring, and self-documenting code through interfaces. The investment in TypeScript setup pays dividends through improved developer experience and maintainability (Microsoft, 2023).

**FastAPI (Backend Framework)** Selected for its modern Python async capabilities, automatic API documentation generation, built-in validation with Pydantic, and superior performance compared to Django/Flask. The framework's native support for WebSockets enables real-time features without additional complexity (Ramirez, 2021).

**Next.js with TypeScript** Next.js offers first-class TypeScript support with automatic type generation for pages and API routes. The combination provides type-safe routing, validated environment variables, enhanced build-time optimizations, and seamless integration with React's ecosystem. The framework's production-ready nature reduces configuration overhead while maintaining flexibility (Vercel, 2023).

**PostgreSQL \+ DynamoDB (Database)** This hybrid approach leverages PostgreSQL's ACID compliance and relational strengths for structured data while utilizing DynamoDB's flexibility and auto-scaling for unstructured content. PostgreSQL handles complex queries and transactions, while DynamoDB excels at high-velocity writes and flexible schemas (Kleppmann, 2017).

**AWS Infrastructure** AWS provides comprehensive managed services reducing operational overhead by 40%, enables rapid scaling without infrastructure changes, offers enterprise-grade security with compliance certifications, and supports seamless transition from development to production scale. The free tier supports initial development while production-ready services ensure long-term viability (AWS, 2024).

## **References** {#references}

AWS. (2024). *AWS Well-Architected Framework*. Amazon Web Services. [https://aws.amazon.com/architecture/well-architected/](https://aws.amazon.com/architecture/well-architected/)

Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley Professional.

Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley Professional.

Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media.

Microsoft. (2023). *TypeScript Documentation*. [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/)

Ramirez, S. (2021). *FastAPI Documentation*. [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)

Richardson, C. (2018). *Microservices Patterns*. Manning Publications.

Vercel. (2023). *Next.js Documentation*. [https://nextjs.org/docs](https://nextjs.org/docs)

# UX-Design {#ux-design}

## **Overview** {#overview-3}

The Party-Time user experience design prioritizes simplicity, efficiency, and delight throughout the event planning journey. Given the 13-week development timeline and single developer constraint, the UX strategy focuses on proven design patterns, leveraging existing component libraries (Material Design principles with Tailwind CSS), and creating an intuitive flow that minimizes cognitive load while maximizing functionality. The design philosophy centers on progressive disclosure—presenting complex features gradually as users become comfortable with the platform—ensuring both novice and experienced event planners can navigate the application effectively.

## **Design Philosophy and Principles** {#design-philosophy-and-principles}

### **Core UX Principles** {#core-ux-principles}

**1\. Clarity Over Cleverness** Every interface element serves a clear purpose with obvious affordances. Buttons look clickable, forms provide clear guidance, and navigation remains consistent throughout the application. This principle reduces the learning curve and support burden.

**2\. Progressive Disclosure** Complex features are revealed gradually based on user needs and context. For example, basic event creation requires only essential fields, while advanced options (seating charts, vendor management) appear as optional enhancements.

**3\. Mobile-First Responsive Design** With 60% of users expected to access the platform via mobile devices during event execution, the interface prioritizes touch targets, simplified navigation, and optimized layouts for smaller screens.

**4\. Feedback and Forgiveness** All user actions provide immediate visual feedback, and destructive actions include confirmation dialogs. The system allows users to undo recent actions and recover from mistakes gracefully.

## **Visual Design System** {#visual-design-system}

### **Color Palette** {#color-palette}

The color scheme balances professionalism with celebration, using a sophisticated yet approachable palette:

**Primary Colors:**

* **Primary Blue (\#3B82F6)**: Main actions, links, and primary CTAs  
* **Primary Dark (\#1E40AF)**: Hover states and emphasis  
* **Primary Light (\#DBEAFE)**: Background accents and disabled states

**Secondary Colors:**

* **Success Green (\#10B981)**: Confirmations, completed tasks  
* **Warning Amber (\#F59E0B)**: Warnings, approaching deadlines  
* **Error Red (\#EF4444)**: Errors, overbudget indicators  
* **Neutral Gray (\#6B7280)**: Secondary text, borders

**Event Type Accent Colors:**

* Wedding: Blush Pink (`#FDF2F8`)  
* Birthday: Festive Purple (`#EDE9FE`)  
* Corporate: Professional Teal (`#CCFBF1`)  
* Graduation: Academic Gold (`#FEF3C7`)

### **Typography** {#typography}

**Font Stack:**

font-family: 'Inter', \-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

**Type Scale:**

* Display: 48px (3rem) \- Landing page headers  
* H1: 36px (2.25rem) \- Page titles  
* H2: 30px (1.875rem) \- Section headers  
* H3: 24px (1.5rem) \- Card titles  
* Body: 16px (1rem) \- Default text  
* Small: 14px (0.875rem) \- Helper text  
* Caption: 12px (0.75rem) \- Timestamps, labels

**Font Weights:**

* Light (300): Decorative text  
* Regular (400): Body text  
* Medium (500): Emphasis  
* Semibold (600): Buttons, navigation  
* Bold (700): Headers

### **Spacing and Layout Grid** {#spacing-and-layout-grid}

**8-Point Grid System:** All spacing follows multiples of 8px for consistency:

* xs: 4px (0.25rem)  
* sm: 8px (0.5rem)  
* md: 16px (1rem)  
* lg: 24px (1.5rem)  
* xl: 32px (2rem)  
* 2xl: 48px (3rem)

**Container Widths:**

* Mobile: 100% with 16px padding  
* Tablet: 768px max-width  
* Desktop: 1280px max-width  
* Wide: 1536px max-width

## **User Research and Personas** {#user-research-and-personas}

### **Primary Persona: Sarah Chen** {#primary-persona:-sarah-chen}

**Age:** 29 **Role:** First-time Event Planner **Technical Proficiency:** Moderate

**Goals:**

* Plan her wedding without hiring a professional planner  
* Keep all vendors and guests organized  
* Stay within a $25,000 budget  
* Reduce stress through clear task management

**Pain Points:**

* Overwhelmed by the number of decisions  
* Difficulty tracking multiple vendor conversations  
* Anxious about forgetting important details  
* Limited time due to full-time job

**Key Features Needed:**

* Automated timeline with reminders  
* Simple budget tracking  
* Centralized vendor communication  
* Mobile access for on-the-go updates

### **Secondary Persona: Michael Rodriguez** {#secondary-persona:-michael-rodriguez}

**Age:** 45 **Role:** Corporate Event Coordinator **Technical Proficiency:** High

**Goals:**

* Manage multiple concurrent events efficiently  
* Generate professional reports for stakeholders  
* Coordinate with numerous vendors seamlessly  
* Track detailed metrics for each event

**Pain Points:**

* Switching between multiple tools for different tasks  
* Difficulty generating comprehensive reports  
* Managing last-minute changes across events  
* Ensuring compliance with corporate policies

**Key Features Needed:**

* Multi-event dashboard  
* Advanced reporting capabilities  
* Bulk operations for guest management  
* Integration with corporate calendar systems

### **Tertiary Persona: Emma Thompson** {#tertiary-persona:-emma-thompson}

**Age:** 62 **Role:** Guest/Family Member **Technical Proficiency:** Low

**Goals:**

* Easily RSVP to events  
* View event details without confusion  
* Update dietary restrictions  
* Access venue information

**Pain Points:**

* Complex registration processes  
* Small text on mobile devices  
* Unclear navigation  
* Too many required fields

**Key Features Needed:**

* Simple, one-click RSVP  
* Large, readable text options  
* Minimal required information  
* Clear venue directions

## **Information Architecture** {#information-architecture}

### **Site Map Structure** {#site-map-structure}

Party-Time  
├── Public Pages  
│   ├── Landing Page (/)  
│   ├── Features (/features)  
│   ├── Pricing (/pricing)  
│   ├── About (/about)  
│   └── Auth  
│       ├── Login (/login)  
│       ├── Register (/register)  
│       └── Forgot Password (/forgot-password)  
│  
├── Planner Dashboard (/dashboard)  
│   ├── Events Overview  
│   ├── Create Event (/events/create)  
│   ├── Event Details (/events/:id)  
│   │   ├── Overview Tab  
│   │   ├── Guests Tab  
│   │   ├── Budget Tab  
│   │   ├── Vendors Tab  
│   │   ├── Timeline Tab  
│   │   └── Settings Tab  
│   ├── Calendar View (/calendar)  
│   └── Account Settings (/settings)  
│  
└── Guest Portal (/rsvp/:token)  
    ├── Event Details  
    ├── RSVP Form  
    ├── Guest Preferences  
    └── Venue Information

### **Navigation Hierarchy** {#navigation-hierarchy}

**Primary Navigation (Authenticated Planners):**

1. Dashboard (home icon)  
2. Events (calendar icon)  
3. Calendar (date icon)  
4. Reports (chart icon)  
5. Settings (gear icon)

**Contextual Navigation (Within Event):**

* Horizontal tabs for event sections  
* Breadcrumb trail for location awareness  
* Quick actions menu for common tasks

## **User Flow Diagrams** {#user-flow-diagrams}

### **Critical Path 1: New User Event Creation** {#critical-path-1:-new-user-event-creation}

Landing Page → Sign Up → Email Verification →   
Welcome Tutorial → Create First Event →   
Select Event Type → Enter Basic Details →   
Save Draft → Event Dashboard → 

Add Guests → Send Invitations

**Design Decisions:**

* Immediate value demonstration before registration  
* Optional tutorial with skip option  
* Auto-save functionality to prevent data loss  
* Progressive form with 3 steps maximum

### **Critical Path 2: Guest RSVP Journey** {#critical-path-2:-guest-rsvp-journey}

Email Invitation → RSVP Landing Page →   
View Event Details → Submit RSVP →   
Add Preferences → Confirmation Page → 

Calendar Download Option

**Design Decisions:**

* No registration required for guests  
* Pre-filled information where possible  
* Single-page RSVP form  
* Clear confirmation with next steps

### **Critical Path 3: Budget Management Flow** {#critical-path-3:-budget-management-flow}

Event Dashboard → Budget Tab →   
Set Total Budget → Add Categories →   
Enter Expenses → View Analytics →   
Receive Alert (if over budget) → 

Adjust Allocations

**Design Decisions:**

* Visual budget indicators (progress bars)  
* Real-time calculation updates  
* Color-coded status (green/yellow/red)  
* Drill-down capability for details

## **Interaction Patterns** {#interaction-patterns}

### **Form Design Patterns with TypeScript** {#form-design-patterns-with-typescript}

**Multi-Step Form (Event Creation):**

// components/forms/EventCreationForm.tsx  
import { useState } from 'react';  
import { useRouter } from 'next/navigation';

interface EventFormData {  
 name: string;  
 type: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'other';  
 date: string;  
 location: string;  
 expectedGuests: number;  
 description?: string;  
}

const EventCreationForm: FC \= () \=\> {  
 const \[step, setStep\] \= useState\<1 | 2 | 3\>(1);  
 const \[formData, setFormData\] \= useState\<EventFormData\>({  
   name: '',  
   type: 'wedding',  
   date: '',  
   location: '',  
   expectedGuests: 0,  
   description: ''  
 });  
 const \[errors, setErrors\] \= useState\<Partial\<EventFormData\>\>({});

 const validateStep \= (): boolean \=\> {  
   const newErrors: Partial\<EventFormData\> \= {};  
    
   switch(step) {  
     case 1:  
       if (\!formData.name) newErrors.name \= 'Event name is required';  
       if (\!formData.type) newErrors.type \= 'Please select an event type';  
       break;  
     case 2:  
       if (\!formData.date) newErrors.date \= 'Date is required';  
       if (\!formData.location) newErrors.location \= 'Location is required';  
       break;  
     case 3:  
       if (formData.expectedGuests \< 1) {  
         newErrors.expectedGuests \= 'At least 1 guest is required';  
       }  
       break;  
   }  
    
   setErrors(newErrors);  
   return Object.keys(newErrors).length \=== 0;  
 };

 const handleNext \= () \=\> {  
   if (validateStep()) {  
     setStep(prev \=\> Math.min(prev \+ 1, 3) as 1 | 2 | 3);  
   }  
 };

 const handleSubmit \= async () \=\> {  
   if (validateStep()) {  
     // Submit form logic  
   }  
 };

 return (  
   \<form className\="max-w-2xl mx-auto"\>  
     {/\* Progress Indicator \*/}  
     \<div className\="flex justify-between mb-8"\>  
       {\[1, 2, 3\].map(num \=\> (  
         \<div key\={num} className\="flex-1 mx-1"\>  
           \<div className\={\`h-2 rounded-full transition-colors  
             ${step \>= num ? 'bg-blue-600' : 'bg-gray-200'}\`}  
           /\>  
         \</div\>  
       ))}  
     \</div\>

     {/\* Form Steps \*/}  
     {step \=== 1 && (  
       \<div className\="space-y-4"\>  
         \<h2 className\="text-2xl font-bold mb-4"\>Basic Information\</h2\>  
         {/\* Form fields with TypeScript types \*/}  
       \</div\>  
     )}

     {/\* Navigation \*/}  
     \<div className\="flex justify-between mt-8"\>  
       \<Button  
         variant\="ghost"  
         onClick\={() \=\> setStep(prev \=\> Math.max(prev \- 1, 1) as 1 | 2 | 3)}  
         disabled\={step \=== 1}  
       \>  
         Previous  
       \</Button\>  
       {step \< 3 ? (  
         \<Button variant\="primary" onClick\={handleNext}\>  
           Next  
         \</Button\>  
       ) : (  
         \<Button variant\="primary" onClick\={handleSubmit}\>  
           Create Event  
         \</Button\>  
       )}  
     \</div\>  
   \</form\>  
 );  
};

### **Inline Editing (Guest List):** {#inline-editing-(guest-list):}

// components/forms/InlineGuestEdit.tsx  
interface Guest {  
 id: string;  
 name: string;  
 email: string;  
 phone?: string;  
 rsvpStatus: 'pending' | 'attending' | 'not\_attending' | 'maybe';  
}

interface InlineGuestEditProps {  
 guest: Guest;  
 onSave: (guest: Guest) \=\> Promise\<void\>;  
 onCancel: () \=\> void;  
}

const InlineGuestEdit: FC\<InlineGuestEditProps\> \= ({ guest, onSave, onCancel }) \=\> {  
 const \[editedGuest, setEditedGuest\] \= useState\<Guest\>(guest);  
 const \[isEditing, setIsEditing\] \= useState\<boolean\>(false);  
 const \[isSaving, setIsSaving\] \= useState\<boolean\>(false);

 const handleSave \= async () \=\> {  
   setIsSaving(true);  
   try {  
     await onSave(editedGuest);  
     setIsEditing(false);  
   } catch (error) {  
     console.error('Failed to save guest:', error);  
   } finally {  
     setIsSaving(false);  
   }  
 };

 const handleKeyDown \= (e: React.KeyboardEvent) \=\> {  
   if (e.key \=== 'Enter') {  
     handleSave();  
   } else if (e.key \=== 'Escape') {  
     setEditedGuest(guest);  
     setIsEditing(false);  
     onCancel();  
   }  
 };

 if (\!isEditing) {  
   return (  
     \<div  
       className\="flex items-center p-2 hover:bg-gray-50 cursor-pointer"  
       onClick\={() \=\> setIsEditing(true)}  
     \>  
       \<span\>{guest.name}\</span\>  
       \<span className\="ml-4 text-gray-500"\>{guest.email}\</span\>  
     \</div\>  
   );  
 }

 return (  
   \<div className\="flex items-center p-2 bg-blue-50 border border-blue-200 rounded"\>  
     \<input  
       type\="text"  
       value\={editedGuest.name}  
       onChange\={(e) \=\> setEditedGuest({...editedGuest, name: e.target.value})}  
       onKeyDown\={handleKeyDown}  
       className\="flex-1 px-2 py-1 mr-2"  
       disabled\={isSaving}  
     /\>  
     \<Button size\="sm" variant\="primary" onClick\={handleSave} loading\={isSaving}\>  
       Save  
     \</Button\>  
     \<Button size\="sm" variant\="ghost" onClick\={onCancel} disabled\={isSaving}\>  
       Cancel  
     \</Button\>  
   \</div\>  
 );  
};

### **Feedback Mechanisms with TypeScript** {#feedback-mechanisms-with-typescript}

**Loading States:**

// components/ui/SkeletonLoader.tsx  
interface SkeletonProps {  
 lines?: number;  
 className?: string;  
}

const SkeletonLoader: FC\<SkeletonProps\> \= ({ lines \= 3, className \= '' }) \=\> {  
 return (  
   \<div className\={\`animate-pulse ${className}\`}\>  
     {Array.from({ length: lines }).map((\_, index) \=\> (  
       \<div  
         key\={index}  
         className\={\`h-4 bg-gray-200 rounded mb-2  
           ${index \=== lines \- 1 ? 'w-1/2' : 'w-full'}\`}  
       /\>  
     ))}  
   \</div\>  
 );  
};

### **Toast Notifications:** {#toast-notifications:}

// components/ui/Toast.tsx  
type ToastType \= 'success' | 'error' | 'warning' | 'info';

interface ToastProps {  
 type: ToastType;  
 message: string;  
 duration?: number;  
 onClose: () \=\> void;  
}

const Toast: FC\<ToastProps\> \= ({ type, message, duration \= 5000, onClose }) \=\> {  
 useEffect(() \=\> {  
   const timer \= setTimeout(onClose, duration);  
   return () \=\> clearTimeout(timer);  
 }, \[duration, onClose\]);

 const styles: Record\<ToastType, string\> \= {  
   success: 'bg-green-500',  
   error: 'bg-red-500',  
   warning: 'bg-amber-500',  
   info: 'bg-blue-500'  
 };

 const icons: Record\<ToastType, string\> \= {  
   success: '✓',  
   error: '✗',  
   warning: '⚠',  
   info: 'ℹ'  
 };

 return (  
   \<div className\={\`${styles\[type\]} text-white p-4 rounded-lg shadow-lg  
                    flex items-center space-x-3 min-w-\[300px\]\`}\>  
     \<span className\="text-xl"\>{icons\[type\]}\</span\>  
     \<span className\="flex-1"\>{message}\</span\>  
     \<button  
       onClick\={onClose}  
       className\="ml-4 hover:opacity-75"  
       aria-label\="Close notification"  
     \>  
       ✕  
     \</button\>  
   \</div\>  
 );  
};

### **Error Handling:** {#error-handling:}

// hooks/useFormValidation.ts  
interface ValidationRule {  
 required?: boolean;  
 minLength?: number;  
 maxLength?: number;  
 pattern?: RegExp;  
 custom?: (value: any) \=\> boolean;  
}

interface ValidationErrors {  
 \[key: string\]: string;  
}

const useFormValidation \= \<T extends Record\<string, any\>\>(  
 initialValues: T,  
 rules: Record\<keyof T, ValidationRule\>  
) \=\> {  
 const \[values, setValues\] \= useState\<T\>(initialValues);  
 const \[errors, setErrors\] \= useState\<ValidationErrors\>({});  
 const \[touched, setTouched\] \= useState\<Record\<keyof T, boolean\>\>({} as Record\<keyof T, boolean\>);

 const validate \= (fieldName: keyof T, value: any): string | null \=\> {  
   const rule \= rules\[fieldName\];  
   if (\!rule) return null;

   if (rule.required && \!value) {  
     return \`${String(fieldName)} is required\`;  
   }

   if (rule.minLength && value.length \< rule.minLength) {  
     return \`Minimum length is ${rule.minLength}\`;  
   }

   if (rule.maxLength && value.length \> rule.maxLength) {  
     return \`Maximum length is ${rule.maxLength}\`;  
   }

   if (rule.pattern && \!rule.pattern.test(value)) {  
     return 'Invalid format';  
   }

   if (rule.custom && \!rule.custom(value)) {  
     return 'Invalid value';  
   }

   return null;  
 };

 const handleChange \= (fieldName: keyof T) \=\> (  
   e: React.ChangeEvent\<HTMLInputElement | HTMLTextAreaElement\>  
 ) \=\> {  
   const value \= e.target.value;  
   setValues(prev \=\> ({ ...prev, \[fieldName\]: value }));  
    
   if (touched\[fieldName\]) {  
     const error \= validate(fieldName, value);  
     setErrors(prev \=\> ({  
       ...prev,  
       \[fieldName\]: error || undefined  
     }));  
   }  
 };

 const handleBlur \= (fieldName: keyof T) \=\> () \=\> {  
   setTouched(prev \=\> ({ ...prev, \[fieldName\]: true }));  
   const error \= validate(fieldName, values\[fieldName\]);  
   setErrors(prev \=\> ({  
     ...prev,  
     \[fieldName\]: error || undefined  
   }));  
 };

 return {  
   values,  
   errors,  
   touched,  
   handleChange,  
   handleBlur,  
   isValid: Object.keys(errors).length \=== 0  
 };  
};

export default useFormValidation;

### **Mobile Interactions** {#mobile-interactions}

**Touch Targets:**

* Minimum 44×44px for all interactive elements  
* 8px spacing between targets  
* Thumb-friendly bottom navigation  
* Swipe gestures for common actions

**Responsive Behavior:**

* Collapsible sidebar on tablet/mobile  
* Bottom sheet modals on mobile  
* Horizontal scroll for tables  
* Stacked cards on narrow screens

## **Component Library with TypeScript** {#component-library-with-typescript}

### **Type Definitions** {#type-definitions}

// types/components.ts  
export interface ButtonProps {  
 variant: 'primary' | 'secondary' | 'ghost' | 'danger';  
 size?: 'sm' | 'md' | 'lg';  
 disabled?: boolean;  
 loading?: boolean;  
 onClick?: () \=\> void;  
 children: React.ReactNode;  
}

export interface EventCardProps {  
 event: {  
   id: string;  
   name: string;  
   date: Date;  
   type: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'other';  
   status: 'draft' | 'active' | 'completed' | 'cancelled';  
   guestCount: number;  
   venue?: string;  
 };  
 onClick?: (id: string) \=\> void;  
}

export interface FormFieldProps {  
 label: string;  
 name: string;  
 type?: 'text' | 'email' | 'date' | 'number';  
 value: string | number;  
 error?: string;  
 required?: boolean;  
 placeholder?: string;  
 helpText?: string;  
 onChange: (e: React.ChangeEvent\<HTMLInputElement\>) \=\> void;  
 onBlur?: (e: React.FocusEvent\<HTMLInputElement\>) \=\> void;  
}

### **Core UI Components** {#core-ui-components}

**Button Component with TypeScript:**

// components/ui/Button.tsx  
import { FC } from 'react';  
import { ButtonProps } from '@/types/components';

const Button: FC\<ButtonProps\> \= ({  
 variant \= 'primary',  
 size \= 'md',  
 disabled \= false,  
 loading \= false,  
 onClick,  
 children  
}) \=\> {  
 const baseStyles \= 'rounded-lg transition-colors focus:outline-none focus:ring-2 font-semibold';  
  const variants \= {  
   primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',  
   secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',  
   ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-300',  
   danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'  
 };

 const sizes \= {  
   sm: 'px-4 py-2 text-sm',  
   md: 'px-6 py-3 text-base',  
   lg: 'px-8 py-4 text-lg'  
 };

 return (  
   \<button  
     className\={\`${baseStyles} ${variants\[variant\]} ${sizes\[size\]}  
                 ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}\`}  
     disabled\={disabled || loading}  
     onClick\={onClick}  
   \>  
     {loading ? (  
       \<span className\="flex items-center"\>  
         \<svg className\="animate-spin h-4 w-4 mr-2" viewBox\="0 0 24 24"\>  
           {/\* Loading spinner SVG \*/}  
         \</svg\>  
         Loading...  
       \</span\>  
     ) : children}  
   \</button\>  
 );  
};

export default Button;

### **Event Card Component:** {#event-card-component:}

// components/ui/EventCard.tsx  
import { FC } from 'react';  
import { EventCardProps } from '@/types/components';  
import { format } from 'date-fns';

const EventCard: FC\<EventCardProps\> \= ({ event, onClick }) \=\> {  
 const statusColors: Record\<typeof event.status, string\> \= {  
   draft: 'bg-gray-100 text-gray-800',  
   active: 'bg-green-100 text-green-800',  
   completed: 'bg-blue-100 text-blue-800',  
   cancelled: 'bg-red-100 text-red-800'  
 };

 return (  
   \<div  
     className\="bg-white rounded-xl shadow-sm border border-gray-200  
                p-6 hover:shadow-md transition-shadow cursor-pointer"  
     onClick\={() \=\> onClick?.(event.id)}  
     role\="button"  
     tabIndex\={0}  
     onKeyPress\={(e) \=\> {  
       if (e.key \=== 'Enter' || e.key \=== ' ') {  
         onClick?.(event.id);  
       }  
     }}  
   \>  
     \<div className\="flex justify-between items-start mb-4"\>  
       \<h3 className\="text-lg font-semibold"\>{event.name}\</h3\>  
       \<span className\={\`px-2 py-1 rounded-full text-xs font-medium  
                        ${statusColors\[event.status\]}\`}\>  
         {event.status}  
       \</span\>  
     \</div\>  
     \<div className\="space-y-2 text-sm text-gray-600"\>  
       \<p\>📅 {format(event.date, 'MMMM d, yyyy')}\</p\>  
       \<p\>👥 {event.guestCount} guests\</p\>  
       {event.venue && \<p\>📍 {event.venue}\</p\>}  
     \</div\>  
   \</div\>  
 );  
};

export default EventCard;

**Form Input Component:**

// components/ui/FormField.tsx  
import { FC } from 'react';  
import { FormFieldProps } from '@/types/components';

const FormField: FC\<FormFieldProps\> \= ({  
 label,  
 name,  
 type \= 'text',  
 value,  
 error,  
 required \= false,  
 placeholder,  
 helpText,  
 onChange,  
 onBlur  
}) \=\> {  
 return (  
   \<div className\="mb-4"\>  
     \<label  
       htmlFor\={name}  
       className\="block text-sm font-medium text-gray-700 mb-1"  
     \>  
       {label}  
       {required && \<span className\="text-red-500 ml-1"\>\*\</span\>}  
     \</label\>  
     \<input  
       id\={name}  
       name\={name}  
       type\={type}  
       value\={value}  
       onChange\={onChange}  
       onBlur\={onBlur}  
       placeholder\={placeholder}  
       aria-invalid\={\!\!error}  
       aria-describedby\={error ? \`${name}-error\` : \`${name}-help\`}  
       className\={\`w-full px-4 py-2 border rounded-lg transition-colors  
                  focus:ring-2 focus:ring-blue-500 focus:border-transparent  
                  ${error ? 'border-red-500' : 'border-gray-300'}\`}  
     /\>  
     {error && (  
       \<p id\={\`${name}-error\`} className\="mt-1 text-sm text-red-600"\>  
         {error}  
       \</p\>  
     )}  
     {helpText && \!error && (  
       \<p id\={\`${name}-help\`} className\="mt-1 text-sm text-gray-500"\>  
         {helpText}  
       \</p\>  
     )}  
   \</div\>  
 );  
};

export default FormField;

### **Custom Components with TypeScript** {#custom-components-with-typescript}

**Event Status Badge:**

// components/ui/StatusBadge.tsx  
type Status \= 'draft' | 'active' | 'completed' | 'cancelled';

interface StatusBadgeProps {  
 status: Status;  
}

const StatusBadge: FC\<StatusBadgeProps\> \= ({ status }) \=\> {  
 const styles: Record\<Status, string\> \= {  
   draft: 'bg-gray-100 text-gray-800',  
   active: 'bg-green-100 text-green-800',  
   completed: 'bg-blue-100 text-blue-800',  
   cancelled: 'bg-red-100 text-red-800'  
 };

 return (  
   \<span className\={\`px-3 py-1 rounded-full text-xs font-medium ${styles\[status\]}\`}\>  
     {status.charAt(0).toUpperCase() \+ status.slice(1)}  
   \</span\>  
 );  
};

**Budget Progress Bar:**

// components/ui/BudgetProgress.tsx  
interface BudgetProgressProps {  
 total: number;  
 spent: number;  
 category?: string;  
 onClick?: () \=\> void;  
}

const BudgetProgress: FC\<BudgetProgressProps\> \= ({ total, spent, category, onClick }) \=\> {  
 const percentage \= Math.min((spent / total) \* 100, 100);  
 const getColor \= (pct: number): string \=\> {  
   if (pct \<= 70) return 'bg-green-500';  
   if (pct \<= 90) return 'bg-amber-500';  
   return 'bg-red-500';  
 };

 return (  
   \<div  
     className\="cursor-pointer"  
     onClick\={onClick}  
     role\="progressbar"  
     aria-valuenow\={spent}  
     aria-valuemin\={0}  
     aria-valuemax\={total}  
   \>  
     {category && \<p className\="text-sm font-medium mb-1"\>{category}\</p\>}  
     \<div className\="relative h-6 bg-gray-200 rounded-full overflow-hidden"\>  
       \<div  
         className\={\`h-full ${getColor(percentage)} transition-all duration-500\`}  
         style\={{ width: \`${percentage}%\` }}  
       /\>  
       \<span className\="absolute inset-0 flex items-center justify-center text-xs font-medium"\>  
         ${spent.toLocaleString()} / ${total.toLocaleString()}  
       \</span\>  
     \</div\>  
   \</div\>  
 );  
};

### **RSVP Counter:** {#rsvp-counter:}

// components/ui/RSVPCounter.tsx  
interface RSVPCounterProps {  
 attending: number;  
 notAttending: number;  
 pending: number;  
 total: number;  
}

const RSVPCounter: FC\<RSVPCounterProps\> \= ({ attending, notAttending, pending, total }) \=\> {  
 const percentage \= (attending / total) \* 100;

 return (  
   \<div className\="bg-white rounded-lg p-4 border border-gray-200"\>  
     \<div className\="flex justify-between items-center mb-3"\>  
       \<h4 className\="font-semibold"\>RSVP Status\</h4\>  
       \<span className\="text-2xl font-bold text-blue-600"\>  
         {attending}/{total}  
       \</span\>  
     \</div\>  
     \<div className\="space-y-2"\>  
       \<div className\="flex justify-between text-sm"\>  
         \<span className\="text-green-600"\>✓ Attending\</span\>  
         \<span\>{attending}\</span\>  
       \</div\>  
       \<div className\="flex justify-between text-sm"\>  
         \<span className\="text-red-600"\>✗ Not Attending\</span\>  
         \<span\>{notAttending}\</span\>  
       \</div\>  
       \<div className\="flex justify-between text-sm"\>  
         \<span className\="text-gray-500"\>○ Pending\</span\>  
         \<span\>{pending}\</span\>  
       \</div\>  
     \</div\>  
   \</div\>  
 );  
};

## **Accessibility Considerations** {#accessibility-considerations}

### **WCAG 2.1 Level AA Compliance** {#wcag-2.1-level-aa-compliance}

**Color Contrast:**

* All text maintains 4.5:1 contrast ratio  
* Large text (18px+) maintains 3:1 ratio  
* Interactive elements have visible focus states  
* Color not sole indicator of meaning

**Keyboard Navigation:**

* All interactive elements keyboard accessible  
* Logical tab order throughout  
* Skip navigation links  
* Keyboard shortcuts for power users

**Screen Reader Support:**

* Semantic HTML structure  
* ARIA labels for complex widgets  
* Live regions for dynamic updates  
* Alternative text for all images

**Responsive Text:**

* Base font size 16px minimum  
* User-adjustable font sizing  
* Line height 1.5 for body text  
* Maximum line length 75 characters

## **Motion and Animation** {#motion-and-animation}

### **Micro-interactions** {#micro-interactions}

**Hover Effects:**

* Scale: 1.02 for cards  
* Shadow elevation changes  
* Color transitions (200ms ease)  
* Underline animations for links

**Loading Animations:**

* Spinner for quick loads (\<2s)  
* Progress bar for file uploads  
* Skeleton screens for content  
* Pulsing effect for pending items

**Transitions:**

/\* Standard transition for all interactions \*/  
transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

### **Celebratory Animations** {#celebratory-animations}

**Milestone Achievements:**

* Confetti burst on event creation  
* Progress celebration at 100% RSVP  
* Success checkmark animation  
* Number counter animations

## **Error Prevention and Recovery with TypeScript** {#error-prevention-and-recovery-with-typescript}

### **Validation Strategies** {#validation-strategies}

**Real-time Validation with Type Safety:**

// utils/validators.ts  
export const validators \= {  
 email: (value: string): boolean \=\> {  
   const emailRegex \= /^\[^\\s@\]\+@\[^\\s@\]\+**\\.**\[^\\s@\]\+$/;  
   return emailRegex.test(value);  
 },  
  futureDate: (date: Date): boolean \=\> {  
   return date \> new Date();  
 },  
  guestCount: (count: number, max: number \= 1000): boolean \=\> {  
   return count \> 0 && count \<= max;  
 },  
  budgetAmount: (amount: number): boolean \=\> {  
   return amount \>= 0 && amount \<= 1000000;  
 }  
};

// components/forms/ValidatedInput.tsx  
interface ValidatedInputProps {  
 value: string;  
 validator: (value: string) \=\> boolean;  
 errorMessage: string;  
 onChange: (value: string, isValid: boolean) \=\> void;  
 placeholder?: string;  
 label: string;  
}

const ValidatedInput: FC\<ValidatedInputProps\> \= ({  
 value,  
 validator,  
 errorMessage,  
 onChange,  
 placeholder,  
 label  
}) \=\> {  
 const \[error, setError\] \= useState\<string\>('');  
 const \[touched, setTouched\] \= useState\<boolean\>(false);

 const handleChange \= (e: React.ChangeEvent\<HTMLInputElement\>) \=\> {  
   const newValue \= e.target.value;  
   const isValid \= validator(newValue);  
    
   if (touched) {  
     setError(isValid ? '' : errorMessage);  
   }  
    
   onChange(newValue, isValid);  
 };

 const handleBlur \= () \=\> {  
   setTouched(true);  
   if (\!validator(value)) {  
     setError(errorMessage);  
   }  
 };

 return (  
   \<div className\="mb-4"\>  
     \<label className\="block text-sm font-medium text-gray-700 mb-1"\>  
       {label}  
     \</label\>  
     \<input  
       type\="text"  
       value\={value}  
       onChange\={handleChange}  
       onBlur\={handleBlur}  
       placeholder\={placeholder}  
       className\={\`w-full px-4 py-2 border rounded-lg  
                  ${error ? 'border-red-500' : 'border-gray-300'}  
                  focus:ring-2 focus:ring-blue-500\`}  
     /\>  
     {error && \<p className\="mt-1 text-sm text-red-600"\>{error}\</p\>}  
   \</div\>  
 );  
};

### **Confirmation Dialog Component:** {#confirmation-dialog-component:}

// components/ui/ConfirmationModal.tsx  
interface ConfirmationModalProps {  
 isOpen: boolean;  
 title: string;  
 message: string;  
 confirmText?: string;  
 cancelText?: string;  
 variant?: 'danger' | 'warning' | 'info';  
 onConfirm: () \=\> void | Promise\<void\>;  
 onCancel: () \=\> void;  
}

const ConfirmationModal: FC\<ConfirmationModalProps\> \= ({  
 isOpen,  
 title,  
 message,  
 confirmText \= 'Confirm',  
 cancelText \= 'Cancel',  
 variant \= 'warning',  
 onConfirm,  
 onCancel  
}) \=\> {  
 const \[isLoading, setIsLoading\] \= useState\<boolean\>(false);

 const handleConfirm \= async () \=\> {  
   setIsLoading(true);  
   try {  
     await onConfirm();  
   } finally {  
     setIsLoading(false);  
   }  
 };

 const variantStyles: Record\<typeof variant, string\> \= {  
   danger: 'bg-red-600 hover:bg-red-700',  
   warning: 'bg-amber-600 hover:bg-amber-700',  
   info: 'bg-blue-600 hover:bg-blue-700'  
 };

 if (\!isOpen) return null;

 return (  
   \<div className\="fixed inset-0 z-50 flex items-center justify-center"\>  
     \<div className\="absolute inset-0 bg-black opacity-50" onClick\={onCancel} /\>  
     \<div className\="relative bg-white rounded-lg p-6 max-w-md w-full mx-4"\>  
       \<h2 className\="text-xl font-semibold mb-4"\>{title}\</h2\>  
       \<p className\="text-gray-600 mb-6"\>{message}\</p\>  
       \<div className\="flex justify-end space-x-3"\>  
         \<Button  
           variant\="ghost"  
           onClick\={onCancel}  
           disabled\={isLoading}  
         \>  
           {cancelText}  
         \</Button\>  
         \<button  
           onClick\={handleConfirm}  
           disabled\={isLoading}  
           className\={\`px-4 py-2 text-white rounded-lg transition-colors  
                      ${variantStyles\[variant\]}  
                      ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}\`}  
         \>  
           {isLoading ? 'Processing...' : confirmText}  
         \</button\>  
       \</div\>  
     \</div\>  
   \</div\>  
 );  
};

### **Auto-save Functionality:** {#auto-save-functionality:}

// hooks/useAutoSave.ts  
interface UseAutoSaveOptions {  
 delay?: number;  
 onSave: (data: any) \=\> Promise\<void\>;  
 onError?: (error: Error) \=\> void;  
}

const useAutoSave \= \<T\>(  
 data: T,  
 { delay \= 30000, onSave, onError }: UseAutoSaveOptions  
) \=\> {  
 const \[isSaving, setIsSaving\] \= useState\<boolean\>(false);  
 const \[lastSaved, setLastSaved\] \= useState\<Date | null\>(null);  
 const timeoutRef \= useRef\<NodeJS.Timeout\>();

 useEffect(() \=\> {  
   // Clear existing timeout  
   if (timeoutRef.current) {  
     clearTimeout(timeoutRef.current);  
   }

   // Set new timeout  
   timeoutRef.current \= setTimeout(async () \=\> {  
     setIsSaving(true);  
     try {  
       await onSave(data);  
       setLastSaved(new Date());  
     } catch (error) {  
       onError?.(error as Error);  
     } finally {  
       setIsSaving(false);  
     }  
   }, delay);

   // Cleanup on unmount or data change  
   return () \=\> {  
     if (timeoutRef.current) {  
       clearTimeout(timeoutRef.current);  
     }  
   };  
 }, \[data, delay, onSave, onError\]);

 return {  
   isSaving,  
   lastSaved,  
   forceSave: async () \=\> {  
     if (timeoutRef.current) {  
       clearTimeout(timeoutRef.current);  
     }  
     setIsSaving(true);  
     try {  
       await onSave(data);  
       setLastSaved(new Date());  
     } catch (error) {  
       onError?.(error as Error);  
     } finally {  
       setIsSaving(false);  
     }  
   }  
 };  
};

export default useAutoSave;

## **Performance Optimization** {#performance-optimization}

### **Perceived Performance** {#perceived-performance}

**Optimistic UI Updates:**

* Immediate visual feedback  
* Background synchronization  
* Rollback on failure  
* Queue offline actions

**Progressive Enhancement:**

* Core functionality without JavaScript  
* Enhanced features when available  
* Graceful degradation  
* Feature detection

### **Loading Strategies** {#loading-strategies}

**Code Splitting:**

* Route-based splitting  
* Lazy load heavy components  
* Prefetch likely next pages  
* Bundle size optimization

**Asset Optimization:**

* WebP images with fallbacks  
* Responsive image sizing  
* Lazy loading below fold  
* CDN distribution

## **References** {#references-1}

Cooper, A., Reimann, R., Cronin, D., & Noessel, C. (2014). *About Face: The Essentials of Interaction Design* (4th ed.). Wiley.

Krug, S. (2014). *Don't Make Me Think, Revisited: A Common Sense Approach to Web Usability* (3rd ed.). New Riders.

Nielsen, J., & Budiu, R. (2013). *Mobile Usability*. New Riders.

Norman, D. (2013). *The Design of Everyday Things: Revised and Expanded Edition*. Basic Books.

Tidwell, J., Brewer, C., & Valencia, A. (2020). *Designing Interfaces: Patterns for Effective Interaction Design* (3rd ed.). O'Reilly Media.

W3C. (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. [https://www.w3.org/WAI/WCAG21/quickref/](https://www.w3.org/WAI/WCAG21/quickref/)

# Prototype {#prototype}

## **Overview** {#overview-4}

The Party-Time prototype demonstrates the core MVP functionality implemented during the first 8 weeks of development, focusing on essential event management features and establishing a robust technical foundation. This working prototype validates the feasibility of the microservices architecture, showcases the responsive user interface built with Next.js and TypeScript, and proves the integration capabilities with external services including AWS Cognito for authentication and Google Places API for venue discovery. The prototype currently supports the complete event lifecycle from creation through RSVP management, serving as a solid foundation for the enhanced features planned in subsequent development phases.

## **Current Implementation Status** {#current-implementation-status}

### **Completed Core Features** {#completed-core-features}

**Authentication System (100% Complete)** The authentication module leverages AWS Cognito with both email/password and Google OAuth options. Users can register, verify their email addresses, and securely access the platform. The implementation includes JWT token management, role-based access control distinguishing between planners and guests, and secure session handling with automatic token refresh.

**Event Management (85% Complete)** Event creation and management functionality allows planners to create events with essential details including name, type, date, and location. The system supports multiple event types (wedding, birthday, corporate, graduation, celebration) with type-specific form fields and automatically generates unique event identifiers. Event state management tracks events through draft, active, and completed phases.

**Guest List Management (75% Complete)** The guest management system enables manual guest entry with contact information storage and basic categorization. Each guest receives a unique RSVP token for passwordless event access. The Excel import feature using Papa Parse is partially implemented, currently supporting CSV format with bulk validation.

**RSVP System (90% Complete)** Guests can respond to invitations through unique RSVP links without requiring account creation. The system tracks attendance status (attending, not attending, maybe) and sends automated confirmation emails via AWS SES. Real-time updates reflect in the planner's dashboard as responses are received.

**Basic Venue Search (70% Complete)** Integration with Google Places API provides venue discovery by location with basic filtering capabilities. Search results display venue names, addresses, and ratings. Manual venue entry is fully functional for cases where automated search doesn't yield suitable results.

### **Technical Infrastructure** {#technical-infrastructure}

**Backend API (FastAPI)**

* RESTful endpoints for all core operations  
* Async request handling for improved performance  
* Pydantic models for automatic validation  
* SQLAlchemy ORM with PostgreSQL integration  
* Comprehensive error handling and logging

**Frontend Application (Next.js)**

* Server-side rendering for improved SEO and performance  
* TypeScript for type safety and developer experience  
* Responsive design with Tailwind CSS  
* React Hook Form for form management  
* React Query for server state synchronization

**DevOps Pipeline**

* Docker containers for local development  
* GitHub Actions CI/CD workflow  
* Automated testing with pytest (backend) and Jest (frontend)  
* AWS infrastructure provisioned with Terraform  
* Environment-based configuration management

## **User Interface Screenshots** {#user-interface-screenshots}

### **Landing Page** {#landing-page}

The landing page presents a clean, professional design that immediately communicates the application's value proposition. The hero section features a gradient background with the tagline "Plan Perfect Events, Create Lasting Memories" and a prominent "Start Planning" call-to-action button. Below the fold, feature cards highlight key capabilities: Guest Management, Budget Tracking, and Venue Discovery.

**Key UI Elements:**

* Sticky navigation bar with authentication options  
* Responsive grid layout for feature showcase  
* Testimonial carousel (placeholder content)  
* Footer with quick links and contact information

### **Registration Flow** {#registration-flow}

The registration process implements a streamlined two-step approach. Step one collects basic information (name, email, password) with real-time validation feedback. Step two offers role selection (Event Planner or Vendor) and optional profile customization. Google OAuth provides single-click registration as an alternative path.

**Key UI Elements:**

* Progress indicator showing registration steps  
* Inline field validation with helpful error messages  
* Password strength indicator  
* Terms of service checkbox with modal preview

### **Event Dashboard** {#event-dashboard}

The authenticated planner dashboard displays active events in a card-based layout. Each event card shows essential information: event name, date, type icon, guest count progress bar, and RSVP status summary. The dashboard header includes quick statistics: total events, upcoming this month, and total guests across all events.

**Key UI Elements:**

* Filterable event grid (active, draft, completed)  
* Search bar with type-ahead suggestions  
* "Create New Event" floating action button  
* Responsive cards with hover effects

### **Event Creation Form** {#event-creation-form}

The multi-step event creation form uses progressive disclosure to avoid overwhelming users. Step 1 captures event basics (name, type, date), Step 2 handles location details with Google Places autocomplete, and Step 3 sets guest count and privacy settings. Each step includes contextual help text and smart defaults based on event type.

**Key UI Elements:**

* Visual step indicator with clickable navigation  
* Event type selector with descriptive icons  
* Date picker with availability checking  
* Google Places integrated location search  
* Auto-save indicator showing draft status

### **Guest Management Interface** {#guest-management-interface}

The guest list view provides a sortable, filtable table with inline editing capabilities. Planners can add guests individually through a slide-out panel or bulk import via CSV upload. Each guest row displays name, email, RSVP status with color coding, and action buttons for edit/delete operations.

**Key UI Elements:**

* Searchable guest table with pagination  
* Drag-and-drop CSV upload zone  
* RSVP status filters (attending, pending, declined)  
* Bulk selection for group operations  
* Export to CSV functionality

### **Guest RSVP Portal** {#guest-rsvp-portal}

The guest-facing RSVP page requires no authentication, loading personalized event details from the unique token. The interface displays event information prominently, followed by a simple RSVP form with attendance options and dietary restrictions field. The mobile-optimized design ensures easy completion on any device.

**Key UI Elements:**

* Event header with date and venue details  
* Large, touch-friendly response buttons  
* Optional fields collapsed by default  
* Progress indicator for form submission  
* Calendar download button post-confirmation

## **Feature Demonstrations** {#feature-demonstrations}

### **Core Workflow: Event Creation to RSVP** {#core-workflow:-event-creation-to-rsvp}

**Step 1: Event Setup** The planner begins by clicking "Create Event" from the dashboard, triggering the creation wizard. After selecting "Wedding" as the event type, they enter "Sarah & Michael's Wedding" as the event name and choose June 15, 2025 as the date. The system automatically suggests planning milestones based on the 6-month timeline.

**Step 2: Venue Selection** Using the integrated Google Places search, the planner types "venues near Costa Mesa" and reviews results with photos and ratings. They select "The Estate on Second" which automatically populates address and capacity information. The venue details are saved to the event record for future reference.

**Step 3: Guest List Building** The planner uploads a CSV file containing 150 guests using the drag-and-drop interface. The system validates email formats, identifies 3 duplicate entries for review, and successfully imports 147 unique guests. Each guest is automatically assigned to categories (Family, Friends, Colleagues) based on the CSV structure.

**Step 4: Invitation Distribution** With guests imported, the planner customizes the invitation template and triggers bulk email sending. The system queues emails through AWS SES, sending them in batches to comply with rate limits. Each email contains a unique RSVP link and event details.

**Step 5: RSVP Collection** Guests receive personalized emails and click their RSVP links. The guest portal loads with their name pre-filled, displaying event details and response options. As guests submit responses, the planner's dashboard updates in real-time, showing acceptance rates and dietary restriction summaries.

### **Data Validation and Error Handling** {#data-validation-and-error-handling}

The prototype implements comprehensive validation at multiple levels:

**Frontend Validation:**

* Required field checking before form submission  
* Email format validation using regex patterns  
* Date validation ensuring future dates only  
* Guest count limits (1-1000)  
* Real-time feedback on invalid inputs

**Backend Validation:**

* Pydantic schema validation on all API endpoints  
* Database constraint enforcement  
* Business logic validation (no duplicate events on same date)  
* Foreign key relationship integrity  
* SQL injection prevention through parameterized queries

**Error Recovery:**

* Auto-save every 30 seconds for event drafts  
* Session restoration after connection loss  
* Graceful handling of API failures with retry logic  
* Clear error messages with suggested actions  
* Rollback capability for failed bulk operations

## **Technical Implementation Details** {#technical-implementation-details}

### **Database Schema Implementation** {#database-schema-implementation}

The PostgreSQL database currently contains 6 core tables with established relationships:

   \-- Current implemented tables  
users (id, email, name, role, created\_at, updated\_at)  
events (id, planner\_id, name, type, date, status, guest\_count)  
guests (id, event\_id, name, email, rsvp\_status, rsvp\_token)  
venues (id, google\_place\_id, name, address, capacity)  
event\_venues (event\_id, venue\_id)  
audit\_log (id, user\_id, action, entity\_type, entity\_id, timestamp)

Indexes have been created on frequently queried fields (email, event\_date, rsvp\_token) resulting in sub-100ms query times for typical operations. The audit\_log table tracks all data modifications for compliance and debugging purposes.

### **API Endpoints Implemented** {#api-endpoints-implemented}

**Authentication Endpoints:**

* POST /api/auth/register \- User registration  
* POST /api/auth/login \- User authentication  
* POST /api/auth/refresh \- Token refresh  
* POST /api/auth/logout \- Session termination  
* GET /api/auth/verify-email \- Email verification

**Event Management Endpoints:**

* GET /api/events \- List user's events  
* POST /api/events \- Create new event  
* GET /api/events/{id} \- Get event details  
* PUT /api/events/{id} \- Update event  
* DELETE /api/events/{id} \- Delete event

**Guest Management Endpoints:**

* GET /api/events/{id}/guests \- List event guests  
* POST /api/events/{id}/guests \- Add guest  
* POST /api/events/{id}/guests/import \- Bulk import  
* PUT /api/guests/{id} \- Update guest  
* DELETE /api/guests/{id} \- Remove guest

**RSVP Endpoints:**

* GET /api/rsvp/{token} \- Get RSVP details  
* POST /api/rsvp/{token} \- Submit RSVP response  
* PUT /api/rsvp/{token} \- Update RSVP

**Venue Endpoints:**

* GET /api/venues/search \- Search Google Places  
* POST /api/venues \- Add custom venue  
* GET /api/venues/{id} \- Get venue details

### **Performance Metrics** {#performance-metrics}

**Current Performance Benchmarks:**

* Average API response time: 127ms  
* Frontend First Contentful Paint: 1.8s  
* Time to Interactive: 3.2s  
* Lighthouse Performance Score: 82  
* Database query average: 43ms  
* Successful RSVP submissions: 98.5%

**Load Testing Results (via Apache JMeter):**

* Concurrent users supported: 50  
* Requests per second: 120  
* Error rate under load: 0.3%  
* Memory usage (Docker container): 256MB  
* CPU usage (average): 15%

## **Limitations and Known Issues** {#limitations-and-known-issues}

### **Current Limitations** {#current-limitations}

**Feature Limitations:**

1. Email sending limited to 100/day in AWS SES sandbox mode  
2. File upload restricted to CSV format (Excel .xlsx pending)  
3. Budget tracking UI complete but calculations not fully implemented  
4. Vendor management interface designed but backend incomplete  
5. Real-time chat planned but not yet implemented

**Technical Limitations:**

1. No horizontal scaling configured (single instance deployment)  
2. Image upload to S3 not yet integrated  
3. Calendar sync with Google Calendar pending OAuth setup  
4. Mobile app views functional but not fully optimized  
5. Internationalization (i18n) framework not implemented

### **Known Bugs** {#known-bugs}

**Priority 1 (Critical):**

* None currently identified

**Priority 2 (Major):**

* Guest import occasionally fails with files \>100 rows (timeout issue)  
* RSVP confirmation email delays during high load periods  
* Session timeout not gracefully handled on frontend

**Priority 3 (Minor):**

* Date picker allows selection of today (should be tomorrow minimum)  
* Guest count doesn't update immediately after bulk delete  
* Venue search results occasionally show duplicate entries  
* Mobile keyboard covers form fields on some devices

## **Deployment and Access** {#deployment-and-access}

### **Local Development Setup** {#local-development-setup}

The prototype can be run locally using Docker Compose:

\# Clone repository  
git clone https://github.com/\[username\]/party-time.git  
cd party-time

\# Configure environment  
cp .env.example .env  
\# Edit .env with required API keys

\# Start services  
docker-compose up \-d

\# Run migrations  
docker-compose exec backend alembic upgrade head

\# Access application  
\# Frontend: http://localhost:3000  
\# Backend API: http://localhost:8000/docs

### **Staging Environment** {#staging-environment}

A staging deployment is available on AWS ECS (details in private documentation) demonstrating the cloud-native architecture. The staging environment uses:

* AWS ECS Fargate for container hosting  
* RDS PostgreSQL for database  
* CloudFront for CDN  
* Route 53 for DNS management

### **Demo Credentials** {#demo-credentials}

For prototype testing:

* **Planner Account:** demo@partytime.app / DemoPass123\!  
* **Sample Event:** "Demo Wedding Event" with 50 pre-populated guests  
* **Guest RSVP Token:** Available in demo planner dashboard

## **Video Demonstration** {#video-demonstration}

A comprehensive video walkthrough demonstrating all implemented features is available at: \[YouTube Demo Link \- To be recorded\]

The 8-minute demo covers:

1. User registration and authentication (0:00-1:00)  
2. Event creation workflow (1:00-3:00)  
3. Guest list management and import (3:00-4:30)  
4. RSVP submission from guest perspective (4:30-6:00)  
5. Dashboard analytics and reporting (6:00-7:00)  
6. Technical architecture overview (7:00-8:00)

## **Development Metrics Achieved** {#development-metrics-achieved}

### **Code Metrics** {#code-metrics-1}

* **Total Lines of Code:** 4,847 (excluding dependencies)  
* **Frontend Components:** 23 React components  
* **API Endpoints:** 18 REST endpoints  
* **Test Coverage:** 67% backend, 52% frontend  
* **Database Tables:** 6 with full CRUD operations

### **Development Progress** {#development-progress}

* **Phase 1 Features:** 78% complete  
* **GitHub Commits:** 186 across 8 weeks  
* **Pull Requests Merged:** 34  
* **Issues Closed:** 47 of 61 created  
* **Documentation Pages:** 38 (including API docs)

## **Next Steps and Roadmap** {#next-steps-and-roadmap}

### **Immediate Priorities (Weeks 9-10)** {#immediate-priorities-(weeks-9-10)}

1. Complete Excel file import functionality  
2. Implement budget tracking calculations  
3. Add vendor management CRUD operations  
4. Enhance mobile responsiveness  
5. Increase test coverage to 80%

### **Phase 2 Features (Weeks 11-12)** {#phase-2-features-(weeks-11-12)}

1. Interactive seating chart with Fabric.js  
2. Payment processing with Stripe integration  
3. Advanced analytics dashboard  
4. Email template customization  
5. Performance optimization for 100+ concurrent users

### **Phase 3 Enhancements (Week 13\)** {#phase-3-enhancements-(week-13)}

1. AI integration for planning suggestions  
2. Real-time chat implementation  
3. Photo gallery for events  
4. Calendar synchronization  
5. Final bug fixes and polish

## **Conclusion** {#conclusion}

The Party-Time prototype successfully demonstrates the viability of the proposed event planning platform, with core functionality operational and a solid technical foundation established. The implemented features validate the chosen architecture patterns, prove the integration capabilities with external services, and provide a user experience that addresses the primary pain points identified in the requirements phase. While some advanced features remain to be implemented, the current prototype achieves 78% of Phase 1 objectives and positions the project well for successful completion within the 13-week timeline. The combination of working features, comprehensive testing, and documented deployment pipeline provides confidence in the project's trajectory toward a production-ready application.

Retry  
[Claude can make mistakes.](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)  
[Please double-check responses.](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)  


[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAlQAAAIeCAYAAAB9W5EjAAB/90lEQVR4Xuy92bMd1ZWgzz/Qj/3UT/3QD/3Y0c/dLx0dHRUVVf7Zbbuo8tAubLCNdCUws41dNi4MnjAeKLuwMZh5LIZinkchkJCQEAIJhBAgEBIaLVlizN9dmbkz915r7Tx5bt6j4Z7vi/gib+Y55w7C0v28MnOf44oMn3zySS8//vhjRERExGNW3TY5uzhOHxD0JwjhtPal/cUfrt9RfPsnbxWLv/tGsUg8d0tPXy8WfWeUm63f1r7W4aZoW3uO9tVuzxZfGe1ZG7MuVttFZ22oPLN1cb2/OOyX25etZ7w8+1jkGS+VLnIMjy0+Y33jotO1LxaLZ7eLy23qotOC6xoXO1aPvTD78QvFom/Nbjtd27go+rj01Ng1PX2+WHzKKFdXLu1ylXVJ8LkervSdiV3Rz8XP9nPRMz1d3npyzqd7uKzym55PNc6o7eJvBJ9snMm4+OtPGGccF3/98dIZ2Z40u824+KTHZrcdnhh8tIePVH7N8+FoG/nV2IdGe8KDPXyg238M3t/fr9znuiTZ3lvM/D/rksR7GmeCXw7eXT0m20g53nrX7DHHL8XeOdov/ntP7yiWfKGvt7f+Q63e/4fbenhr5d97/lu0jTw+9pbGpY7lY393c+JSxyV/d5NxaeznY2/s5+du6OH1xdLPjvK6vP/32nab9Zq8nwlebTwl2ga/99Vbist/+ljxwrNvdMaWRxJU+gXhk/32qu1VPMWe2zemXu8RU10RpaPJMQ4mN6KckJJw0vt9Y2pEUKWmIeXrh1SlxFLY5lyfaiKqCqlgGU/ONg6pzqD6VhVSsTakKiWiFp2a6oXUIu0pKqSiYFpktnVAabviaWhIJeHk6YVTtE104inxmUoTTtqukNKxFPlNUQdTzjakEpuISkOq06/ng0qHlUSUNo2pKpgkqEpPjJU4siElx4PlvgRSiCg3pFQ8ec5rSKmgasLJ2e8bVE5EWe9tNUEl0RS2yiikgiGg9FZCqvRLlTai5PidrjamZo/XwRS2WU00eXrhpNXRFBliaWRIdahCqlMVU3FUxdsmpD7fakOqiqkl2s/NMaSCYwVUUEeTp44mZz8TU8ZPi1e55sJK0wSVF1K/v36HDakkqnQ8ec4hqJKocgLKGIVU36DSHuag0pMpmT7lgiqeTPkTqiqk4slUaUdQeeqYmo+giidTNqbGmE6ZKZSeSEWTKRNUI6JqaFDp/VFBFe/3Cqo6qkxAaUcF1aiw0vHkaWMqmVBlgkpPpsaeUI0MqiqqzISqCSkbVFYJqT6TqQ6nIKj0ZKqZUGWCSquDqgyouU6m6qAy4ZTTxJPn0RtUejpVTqgyMaUdJ6hGauLJ8zAGVRxWYwRVPKGqosrGlHjKrDK18sIqpgwqHVMfffSRnUb1DikJqCik3KByAsrElI4mz66A0joBlYTUGEFloslzQ6sJKommPpOpUaqJVHSar42pNqS8CVWjOtU3PKjaiNJ6IRVPp8p9CaRMSIXJlAmocUOqCSodTR2acMrphZPe19Hk+UxHTEk8qZAyQeWEk9ZEU87cRErrB5XZOjFlg6o9zafV06kyqJLJVDWdChMobXs8CqhBIdUzpsYKKh1Nnl441fYKqSigsjFlJ1LhNF9zui8Kqe6gaidTzYTKMUyjkq3EUxJSfWPqjkoTTyGgVEiZmHLCSWuiydOJJxNSfkxl7RVUaUg1QZUJKZlKlVuZTH1Otjf0CKkooLIx5QSU1kRTTh1NXdqYMjohFQdV5ZVlH+Wi6jg9lfrz/g+Kk2eDSGvDqfLk2UDSehOok8Vvp+ZO7Z0ce47oh1N5vNy+2mjCqY6mk+tYOrmOorA1mjDKaCKpSyeYeseThFL0sTmVlw+n6jRe0MaS8Vt+LFmrqVNyOk/vNzqn87SnVAHV7erWpdpV6uPaJdrnup0NodGu6LaOpUWzMeQpkRS2wUWzUaS18TR7fDaQtHYKVbkoWJ7Ok+2yOp5sQJWP6WDKxpONJaMTSVmdUPJ1Tud1BFTeRyq/5vmw+rj2q9qHup0NoZwSSe3+A63/WGljSY7fbzQBJcdn4yjWhlMUUGbylImnZuoUT5/sJMpax5ITT5X2VF5ieRqvOpXXy9kg6uftxcw/WCWa0u1ts1trG09tQM24SiDZgJqpg6na3jK7dQKpjKSgjSXrTZVOMKU6p/K0ZTxVAdXL2Ujq9rrK/+t5bbmVaZR8HEKpOh4Zpk7q9J4cr7y6VKIobI0dp/MS/78re/mz0+50p1VlUIWpVJhMhYDSW88QUHqrg6qMKhNRWj2BmvWc2jCRMpMnPYHKTKPmdfokbqg08eTpTKGSoBoVVX2DygmrJqh6RNVRHVRRVJmg0nGViyoJpzasZOJkompJGlB68uRFlTm1V4aVjSkdUnMJKgknvc1FVTqFirYqqOwUatQ0yomoJKjGiCoTTjkzQWWiSgeUpw4pz9FBJZMmb7v4hDSq7NSpI6ic03shoPTWaMIppw4oTzWRMmHVI6pCUKnrpSYSVSacqumT3d7eqoJKq2MqCarSNqj8SZQzlUouNg+TqMxEakhUuYHlBJTnPASVnkrlwso7vRfHVLlfBlV0es9Mn3pMoOY5qMTQTHFUHRfH1Ck/eLOQ03t6OuUH1eulejplg6qNKW02oqLJVJhCecYTKgmncgrlhlTPmBonqEw0eToh5arDKVIiaWRIZewbUk1Q6XDKqaMppxdOel9Hk2cdUm5MqYByY0pHk6eeROV0JlLJZGr0hEqf0tMxZYOqOo2np1NpUKUB1U6mqoBqp1A5R02meoTUuDHVO6i8cNLqaKr9mvhIj5CKAkrbdzJVxpSdSnlRpUNqrAlVfCqvDKlgO5nyJ1T3troB5cTUOAEVT6ZG6gSUiSknnHI6QeVrp1N6QhWCKYmpv6/0Tu9506lqQqU0IdVh75CqY8rEk6cTTnq/d0xdX+nElJlOOSEVB5M2nkwFcyFlJlISTnq/b0yNFVR/Kk7//NUmqpqgWv3in5vrpfRkyg+qOqpMQGmroEovNNfaoGonVDakrCqkjpqgUlEVR1TfU35lUNXTqWxYOTE1l6gy4ZSznkb1CitnIqUDywSUZy6oQlQ5cWWmU+lkykyoVDzp6VQ1ofKDSl8vpUMqH1TPVtOnMIUyMRVFlZlGaTOTqWYq1Wc65Th2VDnhlNPEU87cRKpHVCWBpUNKR1W1leuimq0znQoTKa2eTnkxlQsqHVKtzjQqE1SjzQWVjquuoBoRVnE4ZQPLiag5BJVcH5ULKnutVHdQ6eul4qlUGVOZoLI6MXU0BpW2Z1DJ9VISU3J9lI2odDIVHDeozEQqE1RmEqWdYFCJa5a/3gSVeJzsfPjhh2VINafxHHMRlU6nqmulzEXmzYQqvT7KxFNtmEzF2ohSk6lwnZQJqSqm9LVTJ5+lQ6pPTG1ozYaTiigdUjqYjDqWcjrxZCKqZ0iNG1MmmkYElAmnURFVh1J2MuVMozx1MOU0U6icaUgF08mUbG1IlUoY1QGVnMpLXF4aT6bshKq9RsoEVDOhqiJJb606mLp04imZTI0TUzqYtFFAmYgKgdQRUWEy1akzidL7fSdTQRVTcVS1WzuZ8qOqCqZ4MhXMneJrJ1R1OMUR5YZUFE+eOpa6NNGUU4dTThtQVhtS1voUnxtTUTSFWIqDqpxMtdMnG0/pVKo0XCPlhFT2mimtiaacOpo8c+HUN6LqWAofZ0IqmUhpo4jSp/S08WSqmVC5RtdMNeHk7PcNKhNNnlVIlX6qUvopRNVxsnPvo7vHuItPaSZSOW1k2cmVjSvrpkonsKrJVGZiNc6kyoSUZxRXcWCdZRftNIF1ZrpYZ9i3cVWZLpmQW7CzurNPL9qZxlUVWHJHn75zr7x7z4krWbzT3sFXhZW7WGfwVHsnX6en2Lv5fPVdfJ7enXy1zb5zB1/jSt9kWmWvm7KTKmca5WmmUTnTwCqnUu7kygaW0YSVp7ckQhpXehmE6u49G1d6GYRmOYR6wc44pso7+2SbWIWVuzRC8MRRyyLE6rv4PL27+OK7+Ubc1RcmUl+tdSZVZpFObZ8JVTOpsoGVV4dVpSyJELbJYp3RxCpZLuHLejmEWFkKQR6LlkWol0aQsBq5NMLQu/j0funtVplK6f1oUtWtDSyrH1f6GqqwSGezWKeKq6XH18rHkU1YRSYLdop1WMV38HVaT6JGq6+X8vTu5Ktt9m1YtcqEKppYuddSqcnUZ9SSCE5UtXfutS799JWVKqROcf1T6f03rWmi6rj3339/jutLiTqaPL1w0upocgJqZEh12DekesdUFFRmUqW1MdWc8mv2bUQlE6t6W4aUG1TtdCqJqSSo2mDSITXecgj1lEqd8rMhVWmmVTqk6piSyZS3TUIq6AbUiJAy0eSpwknv9wmpJqiccMppwslTR5OnE05xQI0MqSqejE5IeYYlEew0KsSTE1RmMqVDqtKbVtm1pqrplLdNQiobUxJPKqRMTDnhpDXR5OmFk7M/70GVm1SNmFpFp/yWSFRFIWWD6q5KCSYVUiGm4imVCakmqHQ0dWjCKacXTnpfR5PnrR0xFQWUtu8pvyikYuPFOs36UtG0ylv93EyqdESNFVPX94ipjpAy0eQZhdMYIeWqp1FRVMVxpUMqH1TRpGpW6SiJKhtUJpo8X291A0qFlAkqHU2eXQHVM6SamJrvoNLR5JkJqXDar1dI1cEUPu4IqTio4q05teeE1LwElbGKJR1TSVBFwaRDqlr9XIVUrZz2ywaUiSkdTZ5eOOV04ikJqaATTsZnKk08qZCKJ1ImoHqE1EidiHKDykaUa++gsjFlg6qdSpmgikIqGJ/2q/brgBoZUh32DaneMaWCypzqGzOmTDR51iHlBpUTUE5IBUM8xdtmfSl1V59drFOd8stFVX3KT2IpbPPqaPLMhFQTUKNCqo6luYZUE1NOOHk6MaWDqt22IdUEldHGlAkqE006oKKQcoPKCaghIaWDyjnl11snpnRQeZMpP6iqyVR86k866oMPPiiOO3TokJpQ6XjyPAJBpff7BlUTVU48eZp48tTxlJpd/TyaSPVd/TxMpOLVz3OLduqVz6tTfvMfVO7q52ZC5UyijM9XmmlUCCk/qDpP7WlNPHnWQdUrrJyI0h6tQdXjffmC+lTfTCao9Om+3IKdejI1blAlp/xCSDUTKj2FciZS2kkFVfbUnjYKqs6ocgLKeF+liSg/qJZkgkqvfJ6c8lNB5RnHlIRUMqFKosoJKE8TTjl1PHlGQWXCqmdQaccNqjKqbDzpU33V1o8pTz2hsjFVBVU/dUh55oIqRFVHXM0lqrITKiecPmNXP69O+fkxpdUhZWMqjarS2aCSjiqD6uDBgz0mUxJPKqRMTDkBZWJKR1NOHU45nXDS+71jamOliScVUtlTfU44eZOpkdqJlF79vNra6ZSJqsxF6TqkKm1M2aCqIyqaTNkJVRpN8VSqOY3nhFR7iq+eQumISmLKCSdPE045+4RUJqbCXX69JlMSUKNCKgoobZ9Te15IdepMovT+iAnVXFc/94NKIikNqWZCpS5Kt/FkJ1OLQzTNJaSaoNLR1KEJJ8+BISWBFELKhJMNKNfMZGquq58nQdWc1tMh5U+oTEj1jqk7Wt2AckLKTKb6qMNJ64ST5zxNqFpvKh09oapiSV9Dlb4/n46mTEBp+0ynxgqpKKbiaZTezwWVu2yCjSk/qmxMpVEVRVQ9mZKYkq10lEypjvvLX/5iAkqvK2XXlmojSq8tZRfvrCJJ3+GX3OVnQim+w8+ZONWx1N7dV0VRdvVzsY6ik00kaXUo5cxEk943weTZxpNVQskJqL538pWLdfrTJ6sTS3q/1J7GM5o7+7rUd/F55pZDCHfzjbirb6a+U2+JvnMvcxefUqKpuqvP3r0nkaSXRNDrSvnrS1XqtaVyC3bGd/c1q6CX8RRsQ8ne1SeRFAWUiaV8MDX2vYvPRFKXOpac/SiiOv2avovP07uLL76bL3NXX7kcgn8Xn0RSvNVLInjxZNaWqrXxJHf1pSug+2tM3aemTjm903laG1GNEkSZeHLv4vPsewffF/Tdel06d/GpfYkovVBnuJMvCag6lGYcvYhKVz8fcSff0MU6nXjSp/FcR97J59zV16m+gy+1z+rnyQroUSjFK6BLFJm1pnrGUqITSb7pHXx5r0iUjpIp1XEHDhxwg0qCSW+t0TIJJqTGmUrZoMpOoeY6gTLhlFOHU85jJKiasNLx5FkHVBxWcw2qJqx0PHnqePLsF1QycYq3XlDpaVQuqLxplI4pHVJeUP3udxsadUyFqVT36ueZqVQIql5TKRVUblg5ETWXoHLu3MtbB1QcVnMNqnoi1W13UMnpvWpbhVTYekFlJ08PFqd985Hi9ptfKR5/+M3imstfLMMqcOjQR0lQSTDprbH3+lKHL6ju//dNzc905tfvOyJBJdOneOsFlZ1IZYIqmUa1QRWiKt56QeXfuZdxLkGlPUJBJZOosA2TJy+qvOul9FIJS7zrpIxORM01qDqmT25QjQyrNKiko2RKddz+/ftVUNnplA2q9lSenk5Vkyc/pNr359PRZG3WmMpGVBtSnZOpMqbGCCoTTp5eOGl1NEVKIPUKqQ7nNaRUUJmA0jrh1ARUUEeT5+pWN6BUSNW+++6h4qOPqjekfO+998t9cdXq3cWZ56zxQ6pTNZEKa0xFk6mwxpSOqT5BFaNDKsSU9sIfrZ39mQ4mhnWnkvfn67FY57vv/qV4d9tfqm1Q9mvvu+dNG0+eJpwymmjKqULKVUeTVU7x7XzvYPLnvHfP+8XZpzyZBpQ2mUx12HMy9YffrE2+B0EmVDG9J1S9Vz8X76008ZQJKRNTTjhpo2CKeW/7gTFDqmdMjQiqVDWZSiZS6ek9PZkK60zpkLITqvzq52EyZeLJ00RTTh1NXToBlYRU35i6PhtTVTilk6kyqJLJVMfaUo3XVIYJlePIydTYMXWVE06e44dUUDqqM6jsNMoPKn8i5QdVYwgn90LzoDORMmHlxFNOHU45TTx5RkGVDSsnpJKJ1DESVHp/VFCNO5maQ1CNQt78u51QVVOpEE/2uignqPSEqrk+qn9Qlafy6nCK8YLKTqOWJ68JJJOpEFI9JlOj2PzaPhtPnjqccppwymmDKlD+N+wRVKtWbo9+Est7Ow42ASXXQ8VbL6jMNVFNVPlBFesh8aT3R14jlYSVjifPyQRV8n1Hp/gO7P+gOX7zVS/2D6omqpx48jTh1Kqvl3InVIlpUIWPy20mqLITKe2kgio7kdI6IaU18eR5fXldlB9VElDtZCqZUJmgstdLpaEVBZQ7oXICylNHU5cmnnKOCio/qqSj5LTfcX/+85+bkAoXmuvpVHVaT4WUmVA510ZFhsnUqNXPQ0zpVdA99bVTZlJVTqb6xtSGShNPmZAaK6Bq42DqG1ISTnq/b0yNFVQ6mjy9cNLqaMoElBtRfkAlLhkdVIL8QraTqJxqMhWZroJuY2rRIhtSIabyE6o6pNwJVXV9lIdMpiqrWLLXSaUhFU7pjWJkUDkLdebV0eRpQ8oG1Scmnhrr03cP3/9m9FPkeeP1fc5UqsdkqiOmvAlVQIJDr37+439ansRUM5WKVj8vV0B33kZGT6iqVdBHhZQKKG1HSLlBpU7r/fOZjxWnffVedVxPopz9vkHlRJTVD6lKiaWwTSMqnkzZa6P0hGo+Vz8fI6hMNHl6kyitjiY9kQpbHVBtSOVsJ1T2lJ5Wr3w+zoRqyZDVzzMLdboR5YaUjSfj315eSEepoEqnVPYuPk8bWOV0Ktm3cWWNplVmYuVMp5IpVc9JlQmonHVYzWH182C8+rldDqGy7+rnElF69fPcop32zr04rl6onI2ncvVzZwX0ZikEtTWeqpc/6PAUvRyCZ7wUQs727r2Ys7+9trpTTx6b3cbEd/Ldd/87ZWTF3HjTlmRSFSOTqZjde96vp1VpQK1/cU/yvNdf318/1k6iYtIJlZpU1dOqwMYNe6NXRhOqrDKx0mG1rHm9XMMjkaWXRAgG9sz+rHophICcWgvx9M/fT/+85c/3kl++UEVVbfzYaYufTP4blFOok6q7+CTqcuSWRoi5/+4tyV18Pzs//d70nX2vvZr+d5Ofa+mJ6RIJgXVr3iv+dOm66Nmzf0a7DhVhiYQc78/+ecvF6DHtxen3Fzdf83Ly2LLH30pOXT75yJvl82Li0Fr22FvN8fe2/6WMqzc2t/+bWff89uKjDz9u9sPq56efeL/5u7Bt65+bpRLuufWV9MEImVIdOvhhs/9v16xvlkaQqFr9zNvRs4viLwc+KM755v3JHXwxcrfeu2//udl///2P7F18ZiLlWV8zlVNNqrqViZUNrOzEKnsN1b+ZJRFSq3gasvp5vMaUXQJB+Tl9916X1bTKLosQm06rjM6kKlWmU2Hbb1qll0TwwkovhdCsMaXiSu7q08shSFTpu/lcPyVe0dgRVDqaPDMh1feUnw6ocUOqCSonnHKacMqpp1KeNqKaSVWzbyOqVSZU1XYuq59X60vZKZWOqSqo2pAK6pCKg0pflD7n1c+jpRFkOpUujZAukeAHlcRTGlJuUJ2zJgmn+BdFWBJB//KI2b79UHNqL8Z7TRkAUUx1EQdT7rgOKXHvng/a56pTfzqgAiue3eGGlD7lF4LKXpReTaJiwjGJqbvvfKM5fsF5q8qYen71e9GzU+KL0kexbu3OMqre3rpfP9Rgl0SwQeUtixD/Nwwhdeo30tdp4lN9gXe3HYie0XLuaU90BpVc52eCqp5S7d1zKDke2Lf3/ebjFU+/XcjSCDFxUD23/J3muHw+mUxti/4c9+xKryuTydSKZVuTYzHLHn2jXP7gkXs364caJKg+jCLt7n/b2CyH0MXt1613gyqOs5gyqEw05fTCydk34aTtCqkQUCqmTFDpaFLqSVQUUGaxzlxQNSFVqU/vmZAaK6gGhFQTUH1CKmMmpFzNNKoNKrvVUykbUyGo9MSqjKckpNKYGhFUW5yA8swFVbyvQ0pHlYor59Rfp32nU5mgWuxu6+mUCqswmZJtWLjTs3mPvmgC5QWVnk7ZoGqjSk+nxgsq2bYh1UyoMkGVTKZCUMX7pTqecuqA0vYJKhtVMTqoYmT/wQe3JcfWr9/bXNAeCGtMafTzhBBT8WMffPBxsWbN7uhZRfGzn77YI6jSqDrz9HZK9sMfrOkMqkv/dYN6TIfUOBOqKp7efKP9ZRxPp+KfVWLq7NPT72vTq3tnQ6ANQSEXVF6oygRq9XM7Zn+5fpQcl31RT6bEs5a2Afjqxj1uUKVrTVUfx8hpxbfeaKcjgkyjdFAFvP89SFCF7zMgn1f2y6mRDqp6QqXx/lzGDqqvpEGlkelTjEyl3ng9nYJKUN105YsmdGRfdINq9ti5M2lY7tzxl2L/vjYOBS+ocvzpX1YNm1DNKaiiqHLDarygkqmUNp5MxUGl1RMqM51SE6pemnjKqQNK68RUHFTNvg6pHlGVmU7pyVTu/fk6J1QjYspba8rYP6he7zjVJ5HkRJSZTI0yF05aJ55MSI0RUyMX7IxCykyjek6mTDR5VtOoMpbCxyak2slUHFRmq2IqG1R1RI2eUKWTqeCQt5MJthOqKKCUcv2UF0+eMXFQ/ezn6SkUmU7detubxdq1u0t/cN4L2dN7Oqheemmve9ybTnlTK/nlmw+q9Boq70J0PYWKj+lQ2jsbMzqi4inUKJpp1DfbSHnkoa1mcrV37/tlUO3f3/6ynflGu2DnfXe3k6ywaGfMhT98rlm0M5kkuhelf5IEVLh+qvr4keLKy9Y3z73l+lc6Qqr17FOeaF4jeNOo+HhyLHPxuXf82WUSQu2aUzHhdF96rL0IPWaFfJ6veEFVXUP13PL29Jo3oRL0tVNrV71bulQ+R32t1LJH22vRqgU6q4U6Y+KL0k1QqQvVr/zd6uZ6qphNG3YV8pYyMRJd4RRfzEtrtzvRpFUBZeJpVERFseQGlBNP2j5TqdgopEZOqNQ1U3oyFUKpc0JlYkmFU7NVjoonHVEj7QonrTON8nRiyptM5Rbs9ELKu5aqiiYbUUdfUOn9vkHVRJUOp5w6njzb66Q8+7ydjKjfTiadULUR1fftZPITqskEVbltTu3NZTL1fKUTVjqi/AmVDShtX7y3k/nVrzcUt9zS/uIvn+eFU3SXXzKhmY2mP/7x1eiZRfHMM+81xowTVDfd+HrznHfe/kuvoPrW0uXFHy7d4MTU3IIqjicJHplOfWumDbdvn/lMGVQxzy5/NzFwy42bTFDFbyfz0H3tL/H47WQCOqhSHyluuLqd0F131QZnOmWDas2q9I7AOKj2/7kNAh1U8lgcTvF1SdmgihbyjJH975/Z/hmuXvluPqhkQjUgqD6e/d+tfiuZ+C1lfvzdJ4urLl1TbH2zvX4tXvk8Jn47GS+oYuLrpdavSf/M9YTq9BPuboJq6xvt9/HeuwecgNJGQWXCqmdQhZDqnEqNUEdTZHwNVflxJqi0+i4/G1NtUI1Wh5RnLqgmFFUhnvR+Jqj8CZWNKX9CNSqmnOlUM4nKT6U6gioXU05AaU005dTR1KUOJ2ffRJPnxo6YkolU2EaOmkgNmUxFE6khbyfT/y1lbEzZoGpP6Xl39XkhFU+lmuuieoRUdkLVM6TGCapzv7u2CanNm/OnQQQ3qKKlEuKJjATVsmXdt+oH/KBSMVUHVfIc5zqp8riJpi7ba6QCcsHvKYufVi5Lgmr9i+2pS9l/aX20X1+M3ofnV73nBFX7VjLXXbWxOR4vjxDwgip+O5nvndn+2axeub0zpIKyhEJArlWKg2rF8vbUsA6qjS/vSsIpia/meBtO3ROq+4ur/9Be4P7LC1dUMVWfxtv/5+gaKndCVd/ZN6sfVO0pzI0v7SzDKX47mfPP6f7vlw2q6G6+UUElkykJJ7mj7/e/SP9e6UlU/FYycXz5QeUElBtSfdTh5OnEk3aeJlStN5WOnlCl0RQmU+XbyUggjQwpZyplYsqJJ62JppxeOOXUkyhn3wkpP6hGTaiiiKonU+HtZHQ05dV3+amIsot1xpOoNKL028mUyyHIYyaS+r2dTG5JBNc6jka/ncxGFUpdOtGk900weXqn8+IplBNQ46x+Pu9vJ1MFVKe9lkZQSyQs7TJdDiG3+rk25jeXbCx+/JP1xQU/Xu8sh5Ce2isXx5yplkiICUsgeMckoOKgkmUQLr88nVDZ66LSt5NJnluf3qusounHF9oFIXOsXLFDRVMaT9Z26lReQxXFU6mzHELg1ls2Nx8LYdkD75i7LEI0cSqfGy2PcO2VcVC1p/QCzbIJX6sCyjPGWxYheXw2kPSEKl79/M9RJIWlEAISVPHbySRB5YSTBFW8WGeMxNPSKL7KJRa+0i6JEFMF1b3JsXhphDej65+qoLrHBlW01tSalW00ymm/cMrvpivbwIvfTiYmXksqDaoN5tRevPzButXt1DI8lux/oV0GYf2a9rkSVPklEdK1pvSq52FphCSg6kiacZU4cgKqXBIhbJ04aiIpaGPJ6sSS3i+1p/KMvZZGiJZI+Owoo2URkgU7q6UR9NvJiMmSCZ85Wt9ORtTLIXg6SyIYL6/829TuoGqmTzn19CkyBFXnRMqJKRNVTkBpdTR1acIppxNQet/Ek+eEg6qMKh1PnnVAxWE116BqwkrHk+f8BVVYpDNsY846+/kynPTbyVQLdqZBFS/WmRzPBFW4LkoHlb+2VOV9920tlzvYMGt4G5nkufMYVDfd+FqxdeuBNqjcsJp7UMW/OLe+tb+50PxgdAG2foPjjS/vnv35dxfnnrW8jKqYcYKqPf5I5YigktNwcVDpZREkqL7zrXQ6EwdVjD6FlwTVCf2CKqw1pU/jVdOo9Nj6tTvKmHrons3JcS+oJIpCUMX0CSpZwiAQrzcVX1A/16A6+Jf278gfLl7RBFXM66/uNsfmElTe9VImqJJpVBtUIaribRVQflB5F5sb5xJUcVgdwaCSSVTYxpMnG1VVUOnJU7z21Ly8nUwZVU48uepo6tK/PmouQXVKv6CqI8qdUEkg+SGl306ma8HOfm8nU8VU52SqjKlxgkpHk6cXTlodTZEhlkaGVId9Q6p3TEVBZeJJ64VTtB13MuUGVRRQ2iSkuo0JQeVrl0LY+Ipd72guQRVfVP3++x8Xjz26bfYvVPuLaceOQx0TqnT5AzF9O5nW5LXN8aeK005pP+/HH3/ihlRwFOXCnk5QxSw9+ckmmr53TvpnJa9/8YVdybHuCdWjs0HVXgOVCypB7qDUIRWmUW9usf8tvTvxyj+fr1aLdGq2vZ2eDt74ksSTE1T/2C7U2SeoshOqetHOPpRBNRtOci1UjHdHYBlUX/aCqg0nCZqATACfeeLN5HowIT61px+TU8YmqG7ZUJ7a+/6p6URQnmuWbXAiqzOonIlUGlVtMMWTqXHfTkacU0g1QaWjqUMTTjmdgJprSGViqppGhW2ljakRC3bWITV/byczRlCZaPIcGFJ/K9ZTKSekKv/YHVT+RMoPqmQyFcxOp5yJlBtWTkB5mnDKqePJMwqqbFg5IaUnUsdCUOn9UUE1l8nUPASVnkx5SyM0EypHCarHHk9POXiMG1TlKT01pdLEkyh73AZV8nYyPYLqop+lU635DKpHH7JrFZWPRZOol19Kl4mIueZPG+YcVCuftf+9ckEl/uVA+98mR/yWMqefbKMtxrvIfC6n/HIXmsfXS3ns2d2uTxUmVOef4/83fGuLOuU3IqhED4mfQBxUl//GXq9ogkomVPUK6F3cf8cr4wfVyAlVGlTJNhNUqSqktJMIKu+Un6sTUloTT57Xl9dF+VElAZVOppoJVc+gao0Cyp1QOQHlOe9BFUWVCameUVXGVHWtlATUKbUdE6ooppIJVffbyZQTqnoqNfotZfq9nYyeUJlJ1by9nYxEkxNSvQNKTaY6dcJJ748TU72DSkeTZyakmonUqJDqCqgeIdXElJ1E5Yw5/czVzmSqnVDJ28Zcfc3m5v/Vy/bMM9NfFG5QRW8ps29f+ws0fksZ8eWX01NL8stm6ZKua6hsTHW9nUzyWnVKL/xM//LrF1VMjRdUr76yN3vaT9i4YU9zui/2x+fbX7iPPbw1CicdVG04/emyl9LjUTDFC2nKz+iFVOylv/ZPmT7+8Fv2bWRqt76Zrj8lb6Z8ykkPlyGlJ1QvrXsvmVDFi2+2QdWGk6xgHr+dTEyIqfjtZM5e/HD9djL3JqfOlj32ZnN67/e/TP+s//ib1cXyJ9qV0nftPFgG1VvR1O6lF3aYoBLj9aHuue2V4srfPd/sx0Elvr5pdzIRk3CSFeADt123vg6qKpZkuYMYibVzZx6oHq/DKSYOqrUr23W1ZPV0HVL6dF58Wm/I28k0bymTTKb6xtQ4QaWjydObRGl1NDkTqWxEVSGVs51QqeujTEDVE6p6KjWnt5NxdcLJeGWlCacQT1FEuTGlg8nRTKE8/9joTKg67uyT6VSyb8OqVSZUYRs59qTKmUhpTUB1aeNKv53MqAU7w9ZfrLOy74Kdfd9ORrR374XHXqisA8pbsLNZCkFtjafau/mynqLv4vPUyyF42jv4GmUaFbZZ62untMmkqr1uKms0jRppdL1Ut+ldfI3Jvo0r67JKFVphUhW2yWKdybSqDSv9djJidR1VGlNhXSlt/JYyIarapRBaw9vJ6K3xRL0cgucjzpII2uhuvvKtY2Lb6VTeByslpMLW+EC3UVj1MUaunTr1aw8UN17Vrq0lNEskJO/RVylvIxO28VII2maphC+3d++FtaZa7yoNbyETK1FVrYTeLoWQtb5bb7T67r2c0V18ns6kKq9MrGxgtZMqZ2LlxlW/t5MR9VIIZjmE2txinRJV+m4+18/pO/hyVtMqu1BnrJ1WVXfzRVsnrJJJVbPtN63SSyJ4YWWXQojCqteinendfK6fGu/OvjCpEp2gyoRU31N+cTjNNaSaoHLiydNEU049nfK0EdVMqpp9G1Ct6xvn8+1k8kGlp1E2pkJQ6YvS07Wl2pgykyodUuO+nYwJKiecmoAK6mjydALKhFTfmBonqHQ0eWZCqgmoESEVYmlkSHWoQkobQqrcqpjqiipvSqVjKgSUfgPkKqCC8VIIeisBFYWUG1R2SQQbVDqaPHU05cwEVBJS4wTVfe51UDFPyfv4Zd/8WGIpbNtwavbVGx/rmGqDqgopE1RNRElQtRejB01I1coUysaTowknTy+cPHU4aUeFVIcmpjKaSVQaVXFc6ZiSqdSgt5PpXBphnkLKRJOnCig3ptKQymomUnqxziiozIRKh1QVU3pa1eftZKzVBek6pjJB5URVfB1Vs69DSkVVZ1D1jCodTjlNOOm3kRnv7WRyi3b2fTuZKqLS6VQuqvR0atygMm8nk9FMpkJQJZOpMaZT2bWmxgmqjrjqFVWZoDITKiegPE045dTxlLMrqkYEVQip8LGJqTSq9GRKtjOZoNLTqVxQ6ZDKBZWNqSqojCGo4n0zidL2CSonrsaaTj3YM6o6gmpOE6rqdN/T0Sm7gFyE/+0lj5SPL8kGVZhMtdMpM6Gqo8qbTsUTqnIK5Uym0rCy8eSqwymrjqecuYnUOEEVRZUbVk5IdQSVfiuZ3NvJ9JlQletNhaByJlT91PGUUweU1okpHVTlvg6pHlHVMZ2KJ1OyzS3YqadTXlBJPPlBNWJC1Tuo8lHVeQ1VOpkaZS6ctE44JREV68ST0caU1Q+pdiI1YjJlosmznkyFYNL73jVUejLVBJWNqVxQ6emUH1XpZCqoJ1NBPZ0qp0/ymImmeEKlAkrbFU9JSOlo6tBMonI68dREVFBHk+czHTEl4aQiyoSUjiZHE0yeziRK7zun+jp1gspG1eOlejqVRlUbTPFkKlyEnouodDJVXStlA0qHVIcmmjo04ZRTR5OnjibH+rop3zqePJPJVIdqMhVPqPSkKplO1ddLxZOp3hOqLwara6hsPKmQGhlTXQGlQ8kziiU3oEZEVCakOlUhpaOqjasqoLTegp2dEyoTSyqcco6KpySkdCzlzIWT1oaUq3O6z5tM5RbrlAmUF1H6OqoqjkZFVBRNTkRV/rF0skGl9/sEVRJVOp48dTx51tdJZYJKv52MmVDV0aTfSib3djLhNF/8djK5FdD1dGpoUNmYaoMqrII+9tvJhKDqsQp61kkElZlE5XRCykSVjifPOqjcqDqCQaUmUxJS1XTKDyo9neo/ofKDKjeZaq6dik/xlZMpG1RmIhWCqnMy1aGOpi5NOOX0JlFaJ6CM91WamPKDyk6o2njSbyXTTKicmPKMT/M1MaVO983/dGrMoDJhpePJMwqpuUylkrBy4un4fm8nM3JC1Zza84NqtDqkdFQ5cdVnItUEVd+ocoJK748IqmRC1RFUqTqkchMqbxLVdyoVhVQ2qKqoskE1NKKScHICapwJ1JC7+PR+MpHqcNypVDKB8owCKlmwM4RTPqBKVTD5quujtGVAOZOnnPXkaaRL9V18nrm7+Srl1F68JIJVosmPp+QuvloTS3J8sVjdwRevfK6Nl0KIt75OMOn9XETJsghDIsq9k8+Pp2rBTj+YrI9XOhOoVOf6KG09keqnXg7BswqleAX0oHdqT9/NJ3fshbv2tOGxeNHOXDyFRTpHakIpo3Maz1dPoGqTfTuVsqbTqFQ7hWqsl0SIVz/P+oX2jr2gRJLd1sshRNp4Su/qcxfrDJpg8tTTp1gJpExA/V3QBpO1jiVtMpGy0yfXz+m79zr8rL6LT8dTFVD6jj5ZFqGNpzSi2sU6OwIqG01OQI11J9+VlWb6pFXXRoUplN4vde7ki5SA6rq7TweUuPRvWtOgUiE15O1kuhbtzC6FoD3rMLydTLjYfNyQysaUnULZoHLCKYmoviFVx1R0Gi+vE05JRAWdcDKurjTx1BFSZvXzESbBlLMNqbA0QhxWsi/TJx1TuajSSyEEvZiKl0MIeiG1KLZcFiEsjTAqpNQUykRUJqC0JpoymmjqMj6Nl1NHk6OJpjSg2m1kElNOODUBFYyDqY2qeBuvLRXUIRViyigLdCYhVRneRiZ+OxmrjibPTEg1ATUipEIszTWkmphywimnE1S+ejkEu86UDql40U4vpGaMElDONOr4nm8n08SUjiZPL5xy6nBy9kcujRDsWhrBWSKhWVsqKIEUtqnNcgmfiZZDMAE1gbeTEU045UxP4/naeLJeXumEVLw0QrCMqSSoLusOKmMIquxUyplIuVHlxJOnDqecJpxyHiNBVUaVDqecehKV04koTxNPnvMXVGEyZSZUUTjpyVQ7oVJBpadTHUGlYyoXVDam2qCScLIhNWIyFUJq5GRKBZUbVk5AaXU4ZdXR1KWeRHk6AWV8pNLE1PhBFaZSzYQqE1R6OlVFVTuZCmHlBZUEU5hQ6a0OKhtPnjqePBdGUGUnVE5E6eulTFDV5oIq3lYB5QdV72ukxg2qXmHlTKMmFFT61J6NqiqodEylE6oqpHJB5U6jPHU0dWnCKac3idLqePKsTufZmGqDKkylYjuCKg2oIW8nUy7aqSZTIaZGT6aCTjwZdTR5ZkKqCagRIRViaa4h1cSUE06eJpq61OHk6YVTtB05mZKAikLKDSoVUNp5nUypCVUZTfVEKplMjRFUTkzZqFreqKdTMoHKhZR+Oxm9aKcbUiGa9H7fkCpjaoygMtHkOTCkJJDCNqsKKO2oyVQzobKTKW9CVX4cTaaaCZWjmU6JYULlhFTnZCobU1FAacc5tWeiKacTUElIjRtUNqas9Sk+ZyrVRlUbTHoyFaZP9nTeBN5OpgwqHU4ZTTTlzATUvIZUNJGqtTHVvVhnCKn47WRyC3Z2TqbKkAo64eSqo8mzK6QkkEaEVM+3k9GGyVQZVFFMjQyqZDIVzE6nnGmU3h9nOlWGlY4nTx1PnlFQmbDqEVTqgnMbU8dwUPWaTA0LKrnYPBdU8YSq+nhlZRROejKVnVDVQdXeuTd+UHlbL6j8iZQfVLm3k/GdgqAaOZmqLK+Z0lsnqMxF5h1BpadTyYSqCScbU2FCZTSn/HQ8edZB5UaVE1JzCarOiVTPoEqiSodTTh1P7URKX3DuRZV34XmYRjVbJ6SsKqS0kwiqXpMpsSOomn0dT57XlxeZN1snqMxF5mMGVaWKJ73fezo1TlBd5QSUZy6odFzllJiqLjyXgArXR+WiSk+nwoTqFD+oRpzyKy9CD1sdVJmw0o4TVSaecm6wYaX3u8Iq2dcx5dkVV21E6SURvFN++q698s690hcqo3iyd+/VQaW0a0v5UWXu5hPriPK25o6+pa0SVf5aU/EdfEF9t55ndKrPXVtKVKf4cup4ymkCKmdXWMWBlVHCKWyzRjGlHSesdDh9Pawlpbc6nvTde63mAvST9NpS1Z18JqhO7LijzygB5dzRl7kIPasTUNYHuu0Kqpwmojx1THl2h1V5V59s65CK15aKwyq3tpQXVebOvTKsqjv09NbVBFTO+gL0+CJ0vR+f2st6a6WJqhBWTmCNO6ky8ZQuhZAElQoru7aUH1X2Dr5qaQSJJ3sHn76bL5zay2nDKrkAvdzXIaWiynPcsNLRFKkX7bTxpO/cC3f01VGlJlb2zj59955n91188cXojWVQVTp3+emI6ggqN6yciDoCQTXk7WT8BTv7v51MiCjtJIIqWRIhjikTVk48uep48rRBZXWCqgkrHU+eKqSOhaBK9p2Q0kHVcxV0vWinF1R6GYTxlkOog6rH28mEpRFCRCUxlYSVjifP3LII8xhUvRbtdCLqKAiqzgU7Q0jJY3VI6cU6O4MqiiodT646mro04ZQzCijtXILKjarxgkq/nUz6tjJpTGlNUNXmgsrEk6eJp5xzjKoQVk1g6ZDqEVVJWKUB1eftZEJEab27/HRMmSUR4oDS+yaecuqQ0vYNKhNQcUjVwTTXkGqCygmnnCacPPUUytNGVHLKb+Rkqp1I9Xk7mTioko+jkOoOKn1aLx9U3kXp6YKdVUzp6ZSdUD3fxJSdTElARSHlBpUTTmY6paPJ0wkoE1I9g6o57efEk1FHk2cmpEad8otDKtgjpFxHTKbKiIq2OqY6g6oOqXxQtRGlT/0dlreTaYJKR5OnjqYunYBKQmqcoNLR5HlvqwkpG06TejuZXgt21nZOpBJ1NHl64eSpw6lvRDkBpXViKmszgcpPqNygChMqRz2Z8gNLR5NnHVJuTEkojQgpE02eKpz0vhNSWZ2Y8iZU5cdRSOWDyplM1af60jWndDRp68lUNqZURLlBZU756ZBSUdUZVD2jSkdTlyaeKufz7WQkqvTbydgJVYiofm8nk59Q9Qsq7+1kckGVTKZCQOl9E0859SRK2yeoOuKqV1RlgmriEyodTzm7ompEUMUTKRVUMx1RNde3kxl7QtUZU21QpZOo2mRfT6K0Q4OqT1Q9OEZUZYJqThOq+3pFlV2sM40qPZ3KRZWOqXhCVS7WqadSJqxsPLmacOrQBJRnbiI1TlCNCisnpEYElX47mWpC5ceUVk+lmphyJlQ2njx1POXMBVWPyVSIpnJfh1Qmqtyg8qOqz9vJZCdUKqT8oBoxoeodVKOiygmp8YMqF06eOpzUx2NdlG4jyuqHVDuR6jGZGmk9mQrBpPedyZSOqmabuSjdxtQ6M5nyJ1RVNHkXpXshpadT5fRJHjPRFE+oqnDKvq1MVzxpTThlNFOonF44RdtxJlPZmIriSdsroJzJVKd6EuXsZ4LK1YkpG1SPl+rpVBpVaUSlF6V710Z5k6nqonMbUD1DqgkqHU4ZTTTl1NHkqaMpUgIpbLNGEyltx2TKGMVSHFQ6rJLpVH2dlJ5M9ZpQzeXtZNwJlUTTqIjSweSpg8nTiaceIdWpiil/QlUFlKcXUWZCJWEkH5tYcsIpZ1c8JSGlY6lLL5w8bUwZM6f70gnVbCBl31JGIslGlL4oXeKoutC8yyiW5hJRSUxd1pgE1aH3P0BERETEMSWoEBEREQdKUCEiIiIOlKBCREREHChBhYiIiDhQggoRERFxoAQVIiIi4kAJKkRERMSBElSIiIiIAyWoEBEREQdKUCEiIiIOlKBCREREHChBhYiIiDhQggoRERFxoAQVIiIi4kAJKkRERMSBElSIiIiIAz0sQXXgwF+KN998s3j99dcRERERj4g73nvPNMp8OfGg2rJli/mBEBEREY+Uu3fvMb0y1IkGlf4B3pstw7179xZ79uxBREREPCzu27fPNMk727aZbhnixIIq/qb1D4aIiIh4JJTBziQmVRMJqu3bdxBTiIiIeFQaR5VumLk6kaAK3ySn9xAREfFoNNwsN18Xqs97UO37836mU4iIiHhUO99TqnkPKrnIi6BCRETEo92jOqjiZRL0N46IiIh4tHhUB1X45ggqREREPJolqBAREREHSlAhIiIiDpSgQkRERBzowg+q3buLXb//TbHz5C8XO//pzGL3Yw/Z54xw3+Z7i/1Pf7M48Oinyu2+zfeY54xy957dxb+s/0Xx9eVfKH34jfvNcxAREfHYdMEG1e6Vy6uIyrnkq+Y12r1vPllGVE55XL/G84SnP59V4ko/HxEREY8tF2xQmYBy1K/R6oDy1K/R/tPqM0xEaeU5+nWIiIh47Lggg2rn6d808eQ6+zz92uCBJ75o4sl19nn6tUE5zafjKac8V78eERERjw0XZlDpcOpQvzZowqlD/dqgXDOlwymnPFe/HhEREY8NCSrn9aKOpi71a4NyfZQOp5xcS4WIiHjsSlA5rxd1NHWpXxs8Z9VSE0455bn69YiIiHhsSFA5rxd1NHWpXxuUpRF0OOVkGQVERMRj1wUZVLtuv8mEk6c8T782uG/D1SacPOV5+rWxOpxy6tchIiLiseOCDCpR1pnSAaXVr9EeeOxzJqASH/useY32xW1rTTxp5Tn6dYiIiHjsuGCDStx5/rkmooK7168zz/fc/8wpNqRq9XNzdq1FRUwhIiIe+y7ooEJEREQ8HBJUiIiIiAMlqBAREREHSlAhIiIiDpSgQkRERBwoQYWIiIg4UIIKERERcaAEFSIiIuJACSpERETEgRJUiIiIiAMlqBAREREHeswE1aZNmxARERGPSo+ZoAIAAAA4WiGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQDHLF/60peK//7f/3tjID72v//3/45eAQAwGQgqgFkeeOCB5JdwlwsN/fNpJUi2bNmiX3ZUoL9X7zhBBQCHA4IKoFg4QXXzzTc33+fxxx+vH3bRP1/OG2+8Ub90TsSfc8+ePfrhsdD/3QLxMYIKAA4HBBVAYX8xd3k0M8mgEn/5y1/ql49N/PmGBlXg/fffT/bjr0FQAcDhgKACKGxQ7du3Tz9l3pH/XX/44Yf6cCcSDlu3btWHG4YG1a9+9avm+EcffVScfvrpyeOj/mzk+zt48KA+nBB/rlFBJX8+8uf0ySef6Ic6ib9GLqjk55DPLT8nAMBQCCqAYvyg+tu//dvmuZ/+9Kf1w8nnik+Vxce18vcm8Pvf/z55TH9/wRNOOKF8/ooVK8xjsV3Ez4uDKqbr833lK18xjwfjPxv9mDawePFi81is/KyBU0891f0c8bE4qJ599lnz+WLHDTcAgABBBVCMH1Svvfaa+4s84D0mv9j1L3BtQAdVl8Kkg+qJJ55wP9+o+BHDpEwf1wb0cc/AuEGlP48nAMBcIKgAChtUMoHyfOutt5rXxM//+OOPm+Mvv/yy+QX9yiuvJMfefvvt5vnx8ZNPPrk85gXVpk2binfffdccj5nPU34a72vmvpd4gqe/x/i4PuX36quvJo+HP9dLLrkkOX7fffeVx8cJqjvuuMN9rn4+AMBcIKgAChtUOeP/LcrptnD8iiuuaI5LFIXj4Rd/HBi33XZb81zh+9//fvI1BB1Ud911V/Ia/fzA4QqqvXv3mmOa3GPxcR1UXcSvu+iii8pj4wTVZZdd5j4XAGA+IKgAirkF1c6dO91f0KOOnXHGGcXZZ5/d+D/+x/8wr9FBpck9driCSiZHYnws/plE/Xzv83QFlVyQvmrVquLuu+8uv6/4dT//+c/L54wTVAcOHEiOh8euueaakRfSAwCMgqACKGxQjbqGKqB/mcen5GTy5D1vlMLRFlSbN282X/PFF19MjnUppzwD8XEvqPRrPecSVMI777xjPlesXGAPADAXCCqAYu5B9dBDDzWvufXWW4vvfve7zX68JEL8uWVpgS6Foy2ovCmaTHXiY/rn0D9TIH6NDqqZmZnkcbl26plnnjHTwLkGVeDQoUPZuxNZRgEA5gJBBVDMPagE/Qs5mHuO3Lo/ivkIKrluqw/x5/KCShbzzD0n9310Eb9m27Zt2cfi04T6saFBFSNLJcTPv+GGG/RTAABGQlABFDaonn766fKUlqcmfl3wF7/4RfKcxx57LHk8noJ87nOfSx4T5hpUcvF6/JiOEo/4+TJhk59RpkL6Im7v68XH/+qv/qo5Lv8Q9HnNSSedlH1s9erVzXE9IZtLUMXH4ufqx2TqCAAwLgQVQGGDqkuNflz0FojUz/H88Y9/XD53rkEld9/pz6mfo9HP7VKWbojRoZMzRk5F6sfDc2QhUH3ccy5BdfXVV5vP84UvfMEcAwCYCwQVQDEsqPQpMe85glxTpZ8XK5OqwFyDSj+We06Mfm7O3J1w+nlaWZcrRl97FRT0nYNBHWFzCSpBr4+llckcAMBcIKgAjgArV64sb9d/8MEH9UPzhsTJ9u3bzUXhk2LHjh3lzyOnHeUi8j7IUga7du3Sh8vP9fDDDxfr1q3TD80L8mcj64HJ2wJJTMtF6gAAQyCoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAGa59dZbXY8W7rzzzuLgwYP6cMnR9H0CAEwrBBXALCeddJLr4eCqq64a+bW6vp/ccQAAOHwQVABFFSU333yzPnxYGCeoLrzwQv3QyNcCAMDkIagAiu6gWrVqlYmWffv2lcfkf+vCbbfdlp1syf5pp51WXHLJJc3jO3bsKB87dOhQ8rqZmZnktQF57Kabbiq377zzjnks5uKLL24+30UXXdQcv/rqq8tjK1asaB6Xr79+/fpm/xvf+Eb0mYri448/LhYtWtQ8vnfv3uRxAACoIKgAiu6gEuTxW265pdk///zzm5C54ooryo9/+tOfFsuWLSujRKImEGJEwuTZZ59t9oVPPvmknDqF0Fm3bl3zupjw/Pi1+jHhBz/4QfO55OeRjy+99NLysRBU4vLly4sf/ehHzf69997bRGFMePz+++8vfy75WL5nAABIIagAijYctIE77rgj2ZePN27c2Hy8Zs2a5rFwTKY/4WMvVLZs2VJ+3PeUXyBMjLzHNCHWhBBUMXpfpmgykRNkqqYf934WAAAgqABKJBK6JlRCCIlHHnnEBI3nq6++2jwucRIjxzZv3lx+PG5QhX0JK/2YRFyYJMUKfYLqsssua4JKfw79+QAAoIWgAij6BVW4vkiee9555zXHZX/37t3NvkYen++gkumYHHvssceSx+Tj+DqscSdUXlABAMBoCCqAol9QvfTSS811RuF0niD7+u47uSYpXGs0Kqi80NF4j5977rkmeuTjeL2q+HHv6+j9OKiuu+668nG5MD3wwAMPlAIAQApBBVBUYbF06dLiggsuSNTogBGuvfba8tipp55a3HfffeVWR05XUIW77mSydPfddyfPC+ivGdDfT9i/5557klN/wrhBJYTXy4Xt4ed6/vnno1cAAIBAUAHME7KUgpyKiyc64yCv//DDD/XhObFt2zZ9aBASf3P9uQAApgGCCgAAAGAgBBUAAADAQAgqAAAAgIEQVAAAAAADIagAAAAABkJQAQAAAAyEoAIAAAAYCEEFUCNvVrxp0yZEXECGNyEHmDQEFcAs8g/vzp07y7eUQcSFo/y9lr/fAJOGoAKYhZhCXLjK328mVTBpCCqYeuQfWv0PMCIuLJlSwaQhqGDqkX9o9T++iLiwJKhg0hBUMPUQVIgLX4IKJg1BBVMPQYW48CWoYNIQVDD1EFSIC1+CCiYNQQVTD0GFuPAlqGDSEFQw9RBUiAtfggomDUEFUw9BhbjwJahg0hBUMPUQVIgLX4IKJg1BBVPPXILqlVdeKW688cbiyiuvLN566y3z+KR86aWXildffdUcD8rfFXmOPt7Hbdu2la+N9X628Dx9vEt5/ttvv22Od3nw4MHydfKPin5sPnzzzTfNzyvH5Ovq5+KxL0EFk4aggqlnnKD63e9+V5xxxhmll1xySfGnP/2p2b/22mvN8+db+To//OEPzfHgxRdfXD5HH+/j7bff3vwsnuF5d91118ivIY9///vfT/avu+4687wuN2zYUL5u165d5rH58Lvf/a75GWNfeOEF85px1H9ueGQlqGDSEFQw9YwTVLlfkrnj8618ja6g+td//dc5fx8hqPTxPgGllecfK0Glj8v7vs3Hf8/5+Bw4fxJUMGkIKph6xg2qf/7nfzbH5dSf/uX5zDPPFBdddFHzi1WCJTwmp80kfvbv318+ds011zSPxZMimYjpry9BtW7duuK8884rzjrrrOovcP34s88+m3wfy5cvL/7pn/6pPHbzzTcnn0ubC6rwdcPHK1asKL93+Tj+OSRQzjnnnCbq5HsLz5N9CarHHnusfN53vvOd4oEHHjBf54YbbiifK1svqOI/05/+9KfFvn37msfka912223J55M4Ct+DNhdUYvjzD/vyda644oryZ5Ljv/jFL5Lny9eQP3t5XELyt7/9bfM55LGnn3663B44cCB5nfx3z31/OL8SVDBpCCqYesYNKvE3v/mN+eUYG37xihJg4ePwmjVr1jTH4l/e3mvCY/Hj2hBV8hcwxNlll13WPB6iKv5c2lxQ/eEPf0iOxxMr7+fQdn3f5b8V9ecNx+LvVQxBNerPNOzH3/uPfvQjcyzYN6heWLu22ZeIDR9feuml5vk55eeUrY4nOSZxqb8+zr8EFUwaggqmnnGCas+ePeaXpfySjCclov6FG45df/315cdxiITHH3300XJ/y5YtzTGZ6six3bt3N59DlIun488r4RB/rXBcIiTs/372+5FjuVNoXddQxRO0XFDpr61P+Ynxn5Psy4X98vG///u/l/tPPvmkeY18v/IPi3wc/5lu3769PBb+TL1Tk7KfCxYvqGTiFo6HU6vezydTuviY9xx9TO+HP7v4vyVOToIKJg1BBVPPOEGlXblyZfOLUv9CFWW6Ib/w5VSYPC5TIzkefpl6d8vJxOXOO+8sLrzggubzhjvk5GMdCLmv/bOf/ax5TMJKAkQ/J1ZPqORuN7nLL3zvIYa8oNI/hxzTQRV+9uBVV11V/PKXv2we1z/Dxo0by2M6AMOfaXhN/HllX+7AlI8vv/xy8zljcxely/etA1mUP4v77ruv+PnPf26+X73vHQsBeM8997iP42QlqGDSEFQw9YwTVDocgnJ9kvxyvOOOO8r9ECFBCRo5poMqPuUlxq8RJThkGweVvii96xfzgw8+aD6nfk5QB5X+GiF+vKDyfg4dVPqi9FFBFU6ThaDSf6a//vWvy20cVHKnpTwv9zljvQmV53PPPZd8XVHHmnwsARy/zvv64ZhMwmQrf3766+FkJKhg0hBUMPWME1TyS3Dt2rXmeHhMrjcKH8t1VvHjEkLhcS9EwrVDq1atao6FU0vhtJB8PE5QxcoyD/K8W265xTwmdgWVBGG4GP9wBdWLL75YHpOgkou6vT9TORb+TONje/fuLbddwdI3qML3Fq9PJd9T/Fr5uE9QhVO4P/7xj81jOFkJKpg0BBVMPeMGlagXm/zJT35SHpc708Lz4sflNJ4ck7u/ZN8LEe8XcDi2efPmZr9vUMmxOGrCMX2HWjAXVO+99155XKJG9vsGlQRLvN8VVGHCJ3cvxq8RJV5+9atfme9N4kqOhT/T+HUhTuPj2nGCSkeb/vzysQ6qcBG99/lEiSr9GE5OggomDUEFU884QSUREH4hivFpqPjapnBMlgkIkyExBI4XIuHaHPllHSYZwRAz8nHfoJKvFb4vuW4nPE8CST9X7LooPf78fYMqfp1su4Iqfs2tt96a3NEnQbV+/fpmP/dnqj+PDhztOEElSvTJsgxhP36t9/Xia+C8zxduNMDDI0EFk4aggqlnnKAKyukfOSUld+bt2LHDPC6+8cYbxVNPPVWeftKPdSlTrnHfpqVL+fvzxBNPmOOT9t13303uWOzrsmXLsm//0ufPVO4E1BEzVPl6ss5UmBT2VSaT8ucQH3v44YfNjQU4eQkqmDQEFUw9cwkqPHqVmIpPNx5tyvc3n8GM/SSoYNIQVDD1EFQLw3DnnahPQR4NeqcK8fBJUMGkIahg6iGoFobPP/98GStzOc14OJQbF+Sau647D3FyElQwaQgqmHoIKsSFL0EFk4aggqmHoEJc+BJUMGkIKph6CCrEhS9BBZOGoIKph6BCXPgSVDBpCCqYeggqxIUvQQWThqCCqYegQlz4ElQwaQgqmHq2bdtm/vFFxIUlQQWThqACmGXnzp3mH2BEXBjK329ZnwxgkhBUAEV12o+oQlx4yt9rplNwOCCoAGrk/8HKP7yIuHBkMgWHC4IKAAAAYCAEFQAAAMBACCoAAACAgRBUAAAAAAMhqAAAAAAGQlABAAAADISgAgAAABgIQQUAAAAwEIIKAAAAYCAEFQAAAMBACCoAAACAgRBUAAAAAAMhqAAAAAAGQlABAAAADISgAgAAABgIQQUAAAAwEIIKAAAAYCAEFQAAAMBACCoAAACAgRBUAAAAAAMhqAAAAAAGQlABAAAADISgAgAAABgIQQUAAAAwEIIKAAAAYCAEFQAAAMBACCoAAACAgRBUAAAAAAMhqABmufXWWxOXL1+unwIAAJCFoAKY5aSTTnK966679FM7kdfce++9+jAAACxwCCqAogqhm2++OTl26qmnlsdXr16dHO+CoAIAmE4IKoDCD6pwXAzs27cvmWBddNFF5fFDhw4lx2dmZprXbNmypTkukQYAAAsPggqgyAfVjh07kqCSj995551kP0ZPqCS45NjevXvL/Ysvvrjc//jjj5vnAADAsQ9BBVDkg+qTTz4pH5PJlMeFF16Y/O9TB5Xsn3vuuc1+OHbdddclxwAA4NiGoAIo8kEl/9uLp1CXXnppc/ouOCqoPC+44ILmOQAAcOxDUAEU+aA67bTTkqCSj5ctW9bs95lQ/eEPf2j2AQBgYUJQARR+UD3yyCPl8V//+tfNsTiuwr4Oqj/+8Y/Jvn6NBNfmzZuTYwAAcGxDUAEU+VNz+top/bicuov/93nGGWeUx+O7/BYtWpS85uyzz24eAwCAhQFBBTAmu3btKrZt26YPN8iF7B9++GFyTPZfeeWV5BgAACwcCCoAAACAgRBUAAAAAAMhqAAAAAAGQlABAAAADISgAgAAABgIQQUAAAAwEIIKAAAAYCAEFUDNli1bik2bNiHiAlL+XgMcDggqgFnkH95Dhw4h4gJU/n7v379f/7UHmFcIKph65O1l9D/AiLiwlKgCmCQEFUw9ckpA/+OLiAtLggomDUEFUw+n+xAXvgQVTBqCCqYeggpx4UtQwaQhqGDqIagQF74EFUwaggqmHoIKceFLUMGkIahg6iGoEBe+BBVMGoIKph6CCnHhS1DBpCGoYOohqBAXvgQVTBqCCqYeggpx4UtQwaQhqGDqIagQjw7/5//8n+ZY/Nj9999vjveVoIJJQ1DB1HM0BtXnP//54otf/KI5rr3pppuKE044wRzXz/nUpz5ljnvK19XHEA+HEkvHHXdcufWUx7qCa5QEFUwaggqmnqMxqOSXx7p168xx7U9+8pPiP/7H/2iO6+fI59PHteeff36v5yHOt/K/u3HUr+8jQQWThqCCqedoC6p/+Zd/6f1LYz6DasgvK8Qh6mAapX59HwkqmDQEFUw9cw2qgwcPNh/v37/fPK6f01f5hXH33Xeb47HyF022XUEVP2fUL6Frrrmm19dFnIQ6mEapX99HggomDUEFU8+4QaX/cY+V02Z9n+Mp14jkfmFcdNFF5nOJOqj040H9+fRr/vN//s/meHjsv/yX/5Icu/zyy5PP2fWce++9t/dzTj/9dPd7lWPnnnuuOY4LQ/nv2/eCc+9/H30kqGDSEFQw9cwlqH7wgx80H//whz9sPg7/2OvnxMe7fiHIYzqQ4sfi1+7evds8X18HFZ7T9TU//elPl4/Lc/Vjovd6fUzve8f0ftexeLJX/qPS8f3jsa/89yWo4FiHoIKpZy5B9fDDDzcfP/74483H4R97/Zz4eO4Xwle+8pXysW3btpnHwmtDpAX/03/6T0lQeZ9fnqOP6c/7H/7DfzDHg48++mjyeokd2f+rv/or85wrr7yy93PC146fE46deOKJzf5Xv/rVzu8Pj33lvzlBBcc6BBVMPXMJqueee675eO3atc3H4R97/Zz4eO4XQtdj4fGnnnoqOfbNb35zZFDJc/Sx4GmnnVY+tnnzZvNYrDxn48aN5ccSO7K/b98+85zwdfo8J+z3ec6zzz6bPAcXlvLfmKCCYx2CCqaeuQTV6tWrm4/D8gZxCOjnxMe9XwjnnXde8rk85fEQaUG55mhUUOWuS8o93/P4448vJ11dr5HnjPo5w3PkHwqZVHnP+e1vf1sef/nll4tXXnnFfQ4uLOW/MUEFxzoEFUw9Rzqo5O+LHPtf/+t/ma+lv+5f//Vfm2Ojgso7Joavq4/nlOeeeeaZ5fa9994zj4/znGCf54zzPeKxqfw3JqjgWIeggqnnSAfVf/2v/9Uc8wyv3bJlS7kf7pCLg2rFihXuc7zPL1/3v/23/2aO5wyfx/tcwb/5m7+Zl+fEdzR23RWJC0P570xQwbEOQQVTz5EOKtnPLVkQ+/bbbzevD8opNH1XYFh6IX6O/prh6+bWz/KUryOv6Qoc+Xx9n+N9T7F9noMLQ/2/61Hq1/eRoIJJQ1DB1DNuUM238gsit2SB59NPP11cd9115vg4zwlTIn28yxBU+nhsn9OI4Tn/5//8H/NYrDyHu/umR/k/An3Ur+srQQWThqCCqedIBpX8Xdm6das5Pmnla477dSVw9DRMK6cR+zxHPpe+uy823CW4cuVK8xjiXCSoYNIQVDD1HMmgOhYMp1m6Tkv2OR0TP+e1114zj+vn9b2mBrGPBBVMGoIKph6CCnHhS1DBpCGoYOohqBAXvgQVTBqCCqYeggpx4UtQwaQhqGDqIagQF74EFUwaggqmHoIKceFLUMGkIahg6iGoEBe+BBVMGoIKph6CCnHhS1DBpCGoYOohqBAXvgQVTBqCCqaebdu2mX98EXFhSVDBpCGoAAqmVIgLWfn7LW/KDTBJCCqAWXbu3Fn+oytb/Y8xIh6bxn+vASYNQQUQIaf/5B9gRDz2lb/PAIcLggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAGY56aSTXI8WXnnlFX1obOTn2bdvnz6ccMYZZxzRP4P5+DkBAI4EBBVAUcXGJZdcUmzYsCHxaGE+wmZUUIWACs959dVXD3tUHc6vBQAwnxBUAEX1i/zmm2/Wh0s++OCD4t133y0++eST5tju3bvLY4Js9+/fX368bt26YuXKlc3zNA8//HCxefNmfbhk586dxSOPPFLs2rUrOS6fX74/2erH3njjjWLVqlXJsYB8v08//XSxcePGcr8rqO65557y8TfffFM/VB7/5S9/WX4srw8/d0D2Dxw4kByT70t+1nfeeSc5HpBJ1OrVq5Nj8c+pv8aTTz5ZbN26NTkGAHA0QVABFN1BJcjj3/jGN5J9mWiFj3/3u9810xz9XOH5559PHhdj9GPnnXdeefzQoUPJ8ZmZmexrtm3b1jx29913m8fFXFCFxz22b9/exMxPf/pT8zzZv+qqq5L92PjP4oUXXjCP514nyNfWx0O8AgAcTRBUAEX1y/znP/958eyzzyYGwvREWLRokRsC8SlC2b/uuuuS/aVLl5Yfy+RI9kMcXXjhheW+xEP8/HhKE389IXwPYWp22mmnme9JnhMIgdUVVL/61a/0YcOooPrwww+T70viR39fp556arIvMRrvx3h/1uHPEQDgaIKgAiiqX9QSC3JqKTZmz5495fP0L33ZP+uss5JjEg3heXfccUf58dVXX90oU5vwuGx/85vfxC83eF9Tgiz+nHJMThl6zw/HuoLqoosuavYlkMLPGv/Mo4Lqggsu6Py+QvjJzy+nBDX6c//+978vj0l0yjVdAABHKwQVQFH9Iu865ReQ551//vnm2MUXX5wcC1MnIcSJ3EEXlKCQrdDna+vQCJGjP+eQoNKnKQMSi+HzjQqqs88+23xfsh++L2HNmjVNUIrx9Vf6cwtbtmxpnit613kBABxpCCqAol/UfO973yuuvfba8rnx9UrhF31MfGz58uXm8Rh5TJ/GkgvU33///WZfv172ZfqTQz8/HMsFVZgEffTRR/qh5PuTcNSfW/ZDUF122WWd35dGXquvC+vC+7MGADgaIKgAitFBJVOR8Itc4iL+pR5+yUs4xcduu+22ZD+eAMXXBl166aXlx+FuPEH25RRjvB/fZSgRIsfkonVBTk/KfggmHR5hSpYLKkG/RgiTpHAhuNxRKPtyl6MQTumFoJIgi78vQX9fEqbxYzqoJCbjfX0zgP4eAQCOBggqgKL9Ra2NH4+vk5L9b3/7283HIYqC8QXhglywrj+3/D0JhEAK6gvEw6kzHR+xv/3tb5vHVqxYYR4Xu4IqXFCu1deS6cfFrrv8xMBNN91kHvv444+bx+M/R0GWoNDP7/oZAACOFAQVwEDkl7yc6gIAgOmFoAIYCEEFAAAEFcBAZLHK+CJ1AACYPggqAAAAgIEQVAAAAAADIagAAAAABkJQAQAAAAyEoAKIkIvLN23ahIgLQG4WgcMJQQVQVG/1Iv8Ay1ZW+UbEY9/47zXApCGoAGaRf3T1P8aIuDCUv9/h7ZMAJgVBBVOPnBbQ/wAj4sJSogpgkhBUMPUwnUJc+BJUMGkIKph6CCrEhS9BBZOGoIKph6BCXPgSVDBpCCqYeggqxIUvQQWThqCCqYegQlz4ElQwaQgqmHoIKsSFL0EFk4aggqmHoEJc+BJUMGkIKph6CCrEhS9BBZOGoIKph6BCXPgSVDBpCCqYesYJqvXr1xdnnHGG8YW1a5vnvPDCC+Zx/XkQ8fBKUMGkIahg6hknqK644ooqoGajKXbXrl3Nc+Txp556qvz4tddeK/fPOuss87kQ8fBJUMGkIahg6hknqEZNnG6++Wbz+J/+9CdzDBEPrwQVTBqCCqaecYPqnHPOKT8u/+I4j+t42rFjR3nsueeeM89HxMMjQQWThqCCqWfcoNLeeOON5nHvdTK90scR8fBIUMGkIahg6plLUIXXSEzJ/osvvpg87r1Orr/SxxHx8EhQwaQhqGDqGSeoPOOI6gqq22+/3RxHxMMjQQWThqCCqWfSQbVz587y2MqVK81rEfHwSFDBpCGoYOoZJ6gkjHbv3m2OhYi64YYbTFBdffXV5hgiHl4JKpg0BBVMPeMGVRxHq1evLve3b99e7h88eLDcX7ZsWbn/1ltvmdcg4uGXoIJJQ1DB1DNOUN17771NIAVXrFiRPCdEVqz+PIh4eCWoYNIQVDD1jBNUiHhsSlDBpCGoYOohqBAXvgQVTBqCCqYeggpx4UtQwaQhqGDqIagQF74EFUwaggqmHoIKceFLUMGkIahg6iGoEBe+BBVMGoIKph6CCnHhS1DBpCGoYOohqBAXvgQVTBqCCqYeggpx4UtQwaQhqGDqIagQF74EFUwaggqmnn379pl/fBFxYUlQwaQhqAAKplSIC1n5+71//3791x5gXiGoAGbZuXNn+Y+ubPU/xoh4bBr/vQaYNAQVQMS2bdvKf4AR8dhX/j4DHC4IKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQAAAAAAyGoAAAAAAZCUAEAAAAMhKACAAAAGAhBBQAAADAQggoAAABgIAQVAAAAwEAIKgAAAICBEFQA88CuPR8W1/zbjmLRt1+L3FQsOkf7aurZ4iutZ2103FB5pvhy6hlh+1Lq6esjX2xcHLanieuKRcFvvdC4uHFt66lri0Wnrkk95flisXF1sXjp6mLRUtmusi4Rn4tcWSye0a5IXSw+27roGcflrSc/7fvNZcqnisXfCD5p/br4ROTjxeKTWmdKH0tcfOKjjTOy/dojs9tZZdv4cDHz1eBDjg8WMyfEPlDM/GPs/dav3Bd5b+X/097T+uW7lXcVS4Jfap350p3FzBfvLJZ8Ubb/PrvV3lEs+ULw9tZ/iL0t9e9vVf5b6/HBWyr/7pbiun99rtj13gH9Vw7gqIOgAhjAQ0/uLRZ9Z3OljikTVCqmyqCKYupsHVJtUC3uCKrFs9vFsxEV6wWVxFRpGVPjB9Xi2YhKNDHVBlWlF1RxTHlBpWKqDKoophbrkOoRVBJPJ6cxNSPbJqbaoJqJnY0osYkpE1RpTM2cKFYhVVkHVBJUD0dBpUNqckG1pPSexr5BteRLVUxV6pjqE1QqpkxQRTHVBNUtxdImqG5O/Ok5D+q/ggBHDQQVwJhcfsP22VjSARXpRVQ5iXImUu5UKp5IqZCSiZSeRpWur9RTqdOCUTw1thG1aDaaSmUSFbZ6KjUbTKmrW+upVOWqYtGS4HONXkQtmg2mxsWVaUBVLqrDqdrG8RQbAsqbRtUTqdxUykyjvKnUY60nxrZTKZlIpT7cKCG1uJ5MLZ4Np9ITxAcbk4hqQur+YnETTsE4oGpz0yh3KiXTJ887W+upVONsNAXbiGpDauYfxNsSq4hyJlLNJCqaRsX+nY6pm4oln0+98lfL9V9NgCMKQQUwBifPhtTJs9EU64XUyXVInVxH1Mk6otyY0hGlJlImoupJVBJStU1IOTH1rXQilQaUE1JlTOmg0hFVh1QTU21IJZYRFduG1CIJp1p9ik9CqnJ5sejkShNStYvqgArbMp6SkKpjqoyouYZUFFGNTkhJPIVtR0hV1hGlJlISU4u/Eryv1EykvJj6cqyaSI0MqSimvpDGVOvtlfU0Kompvxd1SFUxNVOH1IyOKC+kVEQt+fyNqZ+7sXhh5Vb91xTgiEBQAfRgy9b369N6c51MeTGlgsrEVM+gMnbElDq9l0ymOoPKmUyNGVT29J4fVN4pvjCZkqByp1L6FF88lTJBNWoqlQmqzpjS06k2pKqJVDuZktN64wRVOaHqmkwlQRVPpDIxZYKqI6bUZCqdUKWn99Kg0iHlTae8oEpP8fUJqiWfu6F4Y9Mu/VcW4LBDUAGM4K6HdjfXSZnp1Dk6pOoJVTOZysXUqMmUjikVVCaiophqgmpUTL3QI6ScmMqFVBNU3VOpEFJyfZSeTCVBFV0jVU6mounUIh1R3qm+ZCLlnebTEVWHlLpWanRM+SGVWk+mmgmVjanFSURVIRViKkyluqdTPUIqF1NNSI2OKTuZqq6ViidTQXOtlBdS5VTKiankNJ8KqSimgnff8IL+qwtwWCGoADr44/Xb24vOzYXnfkyNPZkyQRWF1FhBVcdUGVROTCXXTHlBpWJqjMmUXHDebJOgaiPKu/g8H1TORecjJ1NHKKgyk6mgdwG6iamOoOo3meobVE5M5SZTblB5F56nQSUBZSdUkw+qJZ+9vrjiF8v0X2GAwwZBBZBh0XdeT2PKC6rc3XxdQeVNqJKocoLKnPJrQ2pxs61iqtyamFpXLJ4NqtJvtXoXoKd387V38ElMyV18ElHt0gjO3Xzl6T11Ebo53ZdZEiEzobIXoTtB5Z3u866d6giqmdmYKi3v4qtMT/m1IZXczdfcyVffxdfcyecHlbmLL5zmS0735e7ii4IquaNPn+5rQ2pJY3UnnxdU1R19XXfxqTv5krDK3cWngqqMKieo6tN9S+uYku3STFAtjZ0Nqdbri6WfrQQ4EhBUAA7LV/25R1B5MdUnqOKY8oNKlkII22BXUFW2SyPomOoKqmpJBGdZBLGOqWZJhGRZhD5BVcfU2EHlTKhGBlU+pmbqmIqXRdAxJZMpG1RVTFXLIsQR1Teo9JII8x9US0YEVRtTbVA1SyIEc0GVxJQTVDqmzB19fYJqNp6ODxEVW8XU0jqokpAqVTEVBRVRBUcCggrAwYaUE1NeSLnrS3lTKe90nzOV6gipNqjayVRYZyqJqfr0XhxSYX0p71SfH1PP9wgpJ6Yyp/r8Naa8kNKn+3RE9ZlMRVOpWhtU1em9eDLVLtbZTqbKxTrdkJrLop11QDkXoXfHlJ5M6dN96Wk+G1LVdEoCqtxm15jSQTUipkxE6ZByTvklE6k2pIJ6MiWn+exkKp1OLf3sdaUAhxuCCkDhT6bmL6gWJ1s/qOLJVLNYpxtUUUg5QVUu3mliqg2q7GQqOtXnB5WKqdxkaqygemaOQVWFVLlYZyaokgU7S/3rpnRM5SdTdUwd9qBqY0omU9WCndWinV5Q+ZOpaDo1l0U7m6DqWrBTxdSsS3VMHd9eL5ULKjOVknhKJlP5oCKq4HBDUAFE3HH/rmEh1ZzusyFlJlPNqT49kfImU/pC9PYCdP12Ms0K6PVkKp1QzfHtZJprp7yQcmJqZEipmDIRFZ3mK4NKR5Q3mapjqmMyFZZKSFZAjy5ANzFVTqjS66bk4vM0oqJTfb1Cqo6projKhVRyEbo+zedcgG5CqoqpeX87GRNUHZMp5wJ0G1KV8QXoEk5y8bkJqSam2pAK3nntGv1XHGBiEFQANZu2HEoW7kxCKgoovWinCSg3ouJJlJpKlXfwOQFlJlLxkghBe61UGlJ6WQQVUafEd/F1LY/gr36eXx4hXf28awX0ZNHOzN18i+o7+JrFOrPTqCiksutMxXfy1RecN6f27MXnElCp9Z185o4+f9FOL6Tkjr5ywc5gtDSCMRdQzkTKLthpLz4fd9FOf/VzHVC3ltEUFu0010m5IVVdI9W9zlR0F584G05LZgOq3DZeV/l/xWsbl9a+9vIO/VcdYCIQVAA1dhrlB5VdtHOuQRVNpExI1THVGVROTOXeTqZ3UNVLI/QMKm8q1fftZPSinXZphGgypZdEOEqCKn47GZlEdQdVfHqv59vJeNdJZadSOqRUTDVB5S+L4F0vlQ8qfXqvCiozjZpAUOmLz2USpYMqxFTlNfqvOsBEIKgAZtl/4CO7aKcJqSqm5vftZJyYkngy10qt755MTfrtZMqgcqZSZjLlr35uVkCvT+vpt5Np31ImPbXX++1kRoVUdHrPhlQUUY1OSDUTKTWZKmPKLtjpXSflvZ1MOqHKnNo7St9OJpzam6+3k/HWmLLWIVXGVDuZaqPqmsrPXFPs33dI/5UHmHcIKoBZLrxkq5pI5YMqO5UqY0oFlYmpnkFl7Igpc5rPCyoVU2Y65U2lRgWVf+G5F1TeZCpcJ5U7zZe/VqoOqNz1UiakOoKqM6b0dMoGVfx2MuWEqmdQlROquUymcjFlgqojptRkKp1QpddL9X47meZaKS+o0uul+gVVPJlKQ8q7+NzGVB1Un6n82Rn36L/yAPMOQQVQyJsep28nc7IJqTam5v52MlFIeTFlIiqKqSaoRoVUbVdMjTuZqk/3LV76XPHo49uLTa/tLx597N3i299Z00ylQkjJBed6MpV7O5lqQpW+nYx5Sxl9qi+ZSHkx5QSVxNOYMfXD7z5T/PDc4PLK78Q+XZw585iaTumgyq9+7r2dTDuhcqZTXSGVi6kmpFRMuUGlJ1PVhef9305GxZSeSrmn+VRIeTHVMZWqQmp2q66dWjIbUGKIqSDApCGoAAq5fsq5bqrUj6rchGqxF1YqrpIlEcqwstdOLRZPTxftzEVVdWefXrQzXhahz9II0aKdyeKdq4of/mi9/uNK2L7jkL2jr7xuqvvaKXsn3xgTqllnxNmgWvbktvL72PrWAWd9qUq5q89btNNbGuF7Zz2tfkKfd7but3f1JddMqaURkilV7m6+ynKxzmbRzmhCVcdVuljn3cWNV6wrvyezLEJscxdffSefWQXdWR4hvgjdu27KhNX/3965ONdVXXeY/5CSmUyHmU4fM4Q4g20Jgh1CA23aKSQ0JaGPNG1nCDilhjxKW4cEioHiSTyOGwc3JoCpFTDy2/JbkuWHuNXa++xz9l577XPP1blXkqvvm/lx4yvJNmI0+ea311k7baemXNK1CCJV8dLObDWCi/EknzE7VSeZmYoaqqilOvjWb9V/QYDxglABDLRQaYmqRMpaidDWUBV2TKUtVSpSoZXqep2MtFF6+3mzsDNtpyyRGnadzLbpX+lv1eDTT/U7g8GePSfLKxFaGqqhIlWQqdBO7f3PE/XfQYTKPvLTIuVlqnSdzGhCVVqNEAlUZ5HyEpWvSIiP+5pWKsjUk4/uq/9O+qivuGOqTaLqI7+WJ/pikbJkKmqoxnWdTCZRRaHK26mpz/zz4GvTP47+6wGMH4QKNj2yLiGRqVUJVSxT7UKll3aWhKrLdTIloWptpupWSjVTSbxQxfI0O7uQLO3cvTv9uRwuVFqmughVWaakndJClTdU/rivSzNVaqg6XyczRqEK18nI0k5LqOJ2Khaq7DqZ1QiVlqlhzZQpVLFEpUs7QzOViVTWTHUUKi1TBaGSAEwShAo2Pf/+6sXhzVQtVG2tlDU/ZbRSLc1UI1RNM6W3nweRCsmO+VxDlQ+h5zJ1uChSITF6PYIkMDNzrRaqwDvvXEyELEjUFx9qvi7wzLd+k8nUW2+e0p/mePRL/+2aqNu3japshVimrl65kXzs3NnFbGGnW9ZZC9VbtlBFqxF0ks9Vx3uB27eWa5F6eEv6NcJff/2gb6Mqkfo0+sb96IX3o8/0hO3nZ05e0x9yFEUqHPdpmRKJsmQqkyhLpGyZSoXqB3V0MzXKdTJZtEwVRAqhgrUAoYJNzzf/8VRvoepynUzSTu3w18n4hkoLlbpKRglVfJ1MSaiyVkod9dlClcrUs899lHyful4nU0Jk6tt/94F+u2b2k/lapg4dmtMfThguVE1rY2G3U/4qmXEJ1Tf+/GD9/pOP73cy9e2nD0WfnTL78ZX6OplYqCzefefsKoXKkKlEqOJmyhKqSKbuba6TkVkpL1TpELolVFkrJfKUNVPjEarpSqTkVQIwSRAq2PRMPx6vR4iP9owjvqyNso73IpHST/KZrVQ8cB4nP95L1iJkqxGiZip7kq/0RF/zFF9Y2ilNlLx+cPRq/T2S/39PNqBXT/NZx3sxH3xwxR3r/eVT7w6mp9KPBXm6eXO5fu/Ff5lxx3tJs1U9yXfpUtM2/WTPcSdOe1+brd87eWLeH/Hdn8rUyz+YcfNSz3wjvYYkXYnQ5LGd+5PPKxGO96Y/10jVnh8dc+Ike6YCy8ufuiO9B+9rGqtjRy/WM1Lxv3843ouF6teHztRP8MWEJ/qe+PLbzXu/Zz/JJwIVr0bwCzvTtQi2ROkmSrVRRis1dGHnZ9WyzjovOomKVyM0CzvLSzvNNuqeON+rAzBJECrY9IhI6etkVr8aoZKpztfJVELVJlKWTJVEqhYqQ6QsmTK2n4ccm0nbD739PN8vlQtVfJ3My/96vH7/vDwZWA2cT28/UL+/uHgrm5UKw+exZB08cNYWqmolQky8HiF539oxtZJRhUraqBiRqZ1b36p//fU/2e+E6t9eOlq/F69FeOi+16L3/axULFTxSoQTx69E7/vh8yceUULVYWmn3n4uqxFymXrZCdRGuk4mFSpDpgoihVDBWoBQwabHN1S6mbJkqotQdWimWoXKkKlRr5PJhKqSqY5CFa6T+dnP0zvQugnVL5KviYfO5UivC0Go2j7/wP4znYWqREmoHldCZe+YSofPX37xw/rzpaGKZ7fC0Pnsx03jV2Lnltfd0HlJqN4/0vw3KQuVtbAznZeyhUof73mham+mxiNUpeFz3UwlSztbhSqXqal7dtXfJ4BJgFDBpuerf/VJdp1Mdq1MV5EqyZQaOu8kU+t8nczORw4n3ye9/VwSOH16sR46D7hjwmpppwjVqZML9cfakEZKjxDJcZ8IU+Bn+06PSajy7eeP7VBCpUTKLeyMn+KrEvifQ2ejr26E6tQJe94p5i++vK9VqOT4r36/Wtr5xCNN86ZlSjdTYWlnLFLb7tULO9Ojvk7XyUhaJSpENVNZ4utk8nbKLezMZqWGidRKfmeXC8AkQahg0/Ps7jOjNVOZTK1WqOLZKd1KaZmyhErJVKmZGkmo0sHzGC1UU9PpALoWKhkaj1ci7H39VP2xubmlfL9Udbz31JNq1qlahfDeby7W7+37r1OZUJ0+tVDvloqJ90xNbXnbbqYioXp8lUJ1Ye568nWCNFVBqN746Uf1+3pRp94xZQvVjw2h2jNEqNTgebwB3QmVF6g2ocpkygmVkqlOQpXOS8UipZspP3CeCpVrqNTQeTeh8jKFUMGkQahg0zPz8fV2obIaqqylioTKSZVx1FeJlF7aaQmVtf08P+7zEpU9zTcdlnZWe6amdKKn+aIjvjReqLZPlZ9Ki/nKVw4PESovVTG3bi0PDv0yfZrv+e9+OPjTx9I/86knDw/+9+jl5L13f33BbT//4UvHkvcvX7rhpGr2k7QN2r3raCIp8j+3rQhVvmMqF6o29I4pjd4zFfPmqx8NDh1oJFMIu6VsoUobqrBrasd9zT118j1dXvm+j7RnKpOp4ULlnur73XTHlHWtjPlEX53yUZ/9FJ911KeP+1KZmq6zazCNUMGEQagAVmgTqnCdTFiNYAlVl+tkgkzppZ1dharXdTKdhapqqKKW6qt/dkR/uxKeffZYsrQzoBsqyXf+vrw2QZ52c1fKbPm5/lCGE6LP++tkNGHPVBsPfuHtiQvV/LWmnZLISoR/+FZZUOXf3xKq+DqZI5lQ+XUImqJMOaGKVyNokRouVNZ1MnppZyZSLoZMjUGowmoELVSJTK3ka9v/Q3+bAMYKQgUwEKHKRSpvpvT8lGqlzHZKH/Op62ScUOVHfdb2c91MpQ2V3jHlj/dEoPxrumPKy5QWKr1fKt0xZe19coPoavt5wAmSWtYpefihg65JiZGn+PSFx7dvNX/elcs33BFfTNh+/vqrzbGfEF8nM3s8baouX1qqRCqSKbVj6tEH0z+nDb39XBZ4Br54/16/qFNdJ7Njy97od/DsfWUm2YAef6/j62R+FTVa8X6pf/pmevz6yP0/MURqhGbKkqmW62SaK2XSo75iM9UmUaZM6VYqaqacTOljPn/UF5opycE3Z5LvEcC4QagABpZQfejTUai6XCfTNFT2ws5hQtXaTCUyZR31WUJlNFMtQmU90Tfu62SCTMkVMnH6XicTL+60hSpf2OlTuE4myXiuk0mvlHnFp2qmNvp1Mn5hpxeq9maqo1BpmWoRKtdQZTLVNFNBqAAmDUIFMFBClUmUPuYzWqkOzVQYQo9lym09j0QqJDvmcw2VPYSey9ThdpkasZmy7+fTElWJVC1TWqKqJIPo6TC6Gz5XMWXKPclXkKnqSpnkOhmRp0SkKplq2X5uipQ63stjyFR0nUzbRceNUMUi1QiVtFNFkXIxZKoeQtcyZbVTWqRsmUqFqhKpSKaCULnrZBKJsmTKEClLpgyJyqKaKRlADyKFUMFagVABrDC/cLtFoJRIWU/xmSIVD53bs1LF1QjWEV+2EiFKdbQ3bMeUXo3QJN1+7l/903xBoh5YkaY0sUA1IvWA5Atenh6wBMqSqM+HxPKUS5R7ii9OtLSzjnt6z3iSL3ui7w1zx5RIlH/1ErX1jyR++7nLH/psc0klamu0sDMRqJJIRQPn8dN8daon+Zrt5/meqXo1gl6JUMWSqG33+oWdYWlnp9UIyVN8xhHfZ9V+KZfC0s5h288rkdpeCZN7bVvaWT3F1+T5Jnc/P5i/sqR/5AHGDkIFUJEIlQjUyEI1okypVip/iq+LULWsRjCEShop/+qbqK7XyWihEpHKhaqtieoiVFqkWoRKJKoWqkimhgiVNFIiU/41F6qmlUqFKlwn414LMuXSW6Yioar2TPW5TqYWKquRGrq0M16LoEVKyZQpVF6mJn2dTC5UkUxVQgWwFiBUABUzHy8aErUamaqEalSZKolUdLyXyZQlUrVMGa1USzNV3n5+0B3pxc2Ui2qmYpka3kx1kSk/K5U1U3UrZcjU5wyREnnq0EylQtUc7+XtlCFS8RGfPtrrLFO6mYpkqq2ZqmUq336+LRMpL1Pjv05GCVXSSEXNVC1TXa6TqYSqTaSiI75Epu5u8tv300WrAJMCoQKIsIWqNCcVyVSrUBkyNa7rZAyhkjkpS6isealuQuVnpEIzlR/z5UKVZ42EymqmpJEKr9HMVFmo0nmp0Ez5VqrQTFkylQiVmpdqkynzqC8VKWteyhKqXKZ0OzVZobKGz3Uz1QhVc9RnC5UWqYJMKaECWCsQKgBFJlF1M6WEKhs67yBT2czUkQ4iZciUIVKtG9CTVipqp4zrZHQzFRJaqSbW0LlqqBKBUiKVDZxbR3yRUJUkqq2ZSlI1U3VDNXz7eTjiC81UiC1SqpnSrVRRqHQr1S5Tuplqu04mbaiaofNsZspJlBYpPTdlSZQtUmYzVWinitfJ1DKlJarlmC8Sqam7n9M/2gATBaECMBCp2lo1VG5R587Sws73B1t3vOfzcJPStTJ+YWe6tFPaKfcUX7IawViPMK3WIoTVCMmKhNKTfKX1CPFTfPbsVPpEX9VQlWanzIbKt1PbqoZKFnfWT/AZUuUXdvqlnWE1ggiVe4Kves1XIkSrEdxTfNFahJDsiT49M6Uaqlqu1NN8WTtViVUtV1FDtZLtkt+PVyL4p/lEpuIn+bLUT/Dpp/iMhsq1VOpJvrbVCEZD5Rd2pks7XTsVsiJVIy3tNNqp/Ck+exi9TayahZ3pagQRqukoAGsNQgVgcOCXV/KWKhOqppXqcp2MF6p8x5T1RF9JpqShyndMWasRholUJVOtIpU2VENFyhSq6qjPGkQ3ZMoLld4xpYbRq1YqE6laprREWTL1Rlmikpaqo0hZMlU1VCWZihuqejWCE6kuMjVkz1QmUVFD5YQqP+q7U6+TCTIVt1TTHPXBOoBQARTQ18nkDVUjU6u/TqbD0s5Rr5PJhKqSqZGFqm3PVEmobJmSVsqnbWGnP+7LhWrUpZ1rJ1RuWWe1tDNZ2DlEqMxmSkQqa6YsoVIylbVTWqS6CNUP74jrZBqhSpd2xs0UMgXrBUIF0MKwZqppqHwz1XadjCQTqbqdSuemcpHyMiXzUiJQ/lVJlHnUpyUqOuZzQqUlymqmKplqFalCM1WanXIypYXKz0vFzVSzrDOfncpFqsfSzmRuaphIRa2UNYzeYfu5HkAXmZJ5qXaZskRq1GZKHfWN7TqZl9olypQp3UpFzVQtVHp2SouUl6mmmWJuCtYPhApgCOE6meZKGS1T3a6TKQlVsZlKZMo66rOEymimRhKqXxjNVBehGi5Tup2SOalEpjKhGrWZitqpokyNV6ji62RkVqqrUGXNVHbM10GotEyZzVQkU7VQRc1UJVH6qE9vQG9vpjoKlZapFqGShsq+UsYWKpop2AggVAAd2LazkinVTI1ynUwjVM11MiJTup3yc1JG2mRq1GaqPu5rO+KLjvmcUGmJspqpSqhKrVR01NcIVfpEXyZTrqHyAlU3UyJPVjPVKlOF4XNLouoYMpU81aeP+fIn+u6E62R0MzXydTL1MZ8hUpZMGRKVRYlUeKLPkqkH70GmYP1BqABGoNMG9Gw1gl6LoCRqWi/srFId7SWrEYzt5+X1CHrHlBeo1VwnI9HXyTTLO3UjFR/p6WM9S6I67JiqVyLk28+7LO0UgfKvjUTlCzuljcobqXW9TkZi7JiyJGrbvRvrOplsYWclUp2vk5FUElXeM/Xc4MjBT/SPKcC6gFABjMh3XzhRlqmslfLrEEYTqnfKu6YMoZJGyr82bZS+TibIlM6Gu07GkqkhQjXsOplsA3rdSm3862QkRaGyGqm6iVJtlNlKaZFSMmUKlZcpfZ2MtFBDhcpqpFqFypApkajqddfT+/SPJsC6glABrJIXvn9yuEy1iZSTKS1UWqIqkaplymilVDNVC5Va2qllSo70Ol8n4xoqJVIiT8asVLtMNbNStkzphZ0SQ6REnqxmyslUuv082YAezUn1uk6mtLizJFKWTHVoprIN6BO7TkaJVHXE13VppxcqtbDTlKlKqFpFqkWmVvLi3+7XP4oAGwKECqAnr7x2thKqYc2UkqmsnSo3UzInZQuVPXg+XKj8jFTn62SshmqthMpqpqSRCq9qZkrLVL0BPRs+D61UoZmyZCoRqnxeqihT5lGfFil7XkoLVS5Tup2arFCVhs9jiUpkqlWotEgVZGolP919WP/oAWwoECqAMbK0tDzYf+Di4Om/mRl86bH3imsRRmqm6oaq3ErZc1PNdTKJUEVD55vhOpmthSf47oTrZORor991MungeS5TlkTZImU1U2F2akpfKeNmpQyRqmVKS5TP9Ge+N/jjP/j+4JlHXx3s2XVosLR4U/+IAWxYECoAAACAniBUAAAAAD1BqAAAAAB6glABAAAA9AShAgAAAOgJQgUAAADQE4QKAAAAoCcIFQAAAEBPECoAAACAniBUAAAAAD1BqAAAAAB6glABAAAA9AShAgAAAOgJQgUAAADQE4QKAAAAoCcIFQAAAEBPECoAAACAniBUAAAAAD1BqAAAAAB6glABAAAA9AShAgAAAOgJQgUAAADQE4QKAAAAoCcIFQAAAEBPECoAAACAniBUAAAAAD1BqAAAAAB6glABAAAA9AShAgAAAOgJQgUAAADQE4QKAAAAoCcIFQAAAEBPECoAAACAnmxooTp+/DhCBQAAABueDS1Up8+cQagAAABgw7OhhUqCUAEAAMBG5vLly85VZmdnM49ZTSYqVHNzc/rvDwAAALDuBFdZWFjMPGY1mYhQLV6/Xv9F5+fn9b8DAAAAwLoRHEXmvrXDrDYTESrJuXPnaaoAAABgw7C8vFy7ybhmp0ImJlSS+C8tOXfunPuXAQAAAFgrlpaWMieRh+i0t/TJRIVKEq9RIIQQQghZ71y6dDnzlb6ZuFDFmbtwAcEihBBCyJrmxIkTg6vX5jMvGWfWVKgIIYQQQv4/BqEihBBCCOkZhIoQQgghpGcQKkIIIYSQnkGoCCGEEEJ6BqEihBBCCOkZhIoQQgghpGcSoZpfWMg+gRBCCCGElCP+VAuVXGJ85cqV7JMIIYQQQkg54k/iUbVQXb161UV/IiGEEEIIyRPcSTzq+vXrg7sWFhbcG5cvy/02N7IvIIQQQgghcW44bxJ/Eo9yQiU1lZz/yQcuXrxofBEhhBBCCAkRXxJvCvNTS0tLXqjCHNWlS5eQKkIIIYSQQhYXrztfiuennFBJTRUf+4lQLSwsZr8BIYQQQshmjvjRhQsXsuO+GzduDO6Sf8gvwnC6fJJ88vnz5wfXVt7TvxkhhBBCyGaK+JB4kfiRtFPxMLp41M2bN71QSVUVZqmkwpKWam5uzn3xuXPnVr6IPVWEEEII2XwRDxIfEi+yZqfEo27dujW4S/4RWiqpruIB9dBUyW929uxZ9+tr18TIlrI/kBBCCCHkTo74jXiO+I54T5Ap+XWQKX3UJx51+/ZtL1RSVYll6XkqqbXkN4nbKvkDrJw5c4YQQggh5I6JdpmQuJUKx3xBpsJRn3iT+FMtVPIPLVVhnip+8i8WqzjyhxJCCCGE3MmJ3SaIlPhPeKIvyFQ46otlanl5efB/I4mLcIFA7sIAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,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FQAAAGgtiAoAAAC0FkQFAAAAWguiAgAAAK0FUQEAaAnvvvtu9vrrr7vIOgAgKgCt4+ijj+6aw4mzzz47+n6S3/zmN/bQw54HHnig/P4nnnhiOS4/i8P1zx+gG4gKQMuwF+xU2shAz2/Hjh3R90qlLehz2rx5s909JNSJymWXXdbKnwnAgQBRAWgZ9kKdShsZ6PnZ79SUNqDP50CLyrXXXtu6nwfAgQJRAWgZvV6Qxo8fn1100UVlLHX7Fi1alH39618vP2P27NnBfuHGG28MXvvSSy9ln/70p93xp556arZu3bry2NGjR7vj9HmnPlcjPRj6+D179gT7t23blvw5PPbYY8F7z5s3L/vyl78c/ay2bNniztO//tZbbw32a9avX19+N//99L87u3fvjr7f6aef7sbee+899U75537hC1/o+XP9seedd54bqxOVu+66K/nzADgSQFQAWkavF6S1a9fWHqsveHqfHrPRsvDjH/+4HP/9738fHavfUwuBTR3HH3981+P0/meffdaNXXfddeXYFVdckXyPH/7wh9F5+CxdurQ8TvCSk4rsE5qmqET6PAP5XP3z1akTlcmTJ5fjIjcARxKICkDL0BeubuhjJ0yYkBxfvny5Gzv22GOD8euvvz74r3/9eXUXUhvhjDPOiN5HtpsuqPrYhQsX2t21aFGxEe6+++5g7A9/+EN28sknR8cJtqojTb0XXnhhMCbytnPnzuj7SQVGxqTSNNDPlX8o9XhdtKjMmDGjHD/ppJPKcYAjAUQFoGXYC1YqnilTppRjcvFMvUdqTN/6mjpWi4pME3n+8pe/JI8X6sZTDORYjRUV+XdGo/fdd9995bie2nnkkUfcmEynyLj+uQn6PRYsWJActz0qep8m9bkidn5My9w111wTvI8WFZni8uPyZwNwJIGoALQMfbGqS93xdWNNUwcXXHBBuU+OE7SoWOx7dxtPMZBjNVpUZs2aZXfXvq/8O+LH7fe36ErI9OnTy3H93r2KSupz6461+7SoLFmypBwX0QE4kkBUAFpG04UshT1e/u757b6+Pjd21llnBcfVRaY/hAMpKtJU2itaVCz6Yt4tHjulY9OLqAz0c+22Rppv/T4tKtK87MePxOfLwJENogLQMpouZCn09ILwq1/9qtyWv5R2rCnSoCocSFH55S9/aXc7xowZk11yySUuIgNCk6is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>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,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>

[image10]: <data:image/png;base64,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>

[image11]: <data:image/png;base64,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1FQJCBkZGRJIS0vTSM2sASeS01OtROquBLSU7GqqhlHKjNQ2pKenSx4taDZAwhrjObSZxwNymmW1Ddj1NFiQZmhOSc1+frSU5hdQSmL0cJpBe6qp5q6nWkII8RVU4tMAdt+0+AL0YOfOnThv9913n8SoPKgGiGaIECJGpffYsWOJiYm//PJL586dmzVrJvF6CGTOLooSM3HixPXr16OGKlWqjBgxwqOswvHjxx23rCl1jqt848aNu/jii53I6kHrz3DRnBJG/uyCJ4d755136tWrpzHIOWzYsISEBJyN5ORkbKtWrbps2TLtsmTT2mrVqvXee+9J2LOOMbss7TdPi9lZpKrQShskXhuvObOfIkII8QNU4tPgzxTrrbfeypMnD07djh07VDsloALjkQEVD5RatWrVunXrsDWzmcdysioKlOz6668fO3Yswt9+++327ds1SUphK8c1fUpVKaS+//77F154oTZVtqpwUkoym82WnNoj0d37779fdsOuH/z2229fffXVe/fu3bdvH9YKZcqUqV27tqR6qsJujRo1hgwZopGCnhk5kGetYIb1JAsSVu9fDycxHveaEEL8A5U4WkRpJGAKALjxxhsHDx5cuHDhoUOHiuQMGDCgS5cu9957L1zPli1b7tmzB9kgWq+99trtt99+wQUX9OvXT4QEJ3zFihWQxh49eiDP/v37H3744XPPPbdmzZpTpkxBDFStVatWKFKpUiXUjxg40PA7ixUrNm3atGefffaLL75AVatXr0aGfPny3XzzzfPnz3dchxVteOyxx4oUKXLnnXdKG0SfxowZAyV2XPWCoEq/fv/99yZNmuTNmxc1o6xk/vHHHxs0aICj33XXXXPmzBE9Q7UlSpRADCpHKiJV9lDwmmuucSJC3rZt23LlyklS7969IdJXXHHFc889J0pZvXp1UeLvv/8eJwftvOeee2bPno2Yd999t2fPns2aNUMktBynBflxKh588EEselAQjUEl8Ps7dOhw5ZVXli1bdsKECdK8W265ZfTo0ddeey3OiRyaMkwI8TNU4mhRX019Mrng/Msvv+CkQecgMJUrV85w75I++eSTiYmJb7755owZM6A90BXkh0Tlzp178uTJ0AwUgchBrpANgvHyyy+3aNECtTVs2BD+7qJFi1JSUkqWLIlDtG/fvnz58gsXLhw5cqS43VBuiGX3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ihx4+eWXq1atun379r179/78889lypRp2LChppqupyKqCb0fP368KZmOm98UV3NVgfwfffSR47ZQfo6lXZOj6HpFa8hwQYNxWuTTDoQQYgdU4jOIyMnixYtz58597Nixnj179unTBzFQwVtuueXHH39E5ODBg7t06fLDDz80aNBgzZo111xzDVzSevXqffPNNxdccEGnTp2guDfddNN///tfrRaitWjRopD7XSYoHAo+9dRTOXLkOHDggOO+/7JDhw5y6Pbt2z/yyCMtW7Zs1KgRSh06dAilFixYIPWIyJmXsnG4unXrprvvxMDuoEGDChQogKSnn376jTfewHpizJgxu3btatasGeKLFi0qr/dC+7EUQDtnzpwJD7hz585YTKDN0GapeenSpbVq1cqXL9/DDz8Mpz8lJSXkvp1j+vTprVu3xuLDcc9JlSpVcuXKhSWFPHaOPjZp0gRuOqS3XLly3377rTS1UqVKI0eOFC9fOkIIIXENlfhMoV4sfNBq1apBNkaPHi2OLNQX5xnCjDCUb+DAgdCw884778iRI/BoCxcuDH90xowZIfejRp9//vkdd9wBFRThke3Ro0chfhMnTkQYBb///vsSJUp8+umnUFB4vfJ2TBy6SJEiU6ZMgTuOqg4ePCjvn4JwQlCRZ+zYsfpWSJFeJEHn4MdD1FevXl2hQoXGjRujI9DIpKSkNm3arF+/HupYvHhx+XhiyP04EnKWLFkSKg6f+/nnn4dCoyXDhg1D6ty5c9EpLCkg3uhj/fr1sSxAftSA7u/evRu6O2LECOSBMN9zzz1Q365du0Kz4Sij5pD7UQcEbr31VpxD6VS7du3kdVqEEGIHVOIziNwihQsIPUNg27ZtOL3bt29/4okn4DJCZeWrBps2bfryyy/lWjQU7sorr0QAPjGS5KEteI3nnnuu417rVkcQfjN8X/jKefPmxYFeeOEFeK7wPqHQW7duDbsfcYKLiSIZ7js1sSBAGKlQ+rJly0I7r7rqqqFDh5oPRcsnh0PurWJs77///uXLlyPprrvugpQ67nNnqEE+XQzQL3mh5rXXXgu9l/vQOJDUiaS2bdvKFxvl4jMc4o4dOyJw/fXX61cd33///alTp0LpUbksCNBZVCJnQG5jf/XVV/DCpVp46pBtaQAhhFgAlfhMkRl5WhgO3EsvveS4UnfNNddMmDABQgJP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DuUxXDj77LPxF3n9kiVL4AfXXXfdwoULsdbll1+Ov1hFXA2VY/53330H97r33nuR02HazryqHUBgZq9eveCgMqfS3M66wQYbxPMdgbEybhGIVXurdWbPpJVwZqTz8Bw44dSpU+GxUTkzQput09jDTTbZBJVXLRsXYmXfUAgYrIsG3QbD2fr163PE2bx5c2RscKrphs8//3zevHnwmf79+2+88cZvv/02/PD7778///zz69Wr98svvyxYsACNuvbaaxctWgR3uuyyy/D3t99+84yDYUUUhn/iFzKM9BRbwV9mjXRFHhB2H1uYe/ToAee3Dxfq33TTTemuMdTjgMaNnRJXGrxcanbXXXcdeuihXAQl5iOP9vWtpebB38cff5zeg7WwFJEFvvLZZ59h0cSJE1kh0/85c+ZUWvfm0dIZ81Qxt4KhLTYE9zr22GN5XgUB8eKLL4bQIuNjZtetWzd6w6RJk/bdd9+XX34Z023btuUHc+JGfIxbHOLT3gLODLfhm+Aqc6/y8KJzZmwCE5MnT27WrBnf5g9nvv/++1lJ3IiPfcMiYLAuDvQ9+NJtt912+OGH099at2598803V1a9h/+PP/7AnkNHZecxB4Hxv//9L59lf+edd+iW8OS+fftCbqWkSCaKPffcc5weOXJkq1atNt988xNOOAHZJwr/+OOPGPPAXffaa68nnngCVXXv3p2joE8//XSPPfYYY17A2a5dO+yGXW18CGjc2CmxhBX+nnnmmT1zz1fASPwACEzCDzFhHMC3jfOtQ9JgTsBXtt9++wYNGlx00UXPPPMMH9y0xygEKyIvQwHPBDiMBoYOHYosD0Hzwgsv9MyrNA866KAPP/yQpw1RBt5wxRVXID6uvfba8kIGbIVfDYsb8TFucYhPe1fkzFnzGcRjjjkGPvy44dFHH507d25UzowhC5wZg28McRjLoNZdunTxVR4T4mPfsAgYrIvMGWecIa/vaNmy5fHHHw8vfeyxx/jFMAx84TPYcwyRPeN4WYOXG8LCXevWrQuve/755xGoWcbLKT3L4Le8vJwvv0TSCXdFtgp3Pfjggy+44AKUvPXWWzt06IABz4ABA+DYcNcrDdg0Bt/XXXfdMvPaRGjzEUccYe17jAho3NgpsZ3UoAF77733iBEjOB95+oYbbtikSZOmTZti/u677/7FF19MmDChZs2a3333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1133ww8/IAwNGjQIB7Nr165iWZSxw2jWwGkKav60FICi28eHjuFVFW9Ow1sQImHuuXPnws3OO+88HAFkctg6YjRi8YIFC2BiJFuNGzc++OCDWZuX03ipLUSc2jdyssVS4mwunxOPQmxp2LBhgwYNLr30Up4k69ix4/nnn8+YcPLJJ0My+/btS+ds3br1aaed9vvvv8MWQ4YM+e2335C0ISJh5zHT3sqjjz66zTbboPtDoV955ZXtt9++W7duWIRpFO7duzdSeRQbP378jjvuiMwei8aNG4dtQdSxXSzFzP/3//4f99ORU+Xjwgrh16gUwIUJiUQfOCVGJwjTXi7kIW3E9JdfftmyZUukmVDHCRMmcCmC+M4777ztttsOHDgQK7Zt2xZ7iHwTQRYhvn379v/3f/93ww03HH/88YinENejjz762muv3XvvvVEtgm+LFi023HBD9EOei77//vuxOoIvdwOr9O/fH1tBj0J/E3lArIeEoDvde++9M2bMwCrTpk3LteNPbPEIEaeR2p1xvZy4SqzZbbfdbrvtNk4vXrwYgw+0C4fxyCOPhBU8Y9yHHnro73//+3/+8x84AAbNW2yxBUbS+Mu1YPpddtllp512uuiiizxjlGbNmt18881NmzaFGzz77LMw+iabbAKLc9AM/8H8unXrohKYHvVDgNHkDz74wMu534ABA7AKJu666y54jpcLjhj3MCcT7XdkAqf2jZxiKjEnqHBwAOTQG2200fDhwzfffHO64u233478j4URVc4888xWrVp55lQ28rPHH38c+oq9ff/991kJ5vfo0QNZPh2gwnDqqacihni5ES228thjj2E+xhIYBNt2xBAZtSEoQbwROubPn0/XmjRpEobglc7OslSLCyuEX6NSABcmJPRsnihGxIQEIhXFoATp5NChQxFnt9pqK4xLJk6cCF2EfCJLfeeddzbbbDPMGTFiBPoS+sxLL71Uu3btJ598EuWhx+gnI0eORAzFbiMQv/nmmwhzkG0MsufMmVOnTp3LL78cQ6JOnTqxE6IMOiESW2THY8aMwQ54pqMib/3HP/7BriIXFDEsxkyOianEvr7koms5jdROjSvTCDo4hsifoJqVubMU+MXWMVDAkUe+xZKYgBtApBG5jj32WIS5/fbbb//998eiyZMnI7C++OKLcA/4wBNPPIHBSsac6IZ+t2nT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>

[image12]: <data:image/png;base64,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>