// src/screens/SplashScreen.js - Fixed Splash Screen with Proper Navigation
import React, { useEffect, useState } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button, LoadingSpinner } from '../components';
import { colors, spacing } from '../styles';
import { useDebt } from '../context/DebtContext';

const SplashScreen = ({ navigation }) => {
  const {
    creditCards,
    hasCompletedOnboarding,
    initialLoading,        // NEW: Wait for initial data loading
    dataLoaded,           // NEW: Flag to know when data is ready
    error,
  } = useDebt();
  
  const [navigationReady, setNavigationReady] = useState(false);

  // FIXED: Wait for context to load data before making navigation decisions
  useEffect(() => {
    // Only proceed with navigation logic after data is loaded
    if (dataLoaded && !initialLoading) {
      checkAppStateAndNavigate();
    }
  }, [dataLoaded, initialLoading, creditCards, hasCompletedOnboarding]);

  const checkAppStateAndNavigate = async () => {
    try {
      console.log('🧭 Checking app state for navigation...');
      console.log('   - Credit cards found:', creditCards.length);
      console.log('   - Onboarding completed:', hasCompletedOnboarding);
      
      // Check SMS permission status
      const hasCurrentSMSPermission = await checkSMSPermission();
      console.log('   - SMS permission:', hasCurrentSMSPermission);
      
      // Wait a moment for splash screen effect
      setTimeout(() => {
        makeNavigationDecision();
      }, 1000); // Reduced splash time
      
    } catch (error) {
      console.error('❌ Error during app state check:', error);
      // On error, show splash screen with get started button
      setNavigationReady(true);
    }
  };

  const makeNavigationDecision = () => {
    console.log('🚀 Making navigation decision...');
    
    // PRIORITY 1: If user has credit cards (from previous SMS scan), go to main app
    if (creditCards.length > 0) {
      console.log('✅ User has existing cards - navigating to MainTabs');
      navigation.replace('MainTabs');
      return;
    }

    // PRIORITY 2: If user completed onboarding but no cards (maybe deleted SMS)
    if (hasCompletedOnboarding) {
      console.log('✅ Onboarding completed but no cards - navigating to MainTabs');
      navigation.replace('MainTabs');
      return;
    }

    // PRIORITY 3: First-time user - show splash with get started button
    console.log('🆕 First-time user - showing splash with get started');
    setNavigationReady(true);
  };

  const checkSMSPermission = async () => {
    if (Platform.OS !== 'android') {
      return false;
    }

    try {
      const readPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );
      const receivePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
      );
      
      return readPermission && receivePermission;
    } catch (error) {
      console.error('Error checking SMS permission:', error);
      return false;
    }
  };

  const handleGetStarted = () => {
    console.log('🎯 User clicked Get Started - navigating to BankSelection');
    navigation.navigate('BankSelection');
  };

  // FIXED: Show loading screen while context loads initial data
  if (initialLoading || !dataLoaded) {
    return (
      <LinearGradient
        colors={[colors.primaryColor, colors.secondaryColor]}
        style={{ flex: 1 }}
      >
        <Screen safe style={{ backgroundColor: 'transparent' }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
          }}>
            
            {/* App Logo */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <Text variant="h1" color="white" weight="800">
                💳
              </Text>
            </View>

            {/* App Title */}
            <Text 
              variant="h1" 
              color="white" 
              weight="700"
              align="center"
              style={{ marginBottom: spacing.md }}
            >
              DebtTracker
            </Text>

            {/* Loading State */}
            <View style={{ marginTop: spacing.xl }}>
              <LoadingSpinner size="large" color="white" />
              <Text 
                variant="body1" 
                color="white" 
                align="center"
                style={{ 
                  marginTop: spacing.md,
                  opacity: 0.9 
                }}
              >
                {error ? 'Loading failed, please wait...' : 'Loading your data...'}
              </Text>
            </View>
            
          </View>
        </Screen>
      </LinearGradient>
    );
  }

  // FIXED: Show splash with get started only for first-time users
  if (!navigationReady) {
    return (
      <LinearGradient
        colors={[colors.primaryColor, colors.secondaryColor]}
        style={{ flex: 1 }}
      >
        <Screen safe style={{ backgroundColor: 'transparent' }}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
          }}>
            
            {/* App Logo */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <Text variant="h1" color="white" weight="800">
                💳
              </Text>
            </View>

            {/* Loading Indicator */}
            <LoadingSpinner size="large" color="white" />
            <Text 
              variant="body1" 
              color="white" 
              align="center"
              style={{ 
                marginTop: spacing.md,
                opacity: 0.9 
              }}
            >
              Preparing your app...
            </Text>
            
          </View>
        </Screen>
      </LinearGradient>
    );
  }

  // Show welcome screen for first-time users
  return (
    <LinearGradient
      colors={[colors.primaryColor, colors.secondaryColor]}
      style={{ flex: 1 }}
    >
      <Screen safe style={{ backgroundColor: 'transparent' }}>
        
        <View style={{ 
          flex: 1, 
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          
          {/* App Logo */}
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.xl,
          }}>
            <Text variant="h1" color="white" weight="800">
              💳
            </Text>
          </View>

          {/* App Title */}
          <Text 
            variant="h1" 
            color="white" 
            weight="700"
            align="center"
            style={{ marginBottom: spacing.md }}
          >
            DebtTracker
          </Text>

          {/* Tagline */}
          <Text 
            variant="h4" 
            color="white" 
            align="center"
            style={{ 
              marginBottom: spacing.xl,
              opacity: 0.9,
            }}
          >
            Your SMS knows your debt.{'\n'}We solve it.
          </Text>

          {/* Features */}
          <View style={{ marginBottom: spacing.xxl }}>
            <Text variant="body1" color="white" style={{ opacity: 0.9, marginVertical: spacing.xs }}>
              📱 Auto-reads banking SMS
            </Text>
            <Text variant="body1" color="white" style={{ opacity: 0.9, marginVertical: spacing.xs }}>
              💰 Tracks all credit cards
            </Text>
            <Text variant="body1" color="white" style={{ opacity: 0.9, marginVertical: spacing.xs }}>
              🎯 AI debt strategy
            </Text>
          </View>

        </View>

        {/* Bottom Button */}
        <View style={{ paddingBottom: spacing.xl }}>
          <Button
            title="Get Started"
            variant="secondary"
            size="large"
            fullWidth
            onPress={handleGetStarted}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderColor: 'transparent',
            }}
            textStyle={{ color: colors.primaryColor }}
          />
          
          <Text 
            variant="caption" 
            color="white"
            align="center"
            style={{ 
              marginTop: spacing.md,
              opacity: 0.8,
            }}
          >
            Free forever • Privacy first • No manual entry
          </Text>
        </View>

      </Screen>
    </LinearGradient>
  );
};

export default SplashScreen;