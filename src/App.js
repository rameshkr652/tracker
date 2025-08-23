// src/App.js - Professional App Entry Point with React Navigation
import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import { colors } from './styles';

const App = () => {
  return (
    <>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={colors.primaryColor}
        translucent={false}
      />
      <AppNavigator />
    </>
  );
};

export default App;