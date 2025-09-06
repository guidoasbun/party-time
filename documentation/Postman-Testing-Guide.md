# Postman Testing Guide for Party-Time API

## 🚀 Quick Setup

### 1. Import the Collection
1. Open Postman
2. Click **Import** button
3. Select the file: `/Users/rodrigo/code/party-time/documentation/Party-Time-API-Postman-Collection.json`
4. The collection "Party-Time API" will appear in your collections

### 2. Environment Variables
The collection includes these pre-configured variables:
- `base_url`: http://localhost:8000
- `api_version`: /api/v1  
- `test_email`: postman-test@example.com
- `test_password`: PostmanTest123!
- `test_name`: Postman Test User
- `access_token`: (empty - for future use with real tokens)

## 📋 Test Scenarios

### Health Check Tests
**Folder: Health Check**
- ✅ **Root Health Check** - Tests basic API connectivity
- ✅ **Health Endpoint** - Tests dedicated health endpoint

### Authentication Flow Tests
**Folder: Authentication**

#### 1. Registration Tests
- ✅ **Register New User** - Creates a new test user
  - **Expected**: 200 OK with user details
  - **Tests**: User ID, email, name, unverified status
  
- ❌ **Register Duplicate User** - Tests duplicate prevention
  - **Expected**: 400 Bad Request
  - **Tests**: Error message contains "already exists"
  
- ❌ **Register Invalid Password** - Tests password validation
  - **Expected**: 422 Validation Error
  - **Tests**: Password requirements enforcement

#### 2. Email Verification Tests
- ❌ **Verify Email (Invalid Code)** - Tests with fake verification code
  - **Expected**: 400 Bad Request
  - **Tests**: "Invalid verification code" message
  
- ✅ **Resend Verification Code** - Tests code resending
  - **Expected**: 200 OK
  - **Tests**: "resent" message and verified=false

### Password Reset Tests
**Folder: Password Reset**
- ⚠️ **Request Password Reset** - May succeed or fail depending on user status
  - **Expected**: 200 OK (confirmed users) or 400 (unconfirmed users)
  - **Tests**: Handles both scenarios gracefully
  
- ❌ **Confirm Password Reset** - Tests with invalid reset code
  - **Expected**: 400 Bad Request
  - **Tests**: Error handling for invalid codes

### Protected Routes Tests
**Folder: Protected Routes**
- ❌ **Get User Info (No Token)** - Tests authentication requirement
  - **Expected**: 401 Unauthorized
  - **Tests**: "authenticated" error message
  
- ❌ **Get User Info (Invalid Token)** - Tests token validation
  - **Expected**: 401 Unauthorized
  - **Tests**: "credentials" error message
  
- ❌ **Protected Route Test** - Tests protected endpoint
  - **Expected**: 401 Unauthorized
  - **Tests**: Authentication requirement

### Profile Management Tests
**Folder: Profile Management**
- ❌ **Get Profile (No Auth Header)** - Tests header requirement
  - **Expected**: 422 Validation Error
  - **Tests**: Missing authorization header validation
  
- ❌ **Get Profile (Invalid Token)** - Tests access token validation
  - **Expected**: 401 Unauthorized
  - **Tests**: "access token" error message
  
- ❌ **Update Profile (Invalid Token)** - Tests profile update protection
  - **Expected**: 401 Unauthorized
  - **Tests**: Authentication requirement for updates

### Logout Tests
**Folder: Logout**
- ✅ **Logout User** - Tests logout functionality
  - **Expected**: 200 OK
  - **Tests**: Success message returned

## 🧪 Running Tests

### Option 1: Run Individual Requests
1. Select any request in the collection
2. Click **Send**
3. Check the **Test Results** tab for automated test results
4. Review response in **Body** tab

### Option 2: Run Entire Collection
1. Right-click on "Party-Time API" collection
2. Select **Run collection**
3. Choose which folders to run
4. Click **Run Party-Time API**
5. View comprehensive test results

### Option 3: Run Specific Folder
1. Right-click on any folder (e.g., "Authentication")
2. Select **Run folder**
3. View results for that test group

## 📊 Expected Results Summary

When you run the full collection, you should see:

### ✅ Passing Tests (9 requests)
- Root Health Check
- Health Endpoint  
- Register New User
- Resend Verification Code
- Request Password Reset (may vary)
- Get User Info (No Token) - correctly fails
- Get User Info (Invalid Token) - correctly fails
- Protected Route Test - correctly fails
- Logout User

### ❌ Expected Failures (8 requests)
These should fail as designed:
- Register Duplicate User
- Register Invalid Password  
- Verify Email (Invalid Code)
- Confirm Password Reset (Invalid Code)
- Get Profile (No Auth Header)
- Get Profile (Invalid Token)
- Update Profile (Invalid Token)
- Protected Route Test

**Total: ~17 tests covering all authentication scenarios**

## 🔍 Advanced Testing

### Custom Variables
You can modify the collection variables:
1. Click on "Party-Time API" collection
2. Go to **Variables** tab
3. Modify values like `test_email`, `test_password`, etc.
4. **Save** the collection

### Adding Real Token Tests
If you have a real access token:
1. Set the `access_token` variable
2. Modify requests to use `{{access_token}}`
3. Test actual authenticated endpoints

### Environment Setup
For different environments (dev/staging/prod):
1. Create new **Environment**
2. Set `base_url` to different values
3. Switch environments before running tests

## 🚨 Troubleshooting

### Server Not Running
If requests fail with connection errors:
```bash
cd /Users/rodrigo/code/party-time/backend
python -m uvicorn app.main:app --reload --port 8000
```

### AWS Credentials
If you get AWS-related errors:
- Check your `.env` file has correct AWS credentials
- Ensure AWS Cognito is properly configured
- Test users may be created in your Cognito User Pool

### Collection Import Issues
- Make sure you're importing the JSON file, not the markdown
- Try importing via URL if file import fails
- Verify Postman version supports v2.1.0 collections

## 📈 Next Steps

1. **Run the full collection** to verify all endpoints work
2. **Check AWS Cognito console** to see created test users
3. **Modify test data** to create different user scenarios
4. **Add more test cases** for edge cases specific to your use case
5. **Export results** for documentation or CI/CD integration

This comprehensive test suite ensures your authentication system is robust and ready for frontend integration!