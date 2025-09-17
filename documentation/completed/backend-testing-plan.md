# Backend Testing Plan - Party-Time

## Testing Framework: pytest

### Overview
This document outlines the comprehensive testing strategy for the Party-Time backend using pytest, which is the industry standard for Python testing and provides excellent integration with FastAPI.

## Why pytest?

1. **Industry Standard** - Most popular Python testing framework
2. **FastAPI Integration** - Excellent support for testing FastAPI applications
3. **Async Support** - Native async/await support for testing async endpoints
4. **Rich Feature Set** - Fixtures, parametrization, plugins, and more
5. **Already Specified** - Documented in CLAUDE.md as the chosen testing framework

## Recommended Testing Stack

### Core Testing Dependencies
```txt
# Core
pytest>=7.4.0              # Main testing framework
pytest-asyncio>=0.21.0     # Async test support
httpx>=0.24.0              # Async HTTP client for API testing

# Mocking & Fixtures
pytest-mock>=3.11.0        # Enhanced mocking capabilities
Faker>=19.0.0              # Generate realistic test data
factory-boy>=3.3.0         # Test data factories

# Coverage & Quality
pytest-cov>=4.1.0          # Code coverage reports
pytest-env>=0.8.0          # Environment variable management
pytest-xdist>=3.3.0        # Parallel test execution

# Code Quality (already planned)
black>=23.0.0              # Code formatting
flake8>=6.0.0              # Linting
mypy>=1.0.0                # Type checking
```

## Test Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Shared fixtures and configuration
│   ├── unit/                       # Unit tests for individual components
│   │   ├── __init__.py
│   │   ├── test_auth.py           # Auth utility functions
│   │   ├── test_models.py         # Data model validation
│   │   ├── test_utils.py          # Helper function tests
│   │   └── test_validators.py     # Custom validators
│   ├── integration/                # Integration tests for API endpoints
│   │   ├── __init__.py
│   │   ├── test_api_auth.py       # /api/v1/auth/* endpoints
│   │   ├── test_api_events.py     # /api/v1/events/* endpoints
│   │   ├── test_api_guests.py     # /api/v1/guests/* endpoints
│   │   ├── test_api_venues.py     # /api/v1/venues/* endpoints
│   │   └── test_api_budget.py     # /api/v1/budget/* endpoints
│   └── e2e/                        # End-to-end workflow tests
│       ├── __init__.py
│       └── test_workflows.py      # Complete user journeys
```

## Key Testing Patterns

### 1. FastAPI Test Client Setup
```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
```

### 2. Async Testing
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_async_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/async-endpoint")
    assert response.status_code == 200
```

### 3. Authentication Fixtures
```python
@pytest.fixture
def mock_cognito_token():
    """Generate a mock JWT token for testing"""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

@pytest.fixture
def auth_headers(mock_cognito_token):
    """Headers with authentication token"""
    return {"Authorization": f"Bearer {mock_cognito_token}"}

def test_protected_endpoint(client, auth_headers):
    response = client.get("/api/v1/protected", headers=auth_headers)
    assert response.status_code == 200
```

### 4. Database Testing
```python
@pytest.fixture
def test_db():
    """Create a test database session"""
    # Use SQLite in-memory or test PostgreSQL instance
    # Rollback transactions after each test
    pass

@pytest.fixture
def sample_user(test_db):
    """Create a sample user for testing"""
    user = User(
        email="test@example.com",
        name="Test User",
        cognito_id="test-cognito-id"
    )
    test_db.add(user)
    test_db.commit()
    return user
```

### 5. Mocking External Services
```python
@pytest.fixture
def mock_aws_cognito(mocker):
    """Mock AWS Cognito responses"""
    mock = mocker.patch('app.services.auth.verify_token')
    mock.return_value = {
        'sub': 'test-user-id',
        'email': 'test@example.com',
        'name': 'Test User'
    }
    return mock

@pytest.fixture
def mock_google_places(mocker):
    """Mock Google Places API responses"""
    mock = mocker.patch('app.services.venues.search_venues')
    mock.return_value = [
        {'place_id': '123', 'name': 'Test Venue'}
    ]
    return mock
```

