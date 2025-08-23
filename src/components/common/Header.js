// src/components/common/Header.js - Reusable Header Component
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Text from './Text';
import { colors, spacing } from '../../styles';

const Header = ({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  onLeftPress,
  onRightPress,
  backgroundColor = colors.backgroundColor,
  textColor = colors.textColor,
  centerTitle = true,
  style,
  ...props
}) => {
  
  const headerStyle = [
    {
      height: spacing.headerHeight,
      backgroundColor: backgroundColor,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.containerPadding,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },
    style,
  ];

  const renderLeftComponent = () => {
    if (leftComponent) {
      return (
        <TouchableOpacity 
          onPress={onLeftPress}
          style={{ 
            width: 44, 
            height: 44, 
            justifyContent: 'center',
            alignItems: 'flex-start' 
          }}
        >
          {leftComponent}
        </TouchableOpacity>
      );
    }
    return <View style={{ width: 44 }} />;
  };

  const renderRightComponent = () => {
    if (rightComponent) {
      return (
        <TouchableOpacity 
          onPress={onRightPress}
          style={{ 
            width: 44, 
            height: 44, 
            justifyContent: 'center',
            alignItems: 'flex-end' 
          }}
        >
          {rightComponent}
        </TouchableOpacity>
      );
    }
    return <View style={{ width: 44 }} />;
  };

  const renderTitle = () => {
    if (!title) return <View style={{ flex: 1 }} />;
    
    return (
      <View style={{ 
        flex: 1, 
        alignItems: centerTitle ? 'center' : 'flex-start',
        paddingHorizontal: spacing.sm,
      }}>
        <Text 
          variant="navTitle" 
          color={textColor}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            variant="caption" 
            color="secondary"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={headerStyle} {...props}>
      {renderLeftComponent()}
      {renderTitle()}
      {renderRightComponent()}
    </View>
  );
};

export default Header;