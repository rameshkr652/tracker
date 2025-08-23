// src/styles/base/spacing.js - Consistent Spacing System
export const spacing = {
  // Base spacing scale (8px grid system)
  xs: 4,      // 4px
  sm: 8,      // 8px  
  md: 16,     // 16px
  lg: 24,     // 24px
  xl: 32,     // 32px
  xxl: 48,    // 48px
  xxxl: 64,   // 64px
  
  // Semantic spacing
  containerPadding: 16,     // Standard container padding
  cardPadding: 16,          // Standard card padding
  buttonPadding: 12,        // Button internal padding
  inputPadding: 12,         // Input field padding
  sectionSpacing: 24,       // Between major sections
  itemSpacing: 8,           // Between list items
  
  // Screen-level spacing
  screenPadding: 16,        // Standard screen padding
  headerHeight: 56,         // Standard header height
  tabBarHeight: 60,         // Tab bar height
  statusBarHeight: 24,      // Status bar height (Android)
  
  // Component-specific spacing
  buttonSpacing: {
    small: 8,
    medium: 12,
    large: 16,
  },
  
  cardSpacing: {
    inner: 16,              // Inside card content
    outer: 16,              // Between cards
    margin: 8,              // Card margins
  },
  
  textSpacing: {
    tight: 2,               // Tight line spacing
    normal: 4,              // Normal spacing between text elements
    loose: 8,               // Loose spacing
  },
  
  // Form spacing
  formSpacing: {
    fieldGap: 16,           // Between form fields
    sectionGap: 24,         // Between form sections
    labelGap: 4,            // Between label and input
    helperGap: 4,           // Between input and helper text
  },
  
  // List spacing
  listSpacing: {
    itemGap: 8,             // Between list items
    groupGap: 16,           // Between list groups
    indent: 16,             // List item indentation
  },
  
  // Modal/Dialog spacing
  modalSpacing: {
    padding: 24,            // Modal content padding
    margin: 16,             // Modal margins
    buttonGap: 12,          // Between modal buttons
  },
  
  // Border radius (spacing-related)
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,              // Fully rounded
  },
  
  // Component heights (spacing-related)
  heights: {
    button: {
      small: 32,
      medium: 44,
      large: 56,
    },
    input: {
      small: 36,
      medium: 44,
      large: 52,
    },
    card: {
      compact: 80,
      medium: 120,
      expanded: 160,
    },
  },
  
  // Icon sizes (spacing-related)
  iconSizes: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  
  // Touch targets (minimum 44px for accessibility)
  touchTarget: {
    minimum: 44,            // Minimum touch target size
    comfortable: 48,        // Comfortable touch target
    large: 56,              // Large touch target
  },
};

// Spacing utility functions
export const getSpacing = (multiplier = 1, base = spacing.sm) => {
  return base * multiplier;
};

export const getVerticalSpacing = (size = 'md') => {
  return spacing[size] || spacing.md;
};

export const getHorizontalSpacing = (size = 'md') => {
  return spacing[size] || spacing.md;
};

export const getPadding = (vertical = 'md', horizontal = null) => {
  const v = spacing[vertical] || spacing.md;
  const h = horizontal ? (spacing[horizontal] || spacing.md) : v;
  
  return {
    paddingVertical: v,
    paddingHorizontal: h,
  };
};

export const getMargin = (vertical = 'md', horizontal = null) => {
  const v = spacing[vertical] || spacing.md;
  const h = horizontal ? (spacing[horizontal] || spacing.md) : v;
  
  return {
    marginVertical: v,
    marginHorizontal: h,
  };
};

export const getShadow = (elevation = 2) => {
  // Android shadow
  const androidShadow = {
    elevation: elevation,
  };
  
  // iOS shadow
  const iosShadow = {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation / 2,
    },
    shadowOpacity: 0.1 + (elevation * 0.02),
    shadowRadius: elevation * 1.5,
  };
  
  return {
    ...androidShadow,
    ...iosShadow,
  };
};

export default spacing;