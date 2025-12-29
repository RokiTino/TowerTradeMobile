# TowerTrade Logo Installation Instructions

## Required File
Please save the official TowerTrade logo as:
```
/workspace/assets/images/towertrade-logo.png
```

## Logo Specifications
- **Format**: PNG with transparent background
- **Recommended Size**: 1000x400 pixels (2.5:1 aspect ratio)
- **Quality**: High resolution for crisp display on all screen densities

## Color Consistency
The logo's gold color has been matched to the application theme:
- **Tower Gold**: #B08D57

## Usage
The logo is automatically used throughout the app via the `TowerTradeLogo` component:
- Login and Sign Up screens
- Property detail headers and footers
- Discovery feed header
- Other main navigation screens

## Alternative Formats
If you need different densities for optimal display:
- `towertrade-logo.png` - Main high-res logo
- `towertrade-logo@2x.png` - Optional 2x density
- `towertrade-logo@3x.png` - Optional 3x density

React Native will automatically select the appropriate density based on the device.
