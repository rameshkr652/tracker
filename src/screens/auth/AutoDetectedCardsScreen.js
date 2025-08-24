// src/screens/auth/AutoDetectedCardsScreen.js - Display Auto-Detected Credit Cards
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Button, Card } from '../../components';
import { colors, spacing } from '../../styles';
import { useDebt } from '../../context/DebtContext';

const AutoDetectedCardsScreen = ({ navigation, route }) => {
  const { setCreditCards, setTransactions, setAppState } = useDebt();
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [animatedValues] = useState({});
  
  // Get cards and transactions from route params or context
  const cards = route.params?.cards || [];
  const transactions = route.params?.transactions || [];

  useEffect(() => {
    // Initialize all cards as selected
    setSelectedCards(new Set(cards.map(card => card.id)));
    
    // Initialize animations
    cards.forEach((card, index) => {
      animatedValues[card.id] = new Animated.Value(0);
      
      // Stagger the card animations
      Animated.timing(animatedValues[card.id], {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [cards]);

  const toggleCardSelection = (cardId) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setSelectedCards(newSelected);
  };

  const handleContinue = async () => {
    // Filter selected cards and their transactions
    const selectedCardsList = cards.filter(card => selectedCards.has(card.id));
    const selectedTransactions = transactions.filter(transaction =>
      selectedCards.has(transaction.cardId)
    );

    // Save to context and storage
    await setCreditCards(selectedCardsList);
    await setTransactions(selectedTransactions);
    
    // Mark onboarding as complete
    await setAppState({
      hasCompletedOnboarding: true,
      hasParsedSMS: true
    });

    // Navigate to main tabs (dashboard)
    navigation.replace('MainTabs');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBankLogo = (bankName) => {
    // Simple emoji mapping for banks
    const bankLogos = {
      'HDFC Bank': '🏦',
      'ICICI Bank': '🏛️',
      'SBI': '🏪',
      'Axis Bank': '🏢',
      'Kotak Mahindra Bank': '🏬',
      'Yes Bank': '🏭',
      'IndusInd Bank': '🏘️',
      'American Express': '💳',
      'Citibank': '🏦',
      'Standard Chartered': '🏛️',
    };
    return bankLogos[bankName] || '💳';
  };

  const getCardColor = (index) => {
    const cardColors = [
      ['#667eea', '#764ba2'],
      ['#f093fb', '#f5576c'],
      ['#4facfe', '#00f2fe'],
      ['#43e97b', '#38f9d7'],
      ['#fa709a', '#fee140'],
      ['#a8edea', '#fed6e3'],
      ['#ff9a9e', '#fecfef'],
      ['#ffecd2', '#fcb69f'],
    ];
    return cardColors[index % cardColors.length];
  };

  if (cards.length === 0) {
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
            
            <View style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <Text style={{ fontSize: 48 }}>😔</Text>
            </View>

            <Text 
              variant="h2" 
              color="white" 
              weight="700"
              align="center"
              style={{ marginBottom: spacing.lg }}
            >
              No Credit Cards Found
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
              We couldn't find any credit card transactions in your SMS messages. This might be because:
            </Text>

            <View style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: spacing.lg,
              marginBottom: spacing.xl,
            }}>
              <Text variant="body2" color="white" style={{ marginBottom: spacing.sm }}>
                • You don't have credit card transaction SMS
              </Text>
              <Text variant="body2" color="white" style={{ marginBottom: spacing.sm }}>
                • Your bank uses different SMS formats
              </Text>
              <Text variant="body2" color="white">
                • SMS messages are too old or deleted
              </Text>
            </View>

            <Button
              title="Try Again"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => navigation.goBack()}
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
            🎉 Cards Detected!
          </Text>
          
          <Text 
            variant="body1" 
            color="white" 
            align="center"
            style={{ opacity: 0.9 }}
          >
            We found {cards.length} credit card{cards.length !== 1 ? 's' : ''} from your SMS. Select which ones to track:
          </Text>
        </View>

        {/* Cards List */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: spacing.lg,
            paddingBottom: spacing.xl,
          }}
          showsVerticalScrollIndicator={false}
        >
          {cards.map((card, index) => {
            const isSelected = selectedCards.has(card.id);
            const cardTransactions = transactions.filter(t => t.cardId === card.id);
            const animatedValue = animatedValues[card.id] || new Animated.Value(1);
            
            return (
              <Animated.View
                key={card.id}
                style={{
                  opacity: animatedValue,
                  transform: [{
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  }],
                  marginBottom: spacing.lg,
                }}
              >
                <TouchableOpacity
                  onPress={() => toggleCardSelection(card.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={getCardColor(index)}
                    style={{
                      borderRadius: 16,
                      padding: spacing.lg,
                      opacity: isSelected ? 1 : 0.6,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {/* Card Header */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: spacing.md,
                    }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, marginRight: spacing.sm }}>
                          {getBankLogo(card.bankName)}
                        </Text>
                        <View>
                          <Text variant="h5" color="white" weight="600">
                            {card.bankName}
                          </Text>
                          <Text variant="body2" color="white" style={{ opacity: 0.8 }}>
                            {card.cardType}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: isSelected ? 'white' : 'rgba(255,255,255,0.3)',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                        {isSelected && (
                          <Text style={{ color: colors.primaryColor, fontSize: 16 }}>✓</Text>
                        )}
                      </View>
                    </View>

                    {/* Card Number */}
                    <Text variant="h4" color="white" weight="600" style={{ marginBottom: spacing.md }}>
                      •••• •••• •••• {card.lastFourDigits}
                    </Text>

                    {/* Card Details */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      marginBottom: spacing.sm,
                    }}>
                      <View>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Current Balance
                        </Text>
                        <Text variant="h5" color="white" weight="600">
                          {card.currentBalance ? formatCurrency(card.currentBalance) : 'N/A'}
                        </Text>
                      </View>
                      
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Credit Limit
                        </Text>
                        <Text variant="h5" color="white" weight="600">
                          {card.creditLimit ? formatCurrency(card.creditLimit) : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {/* Utilization Bar */}
                    {card.currentBalance && card.creditLimit && (
                      <View>
                        <View style={{
                          height: 4,
                          backgroundColor: 'rgba(255,255,255,0.3)',
                          borderRadius: 2,
                          marginBottom: spacing.xs,
                        }}>
                          <View style={{
                            height: '100%',
                            backgroundColor: 'white',
                            borderRadius: 2,
                            width: `${Math.min((card.currentBalance / card.creditLimit) * 100, 100)}%`,
                          }} />
                        </View>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          {Math.round((card.currentBalance / card.creditLimit) * 100)}% utilized
                        </Text>
                      </View>
                    )}

                    {/* Transaction Count */}
                    <View style={{
                      marginTop: spacing.sm,
                      paddingTop: spacing.sm,
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(255,255,255,0.2)',
                    }}>
                      <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                        {cardTransactions.length} transaction{cardTransactions.length !== 1 ? 's' : ''} found
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* Bottom Actions */}
        <View style={{ 
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}>
            <Text variant="body2" color="white" style={{ opacity: 0.8 }}>
              {selectedCards.size} of {cards.length} cards selected
            </Text>
            
            <TouchableOpacity
              onPress={() => {
                if (selectedCards.size === cards.length) {
                  setSelectedCards(new Set());
                } else {
                  setSelectedCards(new Set(cards.map(card => card.id)));
                }
              }}
            >
              <Text variant="body2" color="white" weight="600">
                {selectedCards.size === cards.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            title={`Continue with ${selectedCards.size} Card${selectedCards.size !== 1 ? 's' : ''}`}
            variant="secondary"
            size="large"
            fullWidth
            disabled={selectedCards.size === 0}
            onPress={handleContinue}
            style={{
              backgroundColor: selectedCards.size > 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.3)',
            }}
            textStyle={{ 
              color: selectedCards.size > 0 ? colors.primaryColor : 'rgba(255,255,255,0.6)',
              fontWeight: '600',
            }}
          />
        </View>

      </Screen>
    </LinearGradient>
  );
};

export default AutoDetectedCardsScreen;