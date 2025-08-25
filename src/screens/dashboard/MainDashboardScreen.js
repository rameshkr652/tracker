// src/screens/dashboard/MainDashboardScreen.js - Smart Insights Dashboard
import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Card, Button, LoadingSpinner } from '../../components';
import { colors, spacing } from '../../styles';
import { useDebt } from '../../context/DebtContext';

const { width } = Dimensions.get('window');

const MainDashboardScreen = ({ navigation }) => {
  const {
    creditCards,
    transactions,
    totalDebt,
    totalCreditLimit,
    creditUtilization,
    initialLoading,
    dataLoaded,
    refreshData,
  } = useDebt();

  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState({});

  useEffect(() => {
    if (dataLoaded && creditCards.length > 0) {
      calculateSmartInsights();
    }
  }, [creditCards, transactions, dataLoaded]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const calculateSmartInsights = () => {
    if (!creditCards.length) return;

    // Calculate total interest being paid monthly
    const monthlyInterest = creditCards.reduce((total, card) => {
      if (card.currentBalance && card.estimatedAPR) {
        return total + (card.currentBalance * (card.estimatedAPR / 100) / 12);
      }
      return total;
    }, 0);

    // Find highest interest card
    const highestInterestCard = creditCards.reduce((max, card) => {
      const cardInterest = card.currentBalance * (card.estimatedAPR / 100) / 12;
      const maxInterest = max.currentBalance * (max.estimatedAPR / 100) / 12;
      return cardInterest > maxInterest ? card : max;
    }, creditCards[0]);

    // Calculate debt-to-limit ratios
    const highUtilizationCards = creditCards.filter(card => {
      if (card.currentBalance && card.creditLimit) {
        return (card.currentBalance / card.creditLimit) > 0.7; // Over 70% utilization
      }
      return false;
    });

    // Calculate minimum vs recommended payments
    const totalMinDue = creditCards.reduce((total, card) => total + (card.minimumDue || 0), 0);
    const recommendedPayment = totalDebt * 0.15; // 15% of total debt

    // Calculate payoff scenarios
    const minPayoffTime = calculatePayoffTime(totalDebt, totalMinDue, 40); // Assuming 40% APR
    const fastPayoffTime = calculatePayoffTime(totalDebt, recommendedPayment, 40);
    const interestSavings = (totalMinDue * minPayoffTime) - (recommendedPayment * fastPayoffTime);

    setInsights({
      monthlyInterest: Math.round(monthlyInterest),
      yearlyInterest: Math.round(monthlyInterest * 12),
      highestInterestCard,
      highUtilizationCards,
      totalMinDue: Math.round(totalMinDue),
      recommendedPayment: Math.round(recommendedPayment),
      minPayoffTime,
      fastPayoffTime,
      interestSavings: Math.round(interestSavings),
      riskLevel: calculateRiskLevel(),
    });
  };

  const calculatePayoffTime = (balance, monthlyPayment, apr) => {
    if (!balance || !monthlyPayment || monthlyPayment <= 0) return 0;
    
    const monthlyRate = apr / 100 / 12;
    if (monthlyPayment <= balance * monthlyRate) return 999; // Never pays off
    
    return Math.ceil(Math.log(1 + (balance * monthlyRate) / monthlyPayment) / Math.log(1 + monthlyRate));
  };

  const calculateRiskLevel = () => {
    if (creditUtilization > 80) return 'HIGH';
    if (creditUtilization > 50) return 'MEDIUM';
    if (creditUtilization > 30) return 'LOW';
    return 'EXCELLENT';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return '#F44336';
      case 'MEDIUM': return '#FF9800';
      case 'LOW': return '#FFC107';
      case 'EXCELLENT': return '#4CAF50';
      default: return colors.textColor;
    }
  };

  const getBankLogo = (bankName) => {
    const bankLogos = {
      'HDFC Bank': '🏦',
      'ICICI Bank': '🏛️',
      'SBI Card': '🏪',
      'Axis Bank': '🏢',
      'Kotak Mahindra Bank': '🏬',
      'American Express': '💳',
    };
    return bankLogos[bankName] || '💳';
  };

  // Show loading screen
  if (initialLoading || !dataLoaded) {
    return (
      <Screen safe>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner size="large" color={colors.primaryColor} />
          <Text variant="body1" align="center" style={{ marginTop: spacing.md }}>
            Loading your financial data...
          </Text>
        </View>
      </Screen>
    );
  }

  // Show empty state
  if (!creditCards || creditCards.length === 0) {
    return (
      <LinearGradient colors={[colors.primaryColor, colors.secondaryColor]} style={{ flex: 1 }}>
        <Screen safe style={{ backgroundColor: 'transparent' }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.lg }}>
            <View style={{
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center', alignItems: 'center',
              marginBottom: spacing.xl,
            }}>
              <Text style={{ fontSize: 48 }}>💳</Text>
            </View>

            <Text variant="h2" color="white" weight="700" align="center" style={{ marginBottom: spacing.lg }}>
              Start Your Debt-Free Journey
            </Text>
            
            <Text variant="body1" color="white" align="center" style={{ opacity: 0.9, marginBottom: spacing.xl, lineHeight: 24 }}>
              Scan your SMS messages to automatically detect credit cards and get personalized debt payoff strategies.
            </Text>

            <Button
              title="Scan SMS for Credit Cards"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => navigation.navigate('SMSPermission')}
              style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
              textStyle={{ color: colors.primaryColor }}
            />
          </View>
        </Screen>
      </LinearGradient>
    );
  }

  return (
    <Screen safe>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header with Risk Level */}
        <LinearGradient
          colors={[colors.primaryColor, colors.secondaryColor]}
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text variant="h3" color="white" weight="700">
              Debt Overview
            </Text>
            <View style={{
              backgroundColor: getRiskColor(insights.riskLevel),
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs,
              borderRadius: 12,
            }}>
              <Text variant="caption" color="white" weight="600">
                {insights.riskLevel || 'CALCULATING...'}
              </Text>
            </View>
          </View>
          
          <Text variant="body1" color="white" style={{ opacity: 0.9 }}>
            {creditCards.length} credit card{creditCards.length !== 1 ? 's' : ''} • {Math.round(creditUtilization)}% utilization
          </Text>
        </LinearGradient>

        {/* Smart Insights Cards */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: -spacing.lg }}>
          
          {/* Total Debt Card */}
          <Card style={{ 
            backgroundColor: 'white',
            marginBottom: spacing.lg,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="body2" style={{ opacity: 0.7, marginBottom: spacing.xs }}>
                Total Outstanding Debt
              </Text>
              <Text variant="h1" weight="700" color={totalDebt > 0 ? '#F44336' : '#4CAF50'}>
                {formatCurrency(totalDebt)}
              </Text>
              {totalCreditLimit > 0 && (
                <Text variant="body2" style={{ opacity: 0.7, marginTop: spacing.xs }}>
                  of {formatCurrency(totalCreditLimit)} total limit
                </Text>
              )}
            </View>
          </Card>

          {/* Interest Impact Card */}
          {insights.monthlyInterest > 0 && (
            <Card style={{
              backgroundColor: '#FFF3E0',
              borderLeftWidth: 4,
              borderLeftColor: '#FF9800',
              marginBottom: spacing.lg,
            }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: 24, marginRight: spacing.sm }}>💸</Text>
                  <Text variant="h5" weight="600" style={{ color: '#E65100' }}>
                    Interest Cost Alert
                  </Text>
                </View>
                
                <Text variant="body2" style={{ marginBottom: spacing.md, color: '#BF360C' }}>
                  You're paying approximately {formatCurrency(insights.monthlyInterest)} per month in interest charges.
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text variant="caption" style={{ opacity: 0.7 }}>Monthly Interest</Text>
                    <Text variant="h6" weight="600" style={{ color: '#F57C00' }}>
                      {formatCurrency(insights.monthlyInterest)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="caption" style={{ opacity: 0.7 }}>Yearly Impact</Text>
                    <Text variant="h6" weight="600" style={{ color: '#F57C00' }}>
                      {formatCurrency(insights.yearlyInterest)}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Payment Strategy Card */}
          {insights.recommendedPayment > insights.totalMinDue && (
            <Card style={{
              backgroundColor: '#E8F5E8',
              borderLeftWidth: 4,
              borderLeftColor: '#4CAF50',
              marginBottom: spacing.lg,
            }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: 24, marginRight: spacing.sm }}>💡</Text>
                  <Text variant="h5" weight="600" style={{ color: '#2E7D32' }}>
                    Smart Payment Strategy
                  </Text>
                </View>
                
                <Text variant="body2" style={{ marginBottom: spacing.md, color: '#1B5E20' }}>
                  Pay {formatCurrency(insights.recommendedPayment)} instead of {formatCurrency(insights.totalMinDue)} minimum due.
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text variant="caption" style={{ opacity: 0.7 }}>Payoff Time</Text>
                    <Text variant="h6" weight="600" style={{ color: '#388E3C' }}>
                      {insights.fastPayoffTime} months
                    </Text>
                    <Text variant="caption" style={{ opacity: 0.6 }}>
                      vs {insights.minPayoffTime} months
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="caption" style={{ opacity: 0.7 }}>Interest Savings</Text>
                    <Text variant="h6" weight="600" style={{ color: '#388E3C' }}>
                      {formatCurrency(insights.interestSavings)}
                    </Text>
                    <Text variant="caption" style={{ opacity: 0.6 }}>
                      total savings
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* High Risk Cards Alert */}
          {insights.highUtilizationCards && insights.highUtilizationCards.length > 0 && (
            <Card style={{
              backgroundColor: '#FFEBEE',
              borderLeftWidth: 4,
              borderLeftColor: '#F44336',
              marginBottom: spacing.lg,
            }}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: 24, marginRight: spacing.sm }}>⚠️</Text>
                  <Text variant="h5" weight="600" style={{ color: '#D32F2F' }}>
                    High Utilization Alert
                  </Text>
                </View>
                
                <Text variant="body2" style={{ marginBottom: spacing.md, color: '#C62828' }}>
                  {insights.highUtilizationCards.length} card{insights.highUtilizationCards.length !== 1 ? 's' : ''} over 70% utilization. This hurts your credit score.
                </Text>
                
                {insights.highUtilizationCards.map((card, index) => (
                  <View key={card.id} style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: spacing.xs,
                    borderTopWidth: index > 0 ? 1 : 0,
                    borderTopColor: 'rgba(244, 67, 54, 0.1)',
                  }}>
                    <Text variant="body2" weight="600" style={{ color: '#D32F2F' }}>
                      {card.bankName} ••{card.lastFourDigits}
                    </Text>
                    <Text variant="body2" weight="600" style={{ color: '#D32F2F' }}>
                      {Math.round((card.currentBalance / card.creditLimit) * 100)}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>

        {/* Credit Cards List */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}>
            <Text variant="h4" weight="600">
              Your Credit Cards
            </Text>
            <TouchableOpacity>
              <Text variant="body2" color={colors.primaryColor} weight="600">
                Manage Cards
              </Text>
            </TouchableOpacity>
          </View>
          
          {creditCards.map((card, index) => {
            const utilization = card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0;
            const monthlyInterest = card.currentBalance * ((card.estimatedAPR || 40) / 100) / 12;
            
            return (
              <TouchableOpacity key={card.id} activeOpacity={0.8} style={{ marginBottom: spacing.lg }}>
                <LinearGradient
                  colors={index % 2 === 0 ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
                  style={{ borderRadius: 16, padding: spacing.lg }}
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
                          {card.estimatedAPR}% APR
                        </Text>
                      </View>
                    </View>
                    
                    {card.needsVerification && (
                      <TouchableOpacity style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs,
                        borderRadius: 8,
                      }}>
                        <Text variant="caption" color="white" weight="600">
                          Verify
                        </Text>
                      </TouchableOpacity>
                    )}
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
                        Outstanding Balance
                      </Text>
                      <Text variant="h5" color="white" weight="600">
                        {formatCurrency(card.currentBalance || 0)}
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'center' }}>
                      <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                        Monthly Interest
                      </Text>
                      <Text variant="h6" color="white" weight="600">
                        {formatCurrency(monthlyInterest)}
                      </Text>
                    </View>
                    
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                        Credit Limit
                      </Text>
                      <Text variant="h5" color="white" weight="600">
                        {formatCurrency(card.creditLimit || 0)}
                      </Text>
                    </View>
                  </View>

                  {/* Utilization Bar */}
                  <View>
                    <View style={{
                      height: 4,
                      backgroundColor: 'rgba(255,255,255,0.3)',
                      borderRadius: 2,
                      marginBottom: spacing.xs,
                    }}>
                      <View style={{
                        height: '100%',
                        backgroundColor: utilization > 70 ? '#FF5252' : utilization > 50 ? '#FFC107' : 'white',
                        borderRadius: 2,
                        width: `${Math.min(utilization, 100)}%`,
                      }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                        {Math.round(utilization)}% utilized
                      </Text>
                      {card.dueDate && (
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Due: {new Date(card.dueDate).toLocaleDateString('en-IN')}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Payment Info */}
                  {(card.totalDue || card.minimumDue) && (
                    <View style={{
                      marginTop: spacing.sm,
                      paddingTop: spacing.sm,
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(255,255,255,0.2)',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                      <View>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Total Due
                        </Text>
                        <Text variant="body1" color="white" weight="600">
                          {formatCurrency(card.totalDue || card.currentBalance || 0)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Min Due
                        </Text>
                        <Text variant="body1" color="white" weight="600">
                          {formatCurrency(card.minimumDue || 0)}
                        </Text>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <Text variant="h4" weight="600" style={{ marginBottom: spacing.lg }}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
            <Button
              title="Rescan SMS"
              variant="primary"
              size="medium"
              onPress={() => navigation.navigate('SMSScanning')}
              style={{ flex: 1, marginRight: spacing.sm }}
            />
            
            <Button
              title="Payoff Planner"
              variant="secondary"
              size="medium"
              onPress={() => {
                // TODO: Navigate to payoff planner screen
                console.log('Payoff planner coming soon');
              }}
              style={{ flex: 1, marginLeft: spacing.sm }}
            />
          </View>

          <Button
            title="Set Payment Reminders"
            variant="outline"
            size="medium"
            fullWidth
            onPress={() => {
              // TODO: Navigate to payment reminders
              console.log('Payment reminders coming soon');
            }}
          />
        </View>

      </ScrollView>
    </Screen>
  );
};

export default MainDashboardScreen;