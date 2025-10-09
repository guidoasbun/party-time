# Party-Time API Testing with Postman

This guide explains how to use the comprehensive Postman collection to test all Party-Time API endpoints.

## 📁 Files Included

- `Party-Time-API-Tests.postman_collection.json` - Complete API test collection
- `Party-Time-Environment.postman_environment.json` - Environment variables
- `POSTMAN_TESTING_GUIDE.md` - This guide

## 🚀 Setup Instructions

### 1. Import Files into Postman

1. Open Postman Desktop App
2. Click **Import** in the top left
3. Drag and drop both JSON files or click **Upload Files**:
   - `Party-Time-API-Tests.postman_collection.json`
   - `Party-Time-Environment.postman_environment.json`
4. Click **Import**

### 2. Select Environment

1. In the top right corner, select **Party-Time Development** environment
2. The environment includes your test credentials:
   - Email: `guido@asbun.io`
   - Password: `Barracuda007!!`

### 3. Start the API Server

Make sure your FastAPI server is running:
```bash
cd backend
source .venv/bin/activate
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## 📋 Testing Workflow

### Step 1: Health Checks
Run the **🚀 Health Checks** folder first:
- ✅ Root Endpoint - Verify API is running
- ✅ Health Check - Check server health  
- ✅ OpenAPI Docs - Access documentation

### Step 2: Authentication
Run the **🔐 Authentication** folder:
1. **Register User** (if needed) - Create account
2. **Login User** ⭐ - **Start here!** Gets access token automatically
3. **Get Current User** - Verify authentication
4. **Protected Route Test** - Test JWT validation

### Step 3: Events Management
Run the **🎉 Events Management** folder:
1. **Create Event** ⭐ - Creates test event, saves ID
2. **Get All Events** - List user's events
3. **Get Event by ID** - Retrieve specific event
4. **Search Events** - Test search functionality
5. **Update Event** - Modify event details
6. **Update Event Status** - Change status to active
7. **Get Event Stats** - View statistics
8. **Get Public Events** - Test public endpoint

### Step 4: Guest Management  
Run the **👥 Guest Management** folder:
1. **Add Single Guest** ⭐ - Creates test guest, saves ID
2. **Add Multiple Guests (Bulk)** - Bulk creation
3. **Get All Guests** - List event guests
4. **Get Guests with Filters** - Test filtering
5. **Get Single Guest** - Retrieve specific guest
6. **Update Guest** - Modify guest details
7. **Get Guest Stats** - View guest statistics
8. **Get Dietary Restrictions** - Special dietary needs
9. **Send Invitation (Mock)** - Mark invitation sent

### Step 5: RSVP System (Public)
Run the **📝 RSVP System (Public)** folder:
1. **Get Guest by RSVP Token** - Public guest lookup
2. **Submit RSVP - Attending** - Accept invitation
3. **Submit RSVP - Not Attending** - Decline invitation

*Note: You'll need to manually get an RSVP token from a guest record or database*

### Step 6: Budget Management
Run the **💰 Budget Management** folder:
1. **Create Budget Category** ⭐ - Creates category, saves ID
2. **Get Budget Categories** - List categories
3. **Create More Categories** - Additional categories
4. **Update Budget Category** - Modify category
5. **Create Expense** ⭐ - Creates expense, saves ID  
6. **Get Expenses** - List all expenses
7. **Get Expenses with Filters** - Test filtering
8. **Update Expense** - Modify expense
9. **Mark Expense as Paid** - Payment tracking
10. **Create More Expenses** - Additional test data
11. **Get Budget Summary** - Financial overview
12. **Get Category Spending Summary** - Category breakdown
13. **Get Recent Expenses** - Latest expenses
14. **Get Expenses by Category** - Category-specific expenses

### Step 7: Error Testing
Run the **🚨 Error Testing** folder:
- Test various error scenarios (404, 422, 401, 400)
- Verify proper error handling and responses

### Step 8: Cleanup (Optional)
Run the **🧹 Cleanup** folder to delete test resources:
1. **Delete Expense** - Remove test expense
2. **Delete Budget Category** - Remove test category  
3. **Delete Guest** - Remove test guest
4. **Delete Event** - Remove test event (cascades)

## 🔧 Environment Variables

The collection uses these variables (automatically managed):

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `base_url` | API base URL | ✅ |
| `api_version` | API version prefix | ✅ |
| `access_token` | JWT token from login | ✅ |
| `test_event_id` | Created event ID | ✅ |
| `test_guest_id` | Created guest ID | ✅ |
| `test_category_id` | Created category ID | ✅ |
| `test_expense_id` | Created expense ID | ✅ |
| `rsvp_token` | Guest RSVP token | ❌ Manual |

## 🎯 Key Features

### Automatic Token Management
- Login request automatically saves JWT token
- All protected endpoints use the token automatically
- No manual copy/paste needed!

### Resource ID Tracking  
- Created resources automatically save their IDs
- Subsequent requests use the saved IDs
- Complete workflow automation

### Comprehensive Coverage
- ✅ **83 API endpoints** covered
- ✅ **Authentication** flow
- ✅ **CRUD operations** for all models
- ✅ **Public endpoints** (RSVP system)
- ✅ **Analytics** and reporting
- ✅ **Error scenarios** testing
- ✅ **Data validation** testing

### Test Scenarios
- **Happy path** - Normal successful operations  
- **Edge cases** - Boundary conditions
- **Error handling** - Invalid data, missing resources
- **Authorization** - Protected vs public endpoints
- **Validation** - Schema validation testing

## 📊 Expected Results

### Successful Responses
- **200 OK** - Successful GET/PUT/PATCH requests
- **201 Created** - Successful POST requests  
- **204 No Content** - Successful DELETE requests

### Error Responses
- **400 Bad Request** - Invalid data, duplicates
- **401 Unauthorized** - Missing/invalid authentication
- **404 Not Found** - Resource doesn't exist
- **422 Unprocessable Entity** - Validation errors

## 🐛 Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Run "Login User" request first
   - Check access token is saved in environment
   
2. **404 Not Found**  
   - Ensure previous requests succeeded
   - Check IDs are saved in environment variables
   
3. **Connection Refused**
   - Verify FastAPI server is running on port 8000
   - Check `base_url` in environment settings

### Tips
- Run requests in order for the best experience
- Check the **Tests** tab for automatic validations
- Use **Console** (View > Show Postman Console) for debugging
- Environment variables are case-sensitive

## 🎉 Ready to Test!

1. Import the collection and environment
2. Start with **Login User** 
3. Follow the testing workflow above
4. Explore the comprehensive API functionality!

The collection provides a complete testing experience for the Party-Time API, covering all endpoints with realistic test data and automatic token management.