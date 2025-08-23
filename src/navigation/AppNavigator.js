// src/navigation/AppNavigator.js - Main App Navigator with DebtProvider
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DebtProvider } from '../context/DebtContext';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import SMSPermissionScreen from '../screens/auth/SMSPermissionScreen';
import SMSScanningScreen from '../screens/auth/SMSScanningScreen';
import AutoDetectedCardsScreen from '../screens/auth/AutoDetectedCardsScreen';
import MainDashboardScreen from '../screens/dashboard/MainDashboardScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <DebtProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen} 
          />
          <Stack.Screen 
            name="SMSPermission" 
            component={SMSPermissionScreen} 
          />
          <Stack.Screen 
            name="SMSScanning" 
            component={SMSScanningScreen} 
          />
          <Stack.Screen 
            name="AutoDetectedCards" 
            component={AutoDetectedCardsScreen} 
          />
          <Stack.Screen 
            name="MainDashboard" 
            component={MainDashboardScreen} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </DebtProvider>
  );
};

export default AppNavigator;