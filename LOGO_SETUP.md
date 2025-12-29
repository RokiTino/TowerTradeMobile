# 🏢 TowerTrade Logo Setup

## ⚠️ REQUIRED: Install the Official Logo

To complete the brand integration, you need to save the official TowerTrade logo image to the project.

### Step 1: Save the Logo File

Save the provided TowerTrade logo image as:
```
/workspace/assets/images/towertrade-logo.png
```

### Step 2: Logo Specifications

The logo should have these specifications:
- **Format**: PNG with transparent background
- **Recommended Size**: 1000x400 pixels (maintains 2.5:1 aspect ratio)
- **Quality**: High resolution (at least 300 DPI) for crisp display on all screen densities

### Step 3: Verify Installation

After saving the logo:
1. The logo will automatically appear throughout the app
2. No code changes are needed
3. The app will use the official logo on:
   - Login and Sign Up screens
   - Property detail headers and footers
   - Discovery feed header
   - Portfolio and Profile screens

### Current Status

Until you add the official logo, the app will display a text-based fallback with:
- Castle icon
- "TowerTrade" text
- "invest from home." tagline

### Brand Color Update

✅ The app's primary gold color has been updated to **#B08D57** to match the official logo's gold color exactly.

### Optional: Multiple Densities

For optimal display across all device types, you can optionally provide multiple densities:
- `towertrade-logo.png` - Standard resolution
- `towertrade-logo@2x.png` - 2x density (2000x800px)
- `towertrade-logo@3x.png` - 3x density (3000x1200px)

React Native will automatically select the appropriate density based on the device screen.

### Need Help?

If you encounter any issues:
1. Ensure the file is named exactly `towertrade-logo.png` (case-sensitive)
2. Ensure it's in the `/workspace/assets/images/` directory
3. Restart the Expo development server after adding the file
