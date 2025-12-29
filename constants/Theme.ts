/**
 * TowerTrade Theme Constants
 * Premium real estate crowdfunding application
 */

export const Colors = {
  // Primary Palette
  towerGold: '#A67C4B',
  ebonyBlack: '#1A1A1A',
  pureWhite: '#FFFFFF',
  softSlate: '#E0E0E0',

  // Semantic Colors
  primary: '#A67C4B',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#666666',
  border: '#E0E0E0',
  inputBackground: '#F8F8F8',
  cardShadow: 'rgba(0, 0, 0, 0.08)',

  // Status Colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
};

export const Typography = {
  // Font Sizes
  heading1: 32,
  heading2: 28,
  heading3: 24,
  heading4: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,

  // Font Weights
  bold: '700' as const,
  semiBold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const Shadows = {
  card: {
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  button: {
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
};
