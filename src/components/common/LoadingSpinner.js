// src/components/common/LoadingSpinner.js - Reusable Loading Component
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import Text from './Text';
import { colors, spacing } from '../../styles';

const LoadingSpinner = ({
  size = 'small',
  color = colors.primaryColor,
  message,
  overlay = false,
  style,
  ...props
}) => {
  
  const containerStyle = [
    {
      justifyContent: 'center',
      alignItems: 'center',
      ...(overlay && {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 1000,
      }),
    },
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text 
          variant="body2" 
          color="secondary" 
          align="center"
          style={{ marginTop: spacing.sm }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

export const FullScreenLoader = ({ message = "Loading...", ...props }) => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: colors.backgroundColor 
  }}>
    <LoadingSpinner 
      size="large" 
      message={message}
      {...props} 
    />
  </View>
);

export default LoadingSpinner;