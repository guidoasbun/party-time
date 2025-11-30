# Venue API Testing Guide

Comprehensive testing guide for Party-Time Venue API endpoints.

**Phase 7.1.1: Google Places API Integration**
**Last Updated:** November 30, 2025
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
8. [Test Execution Order](#test-execution-order)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start

**Get up and running in 5 steps:**

1. **Start backend server:**
   ```bash
   cd backend
   source .venv/bin/activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Import collection and environment into Postman:**
   - Drag and drop `Venue-API-Tests.postman_collection.json` into Postman
   - Drag and drop `Venue-API-Local.postman_environment.json` into Postman

3. **Configure environment variables:**
   - Select "Venue API - Local" environment in Postman
   - Set `event_id` to a valid UUID from your database

4. **Authenticate:**
   - Run "1. Setup & Authentication" > "Login - Get Access Token"
   - Token automatically saved to collection variables

5. **Run tests:**
   - Use "Run collection" to execute all 24 requests sequentially
   - Or run individual folders/requests as needed

---

## Prerequisites

### Required Services

- Docker Desktop - Must be running
- PostgreSQL - Docker container running on port 5432
- Backend API - FastAPI server on http://localhost:8000
- Test Data - At least 1 event in database

### Check Services Status

```bash
# Check Docker containers
docker ps | grep party-time

# Expected output:
# party-time-db    postgres:16-alpine   Up X minutes   0.0.0.0:5432->5432/tcp

# Test backend health
curl http://localhost:8000/health

# Expected output:
# {"status":"healthy"}
```

### Test Data Requirements

You need:
- **1 Event** - Any event type (Wedding, Birthday, Corporate, etc.)
- **User Account** - With email/password for authentication

**Get test data UUIDs:**

```bash
# Get your event ID
export PGPASSWORD=party_secure_2024
psql -h localhost -U party_admin -d party_time -c "SELECT id, name FROM events LIMIT 5;"
```

### Google Places API Key

The backend must have a valid Google Places API key configured:

```bash
# Check backend/.env
GOOGLE_PLACES_API_KEY=your-api-key-here
```

---

## Installation

### Option 1: Drag and Drop (Easiest)

1. Open Postman
2. Drag `Venue-API-Tests.postman_collection.json` into Postman window
3. Drag `Venue-API-Local.postman_environment.json` into Postman window
4. Done!

### Option 2: Import via UI

1. Open Postman
2. Click "Import" button (top left)
3. Click "Upload Files"
4. Select both files:
   - `Venue-API-Tests.postman_collection.json`
   - `Venue-API-Local.postman_environment.json`
5. Click "Import"

---

## Environment Setup

### Environment Variables Explained

The "Venue API - Local" environment includes these variables:

| Variable | Default Value | Description | Required |
|----------|--------------|-------------|----------|
| `base_url` | http://localhost:8000 | Backend API base URL | Yes |
| `api_version` | api/v1 | API version path segment | Yes |
| `test_email` | test@example.com | Login email | Yes |
| `test_password` | password123 | Login password | Yes |
| `event_id` | REPLACE_WITH_YOUR_EVENT_ID | UUID of test event | Yes |
| `test_place_id` | ChIJN1t_tDeuEmsRUsoyG83frY4 | Sample Google Place ID | Yes |
| `search_query` | wedding venue | Default search query | Yes |
| `search_latitude` | 40.7128 | NYC latitude for location tests | Yes |
| `search_longitude` | -74.0060 | NYC longitude for location tests | Yes |

### Auto-Saved Variables (Set During Execution)

These are automatically populated by test scripts:

| Variable | Set By Request | Description |
|----------|----------------|-------------|
| `access_token` | Login - Get Access Token | JWT bearer token |
| `user_id` | Login - Get Access Token | Logged-in user UUID |
| `venue_id` | Add Google Venue to Event | First venue UUID |
| `google_venue_id` | Add Google Venue to Event | Google venue UUID |
| `manual_venue_id` | Add Manual Venue to Event | Manual venue UUID |
| `second_venue_id` | Add Second Venue for Reorder | Second venue UUID |
| `search_place_id` | Search Venues - Basic Query | Place ID from search |

---

## Test Scenarios

Execute these scenarios in order to test all venue functionality:

### Scenario 1: Complete Happy Path Flow

**Goal:** Search venues, add to event, update, reorder, cleanup

**Steps:**
1. Run "1. Setup & Authentication" folder (3 requests)
2. Run "2. Google Places Search" folder
3. Run "4. Event Venue Management" > "Add Google Venue to Event"
4. Run "4. Event Venue Management" > "Add Manual Venue to Event"
5. Run "4. Event Venue Management" > "List Event Venues"
6. Run "6. Error Handling & Cleanup" cleanup requests

**Expected Result:** All requests return 200/201 status codes, venues added and removed successfully.

---

### Scenario 2: Google Places Search Operations

**Goal:** Test search with various filters

**Steps:**
1. Authenticate first
2. Search with basic query
3. Search with location (lat/lng/radius)
4. Search with filters (type, rating, max_results)
5. Test empty query validation

**Expected Result:** Search returns venue results, filters work correctly, validation errors for invalid input.

---

### Scenario 3: Venue Details Retrieval

**Goal:** Get venue details and photos from Google Places

**Steps:**
1. Use a valid place_id (from search or test_place_id)
2. Get venue details
3. Get venue photos
4. Test invalid place_id (404 error)

**Expected Result:** Details include name, address, location, optional fields. Photos return array with URLs.

---

### Scenario 4: Manual Venue Creation

**Goal:** Add a venue without Google Places

**Steps:**
1. Add manual venue with all required fields (name, address, lat, lng)
2. Verify is_manual = true in response
3. Update manual venue details (name, phone, etc.)
4. Verify Google venues cannot have location fields updated

**Expected Result:** Manual venues can be fully edited, Google venues only allow notes updates.

---

### Scenario 5: Venue Reordering

**Goal:** Change display order of event venues

**Steps:**
1. Add at least 2 venues to event
2. Get list and note order
3. Call reorder endpoint with reversed IDs
4. Verify new order in response
5. Test invalid venue ID error

**Expected Result:** Venues reordered successfully, error for invalid IDs.

---

### Scenario 6: Error Handling

**Goal:** Test error scenarios

**Steps:**
1. Add venue to non-existent event (404)
2. Add venue without auth token (401)
3. Add manual venue missing required fields (400)
4. Reorder with invalid venue ID (400)

**Expected Result:** Appropriate HTTP status codes and error messages.

---

## API Endpoint Reference

Complete reference of all 9 venue endpoints:

### Google Places Search

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/venues/search` | Search venues via Google Places | Yes |
| GET | `/api/v1/venues/{place_id}` | Get venue details | Yes |
| GET | `/api/v1/venues/{place_id}/photos` | Get venue photos | Yes |

### Event Venue Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/venues/events/{event_id}/venues` | Add venue to event | Yes |
| GET | `/api/v1/venues/events/{event_id}/venues` | List event venues | Yes |
| GET | `/api/v1/venues/events/{event_id}/venues/{venue_id}` | Get single venue | Yes |
| PUT | `/api/v1/venues/events/{event_id}/venues/{venue_id}` | Update venue | Yes |
| DELETE | `/api/v1/venues/events/{event_id}/venues/{venue_id}` | Remove venue | Yes |
| PUT | `/api/v1/venues/events/{event_id}/venues/reorder` | Reorder venues | Yes |

---

## Expected Responses

### Search Venues (200 OK)

```json
{
  "results": [
    {
      "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
      "name": "Sydney Opera House",
      "address": "Bennelong Point, Sydney NSW 2000",
      "location": {
        "latitude": -33.8567844,
        "longitude": 151.2152967
      },
      "rating": 4.7,
      "price_level": 3,
      "types": ["point_of_interest", "establishment"]
    }
  ],
  "total_results": 1,
  "query": "Sydney Opera House",
  "cached": false
}
```

### Get Venue Details (200 OK)

```json
{
  "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "name": "Sydney Opera House",
  "formatted_address": "Bennelong Point, Sydney NSW 2000, Australia",
  "location": {
    "latitude": -33.8567844,
    "longitude": 151.2152967
  },
  "phone": "+61 2 9250 7111",
  "website": "https://www.sydneyoperahouse.com/",
  "rating": 4.7,
  "user_ratings_total": 45000,
  "price_level": 3,
  "opening_hours": {
    "open_now": true,
    "periods": []
  },
  "photos": [
    {
      "url": "https://maps.googleapis.com/...",
      "width": 4032,
      "height": 3024,
      "attributions": ["A]
    }
  ]
}
```

### Add Venue to Event (201 Created)

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "event_id": "8e9f3d2a-1234-5678-9abc-def012345678",
  "name": "Sydney Opera House",
  "address": "Bennelong Point, Sydney NSW 2000, Australia",
  "latitude": -33.8567844,
  "longitude": 151.2152967,
  "google_place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4",
  "phone": "+61 2 9250 7111",
  "website": "https://www.sydneyoperahouse.com/",
  "rating": 4.7,
  "price_level": 3,
  "photo_url": "https://...",
  "is_manual": false,
  "notes": "Main ceremony venue",
  "display_order": 0,
  "created_at": "2025-11-30T12:00:00Z",
  "updated_at": "2025-11-30T12:00:00Z"
}
```

### List Event Venues (200 OK)

```json
{
  "venues": [
    {
      "id": "venue-uuid-1",
      "name": "Ceremony Venue",
      "is_manual": false,
      "display_order": 0
    },
    {
      "id": "venue-uuid-2",
      "name": "Reception Venue",
      "is_manual": true,
      "display_order": 1
    }
  ],
  "total": 2,
  "event_id": "event-uuid"
}
```

### Error Response (400 Bad Request)

```json
{
  "detail": "Name and address are required for manual venues"
}
```

### Error Response (404 Not Found)

```json
{
  "detail": "Event not found"
}
```

---

## Test Execution Order

### Sequential Execution (Recommended)

Run folders in this order to ensure dependencies are met:

1. **Setup & Authentication** - Get access token
2. **Google Places Search** - Search and get details
3. **Venue Details** - Test details and photos
4. **Event Venue Management** - Add, list, update, delete
5. **Venue Reordering** - Test reorder functionality
6. **Error Handling & Cleanup** - Test errors, cleanup data

**Why sequential?** Each folder builds on the previous:
- Access token needed for all authenticated requests
- Venue IDs needed for subsequent operations
- Cleanup removes test data at the end

---

## Troubleshooting

### Issue: "401 Unauthorized" on all requests

**Cause:** Missing or expired access token

**Solution:**
1. Run "1. Setup & Authentication" > "Login - Get Access Token"
2. Verify `access_token` is set in collection variables
3. Check that collection-level auth is set to "Bearer Token"
4. Ensure environment is selected (top right dropdown)

---

### Issue: "404 Event not found"

**Cause:** Invalid event_id or wrong user

**Solutions:**
1. Verify `event_id` in environment matches an existing event
2. Ensure logged-in user owns the event (planner_id = user_id)
3. Get valid event ID:
   ```bash
   psql -h localhost -U party_admin -d party_time -c "SELECT id, name, planner_id FROM events;"
   ```

---

### Issue: Google Places search returns empty results

**Cause:** Invalid API key or API not enabled

**Solutions:**
1. Check backend/.env has valid `GOOGLE_PLACES_API_KEY`
2. Verify API key has Places API (New) enabled in Google Cloud Console
3. Check API key restrictions (HTTP referrers, IP addresses)
4. Try a broader search query

---

### Issue: "Cannot read property 'id' of undefined" in test script

**Cause:** Previous request failed, variable not set

**Solutions:**
1. Run requests **in order** (dependencies)
2. Check previous request succeeded (200/201 status)
3. Verify response body has expected fields
4. Manually set missing variables in environment

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
docker-compose up -d postgres
```

---

## Additional Resources

- **API Documentation:** http://localhost:8000/docs (Swagger UI)
- **Backend Repository:** `/Users/rodrigo/code/party-time/backend`
- **Google Places API Docs:** https://developers.google.com/maps/documentation/places/web-service
- **Postman Documentation:** https://learning.postman.com/docs/

---

## Support

For issues or questions:
1. Check this guide first
2. Review API documentation at `/docs`
3. Check backend logs for error details
4. Review collection test scripts for debugging

---

**Happy Testing!**

*This guide is part of Phase 7.1.1: Google Places API Integration implementation.*
