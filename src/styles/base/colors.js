// src/styles/base/colors.js - Professional Color Palette
export const colors = {
  // Primary Brand Colors
  primaryColor: '#1E40AF',      // Professional Blue
  primaryLight: '#3B82F6',      // Light Blue
  primaryDark: '#1E3A8A',       // Dark Blue
  
  // Secondary Colors
  secondaryColor: '#10B981',    // Emerald Green
  secondaryLight: '#34D399',    // Light Emerald
  secondaryDark: '#059669',     // Dark Emerald
  
  // Status Colors
  successColor: '#10B981',      // Green for positive
  warningColor: '#F59E0B',      // Amber for warnings
  errorColor: '#EF4444',        // Red for errors/debt
  infoColor: '#3B82F6',         // Blue for info
  
  // Neutral Colors
  backgroundColor: '#F8FAFC',   // Light gray background
  surfaceColor: '#FFFFFF',      // White surface
  cardColor: '#FFFFFF',         // Card background
  borderColor: '#E2E8F0',       // Light border
  dividerColor: '#CBD5E1',      // Divider lines
  
  // Text Colors
  textColor: '#1F2937',         // Dark gray text
  secondaryTextColor: '#6B7280', // Medium gray text
  placeholderColor: '#9CA3AF',  // Light gray placeholder
  invertedTextColor: '#FFFFFF', // White text
  
  // Debt-Specific Colors (Traffic Light System)
  debtHigh: '#DC2626',          // Red - High debt/danger
  debtMedium: '#D97706',        // Orange - Medium debt/caution  
  debtLow: '#059669',           // Green - Low debt/safe
  debtFree: '#10B981',          // Bright Green - Debt free
  
  // Credit Card Colors
  cardVisa: '#1A1F71',          // Visa blue
  cardMastercard: '#EB001B',    // Mastercard red
  cardAmex: '#006FCF',          // Amex blue
  cardRupay: '#00A8CC',         // RuPay cyan
  cardGeneric: '#6B7280',       // Generic gray
  
  // Indian Bank Brand Colors
  hdfc: '#004C8F',              // HDFC blue
  sbi: '#22409A',               // SBI blue
  icici: '#F37920',             // ICICI orange
  axis: '#800080',              // Axis purple
  kotak: '#ED1C24',             // Kotak red
  
  // Gradient Colors
  gradientStart: '#1E40AF',     // Primary gradient start
  gradientEnd: '#3B82F6',       // Primary gradient end
  
  debtGradientStart: '#EF4444', // Debt gradient start
  debtGradientEnd: '#DC2626',   // Debt gradient end
  
  successGradientStart: '#10B981', // Success gradient start
  successGradientEnd: '#059669',   // Success gradient end
  
  // Overlay Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  lightOverlay: 'rgba(0, 0, 0, 0.2)',
  modalOverlay: 'rgba(0, 0, 0, 0.6)',
  
  // Interactive States
  activeColor: '#1E40AF',       // Active state
  inactiveColor: '#9CA3AF',     // Inactive state
  disabledColor: '#D1D5DB',     // Disabled state
  hoverColor: '#3B82F6',        // Hover state
  
  // Chart Colors (For debt visualization)
  chartPrimary: '#1E40AF',
  chartSecondary: '#10B981',
  chartTertiary: '#F59E0B',
  chartQuaternary: '#EF4444',
  chartFifth: '#8B5CF6',
  
  // Transparency variations
  transparent: 'transparent',
  semiTransparent: 'rgba(255, 255, 255, 0.9)',
};

// Color utility functions
export const getDebtColor = (debtAmount, creditLimit) => {
  const utilization = (debtAmount / creditLimit) * 100;
  
  if (utilization >= 80) return colors.debtHigh;
  if (utilization >= 50) return colors.debtMedium;
  if (utilization >= 20) return colors.debtLow;
  return colors.debtFree;
};

export const getBankColor = (bankName) => {
  const bank = bankName.toLowerCase();
  if (bank.includes('hdfc')) return colors.hdfc;
  if (bank.includes('sbi')) return colors.sbi;
  if (bank.includes('icici')) return colors.icici;
  if (bank.includes('axis')) return colors.axis;
  if (bank.includes('kotak')) return colors.kotak;
  return colors.cardGeneric;
};

export const getCardTypeColor = (cardType) => {
  const type = cardType.toLowerCase();
  if (type.includes('visa')) return colors.cardVisa;
  if (type.includes('mastercard') || type.includes('master')) return colors.cardMastercard;
  if (type.includes('amex') || type.includes('american')) return colors.cardAmex;
  if (type.includes('rupay')) return colors.cardRupay;
  return colors.cardGeneric;
};

export default colors;