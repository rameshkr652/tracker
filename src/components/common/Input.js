// src/components/common/Input.js - Simple Input Component  
import React from 'react';
import { View, TextInput } from 'react-native';
import Text from './Text';
import { colors, spacing, typography } from '../../styles';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  style,
  ...props
}) => {
  const inputStyle = [
    {
      height: spacing.heights.input.medium,
      borderWidth: 1,
      borderColor: error ? colors.errorColor : colors.borderColor,
      borderRadius: spacing.borderRadius.medium,
      paddingHorizontal: spacing.inputPadding,
      backgroundColor: colors.surfaceColor,
      fontSize: typography.inputText.fontSize,
      color: colors.textColor,
    },
    style,
  ];

  return (
    <View style={{ marginVertical: spacing.sm }}>
      {label && (
        <Text variant="body2" color="secondary" style={{ marginBottom: spacing.xs }}>
          {label}
        </Text>
      )}
      
      <TextInput
        style={inputStyle}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholderColor}
        value={value}
        onChangeText={onChangeText}
        {...props}
      />
      
      {error && (
        <Text variant="caption" color="error" style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;