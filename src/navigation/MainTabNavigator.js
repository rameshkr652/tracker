// src/navigation/MainTabNavigator.js - Bottom Tab Navigator
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Text } from '../components';
import { colors, spacing } from '../styles';

// Import Screens
import MainDashboardScreen from '../screens/dashboard/MainDashboardScreen';

const Tab = createBottomTabNavigator();

// Placeholder screens for tabs that don't exist yet
const CardsScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: spacing.lg,
  }}>
    <View style={{
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }}>
      <Icon name="credit-card" size={40} color={colors.primaryColor} />
    </View>
    <Text variant="h4" style={{ marginBottom: spacing.sm }}>Credit Cards</Text>
    <Text variant="body1" style={{ opacity: 0.7, textAlign: 'center' }}>
      View and manage your credit cards
    </Text>
  </View>
);

const TransactionsScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: spacing.lg,
  }}>
    <View style={{
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }}>
      <Icon name="receipt-long" size={40} color={colors.primaryColor} />
    </View>
    <Text variant="h4" style={{ marginBottom: spacing.sm }}>Transactions</Text>
    <Text variant="body1" style={{ opacity: 0.7, textAlign: 'center' }}>
      View your transaction history
    </Text>
  </View>
);

const AnalyticsScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: spacing.lg,
  }}>
    <View style={{
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }}>
      <Icon name="analytics" size={40} color={colors.primaryColor} />
    </View>
    <Text variant="h4" style={{ marginBottom: spacing.sm }}>Analytics</Text>
    <Text variant="body1" style={{ opacity: 0.7, textAlign: 'center' }}>
      View spending analytics and insights
    </Text>
  </View>
);

const SettingsScreen = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.backgroundColor,
    paddingHorizontal: spacing.lg,
  }}>
    <View style={{
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primaryColor + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    }}>
      <Icon name="settings" size={40} color={colors.primaryColor} />
    </View>
    <Text variant="h4" style={{ marginBottom: spacing.sm }}>Settings</Text>
    <Text variant="body1" style={{ opacity: 0.7, textAlign: 'center' }}>
      Manage app settings and preferences
    </Text>
  </View>
);

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
      paddingBottom: 5,
      paddingTop: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getIcon = () => {
          switch (route.name) {
            case 'Dashboard':
              return 'dashboard';
            case 'Cards':
              return 'credit-card';
            case 'Transactions':
              return 'receipt-long';
            case 'Analytics':
              return 'analytics';
            case 'Settings':
              return 'settings';
            default:
              return 'circle';
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.sm,
            }}
          >
            <Icon
              name={getIcon()}
              size={24}
              color={isFocused ? colors.primaryColor : colors.secondaryTextColor}
            />
            <Text
              variant="caption"
              style={{
                color: isFocused ? colors.primaryColor : colors.secondaryTextColor,
                marginTop: 4,
                fontSize: 11,
              }}
            >
              {route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Bottom Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={MainDashboardScreen} />
      <Tab.Screen name="Cards" component={CardsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;