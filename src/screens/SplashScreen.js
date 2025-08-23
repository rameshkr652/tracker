// src/screens/SplashScreen.js - Beautiful Splash Screen
import React, { useEffect } from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button } from '../components';
import colors from '../styles/base/colors';
import { spacing } from '../styles/base/spacing';

const SplashScreen = () => {
  
  const handleGetStarted = () => {
    // TODO: Navigate to SMS Permission Screen
    console.log('Get Started pressed');
  };

  return (
    <LinearGradient
      colors={[colors.primaryColor, colors.secondaryColor]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Screen safe>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        }}>
          
          {/* App Logo/Icon Area */}
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
            weight="400"
            style={{ 
              marginBottom: spacing.xl,
              opacity: 0.9,
              lineHeight: 28,
            }}
          >
            Your SMS knows your debt.{'\n'}We solve it.
          </Text>

          {/* Features List */}
          <View style={{ marginBottom: spacing.xxl }}>
            <FeatureItem text="📱 Auto-reads banking SMS" />
            <FeatureItem text="💰 Tracks all credit cards" />
            <FeatureItem text="🎯 AI debt strategy" />
            <FeatureItem text="📊 Real-time analysis" />
          </View>

        </View>

        {/* Bottom Action */}
        <View style={{ 
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        }}>
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

const FeatureItem = ({ text }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    paddingLeft: spacing.md,
  }}>
    <Text variant="body1" color="white" style={{ opacity: 0.9 }}>
      {text}
    </Text>
  </View>
);

export default SplashScreen;