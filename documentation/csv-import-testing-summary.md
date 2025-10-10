# CSV Import Testing - Complete Guide

**Status**: ✅ **READY FOR TESTING**
**Phase**: 4.1.3 - CSV Import Backend
**Date**: January 2025

---

## 📋 What's Been Created

### 1. Test CSV Files (3 files)
**Location**: `backend/tests/fixtures/`

| File | Purpose | Rows | Expected Result |
|------|---------|------|-----------------|
| `test-guests-valid.csv` | Valid guests | 20 | 20 created, 0 errors |
| `test-guests-duplicates.csv` | Duplicate detection | 15 | 10 created, 5 skipped |
| `test-guests-errors.csv` | Validation errors | 10 | 0 created, 10 errors |

### 2. Postman Collection
**Location**: `postman/CSV-Import/`

| File | Description |
|------|-------------|
| `CSV-Import-Collection.json` | Main collection with 2 requests |
| `environment-template.json` | Environment variables template |
| `QUICK-START.md` | 5-minute setup guide |
| `TESTING-GUIDE.md` | Comprehensive testing instructions |
| `TEST-CHECKLIST.md` | 100+ test scenarios |

### 3. Documentation Updated
- ✅ `postman/README.md` - Added CSV Import section
- ✅ `documentation/csv-import-testing-summary.md` - This file

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend (1 minute)
```bash
# Terminal 1 - Database
docker-compose up -d postgres

# Terminal 2 - Backend
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 2: Get Auth Token (1 minute)
```bash
# Option A: Via Postman Guest-API Collection
1. Import Guest-API/Guest-API-Collection.json
2. Run "Login (Get Auth Token)" request
3. Token saved automatically

# Option B: Via curl
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

### Step 3: Import CSV Collection (1 minute)
```
1. Open Postman
2. Click "Import"
3. Select postman/CSV-Import/CSV-Import-Collection.json
4. Click "Import"
```

### Step 4: Set Variables (30 seconds)
```
1. Click eye icon (👁️) in Postman
2. Set `auth_token` (from Step 2)
3. Set `event_id` (create event or use existing)
4. Save
```

### Step 5: Test Import (1 minute)
```
1. Open "1. CSV Import - Preview"
2. Click "Body" > "file" > "Select File"
3. Choose: backend/tests/fixtures/test-guests-valid.csv
4. Click "Send"
5. ✅ Verify: total_rows: 20, valid_rows: 20
```

---

## 🎯 Testing Methods

### Method 1: Postman (Recommended)

**Pros**:
- Visual interface
- Auto-saves tokens
- Test scripts built-in
- Example responses included

**Setup**:
1. Import collection
2. Set auth_token and event_id
3. Attach CSV file to request
4. Send request

**Files**:
```
postman/CSV-Import/CSV-Import-Collection.json
postman/CSV-Import/QUICK-START.md
```

### Method 2: cURL (Command Line)

**Pros**:
- Quick and scriptable
- No additional software needed
- Easy to automate

**Preview Request**:
```bash
curl -X POST \
  http://localhost:8000/api/v1/events/{event_id}/guests/import-preview \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@backend/tests/fixtures/test-guests-valid.csv"
```

**Execute Request**:
```bash
curl -X POST \
  "http://localhost:8000/api/v1/events/{event_id}/guests/import-execute?skip_duplicates=true" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@backend/tests/fixtures/test-guests-valid.csv"
```

### Method 3: Swagger UI (Browser)

**Pros**:
- Interactive documentation
- No setup required
- Great for quick tests

**Steps**:
1. Go to http://localhost:8000/docs
2. Click "Authorize" button
3. Enter: `Bearer YOUR_TOKEN`
4. Find `POST /api/v1/events/{event_id}/guests/import-preview`
5. Click "Try it out"
6. Upload CSV file
7. Execute

---

## 📊 Test Scenarios & Expected Results

### Test 1: Valid CSV (Happy Path)
**File**: `test-guests-valid.csv`

**Preview Response**:
```json
{
  "total_rows": 20,
  "valid_rows": 20,
  "duplicate_rows": 0,
  "error_rows": 0,
  "duplicates": [],
  "errors": [],
  "sample_guests": [...10 guests...],
  "column_mapping": {...}
}
```

**Execute Response**:
```json
{
  "success_count": 20,
  "error_count": 0,
  "skipped_count": 0,
  "created_guest_ids": [...20 UUIDs...],
  "errors": []
}
```

**Verification**:
```
GET /api/v1/events/{event_id}/guests
→ Should return 20 guests
```

### Test 2: Duplicate Detection
**File**: `test-guests-duplicates.csv`

**Preview Response**:
```json
{
  "total_rows": 15,
  "valid_rows": 10,
  "duplicate_rows": 5,
  "error_rows": 0,
  "duplicates": [
    {
      "row_number": 6,
      "email": "duplicate.email@example.com",
      "first_name": "Second",
      "last_name": "Duplicate",
      "reason": "duplicate_in_file"
    }
    // ... 4 more duplicates
  ]
}
```

**Execute Response**:
```json
{
  "success_count": 10,
  "error_count": 0,
  "skipped_count": 5,
  "created_guest_ids": [...10 UUIDs...],
  "errors": []
}
```

