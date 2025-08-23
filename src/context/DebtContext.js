// src/context/DebtContext.js - Global Debt State Management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageService from '../services/storage/StorageService';
import SMSReader from '../services/sms/SMSReader';

// Initial state
const initialState = {
  // Credit cards data
  creditCards: [],
  transactions: [],
  
  // Loading states
  loading: false,
  smsScanning: false,
  
  // App state
  hasCompletedOnboarding: false,
  hasGrantedSMSPermission: false,
  lastSMSScan: null,
  
  // Statistics
  totalDebt: 0,
  totalCreditLimit: 0,
  creditUtilization: 0,
  monthlySpending: 0,
  
  // SMS monitoring
  smsMonitoringActive: false,
  newTransactionsCount: 0,
  
  // Error handling
  error: null,
  
  // User preferences
  preferences: {
    notifications: true,
    smsMonitoring: true,
    currency: 'INR',
    theme: 'light',
  },
};

// Action types
const ActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_SMS_SCANNING: 'SET_SMS_SCANNING',
  SET_CREDIT_CARDS: 'SET_CREDIT_CARDS',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_CREDIT_CARD: 'ADD_CREDIT_CARD',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_CREDIT_CARD: 'UPDATE_CREDIT_CARD',
  SET_APP_STATE: 'SET_APP_STATE',
  SET_STATISTICS: 'SET_STATISTICS',
  SET_SMS_MONITORING: 'SET_SMS_MONITORING',
  SET_NEW_TRANSACTIONS_COUNT: 'SET_NEW_TRANSACTIONS_COUNT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_PREFERENCES: 'SET_PREFERENCES',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const debtReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionTypes.SET_SMS_SCANNING:
      return { ...state, smsScanning: action.payload };
      
    case ActionTypes.SET_CREDIT_CARDS:
      return { 
        ...state, 
        creditCards: action.payload,
        totalDebt: calculateTotalDebt(action.payload),
        totalCreditLimit: calculateTotalCreditLimit(action.payload),
        creditUtilization: calculateCreditUtilization(action.payload),
      };
      
    case ActionTypes.SET_TRANSACTIONS:
      return { 
        ...state, 
        transactions: action.payload,
        monthlySpending: calculateMonthlySpending(action.payload),
      };
      
    case ActionTypes.ADD_CREDIT_CARD:
      const updatedCards = [...state.creditCards, action.payload];
      return {
        ...state,
        creditCards: updatedCards,
        totalDebt: calculateTotalDebt(updatedCards),
        totalCreditLimit: calculateTotalCreditLimit(updatedCards),
        creditUtilization: calculateCreditUtilization(updatedCards),
      };
      
    case ActionTypes.ADD_TRANSACTION:
      const updatedTransactions = [action.payload, ...state.transactions];
      return {
        ...state,
        transactions: updatedTransactions,
        monthlySpending: calculateMonthlySpending(updatedTransactions),
        newTransactionsCount: state.newTransactionsCount + 1,
      };
      
    case ActionTypes.UPDATE_CREDIT_CARD:
      const cardIndex = state.creditCards.findIndex(card => card.id === action.payload.id);
      if (cardIndex >= 0) {
        const newCards = [...state.creditCards];
        newCards[cardIndex] = { ...newCards[cardIndex], ...action.payload };
        return {
          ...state,
          creditCards: newCards,
          totalDebt: calculateTotalDebt(newCards),
          totalCreditLimit: calculateTotalCreditLimit(newCards),
          creditUtilization: calculateCreditUtilization(newCards),
        };
      }
      return state;
      
    case ActionTypes.SET_APP_STATE:
      return { ...state, ...action.payload };
      
    case ActionTypes.SET_STATISTICS:
      return { ...state, ...action.payload };
      
    case ActionTypes.SET_SMS_MONITORING:
      return { ...state, smsMonitoringActive: action.payload };
      
    case ActionTypes.SET_NEW_TRANSACTIONS_COUNT:
      return { ...state, newTransactionsCount: action.payload };
      
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
      
    case ActionTypes.SET_PREFERENCES:
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
      
    case ActionTypes.RESET_STATE:
      return { ...initialState };
      
    default:
      return state;
  }
};

