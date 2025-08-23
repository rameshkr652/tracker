// src/components/common/Screen.js - Simple Screen Component
import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { colors, spacing } from '../../styles';

const Screen = ({ 
  children, 
  scroll = false, 
  safe = true,
  style,
  ...props 
}) => {
  const Container = safe ? SafeAreaView : View;
  const Content = scroll ? ScrollView : View;
  
  const screenStyle = [
    {
      flex: 1,
      backgroundColor: colors.backgroundColor,
      paddingHorizontal: spacing.containerPadding,
    },
    style,
  ];

  if (scroll) {
    return (
      <Container style={{ flex: 1, backgroundColor: colors.backgroundColor }}>
        <ScrollView 
          style={screenStyle}
          showsVerticalScrollIndicator={false}
          {...props}
        >
          {children}
        </ScrollView>
      </Container>
    );
  }

  return (
    <Container style={screenStyle} {...props}>
      {children}
    </Container>
  );
};

export default Screen;