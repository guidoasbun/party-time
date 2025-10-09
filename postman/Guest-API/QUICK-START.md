# Quick Start Guide - Guest API Testing with Postman

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

### Step 2: Import into Postman (1 minute)

1. **Open Postman**
2. **Click "Import"** (top left corner)
3. **Drag and drop** `Guest-API-Collection.json`
4. **Click "Import"** to confirm

### Step 3: Configure Variables (1 minute)

The collection uses these auto-managed variables:

```json
{
  "base_url": "http://localhost:8000",
  "api_version": "v1",
  "auth_token": "(auto-set after login)",
  "event_id": "(auto-set after creating event)",
  "guest_id": "(auto-set after creating guest)"
}
```

**No manual configuration needed!** Variables are set automatically as you run requests.

### Step 4: Run First Test (1 minute)

1. **Expand** "1. Setup & Authentication" folder
2. **Click** "Login (Get Auth Token)"
3. **Update** email/password in request body:
   ```json
   {
     "email": "your-email@example.com",
     "password": "your-password"
   }
   ```
4. **Click "Send"**
5. ✅ Verify you see: `"access_token": "eyJ..."`

## 🎯 Run Your First Complete Test Flow

Follow these requests in order:

### 1. Authenticate
```
POST /api/v1/auth/login
```
**Expected**: 200 OK, `auth_token` saved automatically

### 2. Create Test Event
```
POST /api/v1/events
```
**Expected**: 201 Created, `event_id` saved automatically

### 3. Create Guest
```
POST /api/v1/events/{event_id}/guests
```
**Expected**: 201 Created, `guest_id` saved automatically

### 4. Get All Guests
```
GET /api/v1/events/{event_id}/guests
```
**Expected**: 200 OK, array of guests

### 5. Search Guests
```
GET /api/v1/events/{event_id}/guests/search?q=John
```
**Expected**: 200 OK, filtered results

### 6. Update Guest Status
```
PUT /api/v1/events/{event_id}/guests/{guest_id}
```
**Expected**: 200 OK, updated guest data

## 📊 Run All Tests at Once

### Via Postman Runner

1. **Right-click** collection name
2. **Click** "Run collection"
3. **Select all** requests (or specific folder)
4. **Click** "Run Party-Time Guest API"
5. **View** test results

**Expected Results:**
- ✅ All tests should pass
- ⏱️ Takes ~10-15 seconds
- 📈 You should see 30+ requests completed

### Via Command Line (Newman)

```bash
# Install Newman
npm install -g newman

# Run all tests
newman run postman/Guest-API-Collection.json

# With detailed output
newman run postman/Guest-API-Collection.json --verbose

# Generate HTML report
newman run postman/Guest-API-Collection.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

## 🧪 Test Individual Features

### Test Search Functionality

Navigate to: **"3. Search & Filtering"** folder

Run these requests:
1. ✅ Search Guests by Name
2. ✅ Filter by RSVP Status
3. ✅ Filter by Dietary Restrictions
4. ✅ Search with Multiple Filters

### Test Bulk Operations

Navigate to: **"5. Bulk Operations"** folder

Run these requests:
1. ✅ Create Bulk Guests (creates 3 guests)
2. ✅ Bulk Update Guest Status (updates all to "attending")
3. ✅ Bulk Delete Guests (deletes selected guests)

### Test Sorting

Navigate to: **"4. Sorting & Pagination"** folder

Run these requests:
1. ✅ Sort by First Name (Ascending)
2. ✅ Sort by RSVP Status (Descending)
3. ✅ Pagination - Page 1

## ⚡ Common Workflows

### Workflow 1: Create and Manage Multiple Guests

```
1. POST /api/v1/events/{event_id}/guests/bulk
   → Creates 3 guests at once

2. GET /api/v1/events/{event_id}/guests
   → View all created guests

3. PATCH /api/v1/events/{event_id}/guests/bulk-update
   → Update all to "attending"

4. GET /api/v1/events/{event_id}/guests/stats
   → View updated statistics
```

### Workflow 2: Test RSVP Flow (Public)

```
1. GET /api/v1/events/{event_id}/guests/{guest_id}/rsvp-token
   → Get RSVP token (admin only)

