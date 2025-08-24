// src/screens/auth/BankSelectionScreen.js - Bank Selection Screen
import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button, Card } from '../../components';
import { colors, spacing } from '../../styles';
import { useDebt } from '../../context/DebtContext';

const BankSelectionScreen = ({ navigation }) => {
  const { setAppState } = useDebt();
  const [selectedBanks, setSelectedBanks] = useState(new Set());

  const indianBanks = [
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏦', color: '#004C8F' },
    { id: 'sbi', name: 'State Bank of India', logo: '🏪', color: '#22409A' },
    { id: 'icici', name: 'ICICI Bank', logo: '🏛️', color: '#F37920' },
    { id: 'axis', name: 'Axis Bank', logo: '🏢', color: '#800080' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', logo: '🏬', color: '#ED1C24' },
    { id: 'yes', name: 'Yes Bank', logo: '🏭', color: '#004B87' },
    { id: 'indusind', name: 'IndusInd Bank', logo: '🏘️', color: '#D41367' },
    { id: 'idfc', name: 'IDFC First Bank', logo: '🏦', color: '#ED1C24' },
    { id: 'rbl', name: 'RBL Bank', logo: '🏛️', color: '#004B87' },
    { id: 'bandhan', name: 'Bandhan Bank', logo: '🏪', color: '#8B0000' },
    { id: 'amex', name: 'American Express', logo: '💳', color: '#006FCF' },
    { id: 'citi', name: 'Citibank', logo: '🏦', color: '#004B87' },
    { id: 'standard', name: 'Standard Chartered', logo: '🏛️', color: '#005EB8' },
    { id: 'hsbc', name: 'HSBC', logo: '🏢', color: '#DB0011' },
    { id: 'dbs', name: 'DBS Bank', logo: '🏬', color: '#EB0029' },
    { id: 'pnb', name: 'Punjab National Bank', logo: '🏪', color: '#FF6600' },
    { id: 'bob', name: 'Bank of Baroda', logo: '🏛️', color: '#FF6600' },
    { id: 'canara', name: 'Canara Bank', logo: '🏦', color: '#FF6600' },
    { id: 'union', name: 'Union Bank of India', logo: '🏢', color: '#FF6600' },
    { id: 'indian', name: 'Indian Bank', logo: '🏬', color: '#FF6600' },
  ];

  const toggleBankSelection = (bankId) => {
    const newSelected = new Set(selectedBanks);
    if (newSelected.has(bankId)) {
      newSelected.delete(bankId);
    } else {
      newSelected.add(bankId);
    }
    setSelectedBanks(newSelected);
  };

  const handleContinue = async () => {
    // Save selected banks to app state
    await setAppState({ 
      selectedBanks: Array.from(selectedBanks),
      hasSelectedBanks: true 
    });

    // Navigate to SMS permission or scanning based on current state
    navigation.navigate('SMSPermission');
  };

  const handleSkip = () => {
    // Skip bank selection and proceed with all banks
    navigation.navigate('SMSPermission');
  };

  const renderBankItem = ({ item, index }) => {
    const isSelected = selectedBanks.has(item.id);
    
    return (
      <TouchableOpacity
        onPress={() => toggleBankSelection(item.id)}
        style={{
          marginBottom: spacing.md,
          marginHorizontal: index % 2 === 0 ? 0 : spacing.sm,
          flex: 0.48,
        }}
      >
        <Card style={{
          backgroundColor: isSelected ? item.color + '15' : 'white',
          borderWidth: isSelected ? 2 : 1,
          borderColor: isSelected ? item.color : colors.borderColor,
          alignItems: 'center',
          paddingVertical: spacing.lg,
        }}>
          <Text style={{ fontSize: 32, marginBottom: spacing.sm }}>
            {item.logo}
          </Text>
          <Text 
            variant="body2" 
            weight="600" 
            align="center"
            style={{ 
              color: isSelected ? item.color : colors.textColor,
              lineHeight: 18,
            }}
          >
            {item.name}
          </Text>
          
          {isSelected && (
            <View style={{
              position: 'absolute',
              top: spacing.sm,
              right: spacing.sm,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: item.color,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
            </View>
          )}
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
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginBottom: spacing.lg,
          }}>
            <Text style={{ fontSize: 40 }}>🏦</Text>
          </View>
          
          <Text 
            variant="h2" 
            color="white" 
            weight="700"
            align="center"
            style={{ marginBottom: spacing.md }}
          >
            Select Your Banks
          </Text>
          
          <Text 
            variant="body1" 
            color="white" 
            align="center"
            style={{ 
              opacity: 0.9,
              lineHeight: 24,
            }}
          >
            Choose the banks you have credit cards with to improve SMS parsing accuracy.
          </Text>
        </View>

        {/* Banks Grid */}
        <View style={{ 
          flex: 1,
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: spacing.lg,
        }}>
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: spacing.lg,
            marginBottom: spacing.lg,
          }}>
            <Text variant="h5" weight="600">
              Popular Banks in India
            </Text>
            <Text variant="body2" style={{ opacity: 0.7 }}>
              {selectedBanks.size} selected
            </Text>
          </View>

          <FlatList
            data={indianBanks}
            renderItem={renderBankItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ 
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Bottom Actions */}
        <View style={{ 
          backgroundColor: 'rgba(255,255,255,0.95)',
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          paddingTop: spacing.md,
        }}>
          <Button
            title={selectedBanks.size > 0 ? 
              `Continue with ${selectedBanks.size} Bank${selectedBanks.size !== 1 ? 's' : ''}` : 
              'Select at least one bank'
            }
            variant="primary"
            size="large"
            fullWidth
            disabled={selectedBanks.size === 0}
            onPress={handleContinue}
            style={{
              marginBottom: spacing.md,
              opacity: selectedBanks.size === 0 ? 0.5 : 1,
            }}
          />

          <Button
            title="Skip - Use All Banks"
            variant="outline"
            size="large"
            fullWidth
            onPress={handleSkip}
          />

          <Text 
            variant="caption" 
            align="center"
            style={{ 
              marginTop: spacing.md,
              opacity: 0.7,
              lineHeight: 16,
            }}
          >
            You can change this selection later in settings
          </Text>
        </View>

      </Screen>
    </LinearGradient>
  );
};

export default BankSelectionScreen;