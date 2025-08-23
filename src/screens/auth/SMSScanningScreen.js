// src/screens/auth/SMSScanningScreen.js - Updated SMS Scanning with Real-time Progress
import React, { useState, useEffect } from 'react';
import { View, Animated, Text as RNText } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, LoadingSpinner } from '../../components';
import { colors, spacing } from '../../styles';
import SMSReader from '../../services/sms/SMSReader';
import StorageService from '../../services/storage/StorageService';

const SMSScanningScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [totalSMS, setTotalSMS] = useState(0);
  const [processedSMS, setProcessedSMS] = useState(0);
  const [foundCards, setFoundCards] = useState(0);
  const [foundTransactions, setFoundTransactions] = useState(0);
  const [status, setStatus] = useState('scanning');
  
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    startSMSScanning();
  }, []);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const startSMSScanning = async () => {
    try {
      // Use the improved SMS analyzer
      const result = await SMSReader.analyzeSMS((progress) => {
        // Update UI based on progress
        setProgress(progress.progress);
        setCurrentStep(progress.message);
        
        if (progress.totalSMS) {
          setTotalSMS(progress.totalSMS);
        }
        
        if (progress.processedSMS) {
          setProcessedSMS(progress.processedSMS);
        }
        
        if (progress.foundCards) {
          setFoundCards(progress.foundCards);
        }
        
        if (progress.foundTransactions) {
          setFoundTransactions(progress.foundTransactions);
        }
      });
      
      if (result.creditCards.length === 0) {
        setStatus('no-cards');
        setTimeout(() => {
          navigation.navigate('AutoDetectedCards', {
            cards: [],
            transactions: [],
          });
        }, 2000);
        return;
      }
      
      // Save to storage
      await StorageService.saveCreditCards(result.creditCards);
      await StorageService.saveTransactions(result.transactions);
      
      // Save last scan timestamp
      await StorageService.saveLastSMSScan(new Date());
      
      setStatus('complete');
      
      // Navigate to results after a brief delay
      setTimeout(() => {
        navigation.navigate('AutoDetectedCards', {
          cards: result.creditCards,
          transactions: result.transactions,
        });
      }, 1500);

    } catch (error) {
      console.error('SMS scanning error:', error);
      setStatus('error');
      setCurrentStep('Error occurred during scanning. Please try again.');
    }
  };

  const renderScanningContent = () => (
    <>
      {/* Scanning Animation */}
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
      }}>
        <LoadingSpinner size="large" color="white" />
        <Text style={{ 
          fontSize: 32, 
          position: 'absolute',
          opacity: 0.8,
        }}>📱</Text>
      </View>

      {/* Title */}
      <Text 
        variant="h2" 
        color="white" 
        weight="700"
        align="center"
        style={{ marginBottom: spacing.md }}
      >
        Analyzing Your SMS
      </Text>
      
      {/* Current Step */}
      <Text 
        variant="body1" 
        color="white" 
        align="center"
        style={{ 
          opacity: 0.9,
          marginBottom: spacing.xl,
          minHeight: 24,
        }}
      >
        {currentStep}
      </Text>

      {/* Progress Bar */}
      <View style={{
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: spacing.lg,
        overflow: 'hidden',
      }}>
        <Animated.View
          style={{
            height: '100%',
            backgroundColor: 'white',
            borderRadius: 4,
            width: progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          }}
        />
      </View>

      {/* Progress Percentage */}
      <Text 
        variant="h4" 
        color="white" 
        weight="600"
        style={{ marginBottom: spacing.xl }}
      >
        {Math.round(progress)}%
      </Text>

      {/* Stats */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: spacing.lg,
        width: '100%',
      }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}>
          <Text variant="body2" color="white" style={{ opacity: 0.8 }}>
            Total SMS:
          </Text>
          <Text variant="body2" color="white" weight="600">
            {totalSMS.toLocaleString()}
          </Text>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}>
          <Text variant="body2" color="white" style={{ opacity: 0.8 }}>
            Processed:
          </Text>
          <Text variant="body2" color="white" weight="600">
            {processedSMS.toLocaleString()}
          </Text>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          marginBottom: spacing.md,
        }}>
          <Text variant="body2" color="white" style={{ opacity: 0.8 }}>
            Credit Cards Found:
          </Text>
          <Text variant="body2" color="white" weight="600">
            {foundCards}
          </Text>
        </View>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between',
        }}>
          <Text variant="body2" color="white" style={{ opacity: 0.8 }}>
            Transactions Found:
          </Text>
          <Text variant="body2" color="white" weight="600">
            {foundTransactions.toLocaleString()}
          </Text>
        </View>
      </View>
    </>
  );

  const renderErrorContent = () => (
    <>
      <View style={{
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
      }}>
        <RNText style={{ fontSize: 48 }}>❌</RNText>
      </View>

      <Text 
        variant="h2" 
        color="white" 
        weight="700"
        align="center"
        style={{ marginBottom: spacing.lg }}
      >
        Scanning Error
      </Text>
      
      <Text 
        variant="body1" 
        color="white" 
        align="center"
        style={{ 
          opacity: 0.9,
          marginBottom: spacing.xl,
        }}
      >
        {currentStep}
      </Text>

      <View style={{ width: '100%', marginTop: spacing.md }}>
        <TouchableOpacity
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            borderRadius: spacing.borderRadius.medium,
            paddingVertical: spacing.md,
            alignItems: 'center',
          }}
          onPress={() => {
            setStatus('scanning');
            setProgress(0);
            setCurrentStep('Initializing...');
            startSMSScanning();
          }}
        >
          <Text color={colors.primaryColor} weight="600">
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

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
          
          {status === 'scanning' && renderScanningContent()}
          {status === 'error' && renderErrorContent()}
          {status === 'complete' && renderScanningContent()}
          {status === 'no-cards' && renderScanningContent()}

          {/* Footer Message */}
          <Text 
            variant="caption" 
            color="white"
            align="center"
            style={{ 
              marginTop: spacing.xl,
              opacity: 0.7,
              lineHeight: 18,
            }}
          >
            We're securely analyzing your SMS messages{'\n'}
            to discover your credit cards and transactions
          </Text>

        </View>

      </Screen>
    </LinearGradient>
  );
};

export default SMSScanningScreen;