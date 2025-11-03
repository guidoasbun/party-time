# Seating Chart API Testing Guide

Comprehensive testing guide for Party-Time Seating Chart API endpoints.

**Phase 6.1.2: Seating Chart API Endpoints**
**Last Updated:** November 3, 2025
**Collection Version:** 1.0

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Setup](#environment-setup)
5. [Test Scenarios](#test-scenarios)
6. [API Endpoint Reference](#api-endpoint-reference)
7. [Expected Responses](#expected-responses)
8. [Auto-Assignment Strategies](#auto-assignment-strategies)
9. [Test Execution Order](#test-execution-order)
10. [Troubleshooting](#troubleshooting)

---

## Quick Start

**For the impatient:** Get up and running in 5 steps!

1. **Start backend server:**
   ```bash
   cd backend
   source .venv/bin/activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Import collection and environment into Postman:**
   - Drag and drop `Seating-Chart-API-Tests.postman_collection.json` into Postman
   - Drag and drop `Seating-Chart-Local.postman_environment.json` into Postman

3. **Configure environment variables:**
   - Select "Seating Chart - Local" environment in Postman
   - Set `event_id` to a valid UUID from your database
   - **Note:** Guest IDs are now auto-populated from the API (no manual setup required!)

4. **Authenticate:**
   - Run "1. Setup & Authentication" → "Login - Get Access Token"
   - Token automatically saved to collection variables

5. **Run tests:**
   - Use "Run collection" to execute all 23 requests sequentially
   - The "Get Guests - Auto-populate IDs" request automatically fetches and saves guest IDs
   - Or run individual folders/requests as needed

---

## Prerequisites

### Required Services

- ✅ **Docker Desktop** - Must be running
- ✅ **PostgreSQL** - Docker container running on port 5432
- ✅ **Backend API** - FastAPI server on http://localhost:8000
- ✅ **Test Data** - At least 1 event and 5 guests in database

### Check Services Status

```bash
# Check Docker containers
docker ps | grep party-time

# Expected output:
# party-time-db    postgres:16-alpine   Up X minutes   0.0.0.0:5432->5432/tcp
# party-time-redis redis:7-alpine      Up X minutes   0.0.0.0:6379->6379/tcp

# Test backend health
curl http://localhost:8000/health

# Expected output:
# {"status":"healthy"}
```

### Test Data Requirements

You need:
- **1 Event** - Any event type (Wedding, Birthday, Corporate, etc.)
- **5+ Guests** - Guests assigned to that event (for auto-assign tests)
- **User Account** - With email/password for authentication

**Get test data UUIDs:**

```bash
# Get your event ID
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT id, name FROM events LIMIT 5;"
```

**Note:** Guest IDs are automatically fetched by the "Get Guests - Auto-populate IDs" request, so you don't need to manually set them!

---

## Installation

### Option 1: Drag and Drop (Easiest)

1. Open Postman
2. Drag `Seating-Chart-API-Tests.postman_collection.json` into Postman window
3. Drag `Seating-Chart-Local.postman_environment.json` into Postman window
4. Done!

### Option 2: Import via UI

1. Open Postman
2. Click "Import" button (top left)
3. Click "Upload Files"
4. Select both files:
   - `Seating-Chart-API-Tests.postman_collection.json`
   - `Seating-Chart-Local.postman_environment.json`
5. Click "Import"

### Option 3: Command Line (Postman CLI)

```bash
# Import collection
postman collection import Seating-Chart-API-Tests.postman_collection.json

# Import environment
postman environment import Seating-Chart-Local.postman_environment.json
```

---

## Environment Setup

### Environment Variables Explained

The "Seating Chart - Local" environment includes these variables:

| Variable | Default Value | Description | Required |
|----------|--------------|-------------|----------|
| `base_url` | http://localhost:8000 | Backend API base URL | ✅ Yes |
| `api_version` | api/v1 | API version path segment | ✅ Yes |
| `test_email` | test@example.com | Login email (update to match your user) | ✅ Yes |
| `test_password` | password123 | Login password (update to match your user) | ✅ Yes |
| `event_id` | REPLACE_WITH_YOUR_EVENT_ID | UUID of test event | ✅ Yes |
| `guest_id` | REPLACE_WITH_YOUR_GUEST_ID | UUID of first guest | 🤖 Auto-populated |
| `guest_id_2` | REPLACE_WITH_GUEST_ID_2 | UUID of second guest | 🤖 Auto-populated |
| `guest_id_3` | REPLACE_WITH_GUEST_ID_3 | UUID of third guest | 🤖 Auto-populated |
| `guest_id_4` | REPLACE_WITH_GUEST_ID_4 | UUID of fourth guest | 🤖 Auto-populated |
| `guest_id_5` | REPLACE_WITH_GUEST_ID_5 | UUID of fifth guest | 🤖 Auto-populated |

**🤖 Auto-populated Variables:** The "Get Guests - Auto-populate IDs" request automatically fetches the first 5 guests from your event and populates these variables. No manual setup required!

### Auto-Saved Variables (Set During Execution)

These are automatically populated by test scripts:

| Variable | Set By Request | Description |
|----------|----------------|-------------|
| `access_token` | Login - Get Access Token | JWT bearer token |
| `user_id` | Login - Get Access Token | Logged-in user UUID |
| `event_id` | Get Event - Verify Exists | Confirmed event UUID |
| `guest_id` | Get Guests - Auto-populate IDs | First guest UUID |
| `guest_id_2` to `guest_id_5` | Get Guests - Auto-populate IDs | Additional guest UUIDs |
| `chart_id` | Create Seating Chart | Created chart UUID |
| `table_id` | Create Table - Round Table 1 | First table UUID |
| `table_id_2` to `table_id_6` | Bulk Create Tables | Additional table UUIDs |
| `seat_id` | Assign Guest to Seat | Seat assignment UUID |

### How to Update Environment Variables

1. Click on "Environments" in Postman sidebar
2. Select "Seating Chart - Local"
3. Update the "CURRENT VALUE" column for each variable
4. Click "Save" (Ctrl+S / Cmd+S)

**Pro Tip:** You can also update variables directly in the environment dropdown at top right of Postman.

---

## Test Scenarios

Execute these scenarios in order to test all seating chart functionality:

### Scenario 1: Complete Happy Path Flow

**Goal:** Create seating chart, add tables, assign seats, get statistics, cleanup

**Steps:**
1. Run "1. Setup & Authentication" folder (3 requests)
2. Run "2. Seating Chart CRUD" → "Create Seating Chart"
3. Run "3. Table Management" → "Create Table - Round Table 1"
4. Run "3. Table Management" → "Bulk Create Tables" (adds 5 more tables)
5. Run "4. Seat Assignments" → "Assign Guest to Seat"
6. Run "5. Advanced Operations" → "Get Seating Statistics"
7. Run "6. Cleanup" → "Delete Seating Chart"

**Expected Result:** All requests return 200/201 status codes, chart deleted successfully.

---

### Scenario 2: Table Management Operations

**Goal:** Test all table CRUD operations

**Steps:**
1. Create seating chart (if not exists)
2. Create single table
3. Create 5 tables via bulk endpoint
4. Get table with seats (should be empty initially)
5. Update table position (simulate drag on canvas)
6. Verify updated position in GET response

**Expected Result:** 6 tables total (1 + 5 bulk), positions update correctly.

---

### Scenario 3: Seat Assignment Flow

**Goal:** Assign, update, and remove seat assignments

**Steps:**
1. Ensure table exists with capacity
2. Assign guest to seat #1
3. Update seat assignment notes
4. Get table to verify assignment
5. Delete seat assignment (unassign guest)
6. Get table to verify seat is empty

**Expected Result:** Seat assignments create/update/delete successfully, table reflects changes.

---

### Scenario 4: Auto-Assignment - Fill Tables Strategy

**Goal:** Test sequential table filling

**Steps:**
1. Create seating chart with multiple tables (different capacities)
2. Run auto-assign with `fill_tables` strategy and 3 guests
3. Inspect assignment results
4. Verify guests assigned to **same table** sequentially (seat 1, 2, 3)

**Expected Result:** Guests fill Table 1 seats 1-3 before moving to Table 2.

---

### Scenario 5: Auto-Assignment - Distribute Strategy

**Goal:** Test even distribution across tables

**Steps:**
1. Create seating chart with multiple tables
2. Run auto-assign with `distribute` strategy and 5 guests
3. Inspect assignment results
4. Verify guests **spread across multiple tables** (round-robin)

**Expected Result:** Each table gets 1-2 guests, distributed evenly.

---

### Scenario 6: Capacity Validation

**Goal:** Verify capacity limits are enforced

**Steps:**
1. Create table with capacity = 8
2. Attempt to assign guest to seat #99 (exceeds capacity)
3. Verify error response (400 Bad Request)
4. Check error message mentions capacity

**Expected Result:** Request fails with 400 status, error indicates capacity exceeded.

---

### Scenario 7: Error Handling

**Goal:** Test error scenarios

**Steps:**
1. Try to create duplicate seating chart (should fail with 400)
2. Try to create table with negative dimensions (should fail with 400/422)
3. Try to assign guest to non-existent table (should fail with 404)
4. Try to access another user's chart (should fail with 404)

**Expected Result:** All error scenarios return appropriate HTTP status codes and error messages.

---

### Scenario 8: Statistics and Analytics

**Goal:** Verify seating statistics accuracy

**Steps:**
1. Create seating chart
2. Add 6 tables (50 total capacity)
3. Assign 20 guests across tables
4. Get seating statistics
5. Verify calculations:
   - `total_capacity` = 50
   - `total_assigned` = 20
   - `assignment_percentage` = 40%
   - `total_unassigned` = 30
   - `table_stats` array has 6 items

**Expected Result:** All statistics match actual table/seat data.

---

## API Endpoint Reference

Complete reference of all 14 seating chart endpoints:

### Seating Charts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/events/{event_id}/seating` | Create seating chart | ✅ Yes |
| GET | `/api/v1/events/{event_id}/seating` | Get chart with tables | ✅ Yes |
| PUT | `/api/v1/events/{event_id}/seating/{chart_id}` | Update chart metadata | ✅ Yes |
| DELETE | `/api/v1/events/{event_id}/seating/{chart_id}` | Delete chart (cascade) | ✅ Yes |

### Table Layouts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/events/{event_id}/seating/{chart_id}/tables` | Create table | ✅ Yes |
| POST | `/api/v1/events/{event_id}/seating/{chart_id}/tables/bulk` | Bulk create tables | ✅ Yes |
| GET | `/api/v1/events/{event_id}/seating/{chart_id}/tables/{table_id}` | Get table with seats | ✅ Yes |
| PUT | `/api/v1/events/{event_id}/seating/{chart_id}/tables/{table_id}` | Update table | ✅ Yes |
| DELETE | `/api/v1/events/{event_id}/seating/{chart_id}/tables/{table_id}` | Delete table (cascade) | ✅ Yes |

### Seat Assignments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/events/{event_id}/seating/{chart_id}/tables/{table_id}/seats` | Assign guest to seat | ✅ Yes |
| PUT | `/api/v1/events/{event_id}/seating/{chart_id}/seats/{seat_id}` | Update seat assignment | ✅ Yes |
| DELETE | `/api/v1/events/{event_id}/seating/{chart_id}/seats/{seat_id}` | Remove guest from seat | ✅ Yes |

### Advanced Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/events/{event_id}/seating/{chart_id}/auto-assign` | Auto-assign guests | ✅ Yes |
| GET | `/api/v1/events/{event_id}/seating/{chart_id}/statistics` | Get seating statistics | ✅ Yes |

---

## Expected Responses

### Create Seating Chart (201 Created)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "event_id": "8e9f3d2a-1234-5678-9abc-def012345678",
  "name": "Reception Layout v1",
  "venue_width": "100.00",
  "venue_height": "80.00",
  "venue_unit": "feet",
  "background_image_url": null,
  "version": 1,
  "is_active": true,
  "chart_metadata": null,
  "created_at": "2025-11-03T19:30:00Z",
  "updated_at": "2025-11-03T19:30:00Z"
}
```

### Get Seating Chart with Tables (200 OK)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "event_id": "8e9f3d2a-1234-5678-9abc-def012345678",
  "name": "Reception Layout v1",
  "venue_width": "100.00",
  "venue_height": "80.00",
  "venue_unit": "feet",
  "version": 1,
  "is_active": true,
  "tables": [
    {
      "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
      "table_number": "Table 1",
      "table_type": "round",
      "x_position": "10.00",
      "y_position": "10.00",
      "width": "8.00",
      "height": "8.00",
      "rotation": "0.00",
      "capacity": 8,
      "created_at": "2025-11-03T19:31:00Z"
    }
  ],
  "total_tables": 6,
  "total_capacity": 50,
  "total_assigned": 15
}
```

### Create Table (201 Created)

```json
{
  "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
  "seating_chart_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "table_number": "Table 1",
  "table_type": "round",
  "x_position": "10.00",
  "y_position": "10.00",
  "width": "8.00",
  "height": "8.00",
  "rotation": "0.00",
  "capacity": 8,
  "table_metadata": null,
  "created_at": "2025-11-03T19:31:00Z",
  "updated_at": "2025-11-03T19:31:00Z"
}
```

### Bulk Create Tables (201 Created)

```json
[
  {
    "id": "table-uuid-1",
    "table_number": "Table 2",
    "table_type": "round",
    "capacity": 8,
    // ... other fields
  },
  {
    "id": "table-uuid-2",
    "table_number": "Table 3",
    "table_type": "rectangular",
    "capacity": 10,
    // ... other fields
  }
  // ... 3 more tables
]
```

### Get Table with Seats (200 OK)

```json
{
  "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
  "table_number": "Table 1",
  "table_type": "round",
  "capacity": 8,
  "seat_assignments": [
    {
      "id": "seat-uuid-1",
      "table_layout_id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
      "guest_id": "guest-uuid-1",
      "seat_number": 1,
      "notes": "VIP guest",
      "created_at": "2025-11-03T19:32:00Z"
    }
  ],
  "assigned_count": 1,
  "empty_seats": 7
}
```

### Auto-Assign Guests (200 OK)

```json
{
  "seating_chart_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "strategy": "fill_tables",
  "total_guests": 5,
  "already_assigned": 0,
  "newly_assigned": 5,
  "total_capacity": 50,
  "remaining_capacity": 45,
  "assignments": [
    {
      "guest_id": "guest-uuid-1",
      "guest_name": "John Doe",
      "table_id": "table-uuid-1",
      "table_number": "Table 1",
      "seat_number": 1
    },
    {
      "guest_id": "guest-uuid-2",
      "guest_name": "Jane Smith",
      "table_id": "table-uuid-1",
      "table_number": "Table 1",
      "seat_number": 2
    }
    // ... 3 more assignments
  ]
}
```

### Get Seating Statistics (200 OK)

```json
{
  "seating_chart_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "total_tables": 6,
  "total_capacity": 50,
  "total_assigned": 20,
  "total_unassigned": 30,
  "assignment_percentage": 40.0,
  "tables_by_type": {
    "round": 4,
    "rectangular": 2,
    "square": 0
  },
  "average_table_size": 8.3,
  "table_stats": [
    {
      "table_id": "table-uuid-1",
      "table_number": "Table 1",
      "table_type": "round",
      "capacity": 8,
      "assigned": 5,
      "available": 3,
      "fill_percentage": 62.5
    }
    // ... 5 more tables
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "detail": "Seating chart already exists for this event. Use PUT to update."
}
```

### Error Response (404 Not Found)

```json
{
  "detail": "Event not found or access denied"
}
```

---

## Auto-Assignment Strategies

### Fill Tables Strategy

**How it works:**
1. Sort tables by table number (alphabetically)
2. Fill Table 1 completely before moving to Table 2
3. Continue until all guests assigned or capacity reached

**Use case:** Minimize number of tables used, keep groups together

**Example with 15 guests and 3 tables (capacity 8 each):**
- Table 1: 8 guests (full)
- Table 2: 7 guests (partial)
- Table 3: 0 guests (empty)

**Request:**
```json
{
  "seating_chart_id": "{{chart_id}}",
  "guest_ids": ["guest-1", "guest-2", ..., "guest-15"],
  "strategy": "fill_tables"
}
```

---

### Distribute Strategy

**How it works:**
1. Sort tables by table number
2. Assign guests in round-robin fashion (one per table)
3. Loop through tables until all guests assigned

**Use case:** Spread guests evenly, maximize mingling, balance table sizes

**Example with 15 guests and 3 tables (capacity 8 each):**
- Table 1: 5 guests
- Table 2: 5 guests
- Table 3: 5 guests

**Request:**
```json
{
  "seating_chart_id": "{{chart_id}}",
  "guest_ids": ["guest-1", "guest-2", ..., "guest-15"],
  "strategy": "distribute"
}
```

---

### Comparison

| Aspect | Fill Tables | Distribute |
|--------|-------------|------------|
| **Table Usage** | Minimizes tables used | Uses all tables evenly |
| **Guest Groups** | Keeps groups together | Spreads guests out |
| **Table Balance** | Uneven (some full, some empty) | Balanced (all similar size) |
| **Best For** | Family seating, VIP sections | Networking events, mixers |
| **Empty Tables** | More likely | Less likely |

**Pro Tip:** Use `distribute` for most events to ensure balanced table sizes. Use `fill_tables` when you want to minimize staff or resources.

---

## Test Execution Order

### Sequential Execution (Recommended)

Run folders in this order to ensure dependencies are met:

1. **Setup & Authentication** - Get access token
2. **Seating Chart CRUD** - Create chart
3. **Table Management** - Add tables
4. **Seat Assignments** - Assign guests
5. **Advanced Operations** - Test auto-assign and stats
6. **Cleanup** - Delete test data

**Why sequential?** Each folder builds on the previous:
- Chart ID needed for table creation
- Table ID needed for seat assignments
- Seat assignments needed for statistics

### Parallel Execution (Advanced)

You can run some requests in parallel if:
- You manually set all IDs (chart_id, table_id, etc.)
- You skip auto-save variables
- You create separate test charts for each scenario

**Example parallel scenarios:**
- Create multiple tables simultaneously (different table numbers)
- Assign multiple guests to different tables at once
- Get statistics from multiple charts in parallel

---

## Troubleshooting

### Issue: "401 Unauthorized" on all requests

**Cause:** Missing or expired access token

**Solution:**
1. Run "1. Setup & Authentication" → "Login - Get Access Token"
2. Verify `access_token` is set in collection variables
3. Check that collection-level auth is set to "Bearer Token"
4. Ensure environment is selected (top right dropdown)

---

### Issue: "404 Event not found or access denied"

**Cause:** Invalid event_id or wrong user

**Solutions:**
1. Verify `event_id` in environment matches an existing event
2. Ensure logged-in user owns the event (planner_id = user_id)
3. Get valid event ID:
   ```bash
   psql -h localhost -U party_admin -d party_time -c "SELECT id, name, planner_id FROM events;"
   ```

---

### Issue: "400 Seating chart already exists for this event"

**Cause:** Trying to create second chart for same event

**Solutions:**
1. **Delete existing chart first:**
   - Run "6. Cleanup" → "Delete Seating Chart"
   - Or use DELETE endpoint manually
2. **Use different event_id** in environment
3. **Update existing chart** instead of creating new one

---

### Issue: "Cannot read property 'id' of undefined" in test script

**Cause:** Previous request failed, variable not set

**Solutions:**
1. Run requests **in order** (dependencies)
2. Check previous request succeeded (200/201 status)
3. Verify response body has expected fields
4. Manually set missing variables in environment

---

### Issue: Auto-assign returns "No recipients match the selected criteria"

**Cause:** Guest IDs don't exist or already assigned

**Solutions:**
1. Verify guest IDs exist and belong to the event:
   ```bash
   psql -h localhost -U party_admin -d party_time -c "SELECT id, first_name, last_name FROM guests WHERE event_id = 'YOUR_EVENT_ID';"
   ```
2. Check guests aren't already assigned to seats
3. Ensure guest IDs in request body match environment variables

---

### Issue: "Validation error" on table creation

**Cause:** Invalid field values (negative numbers, zero capacity)

**Solutions:**
1. Ensure all dimensions are **positive numbers**
2. Capacity must be **at least 1**
3. Rotation between **0-360 degrees**
4. Check request body matches schema exactly

---

### Issue: Statistics show zero assigned but seats exist

**Cause:** Seats created without guest_id (empty seats)

**Solution:**
- Statistics only count seats with `guest_id` not null
- Assign guests to seats using seat assignment endpoint
- Or delete empty seat records

---

### Issue: Backend not responding (connection refused)

**Cause:** Backend server not running

**Solution:**
```bash
# Start backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Verify it's running
curl http://localhost:8000/health
```

---

### Issue: PostgreSQL connection error

**Cause:** Docker container not running

**Solution:**
```bash
# Check Docker containers
docker ps | grep party-time

# If not running, start Docker Desktop
open -a Docker

# Wait 10 seconds, then start containers
docker-compose up -d postgres redis
```

---

### Issue: "Rate limit exceeded" errors

**Cause:** Too many requests in short time

**Solutions:**
1. Wait 60 seconds before retrying
2. Run collection with **delay between requests** (Postman settings)
3. Check rate limit headers in response:
   ```
   X-RateLimit-Limit: 100
   X-RateLimit-Remaining: 0
   X-RateLimit-Reset: 1699027200
   ```

---

## Additional Resources

- **API Documentation:** http://localhost:8000/docs (Swagger UI)
- **Backend Repository:** `/Users/rodrigo/code/party-time/backend`
- **Postman Documentation:** https://learning.postman.com/docs/
- **FastAPI Docs:** https://fastapi.tiangolo.com/

---

## Support

For issues or questions:
1. Check this guide first
2. Review API documentation at `/docs`
3. Check backend logs for error details
4. Review collection test scripts for debugging

---

**Happy Testing! 🎉**

*This guide is part of Phase 6.1.2: Seating Chart API Endpoints implementation.*
