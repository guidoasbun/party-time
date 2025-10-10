# CSV Import - Database Verification Guide

## Quick Database Check

After running a CSV import in Postman, use these methods to verify guests were actually saved to the database.

---

## Method 1: PostgreSQL Direct Query (Recommended)

### Connect to Database

```bash
# Set password environment variable
export PGPASSWORD=party_secure_2024

# Connect to database
psql -h localhost -U party_admin -d party_time
```

### Check Guest Count for Event

```sql
-- Replace 'YOUR_EVENT_ID' with actual event UUID
SELECT COUNT(*) as guest_count
FROM guests
WHERE event_id = 'YOUR_EVENT_ID';
```

### View All Guests for Event

```sql
-- Replace 'YOUR_EVENT_ID' with actual event UUID
SELECT
    id,
    email,
    first_name,
    last_name,
    rsvp_status,
    plus_one_allowed,
    created_at
FROM guests
WHERE event_id = 'YOUR_EVENT_ID'
ORDER BY created_at DESC
LIMIT 20;
```

### Check Most Recent Imports

```sql
-- View last 10 guests created (any event)
SELECT
    id,
    event_id,
    email,
    first_name || ' ' || last_name as full_name,
    created_at
FROM guests
ORDER BY created_at DESC
LIMIT 10;
```

### Check Guests Created in Last 5 Minutes

```sql
SELECT
    COUNT(*) as recent_guest_count,
    event_id
FROM guests
WHERE created_at > NOW() - INTERVAL '5 minutes'
GROUP BY event_id;
```

---

## Method 2: Backend API Verification

### Step 1: Get Your Event ID

From Postman collection variables or create event first:

```
GET http://localhost:8000/api/v1/events
Authorization: Bearer {{auth_token}}
```

### Step 2: Query Guests for Event

```
GET http://localhost:8000/api/v1/events/{{event_id}}/guests?limit=100
Authorization: Bearer {{auth_token}}
```

**Expected Response** (if guests exist):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "event_id": "660e8400-e29b-41d4-a716-446655440001",
    "email": "sarah.williams@example.com",
    "first_name": "Sarah",
    "last_name": "Williams",
    "phone": "+1-555-101-2345",
    "plus_one_allowed": true,
    "rsvp_status": "pending",
    "created_at": "2025-01-10T12:34:56.789Z"
  }
]
```

### Step 3: Check Guest Statistics

```
GET http://localhost:8000/api/v1/events/{{event_id}}/guests/stats
Authorization: Bearer {{auth_token}}
```

**Expected Response**:
```json
{
  "event_id": "660e8400-e29b-41d4-a716-446655440001",
  "total_invited": 20,
  "rsvp_responses": {
    "attending": 0,
    "not_attending": 0,
    "maybe": 0,
    "pending": 20
  },
  "total_attending_with_plus_ones": 0,
  "response_rate": 0.0
}
```

---

## Method 3: Check Backend Logs

The backend now includes detailed logging for CSV imports. Look for these log messages:

### Successful Import Logs

```
[API] Starting CSV import for event 660e8400-e29b-41d4-a716-446655440001
[CSV Import] Attempting to create 20 guests for event 660e8400-e29b-41d4-a716-446655440001
[CRUD] create_guests_bulk called with 20 guests for event 660e8400-e29b-41d4-a716-446655440001
[CRUD] Creating guest 1/20: sarah.williams@example.com
[CRUD] Creating guest 2/20: michael.chen@example.com
...
[CRUD] Adding 20 guests to session
[CRUD] Flushing session to database
[CRUD] Refreshing guests to get generated IDs and tokens
[CRUD] Guest 1 refreshed: ID=550e8400-e29b-41d4-a716-446655440000, RSVP Token=ABC123DEF456
...
[CRUD] create_guests_bulk completed successfully, returning 20 guests
[CSV Import] Successfully created 20 guest objects
[CSV Import] Database commit successful
[CSV Import] Created guest IDs: ['550e8400-e29b-41d4-a716-446655440000', ...]
[API] Import completed: 20 created, 0 errors, 0 skipped
```

### Error Logs (If Import Fails)

```
[CSV Import ERROR] Exception during bulk creation: IntegrityError: duplicate key value violates unique constraint
[CSV Import ERROR] Traceback: ...
[API ERROR] CSV import failed: ...
```

---

## Method 4: Postman Response Analysis

### Check the Import Execute Response

When you run **"2. CSV Import - Execute"** in Postman, examine the response JSON:

#### Successful Import Response

```json
{
  "success_count": 20,
  "error_count": 0,
  "skipped_count": 0,
  "created_guest_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001",
    "770e8400-e29b-41d4-a716-446655440002"
  ],
  "errors": []
}
```

**Key Indicators**:
- ✅ `success_count > 0` - Guests were created
- ✅ `created_guest_ids` is a non-empty array with UUIDs
- ✅ `errors` is an empty array

#### Failed Import Response

```json
{
  "success_count": 0,
  "error_count": 5,
  "skipped_count": 0,
  "created_guest_ids": [],
  "errors": [
    "Row 2: Email is required",
    "Row 3: Invalid email format 'invalid-email'",
    "Database error during bulk creation: IntegrityError: ..."
  ]
}
```

**Key Indicators**:
- ❌ `success_count = 0` - No guests created
- ❌ `created_guest_ids` is an empty array
- ❌ `errors` contains error messages

---

## Troubleshooting Common Issues

### Issue 1: Response Shows success_count=0

**Problem**: Import endpoint returns 200 OK but `success_count: 0`

**Diagnosis**:
1. Check the `errors` array in response for error messages
2. Check backend logs for exception details
3. Verify CSV file has valid data (email, first_name, last_name required)

**Solutions**:
- Fix validation errors in CSV file
- Ensure no duplicate emails in CSV or database
- Check database connectivity

### Issue 2: Guests Not Appearing in Database

**Problem**: Response shows `success_count > 0` but database query returns no guests

**Diagnosis**:
```sql
-- Check if transaction was committed
SELECT COUNT(*) FROM guests WHERE created_at > NOW() - INTERVAL '1 hour';

