// src/screens/SplashScreen.js - Splash Screen with Intelligent Navigation
import React, { useEffect, useState } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button } from '../components';
import { colors, spacing } from '../styles';
import { useDebt } from '../context/DebtContext';
import StorageService from '../services/storage/StorageService';

const SplashScreen = ({ navigation }) => {
  const {
    creditCards,
    hasCompletedOnboarding,
    hasGrantedSMSPermission,
    setAppState
  } = useDebt();
  
  const [isLoading, setIsLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // Load app state from storage
      const appState = await StorageService.getAppState();
      const existingCards = await StorageService.getCreditCards();
      const existingTransactions = await StorageService.getTransactions();
      
      console.log('📊 App State:', appState);
      console.log('💳 Existing Cards:', existingCards.length);
      console.log('💰 Existing Transactions:', existingTransactions.length);
      
      // Update context with stored state
      await setAppState({
        hasCompletedOnboarding: appState.hasCompletedOnboarding || false,
        hasGrantedSMSPermission: appState.hasGrantedSMSPermission || false,
        lastSMSScan: appState.lastSMSScan,
        hasParsedSMS: existingCards.length > 0,
      });

      // Check current SMS permission status
      const hasCurrentSMSPermission = await checkSMSPermission();
      
      console.log('🔐 Current SMS Permission:', hasCurrentSMSPermission);
      console.log('✅ Has Completed Onboarding:', appState.hasCompletedOnboarding);
      
      // Wait a bit for splash screen effect
      setTimeout(() => {
        setIsLoading(false);
        setAppReady(true);
        
        // Navigate based on app state
        navigateBasedOnState(appState, existingCards, hasCurrentSMSPermission);
      }, 1500); // Reduced from 2000ms to 1500ms
      
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
      setAppReady(true);
      // Navigate to onboarding on error
      setTimeout(() => {
        console.log('🔄 Error occurred, showing onboarding');
      }, 500);
    }
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

  const navigateBasedOnState = (appState, existingCards, hasCurrentSMSPermission) => {
    console.log('🧭 Navigation Decision:');
    console.log('   - Cards found:', existingCards.length);
    console.log('   - Onboarding completed:', appState.hasCompletedOnboarding);
    console.log('   - SMS permission:', hasCurrentSMSPermission);
    
    // PRIORITY 1: If user has completed initial setup (has cards), go directly to main app
    // This ensures returning users skip all onboarding screens
    if (existingCards.length > 0) {
      console.log('✅ Returning user with cards - navigating to MainTabs');
      navigation.replace('MainTabs');
      return;
    }

    // PRIORITY 2: If user has completed onboarding but no cards found, go to main app anyway
    // (Maybe they deleted SMS or cards were not detected)
    if (appState.hasCompletedOnboarding) {
      console.log('✅ Onboarding completed but no cards - navigating to MainTabs');
      navigation.replace('MainTabs');
      return;
    }

    // PRIORITY 3: First-time users - show splash screen with "Get Started" button
    // Don't auto-navigate, let user initiate the onboarding process
    console.log('🆕 First-time user detected - showing splash screen with Get Started button');
  };

  const handleGetStarted = () => {
    navigation.navigate('BankSelection');
  };

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