// src/context/DebtContext.js - Fixed Global Debt State Management
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import StorageService from '../services/storage/StorageService';
import SMSReader from '../services/sms/SMSReader';

// Initial state
const initialState = {
  // Credit cards data
  creditCards: [],
  transactions: [],
  
  // Loading states - FIXED: Added proper loading states
  loading: false,           // General loading
  initialLoading: true,     // NEW: Initial app data loading
  smsScanning: false,       // SMS scanning specific
  dataLoaded: false,        // NEW: Flag to track if data has been loaded
  
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
  SET_INITIAL_LOADING: 'SET_INITIAL_LOADING',  // NEW
  SET_DATA_LOADED: 'SET_DATA_LOADED',         // NEW
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
  LOAD_INITIAL_DATA_SUCCESS: 'LOAD_INITIAL_DATA_SUCCESS', // NEW
  LOAD_INITIAL_DATA_ERROR: 'LOAD_INITIAL_DATA_ERROR',     // NEW
};

// Reducer function - FIXED: Added proper loading state management
const debtReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_INITIAL_LOADING:
      return { ...state, initialLoading: action.payload };
      
    case ActionTypes.SET_DATA_LOADED:
      return { ...state, dataLoaded: action.payload };
      
    case ActionTypes.LOAD_INITIAL_DATA_SUCCESS:
      return {
        ...state,
        creditCards: action.payload.creditCards || [],
        transactions: action.payload.transactions || [],
        hasCompletedOnboarding: action.payload.appState?.hasCompletedOnboarding || false,
        hasGrantedSMSPermission: action.payload.appState?.hasGrantedSMSPermission || false,
        lastSMSScan: action.payload.appState?.lastSMSScan || null,
        preferences: { ...state.preferences, ...action.payload.preferences },
        totalDebt: calculateTotalDebt(action.payload.creditCards || []),
        totalCreditLimit: calculateTotalCreditLimit(action.payload.creditCards || []),
        creditUtilization: calculateCreditUtilization(action.payload.creditCards || []),
        monthlySpending: calculateMonthlySpending(action.payload.transactions || []),
        initialLoading: false,
        dataLoaded: true,
        error: null,
      };
      
    case ActionTypes.LOAD_INITIAL_DATA_ERROR:
      return {
        ...state,
        initialLoading: false,
        dataLoaded: true,
        error: action.payload,
      };
      
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
      return { ...initialState, initialLoading: false, dataLoaded: true };
      
    default:
      return state;
  }
};

// Helper functions for calculations (same as before)
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

