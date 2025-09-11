# Next Steps Development Plan

## 📍 Current Status
**Week 2 of 13** - Authentication & User Management (60% complete)  
**Phase**: Complete authentication system and begin event management

---

## 🚀 Phase 1: Complete Authentication (2-3 days)

### Phase 1.1: Backend Registration & User Management
**Priority**: HIGH | **Status**: ✅ **COMPLETE** | **Duration**: 1 day

- [x] Create `/api/v1/auth/register` endpoint using boto3 Cognito client
- [x] Implement email verification flow endpoint
- [x] Add password reset endpoint (request and confirm)
- [x] Create user profile management endpoints (GET/UPDATE)
- [x] Add Pydantic schemas for request/response validation
- [x] Include proper error handling and logging
- [x] Test all endpoints with proper JWT authentication

**Key Files to Create/Modify:**
- `backend/app/api/v1/auth.py` - Add registration endpoints
- `backend/app/schemas/auth.py` - Request/response models
- `backend/app/services/cognito_service.py` - Add registration methods
- `backend/requirements.txt` - Add boto3 dependency

### Phase 1.2: Frontend-Backend Integration
**Priority**: HIGH | **Status**: 📋 PENDING | **Duration**: 1 day

- [x] Create API client utilities in `/frontend/src/lib/api.ts`
- [x] Update NextAuth to validate tokens with backend
- [x] Add axios interceptors for JWT token attachment
- [x] Implement protected route wrappers
- [x] Create API error handling utilities
- [x] Test API calls from frontend to backend

**Key Files to Create/Modify:**
- `frontend/src/lib/api.ts` - API client utilities
- `frontend/src/lib/auth.ts` - Auth utilities
- `frontend/src/hooks/useApi.ts` - Custom API hooks
- `frontend/package.json` - Add axios dependency

### Phase 1.3: Google OAuth Setup
**Priority**: HIGH | **Status**: 📋 PENDING | **Duration**: 0.5 day

- [x] Configure Google provider in AWS Cognito User Pool
- [x] Add Google provider to NextAuth configuration
- [x] Test OAuth flow end-to-end
- [x] Handle user data mapping from Google profile
- [x] Ensure Google users work with backend API

**Key Files to Modify:**
- `frontend/src/app/api/auth/[...nextauth]/route.ts`
- AWS Cognito configuration (via console)

### Phase 1.4: Testing & Error Handling
**Priority**: HIGH | **Status**: 📋 PENDING | **Duration**: 0.5 day

- [x] Test email/password registration and login
- [x] Test Google OAuth flow
- [x] Add proper error messages and loading states
- [x] Handle token refresh logic
- [x] Test protected routes and API calls
- [x] End-to-end authentication testing

---

## 📱 Phase 2: Event Management Foundation (3-4 days)

### Phase 2.1: Database Setup
**Priority**: MEDIUM | **Status**: ✅ **COMPLETE** | **Duration**: 1 day

- [x] Create event model in `/backend/app/models/event.py`
- [x] Add event-related tables (event_types, event_status)
- [x] Create Alembic migration for events schema
- [x] Add sample event data for testing
- [x] Update database initialization scripts

### Phase 2.2: Backend API Development
**Priority**: MEDIUM | **Status**: 📋 PENDING | **Duration**: 1.5 days

- [x] Create `/backend/app/api/v1/events.py` router
- [x] Implement event CRUD operations with proper validation
- [x] Add user-event relationship management
- [x] Create event filtering and search endpoints
- [x] Add event status management (draft/active/completed)
- [x] Include proper permissions and ownership checks

### Phase 2.3: Frontend Event Pages
**Priority**: MEDIUM | **Status**: 📋 PENDING | **Duration**: 1.5 days

- [ ] Build event creation form with React Hook Form
- [ ] Create event list/grid component
- [ ] Implement event detail page
- [ ] Add event management dashboard
- [ ] Implement event editing functionality
- [ ] Add event deletion with confirmation

---

## 👥 Phase 3: Guest Management System (Week 4)

### Phase 3.1: Guest Backend
**Priority**: LOW | **Status**: 📋 PENDING | **Duration**: 1.5 days

- [ ] Guest CRUD endpoints
- [ ] Unique RSVP token generation system
- [ ] Guest-event relationship management
- [ ] Guest data validation and security

### Phase 3.2: Guest Management UI
**Priority**: LOW | **Status**: 📋 PENDING | **Duration**: 1.5 days

- [ ] Create guest list table with inline editing
- [ ] Build add guest form with validation
- [ ] Implement guest search and filtering
- [ ] Guest management permissions

### Phase 3.3: CSV Import System
**Priority**: LOW | **Status**: 📋 PENDING | **Duration**: 1 day

- [ ] Simple CSV parser implementation
- [ ] Basic duplicate detection logic
- [ ] Error handling for import failures
- [ ] Import preview and confirmation

---

## 🎯 Critical Path & Dependencies

### Must Complete Before Moving Forward:
1. **Phase 1.1 & 1.2** (Backend + Frontend auth) - Everything depends on this
2. **Phase 1.3 & 1.4** (OAuth + Testing) - Needed for user onboarding
3. **Phase 2.1** (Database) - Required before any event functionality

### Can Work in Parallel:
- Frontend and Backend development within same phase
- Testing can happen alongside development
- Documentation can be updated continuously

---

## ⚡ Daily Development Approach

### Small Task Methodology:
- **Each checkbox = 2-4 hours of work maximum**
- **Complete one checkbox before moving to next**
- **Test immediately after each implementation**
- **Update this document with completion status**

### Focus Sequence:
1. ✅ **Today**: Complete Phase 1.1 (Backend Registration)
2. **Tomorrow**: Complete Phase 1.2 (Frontend Integration)
3. **Day 3**: Complete Phase 1.3 & 1.4 (OAuth + Testing)
4. **Day 4**: Begin Phase 2.1 (Event Database)

---

## 📊 Success Metrics

### End of Phase 1 (Authentication Complete):
- ✅ Users can register with email/password
- ✅ Users can login with Google OAuth
- ✅ Protected routes work correctly
- ✅ Frontend can call backend APIs with authentication
- ✅ Password reset functionality works

### End of Phase 2 (Event Management):
- ✅ Users can create, read, update, delete events
- ✅ Event dashboard shows user's events
- ✅ Event forms have proper validation
- ✅ Event status management works

### End of Phase 3 (Guest Management):
- ✅ Users can manage guest lists for events
- ✅ CSV import functionality works
- ✅ Guest search and filtering operational

---

## 🔄 Progress Tracking

**Last Updated**: September 6, 2025  
**Current Phase**: Phase 1.1 - Backend Registration & User Management  
**Next Milestone**: Complete authentication system (Phase 1 complete)

---

*This document will be updated after each completed task to track progress and maintain focus on the critical path.*