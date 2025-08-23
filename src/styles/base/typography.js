// src/styles/base/typography.js - Professional Typography System
export const typography = {
  // Font Families
  headerFont: 'System',         // iOS: SF Pro, Android: Roboto
  bodyFont: 'System',           // System default
  monospaceFont: 'monospace',   // For numbers/amounts
  
  // Font Weights
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  
  // Heading Styles
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  
  h2: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0,
  },
  
  h5: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  h6: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0,
  },
  
  // Body Text Styles
  body1: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  body2: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Small Text
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  
  overline: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  
  // Button Text
  buttonLarge: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  buttonMedium: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  buttonSmall: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Financial/Number Specific Styles
  currencyLarge: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 42,
    fontFamily: 'monospace',
    letterSpacing: -1,
  },
  
  currencyMedium: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 30,
    fontFamily: 'monospace',
    letterSpacing: -0.5,
  },
  
  currencySmall: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    fontFamily: 'monospace',
    letterSpacing: 0,
  },
  
  // Card-specific typography
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  cardSubtitle: {