// Context provider component - FIXED: Proper initialization
export const DebtProvider = ({ children }) => {
  const [state, dispatch] = useReducer(debtReducer, initialState);

  // FIXED: Load initial data on app start with proper error handling
  useEffect(() => {
    loadInitialData();
  }, []);

  // FIXED: Comprehensive data loading with single dispatch
  const loadInitialData = async () => {
    console.log('🔄 Loading initial data from storage...');
    
    try {
      dispatch({ type: ActionTypes.SET_INITIAL_LOADING, payload: true });
      
      // Load all data in parallel
      const [creditCards, transactions, appState, preferences, lastScan] = await Promise.all([
        StorageService.getCreditCards(),
        StorageService.getTransactions(),
        StorageService.getAppState(),
        StorageService.getUserPreferences(),
        StorageService.getLastSMSScan()
      ]);
      
      console.log('📊 Loaded data:', {
        creditCards: creditCards.length,
        transactions: transactions.length,
        hasCompletedOnboarding: appState?.hasCompletedOnboarding,
        lastScan: lastScan ? new Date(lastScan).toLocaleDateString() : null
      });
      
      // Single dispatch with all loaded data
      dispatch({
        type: ActionTypes.LOAD_INITIAL_DATA_SUCCESS,
        payload: {
          creditCards,
          transactions,
          appState: {
            ...appState,
            lastSMSScan: lastScan
          },
          preferences
        }
      });
      
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      dispatch({
        type: ActionTypes.LOAD_INITIAL_DATA_ERROR,
        payload: 'Failed to load data'
      });
    }
  };

  // Action creators - UPDATED: Better error handling and state management
  const actions = {
    // SMS and data loading
    startSMSScanning: () => {
      dispatch({ type: ActionTypes.SET_SMS_SCANNING, payload: true });
    },

    stopSMSScanning: () => {
      dispatch({ type: ActionTypes.SET_SMS_SCANNING, payload: false });
    },

    // Credit card actions - FIXED: Proper async handling
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

    // FIXED: Proper batch save with immediate UI update
    setCreditCards: async (creditCards) => {
      try {
        // Update UI immediately
        dispatch({ type: ActionTypes.SET_CREDIT_CARDS, payload: creditCards });
        
        // Save to storage
        await StorageService.saveCreditCards(creditCards);
        
        console.log('✅ Credit cards updated successfully:', creditCards.length);
      } catch (error) {
        console.error('❌ Error setting credit cards:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to save credit cards' });
      }
    },

    // Transaction actions - FIXED
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
        // Update UI immediately
        dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions });
        
        // Save to storage
        await StorageService.saveTransactions(transactions);
        
        console.log('✅ Transactions updated successfully:', transactions.length);
      } catch (error) {
        console.error('❌ Error setting transactions:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to save transactions' });
      }
    },

    // App state actions - FIXED: Immediate UI updates
    setAppState: async (appStateUpdate) => {
      try {
        // Update UI immediately
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: appStateUpdate });
        
        // Save to storage
        const newAppState = { ...state, ...appStateUpdate };
        await StorageService.saveAppState(newAppState);
        
        console.log('✅ App state updated:', appStateUpdate);
      } catch (error) {
        console.error('❌ Error setting app state:', error);
      }
    },

    markOnboardingComplete: async () => {
      try {
        const newState = { hasCompletedOnboarding: true };
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: newState });
        await StorageService.saveAppState({ ...state, ...newState });
        console.log('✅ Onboarding marked complete');
      } catch (error) {
        console.error('❌ Error marking onboarding complete:', error);
      }
    },

    setSMSPermissionGranted: async (granted) => {
      try {
        const newState = { hasGrantedSMSPermission: granted };
        dispatch({ type: ActionTypes.SET_APP_STATE, payload: newState });
        await StorageService.saveAppState({ ...state, ...newState });
        console.log('✅ SMS permission state updated:', granted);
      } catch (error) {
        console.error('❌ Error setting SMS permission state:', error);
      }
    },

    // FIXED: Batch update after SMS scanning
    updateAfterSMSScanning: async (creditCards, transactions) => {
      try {
        console.log('🔄 Updating data after SMS scanning...');
        
        // Update both immediately
        dispatch({ type: ActionTypes.SET_CREDIT_CARDS, payload: creditCards });
        dispatch({ type: ActionTypes.SET_TRANSACTIONS, payload: transactions });
        
        // Save both to storage
        await Promise.all([
          StorageService.saveCreditCards(creditCards),
          StorageService.saveTransactions(transactions),
          StorageService.saveLastSMSScan(new Date()),
        ]);
        
        // Update app state
        await actions.setAppState({
          hasCompletedOnboarding: true,
          hasParsedSMS: true,
          lastSMSScan: new Date().toISOString()
        });
        
        console.log('✅ SMS scanning data saved successfully');
      } catch (error) {
        console.error('❌ Error updating after SMS scanning:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to save SMS data' });
      }
    },

    // Data management - FIXED: Proper refresh
    refreshData: async () => {
      console.log('🔄 Refreshing all data...');
      await loadInitialData();
    },

    clearAllData: async () => {
      try {
        await StorageService.clearAllData();
        dispatch({ type: ActionTypes.RESET_STATE });
        console.log('✅ All data cleared');
      } catch (error) {
        console.error('❌ Error clearing data:', error);
        dispatch({ type: ActionTypes.SET_ERROR, payload: 'Failed to clear data' });
      }
    },

    // Error handling
    setError: (error) => {
      dispatch({ type: ActionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: ActionTypes.CLEAR_ERROR });
    },

    // Statistics and insights (same as before)
    getDebtInsights: () => {
      const { creditCards, transactions } = state;
      
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