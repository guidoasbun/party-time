# Guest API Testing Checklist - Phase 4.1.1

## 🎯 Testing Objectives

Verify all Guest Management API endpoints are working correctly, including:
- CRUD operations
- Search and filtering
- Sorting and pagination
- Bulk operations
- RSVP management
- Guest statistics

---

## ✅ Pre-Test Setup

### Environment Setup
- [ ] PostgreSQL database is running (`docker ps | grep party-time-db`)
- [ ] Backend server is running on port 8000
- [ ] Can access API docs at `http://localhost:8000/docs`
- [ ] Postman collection imported successfully
- [ ] Test credentials are configured

### Test Data Preparation
- [ ] Valid user account exists for authentication
- [ ] At least one event exists for testing
- [ ] Sample guest data prepared

---

## 📋 Test Categories

### 1. Authentication & Setup ✅

- [ ] **TC-001**: Login with valid credentials
  - Expected: 200 OK, JWT token received
  - Verify: `auth_token` saved in collection variables

- [ ] **TC-002**: Create test event
  - Expected: 201 Created, event ID returned
  - Verify: `event_id` saved in collection variables

- [ ] **TC-003**: Verify unauthorized access fails
  - Remove auth token temporarily
  - Expected: 401 Unauthorized
  - Restore auth token

---

### 2. CRUD Operations ✅

#### Create Guest
- [ ] **TC-101**: Create guest with all fields
  - Expected: 201 Created
  - Verify: All fields match request
  - Verify: `rsvp_status` defaults to "pending"
  - Verify: `guest_id` saved automatically

- [ ] **TC-102**: Create guest with minimum required fields
  - Only email, first_name, last_name
  - Expected: 201 Created
  - Verify: Optional fields are null

- [ ] **TC-103**: Attempt to create duplicate guest (same email)
  - Expected: 400 Bad Request
  - Verify: Error message mentions duplicate

- [ ] **TC-104**: Create guest with invalid email
  - Expected: 422 Validation Error

#### Read Guests
- [ ] **TC-201**: Get all guests for event
  - Expected: 200 OK, array of guests
  - Verify: All created guests are present

- [ ] **TC-202**: Get single guest by ID
  - Expected: 200 OK
  - Verify: Correct guest returned

- [ ] **TC-203**: Get non-existent guest
  - Expected: 404 Not Found

- [ ] **TC-204**: Get guests from another user's event
  - Expected: 403 Forbidden or 404 Not Found

#### Update Guest
- [ ] **TC-301**: Update guest first name
  - Expected: 200 OK
  - Verify: Only first_name changed

- [ ] **TC-302**: Update multiple fields at once
  - Expected: 200 OK
  - Verify: All specified fields updated

- [ ] **TC-303**: Update with empty/null values
  - Expected: 200 OK or 422 (depending on field)

- [ ] **TC-304**: Update to duplicate email
  - Expected: 400 Bad Request

#### Delete Guest
- [ ] **TC-401**: Delete existing guest
  - Expected: 204 No Content
  - Verify: Guest no longer in list

- [ ] **TC-402**: Delete non-existent guest
  - Expected: 404 Not Found

- [ ] **TC-403**: Delete guest from another user's event
  - Expected: 403 Forbidden or 404 Not Found

---

### 3. Search & Filtering ✅

#### Search Functionality
- [ ] **TC-501**: Search by first name
  - Search: "John"
  - Expected: Returns guests with "John" in first_name

- [ ] **TC-502**: Search by last name
  - Expected: Returns matching guests

- [ ] **TC-503**: Search by email
  - Expected: Returns matching guests

- [ ] **TC-504**: Search by phone
  - Expected: Returns matching guests

- [ ] **TC-505**: Search with no results
  - Search: "nonexistent"
  - Expected: Empty array

- [ ] **TC-506**: Case-insensitive search
  - Search: "JOHN" vs "john"
  - Expected: Both return same results

#### Filter by RSVP Status
- [ ] **TC-601**: Filter by "pending"
  - Expected: Only pending guests

