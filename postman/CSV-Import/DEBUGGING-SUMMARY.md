# CSV Import Database Persistence - Debugging Summary

## Issue Reported

CSV guests uploaded via Postman are not persisting to the PostgreSQL database.

## Root Cause Investigation

### What We've Added

1. **Detailed Logging Throughout Import Pipeline**
   - API endpoint logging (guests.py:849-867)
   - Service layer logging (csv_import_service.py:341-361)
   - CRUD layer logging (crud_guest.py:32-61)

2. **Fixed Transaction Handling**
   - Removed unnecessary `db.rollback()` in API endpoint
   - Service layer already handles commit/rollback properly
   - Better exception handling with type information

3. **Database Verification Documentation**
   - Complete verification guide: `DATABASE-VERIFICATION.md`
   - Multiple verification methods (SQL, API, logs, response)

## How to Debug Your Import

### Step 1: Run Import with Logging

1. **Restart Backend Server** (to pick up logging changes)
   ```bash
   cd backend
   source .venv/bin/activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Run Postman Import Execute**
   - Use "2. CSV Import - Execute" endpoint
   - Attach `test-guests-valid.csv` (20 guests)
   - Send request

3. **Watch Backend Terminal** for log output:

   **✅ Success Logs Look Like:**
   ```
   [API] Starting CSV import for event abc123...
   [CSV Import] Attempting to create 20 guests for event abc123...
   [CRUD] create_guests_bulk called with 20 guests for event abc123...
   [CRUD] Creating guest 1/20: sarah.williams@example.com
   [CRUD] Creating guest 2/20: michael.chen@example.com
   ...
   [CRUD] Adding 20 guests to session
   [CRUD] Flushing session to database
   [CRUD] Refreshing guests to get generated IDs and tokens
   [CRUD] Guest 1 refreshed: ID=550e8400..., RSVP Token=ABC123...
   ...
   [CRUD] create_guests_bulk completed successfully, returning 20 guests
   [CSV Import] Successfully created 20 guest objects
   [CSV Import] Database commit successful                    ← KEY LINE
   [CSV Import] Created guest IDs: ['550e8400...', ...]
   [API] Import completed: 20 created, 0 errors, 0 skipped   ← KEY LINE
   ```

   **❌ Error Logs Look Like:**
   ```
   [API] Starting CSV import for event abc123...
   [CSV Import] Attempting to create 20 guests for event abc123...
   [CRUD] create_guests_bulk called with 20 guests for event abc123...
   [CRUD] Creating guest 1/20: sarah.williams@example.com
   [CSV Import ERROR] Exception during bulk creation: IntegrityError: ...
   [CSV Import ERROR] Traceback: ...
   [API] Import completed: 0 created, 20 errors, 0 skipped   ← KEY LINE
   ```

### Step 2: Check Postman Response

**Successful Import:**
```json
{
  "success_count": 20,          ← Should match number of guests in CSV
  "error_count": 0,             ← Should be 0
  "skipped_count": 0,           ← Number of duplicates skipped
  "created_guest_ids": [        ← Should have UUIDs (not empty!)
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001",
    ...
  ],
  "errors": []                  ← Should be empty
}
```

**Failed Import:**
```json
{
  "success_count": 0,           ← ❌ No guests created
  "error_count": 5,
  "skipped_count": 0,
  "created_guest_ids": [],      ← ❌ Empty array
  "errors": [
    "Row 2: Email is required",
    "Database error during bulk creation: IntegrityError: ..."
  ]
}
```

### Step 3: Verify Database

**Quick SQL Verification:**
```bash
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT COUNT(*) FROM guests WHERE event_id = 'YOUR_EVENT_ID';"
```

Expected result: `20` (or however many guests in CSV)

**Detailed Verification:**
See [DATABASE-VERIFICATION.md](./DATABASE-VERIFICATION.md) for complete methods.

## Common Failure Scenarios

### Scenario 1: Validation Errors

**Symptoms:**
- Response: `success_count: 0`, `error_count > 0`
- Errors array contains validation messages
- Logs show: "Row X: Email is required"

**Cause:** CSV has missing/invalid required fields

**Solution:** Fix CSV file or use `test-guests-valid.csv`

### Scenario 2: Duplicate Emails

**Symptoms:**
- Response: `success_count < total_rows`, `skipped_count > 0`
- Logs show: "duplicate_in_database" or "duplicate_in_file"

**Cause:** Emails already exist in database or duplicated within CSV

**Solutions:**
- Use `test-guests-valid.csv` (no duplicates)
- Delete existing guests: `DELETE FROM guests WHERE event_id = 'YOUR_EVENT_ID';`
- Use different event_id

### Scenario 3: Database Connection Error

**Symptoms:**
- Response: `success_count: 0`, error about database connection
- Logs show: PSQLException, connection refused

**Cause:** PostgreSQL not running or not accessible

**Solution:**
```bash
docker ps | grep party-time-db
# If not running:
docker-compose up -d postgres
```

### Scenario 4: Wrong Event ID

**Symptoms:**
- Import succeeds (success_count > 0)
- Can't find guests when querying database
- Guests exist but for different event

**Cause:** Using different event_id for import vs query

**Solution:** Verify event_id matches:
```sql
SELECT event_id, COUNT(*) FROM guests GROUP BY event_id;
```

### Scenario 5: Transaction Not Committed

**Symptoms:**
- Logs show "Database commit successful"
- Response shows created_guest_ids with UUIDs
- Database query returns 0 guests
- **This was the suspected original issue**

**Diagnosis:** Look for these in logs:
- ✅ `[CSV Import] Database commit successful` - Commit happened
- ✅ `[CRUD] Guest X refreshed: ID=...` - Objects created
- ❌ Any exception after commit - Transaction rolled back

**Fixes Applied:**
1. Added logging to track commit
2. Removed unnecessary rollback in API endpoint
3. Better exception handling

## What Changed in Code

### File 1: backend/app/services/csv_import_service.py

**Lines 340-361:** Added detailed logging around bulk creation and commit
- Logs number of guests being created
- Logs when objects are created
- Logs when commit succeeds
- Logs full exception details if fails
- Logs created guest IDs

### File 2: backend/app/api/v1/guests.py

**Lines 849-867:** Improved API endpoint logging and error handling
- Logs when import starts
- Logs when import completes with statistics
- Removed `db.rollback()` (service already handles transactions)
- Better exception messages with type information

### File 3: backend/app/crud/crud_guest.py

**Lines 32-61:** Added CRUD-level logging
- Logs each guest being created
- Logs session operations (add, flush, refresh)
- Logs generated IDs and RSVP tokens
- Confirms completion

## Next Steps

1. **Restart your backend server** to load the new logging code

2. **Run a test import** with `test-guests-valid.csv`

3. **Watch the terminal output** - you'll see exactly where it fails (if it fails)

4. **Share the logs** - if still not working, copy/paste:
   - The Postman response JSON
   - The backend terminal logs
   - The database query result

5. **Verify database** using methods in DATABASE-VERIFICATION.md

## Expected Successful Flow

```
[User runs Postman Execute import]
   ↓
[API] Starting CSV import
   ↓
[CSV Import] Attempting to create 20 guests
   ↓
[CRUD] create_guests_bulk called with 20 guests
   ↓
[CRUD] Creating guest 1/20, 2/20, ... 20/20
   ↓
[CRUD] Adding 20 guests to session
   ↓
[CRUD] Flushing session to database
   ↓
[CRUD] Refreshing guests (get IDs and tokens)
   ↓
[CRUD] create_guests_bulk completed successfully
   ↓
[CSV Import] Successfully created 20 guest objects
   ↓
[CSV Import] Database commit successful  ← CRITICAL POINT
   ↓
[CSV Import] Created guest IDs: [list of UUIDs]
   ↓
[API] Import completed: 20 created, 0 errors, 0 skipped
   ↓
[Postman receives success_count: 20]
   ↓
[Database query shows 20 guests] ✅
```

## Support

With the detailed logging now in place, you'll be able to see **exactly** where the import process is failing. The logs will show:

- ✅ When each step completes successfully
- ❌ Exactly which step throws an exception
- 📊 The full exception traceback
- 🔍 The number of guests at each stage

If the issue persists after this debugging update, share the logs and we can pinpoint the exact failure point.
