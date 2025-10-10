# CSV Import Testing Guide

> **⚠️ IMPORTANT**: After running CSV imports, you MUST verify guests were saved to the database!
> See [DATABASE-VERIFICATION.md](./DATABASE-VERIFICATION.md) for complete verification methods.

## 📋 Prerequisites

### 1. Backend Server
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. PostgreSQL Database
```bash
docker-compose up -d postgres
docker ps | grep party-time-db
```

### 3. Authentication Token

## 🔑 Getting Authentication Token

### Method 1: Via Guest-API Collection (Easiest)

1. **Import Guest-API Collection**
   ```
   File: postman/Guest-API/Guest-API-Collection.json
   ```

2. **Run Login Request**
   ```
   Guest-API > 1. Setup & Authentication > Login (Get Auth Token)
   ```

3. **Update Credentials**
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```

4. **Send Request**
   - Token is automatically saved to `{{auth_token}}`
   - Shared across all collections

### Method 2: Via Browser DevTools

1. **Login to Frontend**
   ```
   http://localhost:3000
   ```

2. **Open DevTools** (F12)
3. **Go to Network Tab**
4. **Make Any API Request**
5. **Find Request with Authorization Header**
6. **Copy Bearer Token**
   ```
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

7. **Set in Postman**
   - Click eye icon (👁️) in Postman
   - Set `auth_token` value (without "Bearer " prefix)
   - Save

### Method 3: Via cURL

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

Copy the `access_token` from response.

### Method 4: Via Database (Development Only)

```bash
# Get user credentials from database
docker exec -it party-time-db psql -U party_admin -d party_time \
  -c "SELECT email FROM users LIMIT 1;"

# Use credentials to login via Guest-API collection
```

## 📁 Test CSV Files

### test-guests-valid.csv
- **Location**: `backend/tests/fixtures/test-guests-valid.csv`
- **Contents**: 20 valid guests
- **Expected Result**:
  ```json
  {
    "total_rows": 20,
    "valid_rows": 20,
    "duplicate_rows": 0,
    "error_rows": 0
  }
  ```

### test-guests-duplicates.csv
- **Location**: `backend/tests/fixtures/test-guests-duplicates.csv`
- **Contents**: 15 guests (10 unique, 5 duplicates)
- **Expected Result**:
  ```json
  {
    "total_rows": 15,
    "valid_rows": 10,
    "duplicate_rows": 5,
    "error_rows": 0
  }
  ```
- **Duplicates**:
  - Row 6: duplicate.email@example.com
  - Row 10: another.dup@example.com
  - Rows 13, 15: triple.dup@example.com

### test-guests-errors.csv
- **Location**: `backend/tests/fixtures/test-guests-errors.csv`
- **Contents**: 10 invalid guests
- **Expected Result**:
  ```json
  {
    "total_rows": 10,
    "valid_rows": 0,
    "duplicate_rows": 0,
    "error_rows": 10
  }
  ```
- **Error Types**:
  - Missing email (required)
  - Invalid email format
  - Missing first name (required)
  - Missing last name (required)
  - Name exceeds 100 characters

## 🧪 Testing Scenarios

### Scenario 1: Successful Import (Happy Path)

1. **Preview CSV**
   ```
   POST /api/v1/events/{event_id}/guests/import-preview
   File: test-guests-valid.csv
   ```

2. **Verify Preview Response**
   - total_rows = 20
   - valid_rows = 20
   - No duplicates
   - No errors
   - Sample guests shown
   - Column mapping correct

3. **Execute Import**
   ```
   POST /api/v1/events/{event_id}/guests/import-execute
   File: test-guests-valid.csv
   Query: skip_duplicates=true
   ```

4. **Verify Execute Response**
   - success_count = 20
   - error_count = 0
   - skipped_count = 0
   - 20 guest IDs returned

5. **Verify in Database**
   ```
   GET /api/v1/events/{event_id}/guests
   Expected: 20 guests in response
   ```

### Scenario 2: Duplicate Detection

1. **Preview CSV with Duplicates**
   ```
   POST /api/v1/events/{event_id}/guests/import-preview
   File: test-guests-duplicates.csv
   ```

2. **Verify Duplicates Detected**
   - duplicate_rows = 5
   - Duplicates array shows:
     - Row numbers
     - Email addresses
     - Reason (duplicate_in_file)

