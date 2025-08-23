// src/services/sms/SMSParser.js - Universal SMS Parser for Indian Banks with Error Handling
import { bankPatterns } from '../../utils/constants/bankPatterns';
import ErrorHandler, { ErrorTypes } from '../../utils/helpers/errorHandler';

class SMSParser {
  constructor() {
    this.transactionTypes = {
      PURCHASE: 'purchase',
      PAYMENT: 'payment',
      FEE: 'fee',
      INTEREST: 'interest',
      REFUND: 'refund',
      CASH_ADVANCE: 'cash_advance',
      BALANCE_UPDATE: 'balance_update',
    };
  }

  /**
   * Parse SMS message to extract credit card and transaction data
   * @param {Object} sms - SMS message object
   * @returns {Object} Parsed data containing credit card and transaction info
   */
  parseSMS(sms) {
    try {
      // Validate SMS input
      ErrorHandler.validateSMS(sms);

      const body = sms.body;
      const sender = sms.address || '';
      const date = new Date(parseInt(sms.date));

      // Extract credit card information
      const creditCard = this.extractCreditCard(body, sender);
      
      // Extract transaction information
      const transaction = this.extractTransaction(body, date);

      return {
        success: true,
        creditCard,
        transaction,
        originalSMS: {
          body,
          sender,
          date,
        },
        error: null,
      };
    } catch (error) {
      const errorResult = ErrorHandler.handleSMSParseError(sms, error);
      return {
        success: false,
        creditCard: null,
        transaction: null,
        originalSMS: sms,
        error: errorResult.error,
      };
    }
  }

