// src/screens/dashboard/MainDashboardScreen.js - Main Dashboard with Debt Overview
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Screen, Text, Card, Button } from '../../components';
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
    monthlySpending,
    loading,
    refreshData,
    getDebtInsights,
  } = useDebt();

  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState({});

  useEffect(() => {
    setInsights(getDebtInsights());
  }, [creditCards, transactions]);

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

  const getUtilizationColor = (utilization) => {
    if (utilization < 30) return '#4CAF50'; // Green
    if (utilization < 70) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getBankLogo = (bankName) => {
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

  const getRecentTransactions = () => {
    return transactions
      .slice(0, 5)
      .map(transaction => {
        const card = creditCards.find(c => c.id === transaction.cardId);
        return { ...transaction, card };
      });
  };

  const getDebtRecommendation = () => {
    if (creditUtilization > 80) {
      return {
        icon: '🚨',
        title: 'High Credit Utilization',
        message: 'Your credit utilization is very high. Consider making payments to reduce debt.',
        priority: 'high',
      };
    } else if (creditUtilization > 50) {
      return {
        icon: '⚠️',
        title: 'Moderate Credit Usage',
        message: 'Try to keep your credit utilization below 30% for better credit health.',
        priority: 'medium',
      };
    } else if (totalDebt > 0) {
      return {
        icon: '💡',
        title: 'Good Credit Management',
        message: 'Your credit utilization is healthy. Consider paying off high-interest cards first.',
        priority: 'low',
      };
    } else {
      return {
        icon: '🎉',
        title: 'Debt Free!',
        message: 'Congratulations! You have no outstanding credit card debt.',
        priority: 'success',
      };
    }
  };

  const recommendation = getDebtRecommendation();

  if (creditCards.length === 0) {
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
              <Text style={{ fontSize: 48 }}>💳</Text>
            </View>

            <Text 
              variant="h2" 
              color="white" 
              weight="700"
              align="center"
              style={{ marginBottom: spacing.lg }}
            >
              Welcome to DebtTracker
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
              No credit cards found yet. Grant SMS permission to automatically detect your credit cards and start tracking your debt.
            </Text>

            <Button
              title="Scan SMS for Credit Cards"
              variant="secondary"
              size="large"
              fullWidth
              onPress={() => navigation.navigate('SMSPermission')}
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
    <Screen safe>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header */}
        <LinearGradient
          colors={[colors.primaryColor, colors.secondaryColor]}
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.xl,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <Text variant="h3" color="white" weight="700" style={{ marginBottom: spacing.sm }}>
            Your Debt Overview
          </Text>
          <Text variant="body1" color="white" style={{ opacity: 0.9 }}>
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </LinearGradient>

        {/* Debt Summary Cards */}
        <View style={{ 
          paddingHorizontal: spacing.lg,
          marginTop: -spacing.xl,
        }}>
          
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

          {/* Stats Row */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
          }}>
            
            {/* Credit Utilization */}
            <Card style={{ 
              flex: 1, 
              marginRight: spacing.sm,
              backgroundColor: 'white',
              alignItems: 'center',
            }}>
              <Text variant="body2" style={{ opacity: 0.7, marginBottom: spacing.xs }}>
                Credit Utilization
              </Text>
              <Text 
                variant="h3" 
                weight="700" 
                style={{ color: getUtilizationColor(creditUtilization) }}
              >
                {Math.round(creditUtilization)}%
              </Text>
            </Card>

            {/* Monthly Spending */}
            <Card style={{ 
              flex: 1, 
              marginLeft: spacing.sm,
              backgroundColor: 'white',
              alignItems: 'center',
            }}>
              <Text variant="body2" style={{ opacity: 0.7, marginBottom: spacing.xs }}>
                This Month
              </Text>
              <Text variant="h3" weight="700" color={colors.primaryColor}>
                {formatCurrency(monthlySpending)}
              </Text>
            </Card>

          </View>

          {/* AI Recommendation */}
          <Card style={{ 
            backgroundColor: recommendation.priority === 'high' ? '#FFEBEE' : 
                           recommendation.priority === 'medium' ? '#FFF3E0' :
                           recommendation.priority === 'success' ? '#E8F5E8' : '#F3E5F5',
            marginBottom: spacing.lg,
            borderLeftWidth: 4,
            borderLeftColor: recommendation.priority === 'high' ? '#F44336' : 
                            recommendation.priority === 'medium' ? '#FF9800' :
                            recommendation.priority === 'success' ? '#4CAF50' : colors.primaryColor,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 24, marginRight: spacing.md }}>
                {recommendation.icon}
              </Text>
              <View style={{ flex: 1 }}>
                <Text variant="h5" weight="600" style={{ marginBottom: spacing.xs }}>
                  {recommendation.title}
                </Text>
                <Text variant="body2" style={{ opacity: 0.8 }}>
                  {recommendation.message}
                </Text>
              </View>
            </View>
          </Card>

        </View>

        {/* Credit Cards Section */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Text variant="h4" weight="600" style={{ marginBottom: spacing.lg }}>
            Your Credit Cards ({creditCards.length})
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: spacing.lg }}
          >
            {creditCards.map((card, index) => {
              const utilization = card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0;
              
              return (
                <TouchableOpacity
                  key={card.id}
                  style={{ marginRight: spacing.md }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={index % 2 === 0 ? ['#667eea', '#764ba2'] : ['#f093fb', '#f5576c']}
                    style={{
                      width: width * 0.75,
                      borderRadius: 16,
                      padding: spacing.lg,
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
                        <Text style={{ fontSize: 20, marginRight: spacing.sm }}>
                          {getBankLogo(card.bankName)}
                        </Text>
                        <Text variant="body1" color="white" weight="600">
                          {card.bankName}
                        </Text>
                      </View>
                      
                      <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                        {card.cardType}
                      </Text>
                    </View>

                    {/* Card Number */}
                    <Text variant="h4" color="white" weight="600" style={{ marginBottom: spacing.lg }}>
                      •••• •••• •••• {card.lastFourDigits}
                    </Text>

                    {/* Balance Info */}
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between',
                      marginBottom: spacing.sm,
                    }}>
                      <View>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Outstanding
                        </Text>
                        <Text variant="h5" color="white" weight="600">
                          {formatCurrency(card.currentBalance)}
                        </Text>
                      </View>
                      
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                          Available
                        </Text>
                        <Text variant="h5" color="white" weight="600">
                          {formatCurrency((card.creditLimit || 0) - (card.currentBalance || 0))}
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
                          backgroundColor: 'white',
                          borderRadius: 2,
                          width: `${Math.min(utilization, 100)}%`,
                        }} />
                      </View>
                      <Text variant="caption" color="white" style={{ opacity: 0.8 }}>
                        {Math.round(utilization)}% utilized
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent Transactions */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xl }}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}>
            <Text variant="h4" weight="600">
              Recent Transactions
            </Text>
            <TouchableOpacity>
              <Text variant="body2" color={colors.primaryColor} weight="600">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {getRecentTransactions().map((transaction, index) => (
            <Card key={transaction.id} style={{ 
              backgroundColor: 'white',
              marginBottom: spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: transaction.type === 'purchase' ? '#FFEBEE' : '#E8F5E8',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: spacing.md,
              }}>
                <Text style={{ fontSize: 18 }}>
                  {transaction.type === 'purchase' ? '💳' : 
                   transaction.type === 'payment' ? '💰' : '📄'}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text variant="body1" weight="600" style={{ marginBottom: spacing.xs }}>
                  {transaction.merchant || 'Transaction'}
                </Text>
                <Text variant="body2" style={{ opacity: 0.7 }}>
                  {transaction.card?.bankName} •••• {transaction.card?.lastFourDigits}
                </Text>
              </View>
              
              <View style={{ alignItems: 'flex-end' }}>
                <Text 
                  variant="body1" 
                  weight="600"
                  style={{ 
                    color: transaction.type === 'purchase' ? '#F44336' : '#4CAF50',
                    marginBottom: spacing.xs,
                  }}
                >
                  {transaction.type === 'purchase' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </Text>
                <Text variant="caption" style={{ opacity: 0.7 }}>
                  {new Date(transaction.date).toLocaleDateString('en-IN')}
                </Text>
              </View>
            </Card>
          ))}

          {getRecentTransactions().length === 0 && (
            <Card style={{ 
              backgroundColor: 'white',
              alignItems: 'center',
              paddingVertical: spacing.xl,
            }}>
              <Text style={{ fontSize: 48, marginBottom: spacing.md }}>📊</Text>
              <Text variant="body1" style={{ opacity: 0.7 }}>
                No recent transactions found
              </Text>
            </Card>
          )}
        </View>

      </ScrollView>
    </Screen>
  );
};

export default MainDashboardScreen;