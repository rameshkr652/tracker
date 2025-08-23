// src/components/common/Card.js - Professional Reusable Card Component
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Text from './Text';
import { colors, spacing, getShadow, getBankColor, getDebtColor } from '../../styles';

const Card = ({
  children,
  variant = 'default',
  size = 'medium',
  onPress,
  style,
  shadow = true,
  gradientColors,
  borderColor,
  backgroundColor,
  ...props
}) => {
  
  // Get card size
  const getCardSize = () => {
    switch (size) {
      case 'compact':
        return {
          minHeight: spacing.heights.card.compact,
          padding: spacing.sm,
        };
      case 'expanded':
        return {
          minHeight: spacing.heights.card.expanded,
          padding: spacing.lg,
        };
      default:
        return {
          minHeight: spacing.heights.card.medium,
          padding: spacing.cardSpacing.inner,
        };
    }
  };

  // Get card colors based on variant
  const getCardColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || colors.primaryColor,
          borderColor: borderColor || colors.primaryColor,
          gradientColors: gradientColors || [colors.gradientStart, colors.gradientEnd],
        };
      case 'success':
        return {
          backgroundColor: backgroundColor || colors.successColor,
          borderColor: borderColor || colors.successColor,
          gradientColors: gradientColors || [colors.successGradientStart, colors.successGradientEnd],
        };
      case 'warning':
        return {
          backgroundColor: backgroundColor || colors.warningColor,
          borderColor: borderColor || colors.warningColor,
          gradientColors: null,
        };
      case 'danger':
        return {
          backgroundColor: backgroundColor || colors.errorColor,
          borderColor: borderColor || colors.errorColor,
          gradientColors: gradientColors || [colors.debtGradientStart, colors.debtGradientEnd],
        };
      case 'outlined':
        return {
          backgroundColor: backgroundColor || 'transparent',
          borderColor: borderColor || colors.borderColor,
          gradientColors: null,
        };
      default:
        return {
          backgroundColor: backgroundColor || colors.surfaceColor,
          borderColor: borderColor || 'transparent',
          gradientColors: null,
        };
    }
  };

  const cardSize = getCardSize();
  const cardColors = getCardColors();

  // Build card style
  const cardStyle = [
    {
      ...cardSize,
      borderRadius: spacing.borderRadius.large,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: cardColors.borderColor,
      backgroundColor: cardColors.backgroundColor,
      ...(shadow && getShadow(3)),
      marginVertical: spacing.cardSpacing.margin,
    },
    style,
  ];

  // Render gradient card
  if (cardColors.gradientColors) {
    const CardContent = onPress ? TouchableOpacity : View;
    
    return (
      <CardContent
        onPress={onPress}
        activeOpacity={onPress ? 0.9 : 1}
        {...props}
      >
        <LinearGradient
          colors={cardColors.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyle}
        >
          {children}
        </LinearGradient>
      </CardContent>
    );
  }

  // Render standard card
  const CardContent = onPress ? TouchableOpacity : View;
  
  return (
    <CardContent
      style={cardStyle}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      {...props}
    >
      {children}
    </CardContent>
  );
};

// Credit Card specific component
export const CreditCard = ({
  bankName,
  cardNumber,
  cardType,
  balance,
  creditLimit,
  dueDate,
  minPayment,
  onPress,
  style,
  ...props
}) => {
  const utilization = creditLimit ? (balance / creditLimit) * 100 : 0;
  const bankColor = getBankColor(bankName);
  const debtColor = getDebtColor(balance, creditLimit);

  return (
    <Card
      variant="primary"
      onPress={onPress}
      gradientColors={[bankColor, `${bankColor}90`]}
      style={[{ minHeight: 180 }, style]}
      {...props}
    >
      <View style={{ flex: 1 }}>
        {/* Card Header */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: spacing.md 
        }}>
          <Text variant="cardTitle" color="white" weight="600">
            {bankName}
          </Text>
          <Text variant="caption" color="white">
            {cardType}
          </Text>
        </View>

        {/* Card Number */}
        <Text 
          variant="cardNumber" 
          color="white" 
          style={{ marginBottom: spacing.lg }}
        >
          {cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : '**** **** **** ****'}
        </Text>

        {/* Balance Info */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end' 
        }}>
          <View>
            <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
              Outstanding
            </Text>
            <Text variant="currencySmall" color="white" weight="700">
              ₹{balance?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
          
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
              Limit
            </Text>
            <Text variant="caption" color="white">
              ₹{creditLimit?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
        </View>

        {/* Utilization Indicator */}
        <View style={{ 
          height: 4, 
          backgroundColor: 'rgba(255,255,255,0.3)', 
          borderRadius: 2, 
          marginTop: spacing.sm,
          overflow: 'hidden',
        }}>
          <View style={{
            height: '100%',
            width: `${Math.min(utilization, 100)}%`,
            backgroundColor: utilization > 80 ? colors.errorColor : 
                            utilization > 50 ? colors.warningColor : colors.successColor,
          }} />
        </View>
      </View>
    </Card>
  );
};

// Debt Summary Card
export const DebtSummaryCard = ({
  totalDebt,
  totalLimit,
  monthlyPayment,
  nextDueDate,
  ...props
}) => {
  const utilization = totalLimit ? (totalDebt / totalLimit) * 100 : 0;
  const isHighDebt = utilization > 70;

  return (
    <Card
      variant={isHighDebt ? "danger" : "success"}
      shadow={true}
      {...props}
    >
      <View style={{ alignItems: 'center' }}>
        <Text variant="h4" color="white" style={{ marginBottom: spacing.xs }}>
          Total Debt
        </Text>
        <Text variant="currencyLarge" color="white" weight="700">
          ₹{totalDebt?.toLocaleString('en-IN') || '0'}
        </Text>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          width: '100%',
          marginTop: spacing.md,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.3)',
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
              Utilization
            </Text>
            <Text variant="h6" color="white" weight="600">
              {utilization.toFixed(1)}%
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
              Min Payment
            </Text>
            <Text variant="h6" color="white" weight="600">
              ₹{monthlyPayment?.toLocaleString('en-IN') || '0'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

// Info Card
export const InfoCard = ({ title, description, icon, ...props }) => (
  <Card variant="outlined" size="compact" {...props}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {icon && (
        <View style={{ marginRight: spacing.sm }}>
          {icon}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="cardTitle" color="primary" style={{ marginBottom: spacing.xs }}>
          {title}
        </Text>
        <Text variant="body2" color="secondary">
          {description}
        </Text>
      </View>
    </View>
  </Card>
);

export default Card;