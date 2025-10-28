# Manual Test: Number Field Validation & Budget Decimal Fix

## Issues Fixed

### Issue 1: Validation on Empty Fields
When users delete all digits from number input fields, they now show validation errors instead of resetting to the previous value.

**Fixed Fields:**
1. Maximum guest limit (Event Settings step)
2. Total event budget (Event Settings step)

### Issue 2: Budget Decimal Display
Budget field now only accepts whole dollar amounts (no cents). Previously, the field would display "1000.00" when navigating between steps, preventing progression.

**Fix:**
- Changed from `step="0.01"` to `step="1"` (whole dollars only)
- Values are rounded to nearest dollar automatically
- Existing decimal values in localStorage auto-corrected on display

## Test Steps

### Prerequisites
1. Start the backend server:
   ```bash
   cd backend && source .venv/bin/activate
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Start the frontend server:
   ```bash
   cd frontend && npm run dev
   ```

3. Open browser to: http://localhost:3000/events/new

### Test Case 1: Delete All Digits Shows Error
1. Navigate to "Event Settings" step (Step 4)
2. In the "Maximum guest limit" field, enter a number (e.g., "50")
3. Select all text and press Delete/Backspace to clear the field
4. **Expected Result**:
   - Field shows a red border
   - Error message appears below: "Must have at least 1 guest"
   - "Continue" button should be disabled (form is invalid)

### Test Case 2: Re-entering Valid Number Clears Error
1. After triggering the error (from Test Case 1)
2. Type a valid number (e.g., "100")
3. **Expected Result**:
   - Red border disappears
   - Error message disappears
   - "Continue" button becomes enabled

### Test Case 3: Leaving Field Empty Initially is OK
1. Create a new event
2. On "Event Settings" step, do NOT enter anything in "Maximum guest limit"
3. Click "Continue"
4. **Expected Result**:
   - No error shown (field is optional)
   - Form proceeds to next step

### Test Case 4: Invalid Range Shows Different Error
1. In the "Maximum guest limit" field, enter "0"
2. **Expected Result**:
   - Error message: "Must have at least 1 guest"

### Test Case 5: Budget Field - Delete All Digits Shows Error
1. Navigate to "Event Settings" step (Step 4)
2. In the "Total event budget" field, enter a number (e.g., "5000")
3. Select all text and press Delete/Backspace to clear the field
4. **Expected Result**:
   - Field shows a red border
   - Error message appears below: "Budget must be at least $0"
   - "Continue" button should be disabled (form is invalid)

### Test Case 6: Budget Field - Re-entering Valid Number Clears Error
1. After triggering the error (from Test Case 5)
2. Type a valid number (e.g., "10000")
3. **Expected Result**:
   - Red border disappears
   - Error message disappears
   - "Continue" button becomes enabled

### Test Case 7: Budget Field - No Decimal Places Allowed
1. Navigate to "Event Settings" step (Step 4)
2. In the "Total event budget" field, try to enter "1000.50"
3. **Expected Result**:
   - Field automatically rounds to "1001" (no decimal point shown)
   - Input field does not allow typing decimal point

### Test Case 8: Budget Field - Navigation Between Steps Preserves Whole Numbers
1. In "Event Settings" step, enter budget "5000"
2. Click "Continue" to go to RSVP Customization step
3. Click "Back" to return to Event Settings step
4. **Expected Result**:
   - Budget field shows "5000" (not "5000.00")
   - No unwanted decimal places
   - User can proceed without modifying the field

## Code Changes Summary

### 1. Validation Schema for Max Guests ([event.ts:160-175](frontend/src/lib/validations/event.ts#L160-L175))
```typescript
max_guests: z
  .union([z.number(), z.null(), z.undefined()])
  .refine(
    (val) => {
      // null means user deleted the value - show error
      if (val === null) return false;
      // undefined means no value entered yet - valid (no limit)
      if (val === undefined) return true;
      // number must be in valid range
      return val >= 1 && val <= 10000;
    },
    {
      message: "Must have at least 1 guest",
    }
  )
  .transform((val) => (val === null ? undefined : val)),