3. **Execute with Skip Duplicates**
   ```
   POST /api/v1/events/{event_id}/guests/import-execute?skip_duplicates=true
   File: test-guests-duplicates.csv
   ```

4. **Verify Results**
   - success_count = 10
   - skipped_count = 5
   - Only unique guests created

### Scenario 3: Validation Errors

1. **Preview CSV with Errors**
   ```
   POST /api/v1/events/{event_id}/guests/import-preview
   File: test-guests-errors.csv
   ```

2. **Verify Errors Detected**
   - error_rows = 10
   - Errors array shows:
     - Row numbers
     - Specific error messages
     - Guest data causing error

3. **Execute Import (Should Fail)**
   ```
   POST /api/v1/events/{event_id}/guests/import-execute
   File: test-guests-errors.csv
   ```

4. **Verify No Guests Created**
   - success_count = 0
   - error_count > 0
   - Errors list validation failures

### Scenario 4: Database Duplicate Detection

1. **First Import**
   ```
   Execute test-guests-valid.csv
   Creates 20 guests
   ```

2. **Second Import (Same File)**
   ```
   Preview test-guests-valid.csv
   Should show duplicate_rows = 20
   Reason: exists_in_database
   ```

3. **Execute with Skip Duplicates**
   ```
   Execute test-guests-valid.csv?skip_duplicates=true
   success_count = 0
   skipped_count = 20
   ```

## 🔧 Advanced Testing

### Test Different Column Names

Create CSV with different column formats:
```csv
e-mail,FirstName,LAST NAME,Mobile,bring guest,diet
john@example.com,John,Doe,555-1234,yes,Vegan
```

Expected: All columns detected correctly

### Test Boolean Variations

```csv
Email,First Name,Last Name,Plus One
test1@example.com,Test,One,true
test2@example.com,Test,Two,TRUE
test3@example.com,Test,Three,yes
test4@example.com,Test,Four,y
test5@example.com,Test,Five,1
test6@example.com,Test,Six,x
```

Expected: All parsed as `plus_one_allowed = true`

### Test Large Files

```csv
# Create CSV with 500+ rows
# Expected: Processes in < 5 seconds
```

### Test Special Characters

```csv
Email,First Name,Last Name,Notes
test@example.com,José,O'Brien,Special: résumé, café
```

Expected: Characters preserved correctly

## 📊 Response Validation

### Preview Response Schema
```json
{
  "total_rows": number,
  "valid_rows": number,
  "duplicate_rows": number,
  "error_rows": number,
  "duplicates": [
    {
      "row_number": number,
      "email": string,
      "first_name": string,
      "last_name": string,
      "reason": "duplicate_in_file" | "exists_in_database"
    }
  ],
  "errors": [
    {
      "row_number": number,
      "errors": string[],
      "data": {
        "email": string,
        "first_name": string,
        "last_name": string
      }
    }
  ],
  "sample_guests": object[],
  "column_mapping": object
}
```

### Execute Response Schema
```json
{
  "success_count": number,
  "error_count": number,
  "skipped_count": number,
  "created_guest_ids": string[],
  "errors": string[]
}
```

## 🐛 Common Issues

### Issue: File Upload Not Working

**Symptoms**: "No file provided" error

**Solutions**:
1. Ensure "file" key name is correct
2. File must be attached (not empty)
3. Check file path is correct
4. Verify file exists and is readable

### Issue: All Rows Marked as Errors

**Symptoms**: error_rows equals total_rows

**Solutions**:
1. Check CSV has header row
2. Verify column names are recognizable
3. Ensure required fields present (email, first_name, last_name)
4. Check file encoding (should be UTF-8)

### Issue: Duplicates Not Detected

**Symptoms**: Duplicates show as valid

**Solutions**:
1. Ensure emails are identical (case-insensitive)
2. Check no trailing spaces
3. Verify database check is working (test with existing guest)

## ✅ Success Criteria

After testing, you should have verified:

- [ ] Can preview valid CSV (20 guests)
- [ ] Can execute valid CSV (20 created)
- [ ] Duplicate detection works (in-file)
- [ ] Duplicate detection works (database)
- [ ] Validation errors show row numbers
- [ ] Column mapping works for variations
- [ ] Boolean parsing works for all formats
- [ ] Large files process quickly (< 5 seconds for 500 rows)
- [ ] Special characters preserved
- [ ] Auth token management works
- [ ] Error messages are clear and helpful

---

**For more help, see QUICK-START.md or TEST-CHECKLIST.md**
