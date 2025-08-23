// src/styles/index.js - Fixed Main Style Export Hub
import colors, { getDebtColor, getBankColor, getCardTypeColor } from './base/colors';
import typography from './base/typography';
import spacing, { getShadow, getPadding, getMargin } from './base/spacing';
import layout from './base/layout';

// Simple direct exports
export { colors };
export { typography };
export { spacing };
export { layout };
export { getShadow };
export { getDebtColor, getBankColor, getCardTypeColor };

// Common combined styles for quick use
export const commonStyles = {
  // Screen containers
  screenContainer: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: colors.backgroundColor,
  },

  // Centered content
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
  },

  // Card containers
  cardContainer: {
    backgroundColor: colors.surfaceColor,
    borderRadius: spacing.borderRadius.large,
    padding: spacing.cardPadding,
    marginVertical: spacing.sm,
    ...getShadow(3),
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
};

export default {
  colors,
  typography, 
  spacing,
  layout,
  commonStyles,
};