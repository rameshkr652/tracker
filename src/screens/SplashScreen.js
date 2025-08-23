// src/screens/SplashScreen.js - Splash Screen with Navigation
import React from 'react';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button } from '../components';
import { colors, spacing } from '../styles';

const SplashScreen = ({ navigation }) => {
  
  const handleGetStarted = () => {
    navigation.navigate('SMSPermission');
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