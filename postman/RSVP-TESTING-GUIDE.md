# RSVP API - Postman Testing Guide

Complete testing suite for Party-Time RSVP Public API endpoints (Phase 5.1.1).

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Collection Structure](#collection-structure)
- [Environment Variables](#environment-variables)
- [Test Coverage](#test-coverage)
- [Running Tests](#running-tests)
- [Expected Results](#expected-results)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This Postman collection provides comprehensive testing for the RSVP public API endpoints implemented in **Phase 5.1.1: Public RSVP Backend**.

### Features Tested
- ✅ Token validation (valid/invalid/expired)
- ✅ Event details retrieval
- ✅ RSVP submission (attending/not attending/maybe)
- ✅ Dietary restrictions and meal preferences
- ✅ Plus-one management
- ✅ Error handling and edge cases
- ✅ Rate limiting behavior

### API Endpoints Covered
- `GET /api/v1/rsvp/{token}/validate` - Validate RSVP token
- `GET /api/v1/rsvp/{token}/event-details` - Get event details
- `POST /api/v1/rsvp/{token}/respond` - Submit RSVP response
- `PATCH /api/v1/rsvp/{token}/preferences` - Update preferences
- `PATCH /api/v1/rsvp/{token}/plus-one` - Update plus-one

## 🛠️ Prerequisites

### Required Software
1. **Postman** (Desktop app or web version)
   - Download: https://www.postman.com/downloads/

2. **Running Backend Server**
   ```bash
   cd backend
   source .venv/bin/activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **PostgreSQL Database**
   - Ensure Docker PostgreSQL container is running
   ```bash
   docker ps | grep party-time-db
   ```

## 🚀 Quick Start

### Step 1: Create Test Data

Run the seed script to create test guests and tokens:

```bash
cd backend
source .venv/bin/activate
python scripts/seed_rsvp_test_data.py
```

**Expected Output:**
```
🚀 RSVP API Test Data Seeder
======================================================================
🧹 Clearing existing test data...
✅ Test data cleared

📝 Creating test data...
  → Creating test planner user...
  ✓ Planner created: rsvp-tester@party-time.com
  → Creating test event...
  ✓ Event created: RSVP Test Event - Birthday Party
  → Creating test guests...
    ✓ John Doe - Valid token for general testing
    ✓ Expired Token - Expired token for testing 410 error
    ✓ Will NotAttend - For testing 'not attending' response
    ✓ Maybe Coming - For testing 'maybe' response
    ✓ Plus One - For testing plus-one updates (attending status)
    ✓ Solo Guest - For testing plus-one not allowed error
  ✓ All guests created

======================================================================
🎉 Test Data Created Successfully!
======================================================================

🎫 RSVP Tokens for Postman Environment:
   Set these in your Postman environment variables:

   valid_token            = A3X7K9M2
   expired_token          = B4Y8L0N3
   not_attending_token    = C5Z9M1P4
   maybe_token            = D6A0N2Q5
   plus_one_token         = E7B1P3R6
   no_plus_one_token      = F8C2Q4S7
```

⚠️ **IMPORTANT**: Copy these tokens! You'll need them in Step 3.

### Step 2: Import into Postman

1. **Open Postman**
2. **Import Collection**
   - Click **Import** button (top left)
   - Select `postman/RSVP-API-Tests.postman_collection.json`
   - Click **Import**

3. **Import Environment**
   - Click **Import** again
   - Select `postman/RSVP-API-Local.postman_environment.json`
   - Click **Import**

### Step 3: Update Environment Variables

1. **Select Environment**
   - Click the environment dropdown (top right)
   - Select **"RSVP API - Local Development"**

2. **Edit Environment**
   - Click the eye icon next to environment name
   - Click **Edit**

3. **Update Token Variables**
   - Paste the tokens from Step 1 output:
     ```
     valid_token          → [paste A3X7K9M2]
     expired_token        → [paste B4Y8L0N3]
     not_attending_token  → [paste C5Z9M1P4]
     maybe_token          → [paste D6A0N2Q5]
     plus_one_token       → [paste E7B1P3R6]
     no_plus_one_token    → [paste F8C2Q4S7]
     ```

4. **Save** the environment

### Step 4: Run the Collection

**Option A: Run All Tests (Collection Runner)**
1. Click the collection name
2. Click **Run** button
3. Select **RSVP API - Local Development** environment
4. Click **Run RSVP API - Public Endpoints**
5. View results (should be 14/14 passing)

**Option B: Run Individual Requests**
1. Expand collection folders
2. Click any request
3. Click **Send**
4. View response and test results

## 📁 Collection Structure

```
RSVP API - Public Endpoints/
│
├── 1. Token Validation/
│   ├── Validate Valid Token
│   ├── Validate Invalid Token Format
│   └── Validate Non-Existent Token
│
├── 2. Event Details/
│   ├── Get Event Details
│   └── Get Event Details - Expired Token
│
├── 3. RSVP Submission/
│   ├── Submit RSVP - Attending
│   ├── Submit RSVP - Not Attending
│   ├── Submit RSVP - Maybe
│   ├── Submit RSVP - With Plus-One
│   └── Submit RSVP - Plus-One Not Allowed (Error)
│
├── 4. Update Preferences/
│   ├── Update Dietary Restrictions
│   └── Update Notes Only
│
└── 5. Update Plus-One/
    ├── Add Plus-One Name
    └── Remove Plus-One Name
```

## 🔧 Environment Variables

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://localhost:8000` | Backend API base URL |
| `api_version` | `/api/v1` | API version prefix |
| `valid_token` | *(from seed script)* | Valid RSVP token |
| `expired_token` | *(from seed script)* | Expired token for error testing |
| `not_attending_token` | *(from seed script)* | Token for 'not attending' test |
| `maybe_token` | *(from seed script)* | Token for 'maybe' test |
| `plus_one_token` | *(from seed script)* | Token with plus-one allowed |
| `no_plus_one_token` | *(from seed script)* | Token without plus-one |
| `guest_id` | *(auto-set)* | Guest ID from validation |
| `event_id` | *(auto-set)* | Event ID from validation |

## 🧪 Test Coverage

### Happy Path Tests (8 requests)
✅ Validate valid token
✅ Get event details
✅ Submit RSVP (attending)
✅ Submit RSVP (not attending)
✅ Submit RSVP (maybe)
✅ Update dietary restrictions
✅ Add plus-one name
✅ Remove plus-one name

### Error Scenario Tests (6 requests)
✅ Invalid token format
✅ Non-existent token
✅ Expired token (410 Gone)
✅ Plus-one not allowed (400 Bad Request)
✅ Update preferences
✅ Submit with plus-one

## ✅ Expected Results

### Successful Run (14/14 passing)

When you run the entire collection, you should see:

```
✓ Status code is 200 (14x)
✓ Token is valid
✓ Token is invalid (for error tests)
✓ Response has guest information
✓ Response has event information
✓ Submission successful
✓ RSVP status is attending/not_attending/maybe
✓ Update successful
✓ Plus-one name updated
✓ Response time is acceptable (14x)
✓ Response has proper headers (14x)
```

### Individual Test Results

**1. Validate Valid Token** ✅
- Status: 200 OK
- Response includes: `is_valid: true`, guest_name, event_name

**2. Get Event Details** ✅
- Status: 200 OK
- Response includes: guest object, event object, host_name

**3. Submit RSVP - Attending** ✅
- Status: 200 OK
- Response: `success: true`, confirmation message

**4. Expired Token** ✅
- Status: 410 Gone
- Error: "RSVP token has expired"

**5. Plus-One Not Allowed** ✅
- Status: 400 Bad Request
- Error: "Plus-one not allowed for this guest"

## 🐛 Troubleshooting

### Issue: "Connection refused" or "Network error"

**Solution**: Ensure backend server is running
```bash
# Terminal 1: Start backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Verify it's running
curl http://localhost:8000/health
```

### Issue: "Token not found" errors

**Solution**: Re-run the seed script
```bash
python backend/scripts/seed_rsvp_test_data.py
# Copy the new tokens and update Postman environment
```

### Issue: "Database connection error"

**Solution**: Ensure PostgreSQL is running
```bash
# Check Docker container
docker ps | grep party-time-db

# If not running, start it
docker-compose up -d postgres

# Test connection
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT version();"
```

### Issue: Tests failing with "is_valid: false"

**Solution**: Check that you've updated ALL token variables in environment
1. Go to environment settings
2. Verify all tokens are filled in (not empty strings)
3. Tokens should be 8 characters, uppercase alphanumeric (e.g., "A3X7K9M2")

### Issue: "410 Gone" for non-expired tokens

**Solution**: Check token expiration dates
```sql
-- Connect to database
psql -h localhost -U party_admin -d party_time

-- Check token expiration
SELECT first_name, last_name, rsvp_token, token_expires_at
FROM guests
WHERE email LIKE '%rsvp-test%'
ORDER BY token_expires_at;
```

If needed, update expiration:
```sql
UPDATE guests
SET token_expires_at = NOW() + INTERVAL '90 days'
WHERE email LIKE '%rsvp-test%' AND first_name != 'Expired';
```

### Issue: Rate limiting (429 errors)

**Solution**: Wait 60 seconds between test runs, or restart the backend server to reset rate limits.

## 📚 Additional Resources

### API Documentation
- Interactive API docs: http://localhost:8000/docs
- OpenAPI schema: http://localhost:8000/openapi.json

### Related Documentation
- Backend RSVP Implementation: `backend/app/api/v1/rsvp.py`
- RSVP Service: `backend/app/services/rsvp_service.py`
- Rate Limiting: `backend/app/middleware/rate_limit.py`
- Frontend Types: `frontend/src/types/rsvp.types.ts`

### Project Context
- **Phase**: 5.1.1 - Public RSVP Backend
- **Roadmap**: `documentation/new-roadmap.md`
- **Next Phase**: 5.1.2 - RSVP Frontend Portal

## 🎓 Tips for Manual Testing

### Testing Different Scenarios

**Test Attending with Dietary Restrictions:**
```json
{
    "rsvp_status": "attending",
    "dietary_restrictions": "Vegetarian, gluten-free",
    "meal_preference": "Fish",
    "notes": "Excited to attend!"
}
```

**Test Not Attending:**
```json
{
    "rsvp_status": "not_attending"
}
```

**Test Maybe:**
```json
{
    "rsvp_status": "maybe",
    "notes": "Will confirm by next week"
}
```

**Test Plus-One:**
```json
{
    "rsvp_status": "attending",
    "plus_one_name": "Jane Smith"
}
```

### Viewing Database Changes

After running tests, verify data was updated:

```bash
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time

# View RSVP responses
SELECT first_name, last_name, rsvp_status, dietary_restrictions, plus_one_name
FROM guests
WHERE email LIKE '%rsvp-test%';
```

## 🤝 Contributing

If you find issues or want to add more tests:

1. Update the collection JSON
2. Add test scenarios to the seed script
3. Update this README with new tests
4. Submit a PR with description of changes

## 📝 License

Part of the Party-Time event planning application.
Created for Phase 5.1.1: Public RSVP Backend Implementation.

---

**Need Help?** Check the troubleshooting section or review the backend implementation docs.

**Happy Testing!** 🎉