### Test 3: Validation Errors
**File**: `test-guests-errors.csv`

**Preview Response**:
```json
{
  "total_rows": 10,
  "valid_rows": 0,
  "duplicate_rows": 0,
  "error_rows": 10,
  "duplicates": [],
  "errors": [
    {
      "row_number": 2,
      "errors": ["Row 2: Email is required"],
      "data": {
        "email": "",
        "first_name": "John",
        "last_name": "MissingEmail"
      }
    }
    // ... 9 more errors
  ]
}
```

**Execute Response**:
```json
{
  "success_count": 0,
  "error_count": 10,
  "skipped_count": 0,
  "created_guest_ids": [],
  "errors": ["Row 2: Email is required", ...]
}
```

---

## 🔑 Getting Authentication Token

### Option 1: Via Guest-API Postman Collection
```
1. Import postman/Guest-API/Guest-API-Collection.json
2. Open "1. Setup & Authentication" > "Login"
3. Update email/password in request body
4. Send request
5. Token auto-saved to {{auth_token}}
```

### Option 2: Via Browser DevTools
```
1. Login to http://localhost:3000
2. Open DevTools (F12) > Network tab
3. Find any API request
4. Copy Authorization header value
5. Remove "Bearer " prefix
6. Set in Postman variable
```

### Option 3: Via cURL
```bash
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"password"}' \
  | jq -r '.access_token')

echo $TOKEN
```

---

## 🧪 Complete Test Checklist

### Pre-Flight ✓
- [ ] Backend running on port 8000
- [ ] PostgreSQL running (docker ps)
- [ ] Auth token obtained
- [ ] Event ID obtained or created
- [ ] CSV files accessible

### Core Tests ✓
- [ ] Preview valid CSV (20 rows)
- [ ] Execute valid CSV (20 created)
- [ ] Preview duplicates CSV (10 valid, 5 duplicates)
- [ ] Execute duplicates CSV (10 created, 5 skipped)
- [ ] Preview errors CSV (0 valid, 10 errors)
- [ ] Verify row numbers in error messages

### Feature Tests ✓
- [ ] Column detection works (7+ variations)
- [ ] Boolean parsing works (true/yes/y/1/x)
- [ ] Duplicate detection (in-file)
- [ ] Duplicate detection (database)
- [ ] Email validation
- [ ] Character limit enforcement

### Edge Cases ✓
- [ ] Special characters (José, O'Brien)
- [ ] Various phone formats
- [ ] Large files (500+ rows)
- [ ] Different delimiters (comma, semicolon, tab)
- [ ] Different encodings (UTF-8, ISO-8859-1)

---

## 🐛 Troubleshooting

### Error: 401 Unauthorized
```
Problem: No auth token or expired token
Solution: Run Guest-API Login request or set token manually
```

### Error: 404 Event Not Found
```
Problem: Invalid event_id
Solution: Create event or use valid event UUID
```

### Error: 400 File must be a CSV file
```
Problem: Wrong file type
Solution: Ensure file has .csv extension
```

### Error: Connection Refused
```
Problem: Backend not running
Solution: Start backend server
bash
cd backend && source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

### All Rows Show Errors
```
Problem: CSV format issue
Solution:
1. Check file has header row
2. Verify column names recognizable
3. Ensure UTF-8 encoding
4. Check required fields present
```

---

## 📚 Documentation Links

- **Quick Start**: `postman/CSV-Import/QUICK-START.md`
- **Testing Guide**: `postman/CSV-Import/TESTING-GUIDE.md`
- **Test Checklist**: `postman/CSV-Import/TEST-CHECKLIST.md`
- **Postman Collection**: `postman/CSV-Import/CSV-Import-Collection.json`
- **Phase Documentation**: `documentation/phase-4.1.3-csv-import-summary.md`

---

## ✅ Success Criteria

You've successfully tested CSV import when:

1. **Preview Works**
   - Can preview test-guests-valid.csv
   - Shows 20 total, 20 valid, 0 duplicates, 0 errors
   - Sample guests displayed
   - Column mapping shown

2. **Execute Works**
   - Can import test-guests-valid.csv
   - Creates 20 guests successfully
   - Guest IDs returned
   - No errors reported

3. **Duplicate Detection Works**
   - test-guests-duplicates.csv shows 5 duplicates
   - Row numbers displayed for each duplicate
   - Reason shown (duplicate_in_file or exists_in_database)
   - Only 10 unique guests created

4. **Validation Works**
   - test-guests-errors.csv shows 10 errors
   - Each error has row number
   - Specific error messages shown
   - No guests created

5. **Integration Works**
   - Imported guests appear in GET /guests
   - Guest data matches CSV content
   - Can interact with imported guests (update, delete)

---

## 🎉 You're Ready!

All testing materials are ready:
- ✅ 3 test CSV files with different scenarios
- ✅ Postman collection with 2 endpoints
- ✅ Comprehensive documentation (3 guides)
- ✅ 100+ test checklist items
- ✅ Multiple testing methods supported

**Start testing now with:**
```
postman/CSV-Import/QUICK-START.md
```

**Happy Testing! 🚀**
