# Email Template Preview Tests

This document contains Postman test requests for the new template preview endpoint added in Phase 5.2.2.

## Preview Endpoint Tests

### 1. Preview Invitation Template (with mock data)

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "invitation",
  "mock_data": {
    "guest_name": "John Doe",
    "event": {
      "name": "Summer Wedding Celebration",
      "type": "wedding",
      "description": "Join us for a beautiful summer wedding ceremony and reception",
      "start_date": "2024-08-15T16:00:00Z",
      "end_date": null,
      "venue_name": "Garden Terrace Venue",
      "venue_address": "123 Rose Lane",
      "location": "Los Angeles, CA 90210",
      "rsvp_deadline": "2024-07-15T00:00:00Z",
      "meal_options": ["Grilled Chicken", "Pan-Seared Salmon", "Vegetarian Pasta"],
      "dietary_restrictions_enabled": true,
      "planner": {
        "full_name": "Sarah & Michael"
      }
    },
    "guest": {
      "first_name": "John",
      "plus_one_allowed": true
    },
    "rsvp_url": "http://localhost:3000/rsvp/ABC123XY"
  }
}
```

**Expected Response:**
- Status: 200 OK
- Body contains `template_name`, `html_content`, `text_content`, `rendered_at`
- HTML content includes event name, guest name, RSVP button

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('template_name');
    pm.expect(jsonData).to.have.property('html_content');
    pm.expect(jsonData).to.have.property('text_content');
    pm.expect(jsonData).to.have.property('rendered_at');
});

pm.test("Template name is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.template_name).to.eql('invitation');
});

pm.test("HTML content includes personalization", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.html_content).to.include('John Doe');
    pm.expect(jsonData.html_content).to.include('Summer Wedding');
    pm.expect(jsonData.html_content).to.include('RSVP');
});
```

---

### 2. Preview Confirmation Template

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "confirmation",
  "mock_data": {
    "guest_name": "Jane Smith",
    "event": {
      "name": "Corporate Networking Event",
      "type": "networking",
      "start_date": "2024-09-20T18:00:00Z",
      "venue_name": "Downtown Conference Center",
      "venue_address": "456 Main Street",
      "location": "San Francisco, CA 94102",
      "planner": {
        "full_name": "TechCorp Events Team"
      }
    },
    "guest": {
      "first_name": "Jane",
      "rsvp_status": "ATTENDING",
      "meal_preference": "Vegetarian Pasta",
      "dietary_restrictions": "Gluten-free",
      "plus_one_name": "Robert Smith",
      "notes": "Looking forward to networking!"
    },
    "rsvp_url": "http://localhost:3000/rsvp/XYZ789AB"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("HTML includes RSVP status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.html_content).to.include('Attending');
});

pm.test("HTML includes guest details", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.html_content).to.include('Jane Smith');
    pm.expect(jsonData.html_content).to.include('Vegetarian Pasta');
    pm.expect(jsonData.html_content).to.include('Robert Smith');
});
```

---

### 3. Preview Reminder Template

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "reminder",
  "mock_data": {
    "guest_name": "Michael Johnson",
    "event": {
      "name": "Annual Gala Dinner",
      "type": "gala",
      "start_date": "2024-10-15T19:00:00Z",
      "venue_name": "Grand Hotel Ballroom",
      "venue_address": "789 Luxury Ave",
      "location": "New York, NY 10001",
      "rsvp_deadline": "2024-09-20T00:00:00Z",
      "planner": {
        "full_name": "Charity Foundation"
      }
    },
    "rsvp_url": "http://localhost:3000/rsvp/REMIND42"
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("HTML includes reminder messaging", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.html_content).to.include('RSVP');
    pm.expect(jsonData.html_content).to.include('Michael Johnson');
});
```

---

### 4. Preview Thank You Template

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "thank_you",
  "mock_data": {
    "guest_name": "Emily Davis",
    "event": {
      "name": "Birthday Celebration",
      "type": "birthday",
      "description": "A wonderful evening celebrating life and friendship",
      "start_date": "2024-06-10T17:00:00Z",
      "venue_name": "Rooftop Garden",
      "planner": {
        "full_name": "The Anderson Family"
      }
    },
    "guest": {
      "first_name": "Emily",
      "plus_one_name": "David"
    }
  }
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("HTML includes thank you message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.html_content).to.include('Thank');
    pm.expect(jsonData.html_content).to.include('Emily Davis');
});
```

---

### 5. Preview with Event ID (Real Data)

**Prerequisites:** Replace `{{event_id}}` and `{{guest_id}}` with actual UUIDs from your database.

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "invitation",
  "event_id": "{{event_id}}",
  "guest_id": "{{guest_id}}"
}
```

**Tests:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Real data rendered correctly", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.html_content).to.not.be.empty;
    pm.expect(jsonData.text_content).to.not.be.empty;
});
```

---

### 6. Error - Invalid Template Name

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "nonexistent_template",
  "mock_data": {
    "guest_name": "Test User"
  }
}
```

**Expected Response:**
- Status: 400 Bad Request
- Error message about template not found

**Tests:**
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('detail');
    pm.expect(jsonData.detail).to.include('template');
});
```

---

### 7. Error - Invalid Event ID

**Request:**
```
POST {{base_url}}/api/{{api_version}}/emails/preview
Content-Type: application/json

{
  "template_name": "invitation",
  "event_id": "00000000-0000-0000-0000-000000000000"
}
```

**Expected Response:**
- Status: 404 Not Found
- Error message about event not found

**Tests:**
```javascript
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});

pm.test("Error message mentions event", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.detail).to.include('Event');
    pm.expect(jsonData.detail).to.include('not found');
});
```

---

## Testing Workflow

### Manual Testing:
1. Start backend server: `cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Import this collection into Postman
3. Select "Email-API-Local" environment
4. Run tests in order

### Automated Testing:
```bash
# Run entire collection
newman run Email-API-Tests.postman_collection.json -e Email-API-Local.postman_environment.json

# Run specific folder
newman run Email-API-Tests.postman_collection.json -e Email-API-Local.postman_environment.json --folder "6. Template Preview"
```

---

## Expected Results

All 7 template preview tests should pass:
- ✅ Preview Invitation Template
- ✅ Preview Confirmation Template
- ✅ Preview Reminder Template
- ✅ Preview Thank You Template
- ✅ Preview with Real Event/Guest Data
- ✅ Error - Invalid Template Name
- ✅ Error - Invalid Event ID

**Success Criteria:**
- All preview requests return 200 OK with valid data
- HTML content includes personalization tokens
- Text content is generated for all templates
- Error cases return appropriate status codes
- Response times < 1000ms
