// src/components/common/Button.js - Professional Reusable Button Component
import React from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Text from './Text';
import colors from '../../styles/base/colors';
import { spacing, getShadow } from '../../styles/base/spacing';

const Button = ({
  children,
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  gradientColors,
  ...props
}) => {
  
  // Get button dimensions
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          height: spacing.heights.button.small,
          paddingHorizontal: spacing.buttonSpacing.small,
          borderRadius: spacing.borderRadius.small,
        };
      case 'large':
        return {
          height: spacing.heights.button.large,
          paddingHorizontal: spacing.buttonSpacing.large,
          borderRadius: spacing.borderRadius.medium,
        };
      default:
        return {
          height: spacing.heights.button.medium,
          paddingHorizontal: spacing.buttonSpacing.medium,
          borderRadius: spacing.borderRadius.medium,
        };
    }
  };

  // Get button colors based on variant
  const getButtonColors = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primaryColor,
          textColor: colors.invertedTextColor,
          borderColor: colors.primaryColor,
          gradientColors: gradientColors || [colors.gradientStart, colors.gradientEnd],
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          textColor: colors.primaryColor,
          borderColor: colors.primaryColor,
          gradientColors: null,
        };
      case 'success':
        return {
          backgroundColor: colors.successColor,
          textColor: colors.invertedTextColor,
          borderColor: colors.successColor,
          gradientColors: gradientColors || [colors.successGradientStart, colors.successGradientEnd],
        };
      case 'danger':
        return {
          backgroundColor: colors.errorColor,
          textColor: colors.invertedTextColor,
          borderColor: colors.errorColor,
          gradientColors: gradientColors || [colors.debtGradientStart, colors.debtGradientEnd],
        };
      case 'warning':
        return {
          backgroundColor: colors.warningColor,
          textColor: colors.invertedTextColor,
          borderColor: colors.warningColor,
          gradientColors: null,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          textColor: colors.textColor,
          borderColor: colors.borderColor,
          gradientColors: null,
        };
      case 'link':
        return {
          backgroundColor: 'transparent',
          textColor: colors.primaryColor,
          borderColor: 'transparent',
          gradientColors: null,
        };
      default:
        return {
          backgroundColor: colors.primaryColor,
          textColor: colors.invertedTextColor,
          borderColor: colors.primaryColor,
          gradientColors: gradientColors || [colors.gradientStart, colors.gradientEnd],
        };
    }
  };

  const buttonSize = getButtonSize();
  const buttonColors = getButtonColors();
  
  // Build button style
  const buttonStyle = [
    {
      ...buttonSize,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: variant === 'secondary' || variant === 'ghost' ? 1 : 0,
      borderColor: buttonColors.borderColor,
      backgroundColor: buttonColors.backgroundColor,
      opacity: disabled ? 0.6 : 1,
      ...(fullWidth && { width: '100%' }),
      ...(variant !== 'link' && variant !== 'ghost' && getShadow(2)),
    },
    style,
  ];

  // Get text variant based on button size
  const getTextVariant = () => {
    switch (size) {
      case 'small': return 'buttonSmall';
      case 'large': return 'buttonLarge';
      default: return 'buttonMedium';
    }
  };

  // Render button content
  const renderContent = () => {
    const textComponent = (
      <Text
        variant={getTextVariant()}
        color={buttonColors.textColor}
        style={[
          { opacity: loading ? 0 : 1 },
          textStyle,
        ]}
      >
        {title || children}
      </Text>
    );

    const iconComponent = icon && (
      <View style={{ marginRight: iconPosition === 'left' ? spacing.xs : 0, marginLeft: iconPosition === 'right' ? spacing.xs : 0 }}>
        {icon}
      </View>
    );

    return (
      <>
        {loading && (
          <View style={{ position: 'absolute' }}>
            <ActivityIndicator 
              color={buttonColors.textColor} 
              size={size === 'small' ? 'small' : 'small'} 
            />
          </View>
        )}
        {iconPosition === 'left' && iconComponent}
        {textComponent}
        {iconPosition === 'right' && iconComponent}
      </>
    );
  };

  // Render gradient button
  if (buttonColors.gradientColors && variant !== 'secondary' && variant !== 'ghost' && variant !== 'link') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={buttonColors.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={buttonStyle}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Render standard button
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Specialized button components
export const PrimaryButton = ({ children, ...props }) => (
  <Button variant="primary" {...props}>
    {children}
  </Button>
);

export const SecondaryButton = ({ children, ...props }) => (
  <Button variant="secondary" {...props}>
    {children}
  </Button>
);

export const SuccessButton = ({ children, ...props }) => (
  <Button variant="success" {...props}>
    {children}
  </Button>
);

export const DangerButton = ({ children, ...props }) => (
  <Button variant="danger" {...props}>
    {children}
  </Button>
);

export const LinkButton = ({ children, ...props }) => (
  <Button variant="link" {...props}>
    {children}
  </Button>
);

// Debt-specific buttons
export const PayNowButton = ({ amount, ...props }) => (
  <Button
    variant="success"
    title={`Pay ₹${amount?.toLocaleString('en-IN') || '0'} Now`}
    size="large"
    fullWidth
    {...props}
  />
);

export const AnalyzeDebtButton = ({ ...props }) => (
  <Button
    variant="primary"
    title="Analyze My Debt"
    size="large"
    fullWidth
    gradientColors={[colors.primaryColor, colors.primaryLight]}
    {...props}
  />
);

export const SMSPermissionButton = ({ ...props }) => (
  <Button
    variant="primary"
    title="Grant SMS Access"
    size="large"
    fullWidth
    gradientColors={[colors.primaryColor, colors.secondaryColor]}
    {...props}
  />
);

export default Button;