-- Check for guests with different event_id
SELECT event_id, COUNT(*) FROM guests GROUP BY event_id;
```

**Possible Causes**:
- Wrong event_id being queried
- Database connection issue
- Transaction not committed

**Solutions**:
1. Verify event_id matches between import and query
2. Check backend logs for commit confirmation
3. Restart backend server if necessary

### Issue 3: Duplicate Email Errors

**Problem**: Import skips all guests with "duplicate_in_database" reason

**Diagnosis**:
```sql
-- Check existing emails for event
SELECT email FROM guests WHERE event_id = 'YOUR_EVENT_ID';
```

**Solutions**:
- Delete existing guests if testing: `DELETE FROM guests WHERE event_id = 'YOUR_EVENT_ID';`
- Use different test CSV file
- Set `skip_duplicates=false` in query parameter (will return error instead of skipping)

### Issue 4: Backend Not Running

**Symptoms**:
- Connection refused error in Postman
- Cannot connect to localhost:8000

**Solution**:
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Issue 5: Database Not Running

**Symptoms**:
- Database connection error in logs
- PSQLException in backend logs

**Solution**:
```bash
# Check Docker is running
docker ps | grep party-time-db

# If not running, start it
docker-compose up -d postgres

# Verify connection
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT version();"
```

---

## Complete Verification Workflow

### Step-by-Step Verification After Import

1. **Run CSV Import Execute in Postman**
   ```
   POST /api/v1/events/{{event_id}}/guests/import-execute
   File: test-guests-valid.csv (20 guests)
   ```

2. **Check Response JSON**
   - Verify `success_count: 20`
   - Verify `created_guest_ids` has 20 UUIDs
   - Verify `errors: []` (empty)

3. **Check Backend Logs**
   - Look for `[CSV Import] Database commit successful`
   - Look for `[API] Import completed: 20 created, 0 errors, 0 skipped`

4. **Query Database**
   ```sql
   SELECT COUNT(*) FROM guests WHERE event_id = 'YOUR_EVENT_ID';
   -- Expected: 20
   ```

5. **Verify via API**
   ```
   GET /api/v1/events/{{event_id}}/guests/stats
   -- Expected: total_invited: 20
   ```

If ALL 5 steps show correct numbers, import was successful! ✅

---

## Event ID Reference

### How to Get Your Event ID

**Option 1: From Existing Event**
```
GET http://localhost:8000/api/v1/events
```

**Option 2: Create New Test Event**
```
POST http://localhost:8000/api/v1/events
{
  "name": "CSV Import Test Event",
  "event_type": "birthday",
  "start_date": "2025-06-15T18:00:00",
  "status": "planning"
}
```

**Option 3: From PostgreSQL**
```sql
SELECT id, name, event_type, status
FROM events
ORDER BY created_at DESC
LIMIT 5;
```

Copy the `id` value and use it in Postman collection variable `event_id`.

---

## Quick Copy-Paste Commands

### Full Verification Script

```bash
# Connect to database
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time

# Inside psql, run:
\echo 'Recent guests count:'
SELECT COUNT(*) FROM guests WHERE created_at > NOW() - INTERVAL '10 minutes';

\echo '\nGuests by event (last 24 hours):'
SELECT e.name, e.id, COUNT(g.id) as guest_count
FROM events e
LEFT JOIN guests g ON g.event_id = e.id AND g.created_at > NOW() - INTERVAL '24 hours'
GROUP BY e.id, e.name
ORDER BY guest_count DESC;

\echo '\nMost recent 5 guests:'
SELECT email, first_name, last_name, created_at
FROM guests
ORDER BY created_at DESC
LIMIT 5;
```

---

## Support

If guests are still not appearing after following this guide:

1. Share the Postman response JSON
2. Share the backend log output
3. Share the database query results
4. Check if you're using the correct event_id

The detailed logging added to the backend will help diagnose exactly where the import process is failing.
