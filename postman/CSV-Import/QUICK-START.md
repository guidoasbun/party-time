# Quick Start Guide - CSV Import Testing with Postman

> **⚠️ IMPORTANT**: After importing, verify guests were saved to the database!
> - Quick verification: [DATABASE-VERIFICATION.md](./DATABASE-VERIFICATION.md)
> - Debugging issues: [DEBUGGING-SUMMARY.md](./DEBUGGING-SUMMARY.md)

## 🚀 5-Minute Setup

### Step 1: Start Your Development Environment (2 minutes)

```bash
# Terminal 1 - Start Database
cd /Users/rodrigo/code/party-time
docker-compose up -d postgres

# Terminal 2 - Start Backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Verify backend is running
curl http://localhost:8000/docs
```

### Step 2: Get Authentication Token (1 minute)

**Option A: Use Guest-API Collection (Recommended)**
```
1. Import Guest-API collection (if not already imported)
2. Open "1. Setup & Authentication" > "Login (Get Auth Token)"
3. Update email/password in request body
4. Click "Send"
5. Token is automatically saved to {{auth_token}}
```

**Option B: Set Token Manually**
```
1. Get token from browser DevTools or previous login
2. Click collection variables (eye icon) in Postman
3. Set "auth_token" value
4. Save
```

### Step 3: Import CSV Import Collection (30 seconds)

1. **Open Postman**
2. **Click "Import"** (top left corner)
3. **Drag and drop** `CSV-Import-Collection.json`
4. **Click "Import"** to confirm

### Step 4: Set Event ID (30 seconds)

**Option A: Create New Event**
```
1. Use Guest-API > Create Test Event request
2. Event ID is auto-saved to {{event_id}}
```

**Option B: Use Existing Event**
```
1. Click collection variables (eye icon)
2. Set "event_id" to your event UUID
3. Save
```

### Step 5: Run Your First Test (1 minute)

1. **Open** "1. CSV Import - Preview" request
2. **Click "Body" tab**
3. **Click "Select File"** next to the "file" field
4. **Navigate to:** `/backend/tests/fixtures/test-guests-valid.csv`
5. **Click "Send"**
6. ✅ **Verify** you see: `"total_rows": 20, "valid_rows": 20`

## 🎯 Complete Test Flow

### Test 1: Valid Guests (All Import Successfully)

**File**: `test-guests-valid.csv`

```
1. Preview Import
   - Request: "1. CSV Import - Preview"
   - Attach: test-guests-valid.csv
   - Expected: 20 total, 20 valid, 0 duplicates, 0 errors

2. Execute Import
   - Request: "2. CSV Import - Execute"
   - Attach: test-guests-valid.csv
   - Expected: 20 created, 0 errors, 0 skipped
```

### Test 2: Duplicate Detection

**File**: `test-guests-duplicates.csv`

```
1. Preview Import
   - Request: "1. CSV Import - Preview"
   - Attach: test-guests-duplicates.csv
   - Expected: 15 total, 10 valid, 5 duplicates, 0 errors
   - Check: Duplicates array shows row numbers and reasons

2. Execute Import
   - Request: "2. CSV Import - Execute"
   - Attach: test-guests-duplicates.csv
   - Expected: 10 created, 0 errors, 5 skipped
```

### Test 3: Validation Errors

**File**: `test-guests-errors.csv`

```
1. Preview Import
   - Request: "1. CSV Import - Preview"
   - Attach: test-guests-errors.csv
   - Expected: 10 total, 0 valid, 0 duplicates, 10 errors
   - Check: Errors array shows row numbers and specific messages

2. Execute Import
   - Request: "2. CSV Import - Execute"
   - Attach: test-guests-errors.csv
   - Expected: 0 created, 10+ errors, 0 skipped
```

## 📊 What to Look For

### Preview Response
```json
{
  "total_rows": 20,
  "valid_rows": 20,
  "duplicate_rows": 0,
  "error_rows": 0,
  "duplicates": [],
  "errors": [],
  "sample_guests": [
    {
      "email": "sarah.williams@example.com",
      "first_name": "Sarah",
      "last_name": "Williams",
      "plus_one_allowed": true
    }
  ],
  "column_mapping": {
    "email": "Email",
    "first_name": "First Name",
    "last_name": "Last Name"
  }
}
```

### Execute Response
```json
{
  "success_count": 20,
  "error_count": 0,
  "skipped_count": 0,
  "created_guest_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440001"
  ],
  "errors": []
}
```

## 🐛 Troubleshooting

### Error: 401 Unauthorized

**Problem:** Authentication token not set or expired

**Solution:**
```
1. Run Guest-API > Login request
2. OR set auth_token in collection variables manually
3. Verify token in collection variables (eye icon)
4. Try request again
```

### Error: 404 Event Not Found

**Problem:** Event ID not set or invalid

**Solution:**
```
1. Run Guest-API > Create Test Event
2. OR set event_id in collection variables manually
3. Verify event exists: GET /api/v1/events/{event_id}
4. Try request again
```

### Error: 400 File must be a CSV file

**Problem:** Wrong file type selected

**Solution:**
```
1. Ensure file has .csv extension
2. Use one of the test files in backend/tests/fixtures/
3. Check file is not corrupted
```

### Error: Connection Refused

**Problem:** Backend server not running

**Solution:**
```bash
# Check if running
curl http://localhost:8000/docs

# If not, start it
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

## 📈 Expected Console Output

When you run the preview request, you should see:
```
📊 CSV Import Preview Results:
   Total rows: 20
   Valid rows: 20
   Duplicate rows: 0
   Error rows: 0
```

When you run the execute request, you should see:
```
✅ CSV Import Execution Results:
   Successfully created: 20 guests
   Errors: 0
   Skipped duplicates: 0
   Created IDs: 20
```

## 🎉 Success Checklist

- [ ] Backend server running on port 8000
- [ ] PostgreSQL database running
- [ ] Auth token set in collection variables
- [ ] Event ID set in collection variables
- [ ] Can preview test-guests-valid.csv (20 valid)
- [ ] Can execute test-guests-valid.csv (20 created)
- [ ] Can preview test-guests-duplicates.csv (10 valid, 5 duplicates)
- [ ] Can execute test-guests-duplicates.csv (10 created, 5 skipped)
- [ ] Can preview test-guests-errors.csv (0 valid, 10 errors)

## 📚 Next Steps

1. **Try Different CSV Files**
   - Test with your own CSV files
   - Experiment with different column names
   - Test various boolean formats

2. **Check Guest API**
   - Use Guest-API > Get All Guests to verify imports
   - Check guest counts match success_count
   - Verify guest data is correct

3. **Read Full Documentation**
   - See TESTING-GUIDE.md for detailed instructions
   - See TEST-CHECKLIST.md for comprehensive test scenarios
   - Check main README.md for overall project info

## 🆘 Getting Help

- **API Documentation**: http://localhost:8000/docs
- **Backend Logs**: Terminal where backend is running
- **Postman Console**: View > Show Postman Console (Ctrl+Alt+C)
- **Test Files**: backend/tests/fixtures/
- **Collection Description**: Click "..." on collection > Edit > Info

---

**You're all set! Happy Testing! 🚀**
