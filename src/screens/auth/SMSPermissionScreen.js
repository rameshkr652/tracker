// src/screens/auth/SMSPermissionScreen.js - Professional SMS Permission Screen
import React, { useState, useEffect } from 'react';
import { View, PermissionsAndroid, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button, Card } from '../../components';
import { colors, spacing } from '../../styles';

const SMSPermissionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [checkingPermission, setCheckingPermission] = useState(true);

  // Check current permission status on component mount
  useEffect(() => {
    checkCurrentPermissions();
  }, []);

  const checkCurrentPermissions = async () => {
    if (Platform.OS !== 'android') {
      setCheckingPermission(false);
      setPermissionDenied(true);
      return;
    }

    try {
      const readPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_SMS);
      const receivePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);

      if (readPermission && receivePermission) {
        // Already have permissions, navigate directly to SMS scanning
        navigation.replace('SMSScanning');
      } else {
        // Need to request permissions
        setCheckingPermission(false);
      }
    } catch (error) {
      console.log('Permission check error:', error);
      setCheckingPermission(false);
    }
  };

  const requestSMSPermission = async () => {
    if (Platform.OS !== 'android') {
      setPermissionDenied(true);
      return;
    }

    setLoading(true);
    setPermissionDenied(false);
    
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      ]);

      const readGranted = results['android.permission.READ_SMS'] === 'granted';
      const receiveGranted = results['android.permission.RECEIVE_SMS'] === 'granted';

      if (readGranted && receiveGranted) {
        // Navigate to SMS scanning screen
        navigation.replace('SMSScanning');
      } else {
        setPermissionDenied(true);
      }
    } catch (error) {
      console.log('Permission error:', error);
      setPermissionDenied(true);
    } finally {
      setLoading(false);
    }
  };

  if (checkingPermission) {
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
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}>
              <Text style={{ fontSize: 36 }}>⚡</Text>
            </View>
            <Text variant="h4" color="white" weight="600" align="center">
              Checking Permissions...
            </Text>
          </View>
        </Screen>
      </LinearGradient>
    );
  }

  if (permissionDenied) {
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
            paddingHorizontal: spacing.lg,
          }}>
            
            {/* Error Icon */}
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <Text style={{ fontSize: 48 }}>🚫</Text>
            </View>

            <Text 
              variant="h2" 
              color="white" 
              weight="700"
              align="center"
              style={{ marginBottom: spacing.lg }}
            >
              SMS Access Required
            </Text>
            
            <Text 
              variant="body1" 
              color="white" 
              align="center"
              style={{ 
                opacity: 0.9,
                marginBottom: spacing.xl,
                lineHeight: 24,
              }}
            >
              DebtTracker requires SMS access to automatically detect your credit card transactions. Without this permission, the app cannot function.
            </Text>

            <Button
              title="Grant SMS Permission"
              variant="secondary"
              size="large"
              fullWidth
              onPress={requestSMSPermission}
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
              }}
              textStyle={{ color: colors.primaryColor }}
            />

          </View>
        </Screen>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primaryColor, colors.secondaryColor]}
      style={{ flex: 1 }}
    >
      <Screen safe style={{ backgroundColor: 'transparent' }}>
        
        <View style={{ 
          flex: 1, 
          justifyContent: 'center',
        }}>
          
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}>
              <Text style={{ fontSize: 48 }}>✨</Text>
            </View>
            
            <Text 
              variant="h2" 
              color="white" 
              weight="700"
              align="center"
              style={{ marginBottom: spacing.md }}
            >
              Enable Smart Tracking
            </Text>
            
            <Text 
              variant="body1" 
              color="white" 
              align="center"
              style={{ 
                opacity: 0.9,
                lineHeight: 24,
                paddingHorizontal: spacing.md,
              }}
            >
              Let DebtTracker automatically discover your credit cards and track your debt by reading your banking SMS messages.
            </Text>
          </View>

          {/* Benefits Card */}
          <Card style={{ 
            backgroundColor: 'rgba(255,255,255,0.95)', 
            marginBottom: spacing.xl,
            marginHorizontal: spacing.lg,
          }}>
            <Text variant="h5" weight="600" style={{ marginBottom: spacing.lg, textAlign: 'center' }}>
              🎯 What You'll Get
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>🔍</Text>
              <Text variant="body2" style={{ flex: 1 }}>
                Instant credit card discovery from your SMS history
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>📊</Text>
              <Text variant="body2" style={{ flex: 1 }}>
                Real-time debt tracking with zero manual entry
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>🛡️</Text>
              <Text variant="body2" style={{ flex: 1 }}>
                Complete privacy - all data stays on your device
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 20, marginRight: spacing.md }}>🚀</Text>
              <Text variant="body2" style={{ flex: 1 }}>
                AI-powered debt payoff strategies
              </Text>
            </View>
          </Card>

          {/* Action Button */}
          <View style={{ paddingHorizontal: spacing.lg }}>
            <Button
              title="Enable Smart Tracking"
              variant="secondary"
              size="large"
              fullWidth
              loading={loading}
              onPress={requestSMSPermission}
              style={{
                backgroundColor: 'rgba(255,255,255,0.95)',
              }}
              textStyle={{ color: colors.primaryColor, fontWeight: '600' }}
            />
            
            <Text 
              variant="caption" 
              color="white"
              align="center"
              style={{ 
                marginTop: spacing.lg,
                opacity: 0.8,
                lineHeight: 18,
              }}
            >
              By continuing, you allow DebtTracker to read SMS messages{'\n'}
              from banks to automatically track your credit card activity
            </Text>
          </View>

        </View>

      </Screen>
    </LinearGradient>
  );
};

export default SMSPermissionScreen;