- [ ] **TC-602**: Filter by "attending"
  - Expected: Only attending guests

- [ ] **TC-603**: Filter by "not_attending"
  - Expected: Only not_attending guests

- [ ] **TC-604**: Filter by "maybe"
  - Expected: Only maybe guests

#### Filter by Dietary Restrictions
- [ ] **TC-701**: Filter has_dietary_restrictions=true
  - Expected: Only guests with dietary restrictions

- [ ] **TC-702**: Filter has_dietary_restrictions=false
  - Expected: Only guests without restrictions

#### Filter by Plus One
- [ ] **TC-801**: Filter plus_one_only=true
  - Expected: Only guests with plus_one_allowed=true

- [ ] **TC-802**: Filter plus_one_only=false
  - Expected: Only guests with plus_one_allowed=false

#### Combined Filters
- [ ] **TC-901**: Combine search + RSVP filter
  - Expected: Results match both criteria

- [ ] **TC-902**: Combine search + dietary filter
  - Expected: Results match both criteria

- [ ] **TC-903**: All filters combined
  - Expected: Correctly filtered results

---

### 4. Sorting & Pagination ✅

#### Sorting
- [ ] **TC-1001**: Sort by first_name ASC
  - Expected: Alphabetically ordered A→Z

- [ ] **TC-1002**: Sort by first_name DESC
  - Expected: Alphabetically ordered Z→A

- [ ] **TC-1003**: Sort by last_name ASC
  - Expected: Correct order

- [ ] **TC-1004**: Sort by email ASC
  - Expected: Correct order

- [ ] **TC-1005**: Sort by rsvp_status
  - Expected: Grouped by status

- [ ] **TC-1006**: Sort by created_at DESC
  - Expected: Newest first

- [ ] **TC-1007**: Sort by created_at ASC
  - Expected: Oldest first

#### Pagination
- [ ] **TC-1101**: Get first page (skip=0, limit=10)
  - Expected: Maximum 10 results

- [ ] **TC-1102**: Get second page (skip=10, limit=10)
  - Expected: Next 10 results

- [ ] **TC-1103**: Request limit exceeds maximum
  - limit=10000
  - Expected: Capped at 1000

- [ ] **TC-1104**: Negative skip value
  - Expected: 422 Validation Error

---

### 5. Bulk Operations ✅

#### Bulk Create
- [ ] **TC-1201**: Create 3 guests at once
  - Expected: 201 Created
  - Verify: All 3 guests created

- [ ] **TC-1202**: Bulk create with duplicate emails in batch
  - Expected: 400 Bad Request

- [ ] **TC-1203**: Bulk create empty array
  - Expected: 400 or 422

#### Bulk Update Status
- [ ] **TC-1301**: Update 3 guests to "attending"
  - Expected: 200 OK
  - Verify: `updated_count` = 3
  - Verify: All guests now "attending"

- [ ] **TC-1302**: Update with invalid status
  - Expected: 422 Validation Error

- [ ] **TC-1303**: Update non-existent guest IDs
  - Expected: 400 Bad Request

- [ ] **TC-1304**: Update guests from another event
  - Expected: 400 Bad Request

#### Bulk Delete
- [ ] **TC-1401**: Delete 2 guests at once
  - Expected: 200 OK
  - Verify: `deleted_count` = 2
  - Verify: Guests no longer exist

- [ ] **TC-1402**: Delete with non-existent IDs
  - Expected: 400 Bad Request

- [ ] **TC-1403**: Delete empty array
  - Expected: 400 or 422

---

### 6. Guest Statistics ✅

- [ ] **TC-1501**: Get guest stats with no guests
  - Expected: All counts = 0

- [ ] **TC-1502**: Get stats with mixed RSVP statuses
  - Expected: Correct breakdown
  - Verify: total_invited = sum of all statuses
  - Verify: response_rate calculated correctly

- [ ] **TC-1503**: Get stats with plus ones
  - Expected: total_attending_with_plus_ones > attending

