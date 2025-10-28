# Email Service API Testing Guide

Complete guide for testing the Party-Time Email Service API using Postman.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Import Collection](#import-collection)
4. [Environment Setup](#environment-setup)
5. [Testing Without AWS SES](#testing-without-aws-ses)
6. [Testing With AWS SES](#testing-with-aws-ses)
7. [Test Scenarios](#test-scenarios)
8. [Expected Responses](#expected-responses)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

**For testing without AWS SES (logs/stats only):**
1. Import `Email-API-Tests.postman_collection.json`
2. Import `Email-API-Local.postman_environment.json`
3. Select "Email API - Local (No AWS)" environment
4. Run folders: "1. Setup & Health", "3. Email Logs", "4. Email Statistics"

**For full testing with AWS SES:**
1. Import `Email-API-Tests.postman_collection.json`
2. Import `Email-API-AWS.postman_environment.json`
3. Edit environment: Update `test_email` and `ses_from_email` with your verified emails
4. Select "Email API - AWS SES Enabled" environment
5. Run entire collection

---

## Prerequisites

### Backend Services Running

```bash
# 1. Start PostgreSQL (Docker)
docker ps | grep party-time-db
# If not running: docker-compose up -d postgres

# 2. Start Redis (Docker)
docker ps | grep party-time-redis
# If not running: docker-compose up -d redis

# 3. Start Backend Server
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 4. Verify backend is running
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Database Migration Applied

```bash
cd backend
source .venv/bin/activate
alembic upgrade head
# Should show: Running upgrade ... -> e8a5cd0d1b28, add email logs table
```

### Environment Variables Configured

**Minimum Required (`.env`):**
```bash
DATABASE_URL=postgresql://party_admin:party_secure_2024@localhost:5432/party_time
REDIS_URL=redis://localhost:6379/0
EMAIL_ENABLED=true  # or false for local testing
```

**For AWS SES Testing:**
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
SES_FROM_EMAIL=noreply@yourdomain.com  # Must be verified in SES
SES_REGION=us-east-1
```

---

## Import Collection

### Method 1: Direct Import

1. Open Postman
2. Click **Import** button (top left)
3. Navigate to `postman/Email-API/`
4. Select both:
   - `Email-API-Tests.postman_collection.json`
   - `Email-API-Local.postman_environment.json` (or AWS version)
5. Click **Import**

### Method 2: Drag and Drop

1. Open Postman
2. Drag files from `postman/Email-API/` into Postman window
3. Confirm import

---

## Environment Setup

### Local Environment (No AWS SES)

**File:** `Email-API-Local.postman_environment.json`

**Variables:**
```json
{
  "base_url": "http://localhost:8000",
  "api_version": "v1",
  "test_email": "test@example.com",
  "ses_enabled": "false",  // Key setting!
  "ses_from_email": "noreply@localhost"
}
```

**What Works:**
- ✅ Health checks
- ✅ Email logs retrieval (GET /logs)
- ✅ Email statistics (GET /stats)
- ✅ Schema validation tests
- ❌ Send operations (will be skipped)
- ❌ SES management (will be skipped)

### AWS Environment (Full Testing)

**File:** `Email-API-AWS.postman_environment.json`

**Variables to Update:**
```json
{
  "base_url": "http://localhost:8000",
  "api_version": "v1",
  "test_email": "YOUR_VERIFIED_EMAIL@yourdomain.com",  // CHANGE THIS
  "ses_enabled": "true",  // Enables all tests
  "ses_from_email": "noreply@yourdomain.com"  // CHANGE THIS (must be verified)
}
```

**Steps to Configure:**

1. **Open Environment Settings:**
   - Select "Email API - AWS SES Enabled" in Postman
   - Click the eye icon (👁️) > Edit

2. **Update Email Addresses:**
   - `test_email`: Your verified email address
   - `ses_from_email`: Your verified sender email

3. **Verify in AWS SES:**
   - Go to AWS SES Console
   - Verify both email addresses
   - Check verification links in email inbox

4. **Save Changes**

---

## Testing Without AWS SES

**Use Case:** Development, CI/CD, or testing without AWS credentials

### What Can Be Tested

#### ✅ Email Logs (Folder 3)
- Get all recent logs
- Filter by email type
- Filter by status
- Filter by date range
- Pagination

#### ✅ Email Statistics (Folder 4)
- Overall statistics
- Custom date ranges
- Event-specific stats

#### ✅ Error Handling
- Invalid email formats
- Missing required fields

### Running Tests

1. Select "Email API - Local (No AWS)" environment
2. Run Folder: **"1. Setup & Health"**
   - Both requests should pass
   - Console will show: "⚠ AWS SES not configured"
3. Skip Folder: "2. Send Operations" (all will be skipped)
4. Run Folder: **"3. Email Logs"**
   - All 7 requests should pass
   - May return empty arrays if no logs exist
5. Run Folder: **"4. Email Statistics"**
   - All 4 requests should pass
   - Stats will show zeros if no logs exist
6. Skip Folder: "5. SES Management" (all will be skipped)

### Populating Test Data

To test logs/stats endpoints with data:

```bash
cd backend
source .venv/bin/activate
python scripts/seed_email_test_data.py
```

This creates sample email logs in the database.

---

## Testing With AWS SES

**Use Case:** Full integration testing, production validation

### Prerequisites

1. **AWS SES Account Setup:**
   - AWS account created
   - SES service activated
   - Still in sandbox mode is OK for testing

2. **Email Verification:**
   ```bash
   # Method 1: Via API
   POST http://localhost:8000/api/v1/emails/verify
   Body: {"email": "your-email@domain.com"}

   # Method 2: Via AWS Console
   # Go to SES > Email Addresses > Verify New Email
   ```

3. **Check Inbox:**
   - Check email for verification link
   - Click link to verify
   - Repeat for both test_email and ses_from_email

### Running Full Test Suite

1. **Select AWS Environment:**
   - Choose "Email API - AWS SES Enabled"

2. **Run Collection:**
   - Click "Run Collection" button
   - Or run folders individually:

#### Folder 1: Setup & Health (2 requests)
- ✅ Health Check
- ✅ Check Email Service Config

**Expected:** All pass, console shows "✓ AWS SES is configured"

#### Folder 2: Send Operations (7 requests)
- ✅ Send Test Email (HTML + Text)
- ✅ Send Test Email (HTML Only)
- ✅ Send Test Email (Text Only)
- ✅ Send Template Email
- ✅ Send Email with CC and BCC
- ❌ Error - Invalid Email Address (expected error)
- ❌ Error - Missing Email Body (expected error)

**Expected:** 5 pass, 2 controlled errors

**Note:** Check your inbox for test emails!

#### Folder 3: Email Logs (7 requests)
All should pass with data from sent emails.

#### Folder 4: Email Statistics (4 requests)
All should pass with calculated stats.

#### Folder 5: SES Management (6 requests)
- ✅ Verify Email Address
- ✅ Check Verification Status
- ✅ Get SES Send Quota
- ✅ Error tests

**Expected:** 4 pass, 2 controlled errors

---

## Test Scenarios

### Scenario 1: Fresh Setup Validation

**Goal:** Verify email service is properly configured

```
1. Run "Health Check"
   → Expect: 200 OK, status: healthy

2. Run "Send Test Email (HTML + Text)"
   → Expect: 200 OK, success: true, message_id returned

3. Run "Get All Recent Logs"
   → Expect: 200 OK, array with 1+ log entries

4. Run "Get Overall Statistics"
   → Expect: 200 OK, total_sent: 1+
```

### Scenario 2: Template Email Testing

**Goal:** Verify template rendering works

```
1. Run "Send Template Email"
   → Expect: 200 OK, success: true

2. Check inbox
   → Expect: Email with "Email System is Working!" header

3. Run "Get Logs - Filter by Type (test)"
   → Expect: Log entry with email_type: "test"
```

### Scenario 3: Filtering and Pagination

**Goal:** Verify log filtering works

```
1. Send multiple test emails (run Send Operations folder)
   → Expect: 5 emails sent

2. Run "Get Logs - Filter by Status (sent)"
   → Expect: 5+ log entries with status: "sent"

3. Run "Get Logs - Pagination Test"
   → Expect: Maximum 10 results returned

4. Run "Get Logs - Last 7 Days"
   → Expect: Only recent logs returned
```

### Scenario 4: Statistics Validation

**Goal:** Verify statistics calculation

```
1. Run "Get Overall Statistics (30 days)"
   → Expect: total_sent matches number of emails sent

2. Note the success_rate
   → Should be 100% if no failures

3. Check by_type breakdown
   → Should show count for "test" type
```

### Scenario 5: SES Quota Monitoring

**Goal:** Check SES sending limits

```
1. Run "Get SES Send Quota"
   → Expect: max_24_hour_send (200 in sandbox, 50k+ in production)

2. Check sent_last_24_hours
   → Should match number of emails sent today

3. Check usage_percentage
   → Should be low percentage
```

---

## Expected Responses

### Send Test Email

**Request:**
```json
POST /api/v1/emails/test
{
  "to_email": "test@example.com",
  "subject": "Test Email",
  "html_body": "<h1>Hello</h1>",
  "text_body": "Hello"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message_id": "010101234567890-abcdef12-1234-5678-90ab-cdefghijklmn-000000",
  "recipient": "test@example.com",
  "message": "Test email sent successfully"
}
```

### Get Email Logs

**Request:**
```
GET /api/v1/emails/logs?email_type=test&limit=10
```

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "recipient_email": "test@example.com",
    "subject": "Test Email",
    "email_type": "test",
    "status": "sent",
    "ses_message_id": "010101234567890-abcdef12-...",
    "sent_at": "2025-10-28T06:30:00Z",
    "delivered_at": null,
    "error_message": null,
    "event_id": null,
    "guest_id": null
  }
]
```

### Get Email Statistics

**Request:**
```
GET /api/v1/emails/stats?days=30
```

**Response (200 OK):**
```json
{
  "total_sent": 25,
  "total_failed": 2,
  "total_delivered": 23,
  "total_bounced": 0,
  "total_complained": 0,
  "success_rate": 92.0,
  "by_type": {
    "test": 15,
    "invitation": 10
  }
}
```

### Get SES Quota

**Request:**
```
GET /api/v1/emails/quota
```

**Response (200 OK):**
```json
{
  "max_24_hour_send": 200.0,
  "max_send_rate": 1.0,
  "sent_last_24_hours": 25.0,
  "remaining_24_hour": 175.0,
  "usage_percentage": 12.5
}
```

### Error Response

**Request:**
```json
POST /api/v1/emails/test
{
  "to_email": "invalid-email",
  "subject": "Test",
  "text_body": "Test"
}
```

**Response (500 Internal Server Error):**
```json
{
  "detail": "Failed to send test email: Invalid recipient email address: invalid-email"
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Connection refused" on Health Check

**Symptom:**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/health

# If not running, start it:
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. "Email sending is disabled"

**Symptom:**
```json
{
  "detail": "Failed to send test email: Email sending is disabled"
}
```

**Solution:**
Check `.env` file:
```bash
EMAIL_ENABLED=true  # Must be true
```

Restart backend after changing.

#### 3. "SES_FROM_EMAIL not configured"

**Symptom:**
```json
{
  "detail": "Failed to send test email: SES_FROM_EMAIL not configured in settings"
}
```

**Solution:**
Add to `.env`:
```bash
SES_FROM_EMAIL=noreply@yourdomain.com
```

#### 4. "Email address is not verified"

**Symptom:**
```
MessageRejected: Email address is not verified
```

**Solution:**
```bash
# Method 1: Use verify endpoint
POST /api/v1/emails/verify
Body: {"email": "your-email@domain.com"}

# Method 2: AWS Console
# Go to SES > Email Addresses > Verify New Email

# Check status:
GET /api/v1/emails/verify/your-email@domain.com
```

#### 5. "Request rate exceeded"

**Symptom:**
```
Throttling: Maximum sending rate exceeded
```

**Solution:**
- SES sandbox allows 1 email/second
- Add delay between requests in Postman
- Or move out of sandbox mode

#### 6. Empty Logs/Stats

**Symptom:**
```json
[]  // Empty array from /logs
```

**Solution:**
Either:
1. Send test emails first (run Folder 2)
2. Or run seed script:
   ```bash
   python scripts/seed_email_test_data.py
   ```

#### 7. "No module named 'app'"

**Symptom:**
```
ModuleNotFoundError: No module named 'app'
```

**Solution:**
```bash
# Run from backend directory:
cd /Users/rodrigo/code/party-time/backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload
```

---

## Advanced Testing

### Running Tests in CI/CD

```bash
# Install newman (Postman CLI)
npm install -g newman

# Run collection with local environment
newman run postman/Email-API/Email-API-Tests.postman_collection.json \
  -e postman/Email-API/Email-API-Local.postman_environment.json \
  --reporters cli,json

# Run only non-SES tests
newman run postman/Email-API/Email-API-Tests.postman_collection.json \
  -e postman/Email-API/Email-API-Local.postman_environment.json \
  --folder "3. Email Logs" --folder "4. Email Statistics"
```

### Monitoring SES Usage

Run quota check before and after bulk sends:

```bash
# Before
GET /api/v1/emails/quota
# Note: sent_last_24_hours

# Send bulk emails
# ...

# After
GET /api/v1/emails/quota
# Compare: sent_last_24_hours increased
```

---

## Next Steps

1. **For Development:**
   - Use Local environment
   - Run logs/stats tests
   - Use seed script for test data

2. **For Staging/Production:**
   - Use AWS environment
   - Verify all emails in SES
   - Run full test suite
   - Monitor quota usage

3. **Integration with CI/CD:**
   - Add newman to pipeline
   - Run local environment tests
   - Set up AWS credentials in secrets

---

**Last Updated:** October 2025
**Phase:** 5.2.1 - Email Service Setup Complete
**Collection Version:** 1.0
**Total Tests:** 27 requests with automated assertions