```

### 2. Validation Schema for Budget ([event.ts:176-191](frontend/src/lib/validations/event.ts#L176-L191))
```typescript
budget_total: z
  .union([z.number(), z.null(), z.undefined()])
  .refine(
    (val) => {
      // null means user deleted the value - show error
      if (val === null) return false;
      // undefined means no value entered yet - valid (no budget set)
      if (val === undefined) return true;
      // number must be in valid range
      return val >= 0 && val <= 10000000;
    },
    {
      message: "Budget must be at least $0",
    }
  )
  .transform((val) => (val === null ? undefined : val)),
```

### 3. Component Logic - Max Guests ([SettingsStep.tsx:173-186](frontend/src/components/events/EventForm/SettingsStep.tsx#L173-L186))
```typescript
onChange={(e) => {
  const strValue = e.target.value
  if (strValue === '') {
    // Set to null to trigger validation error
    field.onChange(null)
    handleFieldChange('max_guests', null)
  } else {
    const numValue = parseInt(strValue, 10)
    if (!isNaN(numValue)) {
      field.onChange(numValue)
      handleFieldChange('max_guests', numValue)
    }
  }
}}
onBlur={field.onBlur}  // Triggers validation on blur
```

### 4. Component Logic - Budget ([SettingsStep.tsx:244-281](frontend/src/components/events/EventForm/SettingsStep.tsx#L244-L281))
```typescript
// Updated label (no decimal warning)
label="Total event budget (optional)"

// Auto-round displayed value to whole dollars
value={
  field.value !== null && field.value !== undefined
    ? Math.round(field.value).toString()
    : ""
}

// Round input to whole dollars
onChange={(e) => {
  const strValue = e.target.value
  if (strValue === '') {
    // Set to null to trigger validation error
    field.onChange(null)
    handleFieldChange('budget_total', null)
  } else {
    // Round to whole dollar amount (no cents)
    const numValue = Math.round(parseFloat(strValue))
    if (!isNaN(numValue)) {
      field.onChange(numValue)
      handleFieldChange('budget_total', numValue)
    }
  }
}}
onBlur={field.onBlur}

// Changed step from "0.01" to "1" (whole dollars only)
step="1"
```

## Technical Details

- **Form Mode**: `onChange` - validation triggers on every change
- **Validation Schema**: Zod with custom refinement
- **Three States for Fields**:
  - `undefined`: Field never touched or left empty (valid - optional field)
  - `null`: Field was cleared after having a value (invalid - show error)
  - `number`: Valid number entered (valid within range)
- **Budget Rounding**:
  - Input: `Math.round(parseFloat(strValue))` rounds any decimal input
  - Display: `Math.round(field.value).toString()` rounds stored values on display
  - Step: `"1"` prevents browser from showing decimal UI
  - Result: All budget values stored and displayed as whole integers

## Build Verification

✅ Production build successful:
```bash
cd frontend && npm run build
```

All TypeScript checks passed with no errors.

## Summary of All Changes

**Files Modified:**
1. `frontend/src/lib/validations/event.ts` - Updated validation for both fields
2. `frontend/src/components/events/EventForm/SettingsStep.tsx` - Updated both input handlers

**Issues Resolved:**
1. ✅ Max guests field: Shows error when emptied (not reset to previous value)
2. ✅ Budget field: Shows error when emptied (not reset to previous value)
3. ✅ Budget field: No longer displays decimal places (e.g., "1000" not "1000.00")
4. ✅ Budget field: Auto-rounds decimal input to whole dollars
5. ✅ Budget field: Navigation between steps preserves whole numbers
6. ✅ Budget field: Existing localStorage data with decimals auto-corrected
