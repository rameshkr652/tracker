// src/components/common/Text.js - Professional Reusable Text Component
import React from 'react';
import { Text as RNText } from 'react-native';
import { colors, typography } from '../../styles';

const Text = ({ 
  children, 
  variant = 'body1', 
  color = 'primary',
  align = 'left',
  weight = null,
  size = null,
  style,
  numberOfLines,
  onPress,
  ...props 
}) => {
  
  // Get base typography style
  const getVariantStyle = () => {
    switch (variant) {
      case 'h1': return typography.h1;
      case 'h2': return typography.h2;
      case 'h3': return typography.h3;
      case 'h4': return typography.h4;
      case 'h5': return typography.h5;
      case 'h6': return typography.h6;
      case 'body1': return typography.body1;
      case 'body2': return typography.body2;
      case 'caption': return typography.caption;
      case 'overline': return typography.overline;
      case 'button': return typography.buttonMedium;
      case 'currency': return typography.currencyMedium;
      case 'currencyLarge': return typography.currencyLarge;
      case 'currencySmall': return typography.currencySmall;
      case 'cardTitle': return typography.cardTitle;
      case 'cardSubtitle': return typography.cardSubtitle;
      case 'cardNumber': return typography.cardNumber;
      default: return typography.body1;
    }
  };

  // Get color value
  const getColorValue = () => {
    switch (color) {
      case 'primary': return colors.textColor;
      case 'secondary': return colors.secondaryTextColor;
      case 'success': return colors.successColor;
      case 'error': return colors.errorColor;
      case 'warning': return colors.warningColor;
      case 'info': return colors.infoColor;
      case 'white': return colors.invertedTextColor;
      case 'placeholder': return colors.placeholderColor;
      case 'debtHigh': return colors.debtHigh;
      case 'debtMedium': return colors.debtMedium;
      case 'debtLow': return colors.debtLow;
      case 'debtFree': return colors.debtFree;
      default: return typeof color === 'string' ? color : colors.textColor;
    }
  };

  // Build combined style
  const combinedStyle = [
    getVariantStyle(),
    {
      color: getColorValue(),
      textAlign: align,
      ...(weight && { fontWeight: weight }),
      ...(size && { fontSize: size }),
    },
    style,
  ];

  return (
    <RNText
      style={combinedStyle}
      numberOfLines={numberOfLines}
      onPress={onPress}
      {...props}
    >
      {children}
    </RNText>
  );
};

// Specialized text components for common use cases
export const HeaderText = ({ children, level = 1, ...props }) => (
  <Text variant={`h${level}`} color="primary" align="center" {...props}>
    {children}
  </Text>
);

export const SubHeaderText = ({ children, ...props }) => (
  <Text variant="h4" color="secondary" align="center" {...props}>
    {children}
  </Text>
);

export const BodyText = ({ children, ...props }) => (
  <Text variant="body1" color="primary" {...props}>
    {children}
  </Text>
);

export const CaptionText = ({ children, ...props }) => (
  <Text variant="caption" color="secondary" {...props}>
    {children}
  </Text>
);

export const CurrencyText = ({ 
  children, 
  amount, 
  size = 'medium', 
  type = 'neutral',
  showSymbol = true,
  ...props 
}) => {
  // Format currency amount if provided
  const formatAmount = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return showSymbol ? `₹${value}` : value;
  };

  // Get color based on debt type
  const getDebtColor = () => {
    switch (type) {
      case 'debt': return 'debtHigh';
      case 'payment': return 'debtFree';
      case 'warning': return 'debtMedium';
      case 'safe': return 'debtLow';
      default: return 'primary';
    }
  };

  const displayText = amount ? formatAmount(amount) : children;
  const variant = size === 'large' ? 'currencyLarge' : 
                  size === 'small' ? 'currencySmall' : 'currency';

  return (
    <Text
      variant={variant}
      color={getDebtColor()}
      {...props}
    >
      {displayText}
    </Text>
  );
};

export const DebtText = ({ amount, creditLimit, ...props }) => {
  const utilization = creditLimit ? (amount / creditLimit) * 100 : 0;
  
  const getDebtStatus = () => {
    if (utilization >= 80) return { type: 'debt', label: 'High Risk' };
    if (utilization >= 50) return { type: 'warning', label: 'Moderate' };
    if (utilization >= 20) return { type: 'safe', label: 'Safe' };
    return { type: 'payment', label: 'Excellent' };
  };

  const status = getDebtStatus();

  return (
    <CurrencyText
      amount={amount}
      type={status.type}
      {...props}
    />
  );
};

export const CardNumberText = ({ cardNumber, masked = true, ...props }) => {
  const formatCardNumber = (number) => {
    if (masked && number && number.length > 4) {
      const lastFour = number.slice(-4);
      return `**** **** **** ${lastFour}`;
    }
    return number ? number.match(/.{1,4}/g)?.join(' ') : '';
  };

  return (
    <Text
      variant="cardNumber"
      color="primary"
      {...props}
    >
      {formatCardNumber(cardNumber)}
    </Text>
  );
};

export default Text;