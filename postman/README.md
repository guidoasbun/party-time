# Party-Time Guest API - Postman Testing Guide

## Overview

This Postman collection provides comprehensive testing for all Guest Management API endpoints implemented in **Phase 4.1.1**. The collection includes 30+ requests covering CRUD operations, search, filtering, sorting, bulk operations, and RSVP management.

## 📋 Prerequisites

1. **Backend Server Running**
   ```bash
   cd backend
   source .venv/bin/activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **PostgreSQL Database Running**
   ```bash
   docker-compose up -d postgres
   ```

3. **Postman Installed**
   - Download from: https://www.postman.com/downloads/

## 🚀 Quick Start

### 1. Import the Collection

1. Open Postman
2. Click **Import** (top left)
3. Select `Guest-API-Collection.json`
4. Collection will appear in your sidebar

### 2. Set Up Environment Variables

The collection uses the following variables (automatically managed):

- `base_url` - API base URL (default: `http://localhost:8000`)
- `api_version` - API version (default: `v1`)
- `auth_token` - JWT authentication token (auto-set after login)
- `event_id` - Test event ID (auto-set after creating event)
- `guest_id` - Guest ID (auto-set after creating guest)
- `rsvp_token` - RSVP token (auto-set when retrieved)

### 3. Run the Collection

**Option A: Run All Tests**
```
1. Click the collection name
2. Click "Run" button
3. Select all requests
4. Click "Run Party-Time Guest API"
```

**Option B: Run Individual Requests**
```
1. Navigate to any folder
2. Click a specific request
3. Click "Send"
```

## 📚 Collection Structure

### 1. Setup & Authentication
- **Login** - Get JWT token for authenticated requests
- **Create Test Event** - Create an event to test guest management

### 2. CRUD Operations
- ✅ Create Guest
- ✅ Get All Guests
- ✅ Get Single Guest
- ✅ Update Guest
- ✅ Delete Guest

### 3. Search & Filtering
- ✅ Search Guests by Name/Email/Phone
- ✅ Filter by RSVP Status (`pending`, `attending`, `not_attending`, `maybe`)
- ✅ Filter by Dietary Restrictions
- ✅ Filter by Plus One Allowed
- ✅ Combine Multiple Filters

### 4. Sorting & Pagination
- ✅ Sort by First Name (Ascending/Descending)
- ✅ Sort by RSVP Status
- ✅ Sort by Email, Created Date, etc.
- ✅ Pagination with `skip` and `limit`

### 5. Bulk Operations
- ✅ Create Multiple Guests at Once
- ✅ Bulk Update Guest Status
- ✅ Bulk Delete Guests

### 6. Guest Statistics
- ✅ Get Guest Stats (total invited, RSVP breakdown, response rate)
- ✅ Get Guests with Dietary Restrictions

### 7. RSVP Management
- ✅ Get RSVP Token (Admin)
- ✅ Get Guest by RSVP Token (Public - No Auth)
- ✅ Submit RSVP Response (Public - No Auth)
- ✅ Mark Invitation Sent

## 🔑 Authentication

### Using JWT Token

Most endpoints require authentication. The collection automatically handles this:

1. **Run "Login" request first**
   - Update the email/password in the request body
   - Token is automatically saved to `{{auth_token}}`

2. **All subsequent requests** use the token automatically via:
   ```
   Authorization: Bearer {{auth_token}}
   ```

### Public Endpoints (No Auth Required)

These endpoints don't require authentication:
- `GET /api/v1/events/rsvp/{rsvp_token}` - Get guest by RSVP token
- `POST /api/v1/events/rsvp/{rsvp_token}` - Submit RSVP response

## 📊 Test Scripts

Each request includes automated test scripts that verify:

### Response Status
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### Data Validation
```javascript
pm.test("Response has required fields", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('id');
    pm.expect(response).to.have.property('email');
});
```

### Auto-Save Variables
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.collectionVariables.set("guest_id", response.id);
}
```

## 🎯 Usage Examples

### Example 1: Create and Update a Guest

1. **Create Guest**
   ```
   POST /api/v1/events/{event_id}/guests
   ```
   ```json
   {
     "email": "john.doe@example.com",
     "first_name": "John",
     "last_name": "Doe",
     "phone": "+1234567890",
     "plus_one_allowed": true,
     "dietary_restrictions": "Vegetarian"
   }
   ```

2. **Update Guest** (uses auto-saved `guest_id`)
   ```
   PUT /api/v1/events/{event_id}/guests/{guest_id}
   ```
   ```json
   {
     "first_name": "Jane",
     "dietary_restrictions": "Vegan"
   }
   ```

### Example 2: Search and Filter

**Search by name:**
```
GET /api/v1/events/{event_id}/guests/search?q=John&limit=10
```

**Filter by RSVP status:**
```
GET /api/v1/events/{event_id}/guests?rsvp_status=attending
```

**Combine filters:**
```
GET /api/v1/events/{event_id}/guests?search=john&rsvp_status=attending&has_dietary_restrictions=true
```

### Example 3: Bulk Operations

**Create multiple guests:**
```
POST /api/v1/events/{event_id}/guests/bulk
```
```json
[
  {
    "email": "alice@example.com",
    "first_name": "Alice",
    "last_name": "Smith",
    "plus_one_allowed": false
  },
  {
    "email": "bob@example.com",
    "first_name": "Bob",
    "last_name": "Jones",
    "plus_one_allowed": true
  }
]
```

**Bulk update status:**
```
PATCH /api/v1/events/{event_id}/guests/bulk-update
```
```json
{
  "guest_ids": ["id1", "id2", "id3"],
  "rsvp_status": "attending"
}
```

### Example 4: Sorting

**Sort by first name (ascending):**
```
GET /api/v1/events/{event_id}/guests?sort_by=first_name&sort_order=asc
```

**Sort by RSVP status (descending):**
```
GET /api/v1/events/{event_id}/guests?sort_by=rsvp_status&sort_order=desc
```

**Available sort fields:**
- `first_name`
- `last_name`
- `email`
- `rsvp_status`
- `created_at`
- `invitation_sent_at`
- `rsvp_responded_at`

## 🧪 Running Automated Tests

### Via Postman UI

1. Click collection → "Run"
2. Select all requests
3. Click "Run Party-Time Guest API"
4. View test results in the runner

### Via Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run Guest-API-Collection.json

# Run with environment file
newman run Guest-API-Collection.json -e environment.json

# Generate HTML report
newman run Guest-API-Collection.json --reporters html
```

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Solution:**
1. Run the "Login" request first
2. Verify your credentials in the request body
3. Check that `{{auth_token}}` is set in collection variables

