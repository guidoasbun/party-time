# Test Data Assets

This directory contains sample files for testing and demonstrating Party-Time features.

## Sample Venue Floor Plan

**File**: `sample-venue-floor-plan.svg`

### Description
A professional sample floor plan of a grand ballroom venue designed for testing the Venue Layout Integration feature (Phase 6.2.2).

### Specifications
- **Format**: SVG (Scalable Vector Graphics)
- **Dimensions**: 1200px × 800px
- **File Size**: ~9KB
- **Features**:
  - Main Ballroom (850 sq ft)
  - Stage area
  - Kitchen and storage
  - Restrooms (Men's and Women's)
  - Main entrance with double doors
  - Side exit
  - Suggested areas: Bar, DJ Booth, Dance Floor

### How to Use

#### Option 1: Upload via Demo Page
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/demo/venue-layout`
3. Click **"Upload Floor Plan"** button
4. Select this file: `frontend/public/assets/test-data/sample-venue-floor-plan.svg`
5. Adjust opacity slider to see how the floor plan overlays with tables
6. Click the **"Special Areas"** tab to add venue features like:
   - Stage (already visible on floor plan)
   - Dance Floor (suggested placement shown)
   - Bar Area (suggested placement shown)
   - DJ Booth (suggested placement shown)
   - Obstacles, entrances, exits, etc.

#### Option 2: Direct URL Access
In production or after building, the file is accessible at:
```
/assets/test-data/sample-venue-floor-plan.svg
```

### Testing Features

This sample floor plan is ideal for testing:

1. **Floor Plan Upload**
   - Drag-and-drop functionality
   - File validation (format, size)
   - Preview generation
   - Base64 conversion

2. **Opacity Control**
   - Slider adjustment (0-100%)
   - Visual overlay with seating chart

3. **Lock/Unlock**
   - Prevent accidental changes
   - Lock toggle functionality

4. **Special Areas**
   - Add areas matching the floor plan (Stage, Kitchen, Bar, etc.)
   - Position and resize areas to match the layout
   - Test obstacle markers
   - Color customization

5. **Integration**
   - Layer ordering (floor plan → special areas → tables)
   - Theme support (light/dark mode)
   - Save/load functionality

### Creating Your Own Test Floor Plans

#### Supported Formats
- PNG (.png)
- JPEG (.jpg, .jpeg)
- SVG (.svg)

#### Size Limits
- Maximum: 5MB
- Recommended: Under 3MB for best performance

#### Where to Find Floor Plans
1. **Create Your Own**:
   - Draw.io / Diagrams.net (free)
   - Canva (free templates)
   - Lucidchart

2. **Download Free Plans**:
   - Unsplash: Search "floor plan"
   - Pexels: Search "venue layout"
   - FreePik: Search "event venue floor plan"

3. **Screenshot**:
   - Google Image Search
   - Event venue websites
   - Architecture blogs

#### Adding to This Directory
Simply place your test images in this directory:
```
frontend/public/assets/test-data/
├── sample-venue-floor-plan.svg (provided)
├── your-custom-floor-plan.png
└── wedding-venue-example.jpg
```

## Notes

- All files in this directory are for **testing and demonstration purposes only**
- The sample floor plan is a simplified representation and not based on a real venue
- Feel free to add more test assets as needed
- These files are committed to version control for consistent testing across environments

---

**Phase 6.2.2**: Venue Layout Integration
**Created**: November 2025
**Party-Time Event Planning Application**