## Test Categories

### Unit Tests
- Test individual functions and methods
- Mock all external dependencies
- Fast execution (< 1 second per test)
- High code coverage target (80%+)

### Integration Tests
- Test API endpoints with real database
- Mock external services (AWS, Google, etc.)
- Verify request/response contracts
- Test error handling and validation

### End-to-End Tests
- Test complete user workflows
- Minimal mocking (only external services)
- Verify business logic flows
- Performance benchmarking

## Testing Commands

```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html --cov-report=term

# Run specific test file
pytest tests/integration/test_api_auth.py

# Run specific test function
pytest tests/unit/test_auth.py::test_verify_token

# Run tests in parallel (faster execution)
pytest -n auto

# Run with verbose output
pytest -v

# Run only marked tests
pytest -m "auth"
pytest -m "not slow"

# Run and stop on first failure
pytest -x

# Run last failed tests
pytest --lf

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

## Test Markers

```python
# Mark slow tests
@pytest.mark.slow
def test_complex_workflow():
    pass

# Mark authentication tests
@pytest.mark.auth
def test_login():
    pass

# Mark tests requiring database
@pytest.mark.db
def test_create_event():
    pass

# Skip test conditionally
@pytest.mark.skipif(not os.getenv("COGNITO_CLIENT_ID"), reason="Requires AWS credentials")
def test_cognito_integration():
    pass
```

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: Backend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install -r requirements-test.txt
    
    - name: Run tests
      run: pytest --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

## Testing Best Practices

1. **Test Isolation** - Each test should be independent
2. **Clear Names** - Test names should describe what they test
3. **Arrange-Act-Assert** - Structure tests clearly
4. **One Assertion Per Test** - Keep tests focused
5. **Use Fixtures** - DRY principle for test setup
6. **Mock External Services** - Tests should not depend on external APIs
7. **Test Edge Cases** - Include boundary conditions and error scenarios
8. **Performance Tests** - Monitor response times for critical endpoints

## Coverage Goals

- **Overall Coverage**: 80% minimum
- **Critical Paths**: 95% (auth, payments, core business logic)
- **API Endpoints**: 90% 
- **Utility Functions**: 85%
- **Models/Schemas**: 75%

## Implementation Timeline

### Phase 1: Setup (Week 2-3)
- Install pytest and dependencies
- Create test structure
- Write conftest.py with basic fixtures
- Set up test database configuration

### Phase 2: Core Tests (Week 4-8)
- Authentication endpoint tests
- Event management tests
- Guest management tests
- RSVP system tests
- Budget tracking tests

### Phase 3: Integration (Week 9-10)
- External service mocking
- End-to-end workflow tests
- Performance testing
- Coverage optimization

### Phase 4: CI/CD (Week 11)
- GitHub Actions setup
- Automated test runs on PR
- Coverage reporting
- Test result badges

## Benefits for Party-Time

✅ **Fast Feedback** - Catch bugs during development
✅ **Regression Prevention** - Ensure new features don't break existing functionality
✅ **Documentation** - Tests serve as living documentation
✅ **Confidence** - Deploy with certainty
✅ **Quality Assurance** - Maintain high code quality standards
✅ **Team Collaboration** - Clear test specs help team understanding

## Current Testing Status

### Completed
- ✅ Frontend testing with Jest (173 passing tests)
- ✅ Authentication flow verified with Playwright
- ✅ Frontend-Backend integration confirmed

### To Be Implemented
- ⏳ Backend pytest setup
- ⏳ Unit tests for auth utilities
- ⏳ Integration tests for API endpoints
- ⏳ End-to-end workflow tests
- ⏳ CI/CD pipeline with automated testing

## Next Steps

1. Add pytest dependencies to requirements.txt
2. Create tests/ directory structure
3. Write initial conftest.py with fixtures
4. Implement tests for existing endpoints (/api/v1/auth/me, /api/v1/auth/protected)
5. Set up GitHub Actions workflow
6. Add pre-commit hooks for test execution

---

This testing strategy ensures the Party-Time backend maintains the same high quality standards as the frontend, providing comprehensive test coverage and confidence in the application's reliability.