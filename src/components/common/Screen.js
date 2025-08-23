// src/components/common/Screen.js - Simple Screen Wrapper
import React from 'react';
import { View, ScrollView, SafeAreaView } from 'react-native';
import { colors, commonStyles } from '../../styles';

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
    commonStyles.screenContainer,
    style,
  ];

  if (scroll) {
    return (
      <Container style={commonStyles.safeContainer}>
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