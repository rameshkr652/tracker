// src/styles/index.js - Main Style Export Hub
import { colors } from './base/colors';
import { typography } from './base/typography';
import { spacing } from './base/spacing';
import { layout } from './base/layout';
import { buttonStyles } from './components/buttons';
import { cardStyles } from './components/cards';
import { formStyles } from './components/forms';
import { lightTheme } from './themes/light';

// Global Style System Export
export const GlobalStyles = {
  colors,
  typography,
  spacing,
  layout,
  components: {
    buttons: buttonStyles,
    cards: cardStyles,
    forms: formStyles,
  },
  theme: lightTheme,
};

// Quick access helpers
export const { 
  primaryColor, 
  successColor, 
  errorColor, 
  warningColor,
  backgroundColor,
  surfaceColor,
  textColor,
  secondaryTextColor 
} = colors;

export const {
  headerFont,
  bodyFont,
  captionFont,
  h1, h2, h3, h4,
  body1, body2,
  caption
} = typography;

export const {
  xs, sm, md, lg, xl,
  containerPadding,
  cardPadding,
  buttonPadding
} = spacing;

// Common combined styles for quick use
export const commonStyles = {
  // Screen containers
  screenContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
    paddingHorizontal: containerPadding,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: backgroundColor,
  },

  // Centered content
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: containerPadding,
  },

  // Card containers
  cardContainer: {
    backgroundColor: surfaceColor,
    borderRadius: 12,
    padding: cardPadding,
    marginVertical: sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  // Flex helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Text styles
  headerText: {
    ...h1,
    color: textColor,
    textAlign: 'center',
    marginBottom: lg,
  },

  subHeaderText: {
    ...h3,
    color: secondaryTextColor,
    textAlign: 'center',
    marginBottom: md,
  },

  bodyText: {
    ...body1,
    color: textColor,
    lineHeight: 24,
  },

  captionText: {
    ...caption,
    color: secondaryTextColor,
  },

  // Status styles
  successText: {
    ...body1,
    color: successColor,
    fontWeight: '600',
  },

  errorText: {
    ...body1,
    color: errorColor,
    fontWeight: '600',
  },

  warningText: {
    ...body1,
    color: warningColor,
    fontWeight: '600',
  },
};

export default GlobalStyles;