2. GET /api/v1/events/rsvp/{rsvp_token}
   → Guest views their invitation (no auth)

3. POST /api/v1/events/rsvp/{rsvp_token}
   → Guest submits RSVP (no auth)

4. GET /api/v1/events/{event_id}/guests/stats
   → View updated RSVP statistics
```

### Workflow 3: Search and Filter

```
1. POST /api/v1/events/{event_id}/guests/bulk
   → Create diverse guest list

2. GET /api/v1/events/{event_id}/guests?has_dietary_restrictions=true
   → Find guests with dietary needs

3. GET /api/v1/events/{event_id}/guests/search?q=vegan
   → Search for specific restriction

4. GET /api/v1/events/{event_id}/guests/dietary-restrictions
   → Get full dietary restrictions list
```

## 🐛 Troubleshooting

### Error: 401 Unauthorized

**Problem:** Authentication token expired or not set

**Solution:**
```
1. Run "Login (Get Auth Token)" request
2. Verify response shows: "access_token": "..."
3. Check collection variables (👁️ icon) shows auth_token
4. Try your request again
```

### Error: 404 Event Not Found

**Problem:** No test event created or event_id not set

**Solution:**
```
1. Run "Create Test Event" request
2. Verify response shows: "id": "..."
3. Check collection variables shows event_id
4. Try your request again
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

### Error: Database Connection

**Problem:** PostgreSQL not running

**Solution:**
```bash
# Check if running
docker ps | grep party-time-db

# If not, start it
docker-compose up -d postgres
```

## 📈 Expected Results

After running the complete test suite, you should see:

### Test Summary
```
✅ Total Tests: 30+
✅ Passed: 30+
❌ Failed: 0
⏱️ Duration: ~15 seconds
```

### Created Resources
```
✅ 1 Test Event
✅ 5+ Test Guests
✅ RSVP Tokens Generated
✅ Statistics Calculated
```

### Tested Features
```
✅ CRUD Operations (Create, Read, Update, Delete)
✅ Search by Name, Email, Phone
✅ Filter by RSVP Status, Dietary Restrictions, Plus Ones
✅ Sort by 7 different fields
✅ Bulk Create, Update, Delete
✅ Guest Statistics
✅ RSVP Management (Public & Private)
```

## 🎉 Success Checklist

Run through this checklist to verify everything works:

- [ ] Backend server is running on port 8000
- [ ] PostgreSQL database is running
- [ ] Can login and get auth token
- [ ] Can create test event
- [ ] Can create single guest
- [ ] Can create bulk guests
- [ ] Can search guests by name
- [ ] Can filter by RSVP status
- [ ] Can sort guests
- [ ] Can update guest info
- [ ] Can bulk update status
- [ ] Can get guest statistics
- [ ] Can submit RSVP (public endpoint)
- [ ] Can delete guest
- [ ] Can bulk delete guests

## 📚 Next Steps

1. **Explore Advanced Features**
   - Try combining multiple filters
   - Test different sort orders
   - Experiment with pagination

2. **Test Edge Cases**
   - Try creating duplicate emails
   - Test invalid RSVP statuses
   - Verify authorization (try without token)

3. **Generate Reports**
   ```bash
   newman run postman/Guest-API-Collection.json \
     --reporters cli,html,json \
     --reporter-html-export report.html \
     --reporter-json-export report.json
   ```

4. **Integrate with CI/CD**
   - Add Newman to your GitHub Actions
   - Run tests automatically on push
   - Generate coverage reports

## 🆘 Getting Help

- **API Documentation**: http://localhost:8000/docs
- **Backend Logs**: `tail -f backend/logs/app.log`
- **Database**: `docker exec -it party-time-db psql -U party_admin -d party_time`
- **README**: See `postman/README.md` for detailed documentation

## ✨ Pro Tips

1. **Use Variables** - The collection automatically saves IDs, use them!
2. **Check Tests** - Each request has automated tests in the "Tests" tab
3. **Console Logs** - Open Postman console (Ctrl+Alt+C) to see debug output
4. **Environment** - Create different environments for dev/staging/prod
5. **Organize** - Star ⭐ frequently used requests

---

**You're all set! Happy Testing! 🚀**
