// src/App.js - Main App Entry Point
import React from 'react';
import { StatusBar } from 'react-native';
import SplashScreen from './screens/SplashScreen';
import { colors } from './styles';

const App = () => {
  return (
    <>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={colors.backgroundColor} 
      />
      <SplashScreen />
    </>
  );
};

export default App;