// Helper functions for calculations
const calculateTotalDebt = (creditCards) => {
  return creditCards.reduce((total, card) => total + (card.currentBalance || 0), 0);
};

const calculateTotalCreditLimit = (creditCards) => {
  return creditCards.reduce((total, card) => total + (card.creditLimit || 0), 0);
};

const calculateCreditUtilization = (creditCards) => {
  const totalDebt = calculateTotalDebt(creditCards);
  const totalLimit = calculateTotalCreditLimit(creditCards);
  return totalLimit > 0 ? (totalDebt / totalLimit) * 100 : 0;
};

const calculateMonthlySpending = (transactions) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return transactions
    .filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             transaction.type === 'purchase';
    })
    .reduce((total, transaction) => total + transaction.amount, 0);
};

// Create context
const DebtContext = createContext();

// Context provider component
export const DebtProvider = ({ children }) => {
  const [state, dispatch] = useReducer(debtReducer, initialState);

  // Load initial data on app start
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load data from storage
  const loadInitialData = async () => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: true });
    
    try {
      // Load credit cards
      const creditCards = await StorageService.getCreditCards();
      dispatch({ type: ActionTypes.SET_CREDIT_CARDS, payload: creditCards });
      
      // Load transactions
      const transactions = await StorageService.getTransactions();
      dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions });
      
      // Load app state
      const appState = await StorageService.getAppState();
      dispatch({ type: ActionTypes.SET_APP_STATE, payload: appState });
      
      // Load user preferences
      const preferences = await StorageService.getUserPreferences();
      dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences });
      
      // Load last SMS scan
      const lastScan = await StorageService.getLastSMSScan();
      dispatch({ type: ActionTypes.SET_APP_STATE, payload: { lastSMSScan: lastScan } });
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to load data' });
    } finally {
      dispatch({ type: ActionTypes.SET_LOADING, payload: false });
    }
  };

  // Action creators
  const actions = {
    // SMS and data loading
    startSMSScanning: () => {
      dispatch({ type: ActionTypes.SET_SMS_SCANNING, payload: true });
    },

    stopSMSScanning: () => {
      dispatch({ type: ActionTypes.SET_SMS_SCANNING, payload: false });
    },

    updateScanProgress: (progress) => {
      // This could be used to update scanning progress if needed
    },

    // Credit card actions
    addCreditCard: async (creditCard) => {
      try {
        dispatch({ type: ActionTypes.ADD_CREDIT_CARD, payload: creditCard });
        await StorageService.saveCreditCards([...state.creditCards, creditCard]);
      } catch (error) {
        console.error('Error adding credit card:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to add credit card' });
      }
    },

    updateCreditCard: async (creditCard) => {
      try {
        dispatch({ type: ActionTypes.UPDATE_CREDIT_CARD, payload: creditCard });
        const updatedCards = state.creditCards.map(card => 
          card.id === creditCard.id ? { ...card, ...creditCard } : card
        );
        await StorageService.saveCreditCards(updatedCards);
      } catch (error) {
        console.error('Error updating credit card:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to update credit card' });
      }
    },

    setCreditCards: async (creditCards) => {
      try {
        dispatch({ type: ActionTypes.SET_CREDIT_CARDS, payload: creditCards });
        await StorageService.saveCreditCards(creditCards);
      } catch (error) {
        console.error('Error setting credit cards:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to save credit cards' });
      }
    },

    // Transaction actions
    addTransaction: async (transaction) => {
      try {
        dispatch({ type: ActionTypes.ADD_TRANSACTION, payload: transaction });
        await StorageService.saveTransactions([transaction, ...state.transactions]);
      } catch (error) {
        console.error('Error adding transaction:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to add transaction' });
      }
    },

    setTransactions: async (transactions) => {
      try {
        dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions });
        await StorageService.saveTransactions(transactions);
      } catch (error) {
        console.error('Error setting transactions:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to save transactions' });
      }
    },

    // App state actions
    setAppState: async (appState) => {
      try {
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: appState });
        await StorageService.saveAppState({ ...state, ...appState });
      } catch (error) {
        console.error('Error setting app state:', error);
      }
    },

    markOnboardingComplete: async () => {
      try {
        const newState = { hasCompletedOnboarding: true };
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: newState });
        await StorageService.saveAppState({ ...state, ...newState });
      } catch (error) {
        console.error('Error marking onboarding complete:', error);
      }
    },

    setSMSPermissionGranted: async (granted) => {
      try {
        const newState = { hasGrantedSMSPermission: granted };
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: newState });
        await StorageService.saveAppState({ ...state, ...newState });
      } catch (error) {
        console.error('Error setting SMS permission state:', error);
      }
    },

    // SMS monitoring actions
    startSMSMonitoring: () => {
      if (!state.smsMonitoringActive && state.preferences.smsMonitoring) {
        const intervalId = SMSReader.startSMSMonitoring((newSMS) => {
          // Handle new SMS messages
          console.log('New SMS detected:', newSMS.length);
          // This would trigger parsing of new SMS
        });
        
        dispatch({ type: ActionTypes.SET_SMS_MONITORING, payload: true });
        return intervalId;
      }
    },

    stopSMSMonitoring: (intervalId) => {
      if (intervalId) {
        SMSReader.stopSMSMonitoring(intervalId);
      }
      dispatch({ type: ActionTypes.SET_SMS_MONITORING, payload: false });
    },

    clearNewTransactionsCount: () => {
      dispatch({ type: ActionTypes.SET_NEW_TRANSACTIONS_COUNT, payload: 0 });
    },

    // Preferences actions
    updatePreferences: async (preferences) => {
      try {
        dispatch({ type: ActionTypes.SET_PREFERENCES, payload: preferences });
        await StorageService.saveUserPreferences({ ...state.preferences, ...preferences });
      } catch (error) {
        console.error('Error updating preferences:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to update preferences' });
      }
    },

    // Error handling
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    // Data management
    refreshData: async () => {
      await loadInitialData();
    },

    clearAllData: async () => {
      try {
        await StorageService.clearAllData();
        dispatch({ type: ActionTypes.RESET_STATE });
      } catch (error) {
        console.error('Error clearing data:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to clear data' });
      }
    },

    // Statistics and insights
    getDebtInsights: () => {
      const { creditCards, transactions } = state;
      
      // Calculate insights
      const highestDebtCard = creditCards.reduce((max, card) => 
        (card.currentBalance || 0) > (max.currentBalance || 0) ? card : max, 
        creditCards[0] || {}
      );
      
      const highestUtilizationCard = creditCards.reduce((max, card) => {
        const utilization = card.creditLimit > 0 ? (card.currentBalance / card.creditLimit) * 100 : 0;
        const maxUtilization = max.creditLimit > 0 ? (max.currentBalance / max.creditLimit) * 100 : 0;
        return utilization > maxUtilization ? card : max;
      }, creditCards[0] || {});
      
      const recentTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return transactionDate >= sevenDaysAgo;
      });
      
      return {
        highestDebtCard,
        highestUtilizationCard,
        recentTransactionsCount: recentTransactions.length,
        averageTransactionAmount: recentTransactions.length > 0 
          ? recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length 
          : 0,
      };
    },
  };

  const contextValue = {
    ...state,
    ...actions,
  };

  return (
    <DebtContext.Provider value={contextValue}>
      {children}
    </DebtContext.Provider>
  );
};

// Custom hook to use the debt context
export const useDebt = () => {
  const context = useContext(DebtContext);
  if (!context) {
    throw new Error('useDebt must be used within a DebtProvider');
  }
  return context;
};

export default DebtContext;