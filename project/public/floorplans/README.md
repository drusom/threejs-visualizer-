# Floor Plans Directory

This directory contains floor plan images for storage units in the 3D warehouse visualization.

## Current Floor Plans

- `f280.png` - Shared floor plan for units **B2** and **C13**

## Floor Plan Assignment System

The system supports multiple ways to assign floor plans to units:

### 1. Unit Data with floorPlanUrl (Recommended)
Units can specify their floor plan in the unit data:
```javascript
'b2': { 
  name: 'b2', 
  size: '1,500 sq ft', 
  availability: 'Available', 
  amenities: 'Premium package',
  floorPlanUrl: '/floorplans/f280.png' 
}
```

### 2. Automatic Assignment
- **Units B2 and C13**: Automatically use `f280.png`
- **Other units**: Use default naming `{unitName}.png` (e.g., `a1.png` for unit A1)

## File Naming Convention

For automatic assignment, name files using the unit identifier in lowercase:
- `a1.png` - Floor plan for unit A1
- `c10.png` - Floor plan for unit C10
- `e3.png` - Floor plan for unit E3

## Supported Formats

- PNG (recommended)
- JPG/JPEG (also supported)

## Image Guidelines

- **Resolution**: 800x600 pixels or higher recommended
- **Aspect Ratio**: Any aspect ratio is supported (images will auto-scale)
- **File Size**: Keep under 2MB for optimal loading performance

## GitHub Deployment Notes

**IMPORTANT**: Ensure all PNG files are properly committed to Git:

1. Check that `.gitignore` doesn't exclude PNG files
2. Use `git add public/floorplans/*.png` to explicitly add images
3. Commit with `git commit -m "Add floor plan images"`
4. Verify files are tracked with `git ls-files public/floorplans/`

## Fallback Behavior

If a floor plan image is not found, the system displays a placeholder indicating "Floor Plan Not Available".

## Adding New Floor Plans

1. Create or obtain floor plan images for units
2. Either:
   - Add `floorPlanUrl` to unit data, OR
   - Name using convention `{unitId}.png` and place in this directory
3. Ensure files are committed to Git for deployment
4. The system will automatically load them in the unit details popup 