// src/screens/auth/BankSelectionScreen.js - Bank Selection Screen
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button, Card } from '../../components';
import { colors, spacing } from '../../styles';

const BankSelectionScreen = ({ navigation }) => {
  const [selectedBanks, setSelectedBanks] = useState(new Set());

  // Major Indian banks with logos (using emojis for now)
  const banks = [
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏦', color: '#004C8F', popular: true },
    { id: 'icici', name: 'ICICI Bank', logo: '🏛️', color: '#F37920', popular: true },
    { id: 'sbi', name: 'State Bank of India', logo: '🏪', color: '#22409A', popular: true },
    { id: 'axis', name: 'Axis Bank', logo: '🏢', color: '#800080', popular: true },
    { id: 'kotak', name: 'Kotak Mahindra Bank', logo: '🏬', color: '#ED1C24', popular: true },
    { id: 'yes', name: 'Yes Bank', logo: '🏭', color: '#004B87', popular: false },
    { id: 'indusind', name: 'IndusInd Bank', logo: '🏘️', color: '#9C2A00', popular: false },
    { id: 'idfc', name: 'IDFC First Bank', logo: '🏢', color: '#FF6B35', popular: false },
    { id: 'rbl', name: 'RBL Bank', logo: '🏦', color: '#1F4E79', popular: false },
    { id: 'amex', name: 'American Express', logo: '💳', color: '#006FCF', popular: true },
    { id: 'citi', name: 'Citibank', logo: '🏦', color: '#DA020E', popular: false },
    { id: 'standard', name: 'Standard Chartered', logo: '🏛️', color: '#00A4E6', popular: false },
    { id: 'pnb', name: 'Punjab National Bank', logo: '🏪', color: '#FF6B35', popular: false },
    { id: 'bob', name: 'Bank of Baroda', logo: '🏪', color: '#FF6B35', popular: false },
    { id: 'canara', name: 'Canara Bank', logo: '🏪', color: '#FF6B35', popular: false },
    { id: 'union', name: 'Union Bank of India', logo: '🏪', color: '#FF6B35', popular: false },
  ];

  const popularBanks = banks.filter(bank => bank.popular);
  const otherBanks = banks.filter(bank => !bank.popular);

  const toggleBankSelection = (bankId) => {
    const newSelected = new Set(selectedBanks);
    if (newSelected.has(bankId)) {
      newSelected.delete(bankId);
    } else {
      newSelected.add(bankId);
    }
    setSelectedBanks(newSelected);
  };

  const selectAllPopular = () => {
    const popularBankIds = popularBanks.map(bank => bank.id);
    setSelectedBanks(new Set(popularBankIds));
  };

  const selectAll = () => {
    const allBankIds = banks.map(bank => bank.id);
    setSelectedBanks(new Set(allBankIds));
  };

  const clearAll = () => {
    setSelectedBanks(new Set());
  };

  const handleContinue = () => {
    const selectedBanksList = banks.filter(bank => selectedBanks.has(bank.id));
    
    // Navigate to SMS scanning with selected banks
    navigation.navigate('SMSScanning', {
      selectedBanks: selectedBanksList
    });
  };

  const renderBankCard = (bank) => {
    const isSelected = selectedBanks.has(bank.id);
    
    return (
      <TouchableOpacity
        key={bank.id}
        onPress={() => toggleBankSelection(bank.id)}
        activeOpacity={0.8}
        style={{ marginBottom: spacing.md }}
      >
        <Card
          style={{
            backgroundColor: isSelected ? `${bank.color}20` : colors.surfaceColor,
            borderWidth: 2,
            borderColor: isSelected ? bank.color : colors.borderColor,
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: spacing.md,
          }}
        >
          {/* Bank Logo */}
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: bank.color,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: spacing.md,
          }}>
            <Text style={{ fontSize: 24 }}>{bank.logo}</Text>
          </View>

          {/* Bank Info */}
          <View style={{ flex: 1 }}>
            <Text 
              variant="h6" 
              weight="600" 
              style={{ 
                color: isSelected ? bank.color : colors.textColor,
                marginBottom: spacing.xs,
              }}
            >
              {bank.name}
            </Text>
            {bank.popular && (
              <Text 
                variant="caption" 
                style={{ 
                  color: bank.color,
                  fontWeight: '500',
                }}
              >
                Most Popular
              </Text>
            )}
          </View>

          {/* Selection Indicator */}
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: isSelected ? bank.color : colors.borderColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {isSelected && (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={[colors.primaryColor, colors.secondaryColor]}
      style={{ flex: 1 }}
    >
      <Screen safe style={{ backgroundColor: 'transparent' }}>
        
        {/* Header */}
        <View style={{ 
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
        }}>
          <Text 
            variant="h2" 
            color="white" 
            weight="700"
            align="center"
            style={{ marginBottom: spacing.sm }}
          >
            Select Your Banks
          </Text>
          
          <Text 
            variant="body1" 
            color="white" 
            align="center"
            style={{ opacity: 0.9, lineHeight: 24 }}
          >
            Choose the banks whose credit cards you want to track. We'll only scan SMS from these banks.
          </Text>
        </View>

        {/* Content */}
        <View style={{
          flex: 1,
          backgroundColor: colors.backgroundColor,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: spacing.xl,
        }}>
          
          {/* Quick Actions */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
          }}>
            <TouchableOpacity onPress={selectAllPopular}>
              <Text variant="body2" color={colors.primaryColor} weight="600">
                Select Popular
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={selectAll}>
              <Text variant="body2" color={colors.primaryColor} weight="600">
                Select All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={clearAll}>
              <Text variant="body2" color={colors.errorColor} weight="600">
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Popular Banks Section */}
            <Text variant="h5" weight="600" style={{ marginBottom: spacing.lg }}>
              Popular Banks
            </Text>
            
            {popularBanks.map(renderBankCard)}
            
            {/* Other Banks Section */}
            <Text variant="h5" weight="600" style={{ 
              marginTop: spacing.xl,
              marginBottom: spacing.lg,
            }}>
              Other Banks
            </Text>
            
            {otherBanks.map(renderBankCard)}

            {/* Help Text */}
            <Card style={{ 
              backgroundColor: colors.infoColor + '10',
              borderLeftWidth: 4,
              borderLeftColor: colors.infoColor,
              marginTop: spacing.xl,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 20, marginRight: spacing.md }}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text variant="body2" weight="600" style={{ marginBottom: spacing.xs }}>
                    Tip: Select only banks you actually use
                  </Text>
                  <Text variant="caption" style={{ opacity: 0.8 }}>
                    This helps us scan SMS faster and more accurately. You can always add more banks later in settings.
                  </Text>
                </View>
              </View>
            </Card>

          </ScrollView>

          {/* Bottom Actions */}
          <View style={{ 
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.lg,
            backgroundColor: colors.backgroundColor,
            borderTopWidth: 1,
            borderTopColor: colors.borderColor,
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}>
              <Text variant="body2" style={{ opacity: 0.7 }}>
                {selectedBanks.size} of {banks.length} banks selected
              </Text>
              
              <Text variant="body2" color={colors.primaryColor} weight="600">
                {selectedBanks.size > 0 && `${selectedBanks.size} bank${selectedBanks.size !== 1 ? 's' : ''} selected`}
              </Text>
            </View>

            <Button
              title={selectedBanks.size > 0 ? `Continue with ${selectedBanks.size} Bank${selectedBanks.size !== 1 ? 's' : ''}` : 'Select at least one bank'}
              variant="primary"
              size="large"
              fullWidth
              disabled={selectedBanks.size === 0}
              onPress={handleContinue}
              style={{
                opacity: selectedBanks.size > 0 ? 1 : 0.5,
              }}
            />
            
            <Text 
              variant="caption" 
              align="center"
              style={{ 
                marginTop: spacing.md,
                opacity: 0.7,
                lineHeight: 18,
              }}
            >
              We'll scan your SMS messages only from the selected banks to find your credit card transactions
            </Text>
          </View>

        </View>

      </Screen>
    </LinearGradient>
  );
};

export default BankSelectionScreen;