# CSV Import Test Checklist

## 📋 Pre-Flight Checklist

- [ ] Backend server running (`curl http://localhost:8000/docs`)
- [ ] PostgreSQL running (`docker ps | grep party-time-db`)
- [ ] Postman collection imported
- [ ] Auth token set in collection variables
- [ ] Event ID set in collection variables
- [ ] Test CSV files accessible at `backend/tests/fixtures/`

## 🧪 Core Functionality Tests

### Test 1: Valid CSV Import
**File**: `test-guests-valid.csv`

#### Preview Request
- [ ] Response status: 200 OK
- [ ] `total_rows`: 20
- [ ] `valid_rows`: 20
- [ ] `duplicate_rows`: 0
- [ ] `error_rows`: 0
- [ ] `duplicates` array: empty
- [ ] `errors` array: empty
- [ ] `sample_guests` array: contains 10 guests
- [ ] `column_mapping`: all 7 columns detected

#### Execute Request
- [ ] Response status: 200 OK
- [ ] `success_count`: 20
- [ ] `error_count`: 0
- [ ] `skipped_count`: 0
- [ ] `created_guest_ids`: array of 20 UUIDs
- [ ] `errors` array: empty

#### Verification
- [ ] GET /api/v1/events/{event_id}/guests returns 20 guests
- [ ] Guest data matches CSV content
- [ ] Plus-one values correctly parsed (true/false)
- [ ] Phone numbers preserved with formatting
- [ ] Dietary restrictions saved correctly

### Test 2: Duplicate Detection (In-File)
**File**: `test-guests-duplicates.csv`

#### Preview Request
- [ ] `total_rows`: 15
- [ ] `valid_rows`: 10
- [ ] `duplicate_rows`: 5
- [ ] `error_rows`: 0
- [ ] `duplicates` array contains 5 items
- [ ] Each duplicate shows `row_number`
- [ ] Each duplicate shows `reason`: "duplicate_in_file"
- [ ] Row 6: duplicate.email@example.com detected
- [ ] Row 10: another.dup@example.com detected
- [ ] Rows 13, 15: triple.dup@example.com detected

#### Execute Request
- [ ] `success_count`: 10
- [ ] `error_count`: 0
- [ ] `skipped_count`: 5
- [ ] Only 10 unique guests created

#### Verification
- [ ] GET /api/v1/events/{event_id}/guests returns only 10 guests
- [ ] No duplicate emails in result
- [ ] First occurrence of each email was kept

### Test 3: Validation Errors
**File**: `test-guests-errors.csv`

#### Preview Request
- [ ] `total_rows`: 10
- [ ] `valid_rows`: 0
- [ ] `duplicate_rows`: 0
- [ ] `error_rows`: 10
- [ ] `errors` array contains 10 items
- [ ] Each error shows `row_number`
- [ ] Each error shows specific `errors` messages
- [ ] Row 2: "Email is required" error
- [ ] Row 3: "Invalid email format" error
- [ ] Row 4: "First name is required" error
- [ ] Row 5: "Last name is required" error
- [ ] Row 6: "First name exceeds 100 characters" error

#### Execute Request
- [ ] `success_count`: 0
- [ ] `error_count`: 10 or more
- [ ] `skipped_count`: 0
- [ ] No guests created

### Test 4: Database Duplicate Detection

#### Setup
- [ ] Execute `test-guests-valid.csv` first
- [ ] Verify 20 guests created

#### Preview Request (Same File Again)
- [ ] `total_rows`: 20
- [ ] `valid_rows`: 0
- [ ] `duplicate_rows`: 20
- [ ] Each duplicate shows `reason`: "exists_in_database"

#### Execute Request
- [ ] `success_count`: 0
- [ ] `skipped_count`: 20
- [ ] No new guests created

## 🎯 Feature-Specific Tests

### Column Name Detection
- [ ] "Email" → email
- [ ] "First Name" → first_name
- [ ] "first_name" → first_name
- [ ] "firstName" → first_name
- [ ] "Last Name" → last_name
- [ ] "Phone Number" → phone
- [ ] "Plus One" → plus_one_allowed
- [ ] "Dietary Restrictions" → dietary_restrictions

### Boolean Parsing
- [ ] "true" → true
- [ ] "TRUE" → true
- [ ] "yes" → true
- [ ] "Yes" → true
- [ ] "y" → true
- [ ] "1" → true
- [ ] "x" → true
- [ ] "false" → false
- [ ] "no" → false
- [ ] "0" → false
- [ ] "" (empty) → false