  /**
   * Extract credit card information from SMS
   * @param {string} body - SMS body text
   * @param {string} sender - SMS sender
   * @returns {Object|null} Credit card information
   */
  extractCreditCard(body, sender) {
    try {
      const bodyLower = body.toLowerCase();
      const senderLower = sender.toLowerCase();

      // Extract bank name
      const bankName = this.extractBankName(bodyLower, senderLower);
      if (!bankName) {
        throw new Error('Bank name not found');
      }
      ErrorHandler.validateBankName(bankName);

      // Extract card last 4 digits
      const lastFourDigits = this.extractCardNumber(body);
      if (!lastFourDigits) {
        throw new Error('Card number not found');
      }
      ErrorHandler.validateCardNumber(lastFourDigits);

      // Extract card type
      const cardType = this.extractCardType(bodyLower);

      // Extract credit limit if available
      const creditLimit = this.extractCreditLimit(body);

      // Extract current balance/outstanding
      const currentBalance = this.extractCurrentBalance(body);

      return {
        id: `${bankName.replace(/\s+/g, '_').toLowerCase()}_${lastFourDigits}`,
        bankName,
        lastFourDigits,
        cardType: cardType || 'Credit Card',
        creditLimit,
        currentBalance,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      // Log the error but don't throw - return null to indicate no card found
      ErrorHandler.logError(error, {
        action: 'extracting_credit_card',
        sms_preview: body.substring(0, 100)
      });
      return null;
    }
  }

  /**
   * Extract transaction information from SMS
   * @param {string} body - SMS body text
   * @param {Date} date - SMS date
   * @returns {Object|null} Transaction information
   */
  extractTransaction(body, date) {
    try {
      const bodyLower = body.toLowerCase();

      // Extract transaction amount
      const amount = this.extractAmount(body);
      if (!amount) {
        throw new Error('Transaction amount not found');
      }
      ErrorHandler.validateAmount(amount);

      // Determine transaction type
      const type = this.determineTransactionType(bodyLower);

      // Extract merchant name
      const merchant = this.extractMerchant(body);

      // Extract transaction date (might be different from SMS date)
      const transactionDate = this.extractTransactionDate(body) || date;

      // Extract available limit/balance after transaction
      const availableLimit = this.extractAvailableLimit(body);

      return {
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        type,
        merchant,
        date: transactionDate.toISOString(),
        availableLimit,
        description: this.extractDescription(body),
      };
    } catch (error) {
      // Log the error but don't throw - return null to indicate no transaction found
      ErrorHandler.logError(error, {
        action: 'extracting_transaction',
        sms_preview: body.substring(0, 100)
      });
      return null;
    }
  }

  /**
   * Extract bank name from SMS content
   * @param {string} bodyLower - Lowercase SMS body
   * @param {string} senderLower - Lowercase sender
   * @returns {string|null} Bank name
   */
  extractBankName(bodyLower, senderLower) {
    // Bank name patterns (comprehensive list of Indian banks)
    const bankPatterns = [
      // Major private banks
      { pattern: /hdfc\s*bank|hdfcbank/i, name: 'HDFC Bank' },
      { pattern: /icici\s*bank|icicibank/i, name: 'ICICI Bank' },
      { pattern: /axis\s*bank|axisbank/i, name: 'Axis Bank' },
      { pattern: /kotak\s*mahindra|kotak/i, name: 'Kotak Mahindra Bank' },
      { pattern: /indusind\s*bank|indusind/i, name: 'IndusInd Bank' },
      { pattern: /yes\s*bank|yesbank/i, name: 'Yes Bank' },
      { pattern: /idfc\s*first|idfc/i, name: 'IDFC First Bank' },
      { pattern: /rbl\s*bank|rbl/i, name: 'RBL Bank' },
      { pattern: /bandhan\s*bank|bandhan/i, name: 'Bandhan Bank' },

      // Public sector banks
      { pattern: /state\s*bank\s*of\s*india|sbi/i, name: 'State Bank of India' },
      { pattern: /punjab\s*national\s*bank|pnb/i, name: 'Punjab National Bank' },
      { pattern: /bank\s*of\s*baroda|bob/i, name: 'Bank of Baroda' },
      { pattern: /canara\s*bank/i, name: 'Canara Bank' },
      { pattern: /union\s*bank/i, name: 'Union Bank of India' },
      { pattern: /indian\s*bank/i, name: 'Indian Bank' },
      { pattern: /central\s*bank/i, name: 'Central Bank of India' },
      { pattern: /bank\s*of\s*india|boi/i, name: 'Bank of India' },
      { pattern: /indian\s*overseas\s*bank|iob/i, name: 'Indian Overseas Bank' },
      { pattern: /punjab\s*&\s*sind\s*bank|psb/i, name: 'Punjab & Sind Bank' },
      { pattern: /uco\s*bank/i, name: 'UCO Bank' },

      // Regional banks
      { pattern: /karnataka\s*bank/i, name: 'Karnataka Bank' },
      { pattern: /south\s*indian\s*bank/i, name: 'South Indian Bank' },
      { pattern: /federal\s*bank/i, name: 'Federal Bank' },
      { pattern: /city\s*union\s*bank/i, name: 'City Union Bank' },
      { pattern: /jammu\s*&\s*kashmir\s*bank|j&k\s*bank/i, name: 'Jammu & Kashmir Bank' },

      // Credit card companies
      { pattern: /american\s*express|amex/i, name: 'American Express' },
      { pattern: /standard\s*chartered/i, name: 'Standard Chartered' },
      { pattern: /citibank|citi/i, name: 'Citibank' },
      { pattern: /hsbc/i, name: 'HSBC' },

      // Fintech and digital
      { pattern: /paytm\s*payments\s*bank|paytm/i, name: 'Paytm Payments Bank' },
      { pattern: /airtel\s*payments\s*bank|airtel/i, name: 'Airtel Payments Bank' },
      { pattern: /jio\s*payments\s*bank|jio/i, name: 'Jio Payments Bank' },
      { pattern: /fino\s*payments\s*bank|fino/i, name: 'Fino Payments Bank' },
    ];

    // Check sender first
    for (const bank of bankPatterns) {
      if (bank.pattern.test(senderLower)) {
        return bank.name;
      }
    }

    // Check SMS body
    for (const bank of bankPatterns) {
      if (bank.pattern.test(bodyLower)) {
        return bank.name;
      }
    }

    // Generic bank detection
    if (bodyLower.includes('bank') || bodyLower.includes('card')) {
      // Try to extract bank name from common patterns
      const bankMatch = bodyLower.match(/(\w+)\s*bank/);
      if (bankMatch) {
        return bankMatch[1].charAt(0).toUpperCase() + bankMatch[1].slice(1) + ' Bank';
      }
    }

    return null;
  }

  /**
   * Extract card number (last 4 digits) from SMS
   * @param {string} body - SMS body
   * @returns {string|null} Last 4 digits of card
   */
  extractCardNumber(body) {
    // Common patterns for card numbers in SMS
    const patterns = [
      /xx(\d{4})/i,           // xx1234
      /\*\*\*\*(\d{4})/i,     // ****1234
      /xxxx(\d{4})/i,         // xxxx1234
      /ending\s*(\d{4})/i,    // ending 1234
      /card\s*(\d{4})/i,      // card 1234
      /\*(\d{4})/i,           // *1234
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract card type from SMS
   * @param {string} bodyLower - Lowercase SMS body
   * @returns {string} Card type
   */
  extractCardType(bodyLower) {
    if (bodyLower.includes('credit card') || bodyLower.includes('credit')) {
      return 'Credit Card';
    }
    if (bodyLower.includes('debit card') || bodyLower.includes('debit')) {
      return 'Debit Card';
    }
    if (bodyLower.includes('prepaid')) {
      return 'Prepaid Card';
    }
    return 'Credit Card'; // Default assumption
  }

  /**
   * Extract transaction amount from SMS
   * @param {string} body - SMS body
   * @returns {number|null} Transaction amount
   */
  extractAmount(body) {
    // Amount patterns
    const patterns = [
      /rs\.?\s*([0-9,]+\.?\d*)/i,     // Rs. 1,000.00 or Rs 1000
      /₹\s*([0-9,]+\.?\d*)/i,         // ₹1,000.00
      /inr\s*([0-9,]+\.?\d*)/i,       // INR 1000
      /amount\s*rs\.?\s*([0-9,]+\.?\d*)/i, // Amount Rs. 1000
      /spent\s*rs\.?\s*([0-9,]+\.?\d*)/i,  // spent Rs. 1000
      /paid\s*rs\.?\s*([0-9,]+\.?\d*)/i,   // paid Rs. 1000
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        // Remove commas and convert to number
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return null;
  }

  /**
   * Determine transaction type from SMS content
   * @param {string} bodyLower - Lowercase SMS body
   * @returns {string} Transaction type
   */
  determineTransactionType(bodyLower) {
    // Purchase indicators
    if (bodyLower.includes('spent') || bodyLower.includes('purchase') || 
        bodyLower.includes('transaction') || bodyLower.includes('used') ||
        bodyLower.includes('charged') || bodyLower.includes('debited')) {
      return this.transactionTypes.PURCHASE;
    }

    // Payment indicators
    if (bodyLower.includes('payment') || bodyLower.includes('paid') || 
        bodyLower.includes('credited') || bodyLower.includes('received')) {
      return this.transactionTypes.PAYMENT;
    }

    // Fee indicators
    if (bodyLower.includes('fee') || bodyLower.includes('charge') || 
        bodyLower.includes('penalty') || bodyLower.includes('late')) {
      return this.transactionTypes.FEE;
    }

    // Interest indicators
    if (bodyLower.includes('interest') || bodyLower.includes('finance charge')) {
      return this.transactionTypes.INTEREST;
    }

    // Refund indicators
    if (bodyLower.includes('refund') || bodyLower.includes('reversal')) {
      return this.transactionTypes.REFUND;
    }

    // Cash advance indicators
    if (bodyLower.includes('cash advance') || bodyLower.includes('atm withdrawal')) {
      return this.transactionTypes.CASH_ADVANCE;
    }

    // Balance update indicators
    if (bodyLower.includes('balance') || bodyLower.includes('outstanding') || 
        bodyLower.includes('due') || bodyLower.includes('statement')) {
      return this.transactionTypes.BALANCE_UPDATE;
    }

    // Default to purchase
    return this.transactionTypes.PURCHASE;
  }

  /**
   * Extract merchant name from SMS
   * @param {string} body - SMS body
   * @returns {string|null} Merchant name
   */
  extractMerchant(body) {
    // Common merchant patterns
    const patterns = [
      /at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
      /merchant\s*:?\s*([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
      /spent.*?at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
      /transaction.*?at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Extract transaction date from SMS
   * @param {string} body - SMS body
   * @returns {Date|null} Transaction date
   */
  extractTransactionDate(body) {
    // Date patterns
    const patterns = [
      /on\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      /dated\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
      /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const date = new Date(match[1]);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  }

  /**
   * Extract available credit limit from SMS
   * @param {string} body - SMS body
   * @returns {number|null} Available limit
   */
  extractAvailableLimit(body) {
    const patterns = [
      /available\s*limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /available\s*credit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /limit\s*available\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount >= 0) {
          return amount;
        }
      }
    }

    return null;
  }

  /**
   * Extract current balance/outstanding from SMS
   * @param {string} body - SMS body
   * @returns {number|null} Current balance
   */
  extractCurrentBalance(body) {
    const patterns = [
      /outstanding\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /balance\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /current\s*balance\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /total\s*due\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount >= 0) {
          return amount;
        }
      }
    }

    return null;
  }

  /**
   * Extract credit limit from SMS
   * @param {string} body - SMS body
   * @returns {number|null} Credit limit
   */
  extractCreditLimit(body) {
    const patterns = [
      /credit\s*limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
      /total\s*limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern);
      if (match && match[1]) {
        const amount = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(amount) && amount > 0) {
          return amount;
        }
      }
    }

    return null;
  }

  /**
   * Extract transaction description
   * @param {string} body - SMS body
   * @returns {string} Transaction description
   */
  extractDescription(body) {
    // Return first 100 characters of SMS as description
    return body.length > 100 ? body.substring(0, 100) + '...' : body;
  }

  /**
   * Validate parsed data
   * @param {Object} parsedData - Parsed SMS data
   * @returns {boolean} Whether data is valid
   */
  validateParsedData(parsedData) {
    if (!parsedData) return false;

    const { creditCard, transaction } = parsedData;

    // At least one of creditCard or transaction should be present
    if (!creditCard && !transaction) return false;

    // If credit card is present, validate required fields
    if (creditCard) {
      if (!creditCard.bankName || !creditCard.lastFourDigits) {
        return false;
      }
    }

    // If transaction is present, validate required fields
    if (transaction) {
      if (!transaction.amount || transaction.amount <= 0) {
        return false;
      }
    }

    return true;
  }
}

export default SMSParser;