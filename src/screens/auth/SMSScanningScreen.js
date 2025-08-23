// src/screens/auth/SMSScanningScreen.js - SMS Scanning with Real-time Progress
import React, { useState, useEffect } from 'react';
import { View, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, LoadingSpinner } from '../../components';
import { colors, spacing } from '../../styles';
import SMSReader from '../../services/sms/SMSReader';
import SMSParser from '../../services/sms/SMSParser';
import StorageService from '../../services/storage/StorageService';

const SMSScanningScreen = ({ navigation }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');
  const [totalSMS, setTotalSMS] = useState(0);
  const [processedSMS, setProcessedSMS] = useState(0);
  const [foundCards, setFoundCards] = useState(0);
  const [foundTransactions, setFoundTransactions] = useState(0);
  
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
      // Step 1: Fetch SMS messages
      setCurrentStep('Fetching SMS messages...');
      setProgress(10);
      
      const smsMessages = await SMSReader.getAllSMS();
      console.log(`Fetched ${smsMessages.length} SMS messages`);
      setTotalSMS(smsMessages.length);
      setProgress(20);

      if (smsMessages.length === 0) {
        setCurrentStep('No SMS messages found');
        setTimeout(() => {
          navigation.navigate('AutoDetectedCards', {
            cards: [],
            transactions: [],
          });
        }, 2000);
        return;
      }

      // Step 2: Filter banking SMS
      setCurrentStep('Filtering banking SMS...');
      const bankingSMS = SMSReader.filterBankingSMS(smsMessages);
      console.log(`Found ${bankingSMS.length} banking SMS out of ${smsMessages.length} total`);
      setProgress(30);

      if (bankingSMS.length === 0) {
        setCurrentStep('No banking SMS found');
        setTimeout(() => {
          navigation.navigate('AutoDetectedCards', {
            cards: [],
            transactions: [],
          });
        }, 2000);
        return;
      }

      // Step 3: Parse SMS for credit card data
      setCurrentStep('Analyzing credit card transactions...');
      const parser = new SMSParser();
      
      let cards = {};
      let transactions = [];
      let processed = 0;
      let errors = [];

      for (const sms of bankingSMS) {
        try {
          const parsedData = parser.parseSMS(sms);
          
          if (parsedData.success && parsedData.creditCard) {
            const cardId = `${parsedData.creditCard.bankName}_${parsedData.creditCard.lastFourDigits}`;
            
            if (!cards[cardId]) {
              cards[cardId] = parsedData.creditCard;
              setFoundCards(Object.keys(cards).length);
            }
            
            if (parsedData.transaction) {
              transactions.push({
                ...parsedData.transaction,
                cardId,
                smsBody: sms.body,
              });
              setFoundTransactions(transactions.length);
            }
          } else if (!parsedData.success) {
            errors.push(parsedData.error);
          }
        } catch (error) {
          console.error('SMS parsing error:', error);
          errors.push(error);
        }
        
        processed++;
        setProcessedSMS(processed);
        setProgress(30 + (processed / bankingSMS.length) * 50);
        
        // Update step message
        if (processed % 10 === 0) {
          setCurrentStep(`Processed ${processed} of ${bankingSMS.length} banking SMS...`);
        }
      }

      // Log parsing statistics
      console.log(`SMS Parsing Complete: ${Object.keys(cards).length} cards, ${transactions.length} transactions, ${errors.length} errors`);

      // Step 4: Save data
      setCurrentStep('Saving your credit card data...');
      setProgress(85);
      
      await StorageService.saveCreditCards(Object.values(cards));
      await StorageService.saveTransactions(transactions);
      
      setProgress(95);

      // Step 5: Complete
      setCurrentStep('Analysis complete!');
      setProgress(100);

      // Navigate to results after a brief delay
      setTimeout(() => {
        navigation.navigate('AutoDetectedCards', {
          cards: Object.values(cards),
          transactions,
        });
      }, 1500);

    } catch (error) {
      console.error('SMS scanning error:', error);
      setCurrentStep('Error occurred during scanning');
      // Handle error - maybe show retry option
    }
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
          paddingHorizontal: spacing.lg,
        }}>
          
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