### Email Validation
- [ ] Valid: john@example.com
- [ ] Valid: jane.smith@company.co.uk
- [ ] Valid: user+tag@domain.com
- [ ] Invalid: invalid-email
- [ ] Invalid: @domain.com
- [ ] Invalid: user@
- [ ] Invalid: (empty string)

### Character Limits
- [ ] First name: Max 100 characters
- [ ] Last name: Max 100 characters
- [ ] Plus-one name: Max 200 characters
- [ ] Email: Max 255 characters

## 🔐 Authentication Tests

### Valid Token
- [ ] Request succeeds with valid token
- [ ] Token automatically used from collection variables

### Missing Token
- [ ] Request fails with 401 if token not set
- [ ] Clear error message returned

### Invalid Token
- [ ] Request fails with 401 if token invalid
- [ ] Clear error message returned

### Expired Token
- [ ] Request fails with 401 if token expired
- [ ] User prompted to re-authenticate

## 🚫 Error Handling Tests

### File Validation
- [ ] No file attached: 422 error
- [ ] Wrong file type (.txt): 400 error
- [ ] Empty file: Appropriate error
- [ ] Corrupted file: Appropriate error
- [ ] File too large (>10MB): 400 error

### Event Validation
- [ ] Invalid event_id: 404 error
- [ ] Event not owned by user: 404 error
- [ ] Event doesn't exist: 404 error

### CSV Format Validation
- [ ] No header row: Appropriate error
- [ ] Missing required columns: Error with column names
- [ ] Malformed CSV: Parse error with details

## 📊 Performance Tests

### Large File Handling
- [ ] 100 rows: Processes in < 2 seconds
- [ ] 500 rows: Processes in < 5 seconds
- [ ] 1000 rows: Processes in < 10 seconds
- [ ] 10MB file: Handled without error

### Memory Management
- [ ] No memory leaks during import
- [ ] Server remains responsive
- [ ] Database connection stable

## 🔄 Integration Tests

### With Guest API
- [ ] Imported guests appear in GET /guests
- [ ] Guest count matches import success_count
- [ ] Guest data accessible via individual GET
- [ ] Can update imported guests
- [ ] Can delete imported guests

### With RSVP System
- [ ] Imported guests have RSVP tokens
- [ ] Tokens are unique
- [ ] Can access RSVP page with token
- [ ] Can submit RSVP for imported guest

### With Statistics
- [ ] Guest stats updated after import
- [ ] Total invited count correct
- [ ] RSVP breakdown accurate
- [ ] Response rate calculated correctly

## 🎨 Edge Cases

### Special Characters
- [ ] Names with accents: José, François
- [ ] Names with apostrophes: O'Brien
- [ ] Names with hyphens: Mary-Jane
- [ ] Unicode characters handled correctly

### Email Formats
- [ ] Subdomains: user@mail.example.com
- [ ] Country TLDs: user@example.co.uk
- [ ] Plus addressing: user+tag@example.com
- [ ] Dots in local part: first.last@example.com

### Phone Formats
- [ ] +1-555-123-4567
- [ ] (555) 123-4567
- [ ] 555.123.4567
- [ ] 5551234567
- [ ] +1 555 123 4567
- [ ] All formats preserved

### Empty Fields (Optional)
- [ ] Empty phone: Saved as null
- [ ] Empty dietary restrictions: Saved as null
- [ ] Empty notes: Saved as null
- [ ] Empty plus-one name: Saved as null

## 📝 Postman-Specific Tests

### Collection Variables
- [ ] auth_token persists across requests
- [ ] event_id persists across requests
- [ ] Variables shared between collections

### Pre-request Scripts
- [ ] Auth token warning shows if not set
- [ ] Event ID warning shows if not set

### Test Scripts
- [ ] All status code tests pass
- [ ] Response structure validation passes
- [ ] Console output shows results
- [ ] Duplicate details logged
- [ ] Error details logged

### Example Responses
- [ ] Valid CSV example present
- [ ] Duplicates CSV example present
- [ ] Errors CSV example present
- [ ] Response format matches actual

## ✅ Final Verification

### Documentation
- [ ] Collection description accurate
- [ ] Request descriptions helpful
- [ ] Variable descriptions clear
- [ ] Example responses match reality

### User Experience
- [ ] Easy to understand what to do
- [ ] Clear error messages
- [ ] Helpful console output
- [ ] Response format readable

### Production Readiness
- [ ] All core features work
- [ ] Error handling comprehensive
- [ ] Performance acceptable
- [ ] Documentation complete

---

## 📊 Test Results Summary

**Date**: _____________
**Tester**: _____________
**Total Tests**: 100+
**Tests Passed**: _______
**Tests Failed**: _______
**Issues Found**: _______

**Notes**:
___________________________________
___________________________________
___________________________________

**Sign-off**: _______________