- [ ] **TC-1504**: Get dietary restrictions list
  - Expected: Only guests with restrictions
  - Verify: All have non-null dietary_restrictions

---

### 7. RSVP Management ✅

#### Admin Endpoints
- [ ] **TC-1601**: Get RSVP token for guest
  - Expected: 200 OK
  - Verify: Token is a long hex string

- [ ] **TC-1602**: Mark invitation as sent
  - Expected: 200 OK
  - Verify: `invitation_sent_at` is not null

#### Public Endpoints (No Auth)
- [ ] **TC-1701**: Get guest by RSVP token (valid)
  - **NO AUTH REQUIRED**
  - Expected: 200 OK
  - Verify: Guest data returned

- [ ] **TC-1702**: Get guest by invalid token
  - Expected: 404 Not Found

- [ ] **TC-1703**: Submit RSVP - Attending
  - **NO AUTH REQUIRED**
  - Status: "attending"
  - Expected: 200 OK
  - Verify: `rsvp_responded_at` updated

- [ ] **TC-1704**: Submit RSVP - Not Attending
  - Expected: 200 OK
  - Verify: Status updated

- [ ] **TC-1705**: Submit RSVP with plus one name
  - Status: "attending"
  - Plus one: "Jane Doe"
  - Expected: 200 OK
  - Verify: plus_one_name saved

- [ ] **TC-1706**: Submit RSVP with dietary restrictions
  - Expected: 200 OK
  - Verify: dietary_restrictions updated

---

## 🧪 Performance Tests

- [ ] **PERF-001**: Create 100 guests in bulk
  - Expected: < 5 seconds

- [ ] **PERF-002**: Search across 500+ guests
  - Expected: < 1 second

- [ ] **PERF-003**: Sort 1000+ guests
  - Expected: < 2 seconds

- [ ] **PERF-004**: Bulk update 100 guests
  - Expected: < 3 seconds

---

## 🔒 Security Tests

- [ ] **SEC-001**: Access without authentication
  - Remove auth header
  - Expected: 401 Unauthorized

- [ ] **SEC-002**: Access with expired token
  - Use old token
  - Expected: 401 Unauthorized

- [ ] **SEC-003**: Access another user's guests
  - Expected: 403 Forbidden

- [ ] **SEC-004**: SQL injection in search
  - Try: `search='; DROP TABLE guests; --`
  - Expected: Safely handled, no SQL executed

- [ ] **SEC-005**: XSS in guest fields
  - Try: `<script>alert('XSS')</script>`
  - Expected: Sanitized or escaped

---

## 📊 Test Results Summary

### Total Tests: ____ / 90+
- ✅ Passed: ____
- ❌ Failed: ____
- ⚠️  Skipped: ____

### Pass Rate: ____%

### Critical Issues: ____
### Minor Issues: ____

### Test Duration: ____ minutes

---

## 🐛 Issues Found

| Test ID | Description | Severity | Status |
|---------|-------------|----------|--------|
| TC-XXX  | Issue description | High/Med/Low | Open/Fixed |
|         |             |          |        |

---

## 📝 Notes

### Observations
-
-
-

### Recommendations
-
-
-

### Test Environment
- Date: ____
- Tester: ____
- Backend Version: ____
- Database: PostgreSQL (version: ____)
- OS: ____

---

## ✅ Sign-Off

### Tested By
- Name: ________________
- Date: ________________
- Signature: ________________

### Reviewed By
- Name: ________________
- Date: ________________
- Signature: ________________

### Approved for Production
- [ ] Yes
- [ ] No (see issues above)
- Name: ________________
- Date: ________________

---

## 🎉 Completion

**All tests passed! Guest API is ready for:**
- [ ] Development deployment
- [ ] Staging deployment
- [ ] Production deployment

**Next Steps:**
1. Review any failed tests
2. Fix identified issues
3. Re-run failed tests
4. Document findings
5. Get approval for deployment
