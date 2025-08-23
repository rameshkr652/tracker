// src/services/storage/StorageService.js - Local Storage Service
import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  
  // Storage keys
  static KEYS = {
    CREDIT_CARDS: '@DebtTracker:creditCards',
    TRANSACTIONS: '@DebtTracker:transactions',
    USER_PREFERENCES: '@DebtTracker:userPreferences',
    SMS_LAST_SCAN: '@DebtTracker:smsLastScan',
    APP_STATE: '@DebtTracker:appState',
  };

  /**
   * Save credit cards to storage
   * @param {Array} creditCards - Array of credit card objects
   * @returns {Promise<boolean>} Success status
   */
  static async saveCreditCards(creditCards) {
    try {
      const existingCards = await this.getCreditCards();
      const mergedCards = this.mergeCreditCards(existingCards, creditCards);
      
      await AsyncStorage.setItem(
        this.KEYS.CREDIT_CARDS, 
        JSON.stringify(mergedCards)
      );
      
      console.log(`Saved ${mergedCards.length} credit cards to storage`);
      return true;
    } catch (error) {
      console.error('Error saving credit cards:', error);
      return false;
    }
  }

  /**
   * Get all credit cards from storage
   * @returns {Promise<Array>} Array of credit card objects
   */
  static async getCreditCards() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CREDIT_CARDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting credit cards:', error);
      return [];
    }
  }

  /**
   * Save transactions to storage
   * @param {Array} transactions - Array of transaction objects
   * @returns {Promise<boolean>} Success status
   */
  static async saveTransactions(transactions) {
    try {
      const existingTransactions = await this.getTransactions();
      const mergedTransactions = this.mergeTransactions(existingTransactions, transactions);
      
      await AsyncStorage.setItem(
        this.KEYS.TRANSACTIONS, 
        JSON.stringify(mergedTransactions)
      );
      
      console.log(`Saved ${mergedTransactions.length} transactions to storage`);
      return true;
    } catch (error) {
      console.error('Error saving transactions:', error);
      return false;
    }
  }

  /**
   * Get all transactions from storage
   * @returns {Promise<Array>} Array of transaction objects
   */
  static async getTransactions() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  /**
   * Get transactions for a specific credit card
   * @param {string} cardId - Credit card ID
   * @returns {Promise<Array>} Array of transactions for the card
   */
  static async getTransactionsByCard(cardId) {
    try {
      const allTransactions = await this.getTransactions();
      return allTransactions.filter(transaction => transaction.cardId === cardId);
    } catch (error) {
      console.error('Error getting transactions by card:', error);
      return [];
    }
  }

  /**
   * Get recent transactions (last 30 days)
   * @returns {Promise<Array>} Array of recent transactions
   */
  static async getRecentTransactions() {
    try {
      const allTransactions = await this.getTransactions();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      return allTransactions.filter(transaction => 
        new Date(transaction.date) >= thirtyDaysAgo
      );
    } catch (error) {
      console.error('Error getting recent transactions:', error);
      return [];
    }
  }

  /**
   * Save user preferences
   * @param {Object} preferences - User preferences object
   * @returns {Promise<boolean>} Success status
   */
  static async saveUserPreferences(preferences) {
    try {
      const existingPrefs = await this.getUserPreferences();
      const mergedPrefs = { ...existingPrefs, ...preferences };
      
      await AsyncStorage.setItem(
        this.KEYS.USER_PREFERENCES, 
        JSON.stringify(mergedPrefs)
      );
      
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   * @returns {Promise<Object>} User preferences object
   */
  static async getUserPreferences() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {
        notifications: true,
        smsMonitoring: true,
        currency: 'INR',
        theme: 'light',
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return {};
    }
  }

  /**
   * Save last SMS scan timestamp
   * @param {Date} timestamp - Last scan timestamp
   * @returns {Promise<boolean>} Success status
   */
  static async saveLastSMSScan(timestamp) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.SMS_LAST_SCAN, 
        timestamp.toISOString()
      );
      return true;
    } catch (error) {
      console.error('Error saving last SMS scan:', error);
      return false;
    }
  }

  /**
   * Get last SMS scan timestamp
   * @returns {Promise<Date|null>} Last scan timestamp
   */
  static async getLastSMSScan() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SMS_LAST_SCAN);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error('Error getting last SMS scan:', error);
      return null;
    }
  }

  /**
   * Save app state
   * @param {Object} state - App state object
   * @returns {Promise<boolean>} Success status
   */
  static async saveAppState(state) {
    try {
      await AsyncStorage.setItem(
        this.KEYS.APP_STATE, 
        JSON.stringify(state)
      );
      return true;
    } catch (error) {
      console.error('Error saving app state:', error);
      return false;
    }
  }

  /**
   * Get app state
   * @returns {Promise<Object>} App state object
   */
  static async getAppState() {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.APP_STATE);
      return data ? JSON.parse(data) : {
        hasCompletedOnboarding: false,
        hasGrantedSMSPermission: false,
        lastSMSScan: null,
        totalCreditCards: 0,
        totalTransactions: 0,
      };
    } catch (error) {
      console.error('Error getting app state:', error);
      return {};
    }
  }

  /**
   * Clear all data (for reset/logout)
   * @returns {Promise<boolean>} Success status
   */
  static async clearAllData() {
    try {
      await AsyncStorage.multiRemove([
        this.KEYS.CREDIT_CARDS,
        this.KEYS.TRANSACTIONS,
        this.KEYS.SMS_LAST_SCAN,
        this.KEYS.APP_STATE,
      ]);
      
      console.log('All data cleared from storage');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {Promise<Object>} Storage statistics
   */
  static async getStorageStats() {
    try {
      const creditCards = await this.getCreditCards();
      const transactions = await this.getTransactions();
      const lastScan = await this.getLastSMSScan();
      
      // Calculate total debt
      const totalDebt = creditCards.reduce((sum, card) => 
        sum + (card.currentBalance || 0), 0
      );
      
      // Calculate total credit limit
      const totalCreditLimit = creditCards.reduce((sum, card) => 
        sum + (card.creditLimit || 0), 0
      );
      
      // Calculate recent transactions (last 30 days)
      const recentTransactions = await this.getRecentTransactions();
      
      return {
        totalCreditCards: creditCards.length,
        totalTransactions: transactions.length,
        recentTransactions: recentTransactions.length,
        totalDebt,
        totalCreditLimit,
        creditUtilization: totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0,
        lastSMSScan: lastScan,
        dataSize: await this.calculateDataSize(),
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {};
    }
  }

  /**
   * Calculate approximate data size in storage
   * @returns {Promise<number>} Data size in bytes
   */
  static async calculateDataSize() {
    try {
      let totalSize = 0;
      
      for (const key of Object.values(this.KEYS)) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating data size:', error);
      return 0;
    }
  }

  /**
   * Merge existing credit cards with new ones (avoid duplicates)
   * @param {Array} existing - Existing credit cards
   * @param {Array} newCards - New credit cards
   * @returns {Array} Merged credit cards
   */
  static mergeCreditCards(existing, newCards) {
    const merged = [...existing];
    
    newCards.forEach(newCard => {
      const existingIndex = merged.findIndex(card => 
        card.id === newCard.id || 
        (card.bankName === newCard.bankName && card.lastFourDigits === newCard.lastFourDigits)
      );
      
      if (existingIndex >= 0) {
        // Update existing card with new information
        merged[existingIndex] = {
          ...merged[existingIndex],
          ...newCard,
          lastUpdated: new Date().toISOString(),
        };
      } else {
        // Add new card
        merged.push({
          ...newCard,
          lastUpdated: new Date().toISOString(),
        });
      }
    });
    
    return merged;
  }

  /**
   * Merge existing transactions with new ones (avoid duplicates)
   * @param {Array} existing - Existing transactions
   * @param {Array} newTransactions - New transactions
   * @returns {Array} Merged transactions
   */
  static mergeTransactions(existing, newTransactions) {
    const merged = [...existing];
    
    newTransactions.forEach(newTransaction => {
      // Check for duplicate based on amount, date, and card
      const isDuplicate = merged.some(transaction => 
        transaction.amount === newTransaction.amount &&
        transaction.cardId === newTransaction.cardId &&
        Math.abs(new Date(transaction.date) - new Date(newTransaction.date)) < 60000 // Within 1 minute
      );
      
      if (!isDuplicate) {
        merged.push(newTransaction);
      }
    });
    
    // Sort by date (newest first)
    return merged.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Export data for backup
   * @returns {Promise<Object>} Exported data
   */
  static async exportData() {
    try {
      const creditCards = await this.getCreditCards();
      const transactions = await this.getTransactions();
      const preferences = await this.getUserPreferences();
      const appState = await this.getAppState();
      
      return {
        creditCards,
        transactions,
        preferences,
        appState,
        exportDate: new Date().toISOString(),
        version: '1.0',
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import data from backup
   * @param {Object} data - Data to import
   * @returns {Promise<boolean>} Success status
   */
  static async importData(data) {
    try {
      if (!data || !data.creditCards || !data.transactions) {
        throw new Error('Invalid data format');
      }
      
      await this.saveCreditCards(data.creditCards);
      await this.saveTransactions(data.transactions);
      
      if (data.preferences) {
        await this.saveUserPreferences(data.preferences);
      }
      
      if (data.appState) {
        await this.saveAppState(data.appState);
      }
      
      console.log('Data imported successfully');
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

export default StorageService;