### Issue: 404 Event Not Found

**Solution:**
1. Run "Create Test Event" request first
2. Verify `{{event_id}}` is set in collection variables
3. Or manually set a valid event ID

### Issue: 404 Guest Not Found

**Solution:**
1. Run "Create Guest" request first
2. Verify `{{guest_id}}` is set in collection variables
3. Or manually set a valid guest ID

### Issue: Database Connection Error

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep party-time-db

# If not running, start it
docker-compose up -d postgres
```

### Issue: Backend Not Running

**Solution:**
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 Test Checklist

Use this checklist to verify all features are working:

### Basic CRUD
- [ ] Create guest
- [ ] Get all guests
- [ ] Get single guest
- [ ] Update guest
- [ ] Delete guest

### Search & Filtering
- [ ] Search by name
- [ ] Search by email
- [ ] Filter by RSVP status
- [ ] Filter by dietary restrictions
- [ ] Filter by plus one allowed
- [ ] Combine multiple filters

### Sorting
- [ ] Sort by first name (asc)
- [ ] Sort by first name (desc)
- [ ] Sort by RSVP status
- [ ] Sort by created date

### Pagination
- [ ] Get first page (skip=0, limit=10)
- [ ] Get second page (skip=10, limit=10)

### Bulk Operations
- [ ] Create bulk guests
- [ ] Bulk update status
- [ ] Bulk delete guests

### Statistics
- [ ] Get guest stats
- [ ] Get dietary restrictions list

### RSVP
- [ ] Get RSVP token
- [ ] Get guest by token (public)
- [ ] Submit RSVP (public)
- [ ] Mark invitation sent

## 🔄 API Endpoint Reference

### Authenticated Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/events/{event_id}/guests` | Create guest |
| GET | `/api/v1/events/{event_id}/guests` | List guests |
| GET | `/api/v1/events/{event_id}/guests/{guest_id}` | Get guest |
| PUT | `/api/v1/events/{event_id}/guests/{guest_id}` | Update guest |
| DELETE | `/api/v1/events/{event_id}/guests/{guest_id}` | Delete guest |
| POST | `/api/v1/events/{event_id}/guests/bulk` | Create bulk guests |
| PATCH | `/api/v1/events/{event_id}/guests/bulk-update` | Bulk update status |
| POST | `/api/v1/events/{event_id}/guests/bulk-delete` | Bulk delete guests |
| GET | `/api/v1/events/{event_id}/guests/search` | Search guests |
| GET | `/api/v1/events/{event_id}/guests/stats` | Get statistics |
| GET | `/api/v1/events/{event_id}/guests/dietary-restrictions` | Get dietary restrictions |
| GET | `/api/v1/events/{event_id}/guests/{guest_id}/rsvp-token` | Get RSVP token |
| POST | `/api/v1/events/{event_id}/guests/{guest_id}/send-invitation` | Mark invitation sent |

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/events/rsvp/{rsvp_token}` | Get guest by token |
| POST | `/api/v1/events/rsvp/{rsvp_token}` | Submit RSVP |

## 📝 Notes

- All IDs are UUIDs (format: `550e8400-e29b-41d4-a716-446655440000`)
- RSVP statuses: `pending`, `attending`, `not_attending`, `maybe`
- All date/time fields use ISO 8601 format
- Email validation is enforced on the backend
- Guest emails must be unique per event

## 🆘 Support

For issues or questions:
1. Check the backend logs: `tail -f backend/logs/app.log`
2. Check database connection: `docker ps | grep postgres`
3. Verify API docs: `http://localhost:8000/docs`
4. Review this README for troubleshooting steps

## 📊 Expected Response Formats

### Guest Object
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "event_id": "660e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "rsvp_status": "pending",
  "plus_one_allowed": true,
  "plus_one_name": null,
  "dietary_restrictions": "Vegetarian",
  "notes": "VIP guest",
  "invitation_sent_at": null,
  "rsvp_responded_at": null,
  "created_at": "2024-10-09T12:00:00Z",
  "updated_at": "2024-10-09T12:00:00Z"
}
```

### Guest Stats Object
```json
{
  "event_id": "660e8400-e29b-41d4-a716-446655440000",
  "total_invited": 50,
  "rsvp_responses": {
    "attending": 30,
    "not_attending": 5,
    "maybe": 3,
    "pending": 12
  },
  "total_attending_with_plus_ones": 35,
  "response_rate": 76.0
}
```

## ✅ Success!

You're now ready to test all Guest API endpoints! Start with the "Setup & Authentication" folder and work your way through each section.

Happy Testing! 🎉
