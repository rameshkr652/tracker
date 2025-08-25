// src/services/sms/SMSParser.js - Complete Enhanced SMS Parser
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
      STATEMENT: 'statement',
      REMINDER: 'reminder',
    };

    // Interest rate estimates by bank (annual %)
    this.bankInterestRates = {
      'HDFC Bank': 42.0,
      'ICICI Bank': 39.6,
      'SBI Card': 38.4,
      'Axis Bank': 42.0,
      'Kotak Mahindra Bank': 41.4,
      'American Express': 36.0,
      'Standard Chartered': 42.0,
      'Citibank': 39.6,
      'Yes Bank': 42.0,
      'IndusInd Bank': 41.4,
    };

    this.monthMap = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11,
      'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5,
      'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11,
    };
  }

  /**
   * Parse SMS message to extract complete credit card bill information
   */
  parseSMS(sms) {
    try {
      ErrorHandler.validateSMS(sms);

      const body = sms.body;
      const sender = sms.address || '';
      const date = new Date(parseInt(sms.date));

      // Check if this is a credit card SMS
      if (!this.isCreditCardSMS(body.toLowerCase())) {
        return {
          success: false,
          creditCard: null,
          transaction: null,
          statement: null,
          originalSMS: sms,
          error: 'Not a credit card SMS',
        };
      }

      // Extract bank name
      const bankName = this.extractBankName(body.toLowerCase(), sender.toLowerCase());
      if (!bankName) {
        return {
          success: false,
          creditCard: null,
          transaction: null,
          statement: null,
          originalSMS: sms,
          error: 'Bank not identified',
        };
      }

      // Extract card number
      const cardNumber = this.extractCardNumber(body);
      if (!cardNumber) {
        return {
          success: false,
          creditCard: null,
          transaction: null,
          statement: null,
          originalSMS: sms,
          error: 'No credit card number found',
        };
      }

      // Create base credit card object
      const creditCard = {
        id: `${bankName.replace(/\s+/g, '_').toLowerCase()}_${cardNumber}`,
        bankName,
        lastFourDigits: cardNumber,
        cardType: 'Credit Card',
        
        // Financial details
        creditLimit: this.extractCreditLimit(body),
        currentBalance: this.extractCurrentBalance(body),
        availableCredit: this.extractAvailableCredit(body),
        
        // Payment details
        totalDue: this.extractTotalDue(body),
        minimumDue: this.extractMinimumDue(body),
        dueDate: this.extractDueDate(body),
        
        // Statement details
        statementDate: this.extractStatementDate(body),
        paymentDueDate: this.extractPaymentDueDate(body),
        
        // Interest calculation
        estimatedAPR: this.bankInterestRates[bankName] || 40.0,
        
        // Metadata
        lastUpdated: new Date().toISOString(),
        lastSMSDate: date.toISOString(),
        
        // SMS parsing confidence
        parsingConfidence: this.calculateParsingConfidence(body),
        needsVerification: this.needsManualVerification(body),
      };

      // Extract transaction if present
      let transaction = null;
      const amount = this.extractTransactionAmount(body);
      
      if (amount) {
        const type = this.determineTransactionType(body.toLowerCase());
        const merchant = this.extractMerchant(body);
        
        transaction = {
          id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          cardId: creditCard.id,
          amount,
          type,
          merchant,
          date: this.extractTransactionDate(body, date).toISOString(),
          time: this.extractTransactionTime(body),
          availableLimit: this.extractAvailableCredit(body),
          description: body.trim(),
          declined: this.isDeclinedTransaction(body),
          category: this.categorizeTransaction(merchant, body),
        };
      }

      // Extract statement information if it's a statement SMS
      let statement = null;
      if (this.isStatementSMS(body.toLowerCase())) {
        statement = {
          id: `stmt_${creditCard.id}_${Date.now()}`,
          cardId: creditCard.id,
          statementDate: this.extractStatementDate(body) || date.toISOString(),
          dueDate: this.extractDueDate(body),
          totalDue: this.extractTotalDue(body) || this.extractCurrentBalance(body),
          minimumDue: this.extractMinimumDue(body),
          previousBalance: this.extractPreviousBalance(body),
          paymentsReceived: this.extractPaymentsReceived(body),
          newCharges: this.extractNewCharges(body),
          interestCharged: this.extractInterestCharged(body),
          lateFeesCharged: this.extractLateFees(body),
          
          // Calculations
          minPaymentWarning: this.calculateMinPaymentWarning(creditCard),
          interestProjection: this.calculateInterestProjection(creditCard),
          payoffProjection: this.calculatePayoffProjection(creditCard),
        };
      }

      return {
        success: true,
        creditCard,
        transaction,
        statement,
        allCreditCards: [creditCard],
        allTransactions: transaction ? [transaction] : [],
        allStatements: statement ? [statement] : [],
        originalSMS: {
          body,
          sender,
          date: date.toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error('SMS parsing error:', error);
      return {
        success: false,
        creditCard: null,
        transaction: null,
        statement: null,
        originalSMS: sms,
        error: error.message || 'Unknown parsing error',
      };
    }
  }

  /**
   * Check if SMS is specifically about credit cards
   */
  isCreditCardSMS(bodyLower) {
    const creditCardKeywords = [
      'credit card', 'cc ', 'credit limit', 'available limit', 'available credit',
      'outstanding', 'total due', 'minimum due', 'min due', 'amount due',
      'statement', 'bill generated', 'payment due', 'due date', 'pay by',
      'overdue', 'late payment', 'interest charged', 'finance charge',
      'card ending', 'card xxxx', 'card ****', 'cr card', 'transaction on card',
      'debited on card', 'credited to card', 'txn alert', 'transaction alert'
    ];

    const hasCreditCardKeywords = creditCardKeywords.some(keyword => 
      bodyLower.includes(keyword)
    );

    if (!hasCreditCardKeywords) return false;

    // Exclude debit card transactions
    const debitCardExclusions = [
      'debit card', 'savings account', 'current account', 'account balance',
      'withdrawn from atm', 'upi debit', 'pos debit', 'net banking'
    ];

    const isDebitCard = debitCardExclusions.some(exclusion => 
      bodyLower.includes(exclusion)
    );

    return !isDebitCard;
  }

  /**
   * Enhanced bank name extraction
   */
  extractBankName(bodyLower, senderLower) {
    const bankPatterns = [
      { pattern: /hdfc\s*bank|hdfcbank|ad-hdfcbk|bk-hdfcbk/i, name: 'HDFC Bank' },
      { pattern: /icici\s*bank|icicibank|ad-icicib|vm-icicib/i, name: 'ICICI Bank' },
      { pattern: /axis\s*bank|axisbank|ad-axisbk|ax-bank/i, name: 'Axis Bank' },
      { pattern: /kotak\s*mahindra|kotak|kotakbank|ad-kotakb/i, name: 'Kotak Mahindra Bank' },
      { pattern: /sbi\s*card|sbicard|ad-sbicar|vm-sbicrd/i, name: 'SBI Card' },
      { pattern: /american\s*express|amex|am-ex/i, name: 'American Express' },
      { pattern: /standard\s*chartered|stanchart|stan\s*chart/i, name: 'Standard Chartered' },
      { pattern: /citibank|citi\s*bank|citi/i, name: 'Citibank' },
      { pattern: /yes\s*bank|yesbank/i, name: 'Yes Bank' },
      { pattern: /indusind\s*bank|indusind/i, name: 'IndusInd Bank' },
      { pattern: /hsbc\s*bank|hsbc/i, name: 'HSBC Bank' },
      { pattern: /idfc\s*first|idfcfirst/i, name: 'IDFC First Bank' },
      { pattern: /rbl\s*bank|rblbank/i, name: 'RBL Bank' },
      { pattern: /federal\s*bank|federalbank/i, name: 'Federal Bank' },
      { pattern: /dbs\s*bank|digibank|dbsbank/i, name: 'DBS Bank' },
      { pattern: /barclays/i, name: 'Barclays Bank' },
      { pattern: /boi|bank\s*of\s*india/i, name: 'Bank of India' },
      { pattern: /pnb|punjab\s*national/i, name: 'Punjab National Bank' },
      { pattern: /canara\s*bank|canarabank/i, name: 'Canara Bank' },
      { pattern: /union\s*bank/i, name: 'Union Bank' },
      { pattern: /bob|bank\s*of\s*baroda/i, name: 'Bank of Baroda' },
      { pattern: /south\s*indian\s*bank/i, name: 'South Indian Bank' },
      { pattern: /idbi\s*bank|idbibank/i, name: 'IDBI Bank' },
      { pattern: /catholic\s*syrian\s*bank|csb\s*bank/i, name: 'CSB Bank' },
      { pattern: /karur\s*vysya\s*bank|kvb/i, name: 'Karur Vysya Bank' },
      { pattern: /au\s*small\s*finance|au\s*bank/i, name: 'AU Small Finance Bank' },
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

    return null;
  }

  /**
   * Extract card number (last 4 digits)
   */
  extractCardNumber(text) {
    const patterns = [
      /(?:card|cc)\s*(?:no\.?|number)?\s*(?:xx|XX|\*\*|\*\*\*\*)(\d{4})(?:[^\d]|$)/i,
      /(?:credit\s*card).*?(?:xx|XX|\*\*|\*\*\*\*)(\d{4})(?:[^\d]|$)/i,
      /xx(\d{4})\b/i,
      /XX(\d{4})\b/i,
      /\*\*\*\*(\d{4})\b/i,
      /ending\s*(?:with\s*)?(\d{4})\b/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Helper method to extract amount from patterns
   */
  extractAmountFromPatterns(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
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
   * Extract total amount due
   */
  extractTotalDue(text) {
    const patterns = [
      /total\s*(?:amt|amount)?\s*due\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /total\s*due\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /amount\s*due\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /outstanding\s*(?:balance|amt|amount)?\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /current\s*balance\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract minimum amount due
   */
  extractMinimumDue(text) {
    const patterns = [
      /min(?:imum)?\s*(?:amt|amount)?\s*due\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /min\s*due\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /minimum\s*payment\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract credit limit
   */
  extractCreditLimit(text) {
    const patterns = [
      /credit\s*limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /(?:total\s*)?limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /card\s*limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract available credit
   */
  extractAvailableCredit(text) {
    const patterns = [
      /available\s*(?:credit|limit)\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /avl\s*(?:credit|limit|lmt)\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /credit\s*available\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract current balance/outstanding
   */
  extractCurrentBalance(text) {
    return this.extractTotalDue(text); // Same as total due
  }

  /**
   * Extract previous balance (for statements)
   */
  extractPreviousBalance(text) {
    const patterns = [
      /previous\s*balance\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /prev\s*bal\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /opening\s*balance\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract payments received
   */
  extractPaymentsReceived(text) {
    const patterns = [
      /payments?\s*received\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /payment\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /credits?\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract new charges
   */
  extractNewCharges(text) {
    const patterns = [
      /new\s*charges?\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /purchases?\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /transactions?\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract interest charged
   */
  extractInterestCharged(text) {
    const patterns = [
      /interest\s*charged\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /finance\s*charge\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /interest\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract late fees
   */
  extractLateFees(text) {
    const patterns = [
      /late\s*(?:fee|charge|penalty)\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /overlimit\s*(?:fee|charge)\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /penalty\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Extract transaction amount
   */
  extractTransactionAmount(text) {
    const patterns = [
      /(?:spent|used|charged|debited|paid)\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /(?:payment|credit)\s*(?:of\s*)?(?:rs\.?|inr|₹)\s*([0-9,]+\.?\d*)/i,
      /rs\.?\s*([0-9,]+\.?\d*)(?:\s*(?:spent|used|charged|debited|paid|due))/i,
      /₹\s*([0-9,]+\.?\d*)/i,
      /inr\s*([0-9,]+\.?\d*)/i,
    ];

    return this.extractAmountFromPatterns(text, patterns);
  }

  /**
   * Helper method to extract date from patterns
   */
  extractDateFromPatterns(text, patterns) {
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const day = parseInt(match[1], 10);
          let month;
          let yearStr = match[3];
          if (/^\d+$/.test(match[2])) {
            month = parseInt(match[2], 10) - 1; // Numeric month
          } else {
            month = this.monthMap[match[2].toLowerCase()];
            if (month === undefined) continue;
          }

          let year = parseInt(yearStr, 10);
          if (year < 100) {
            year += 2000; // Assume 20xx for 2-digit years
          }

          const date = new Date(year, month, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (error) {
          console.log('Date parsing error:', error);
        }
      }
    }

    return null;
  }

  /**
   * Extract due date
   */
  extractDueDate(text) {
    const patterns = [
      /(?:due|pay)\s*(?:on|by|date)?\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /payment\s*due\s*(?:on|date)?\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /due\s*date\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /(?:due|pay)\s*(?:on|by|date)?\s*:?\s*(\d{1,2})[- ]?([a-zA-Z]{3,9})[- ]?(\d{2,4})/i,
      /payment\s*due\s*(?:on|date)?\s*:?\s*(\d{1,2})[- ]?([a-zA-Z]{3,9})[- ]?(\d{2,4})/i,
      /due\s*date\s*:?\s*(\d{1,2})[- ]?([a-zA-Z]{3,9})[- ]?(\d{2,4})/i,
    ];

    return this.extractDateFromPatterns(text, patterns);
  }

  /**
   * Extract statement date
   */
  extractStatementDate(text) {
    const patterns = [
      /statement\s*(?:generated|date)\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /bill\s*(?:generated|date)\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /statement\s*(?:generated|date)\s*:?\s*(\d{1,2})[- ]?([a-zA-Z]{3,9})[- ]?(\d{2,4})/i,
      /bill\s*(?:generated|date)\s*:?\s*(\d{1,2})[- ]?([a-zA-Z]{3,9})[- ]?(\d{2,4})/i,
    ];

    return this.extractDateFromPatterns(text, patterns);
  }

  /**
   * Extract payment due date (alias for due date)
   */
  extractPaymentDueDate(text) {
    return this.extractDueDate(text);
  }

  /**
   * Check if SMS is a statement
   */
  isStatementSMS(bodyLower) {
    const statementKeywords = [
      'statement generated', 'bill generated', 'statement available',
      'monthly statement', 'credit card statement', 'statement summary'
    ];

    return statementKeywords.some(keyword => bodyLower.includes(keyword));
  }

  /**
   * Calculate parsing confidence (0-100)
   */
  calculateParsingConfidence(body) {
    let confidence = 0;
    
    // Basic requirements
    if (this.extractCardNumber(body)) confidence += 20;
    if (this.extractTotalDue(body)) confidence += 20;
    if (this.extractMinimumDue(body)) confidence += 15;
    if (this.extractDueDate(body)) confidence += 15;
    if (this.extractCreditLimit(body)) confidence += 10;
    if (this.extractAvailableCredit(body)) confidence += 10;
    
    // Bonus points for additional info
    if (this.extractInterestCharged(body)) confidence += 5;
    if (this.extractLateFees(body)) confidence += 5;
    
    return Math.min(confidence, 100);
  }

  /**
   * Check if manual verification is needed
   */
  needsManualVerification(body) {
    const confidence = this.calculateParsingConfidence(body);
    return confidence < 60;
  }

  /**
   * Calculate minimum payment warning
   */
  calculateMinPaymentWarning(creditCard) {
    if (!creditCard.totalDue || !creditCard.minimumDue || !creditCard.estimatedAPR) {
      return null;
    }

    const totalDue = creditCard.totalDue;
    const minDue = creditCard.minimumDue;
    const monthlyRate = creditCard.estimatedAPR / 100 / 12;
    
    // Calculate interest on remaining balance
    const remainingBalance = totalDue - minDue;
    const monthlyInterest = remainingBalance * monthlyRate;
    
    // Calculate how long to pay off with minimum payments
    const monthsToPayoff = Math.ceil(Math.log(1 + (totalDue * monthlyRate) / minDue) / Math.log(1 + monthlyRate));
    const totalInterest = (minDue * monthsToPayoff) - totalDue;
    
    return {
      monthlyInterest: Math.round(monthlyInterest),
      monthsToPayoff,
      totalInterest: Math.round(totalInterest),
      recommendation: Math.round(totalDue * 0.1), // Recommend 10% of balance
    };
  }

  /**
   * Calculate interest projection
   */
  calculateInterestProjection(creditCard) {
    if (!creditCard.totalDue || !creditCard.estimatedAPR) {
      return null;
    }

    const balance = creditCard.totalDue;
    const annualRate = creditCard.estimatedAPR / 100;
    const monthlyRate = annualRate / 12;
    
    return {
      monthly: Math.round(balance * monthlyRate),
      quarterly: Math.round(balance * monthlyRate * 3),
      yearly: Math.round(balance * annualRate),
    };
  }

  /**
   * Calculate payoff projection
   */
  calculatePayoffProjection(creditCard) {
    if (!creditCard.totalDue || !creditCard.minimumDue || !creditCard.estimatedAPR) {
      return null;
    }

    const balance = creditCard.totalDue;
    const minPayment = creditCard.minimumDue;
    const monthlyRate = creditCard.estimatedAPR / 100 / 12;
    
    // Scenario 1: Minimum payment
    const minPayoffMonths = Math.ceil(Math.log(1 + (balance * monthlyRate) / minPayment) / Math.log(1 + monthlyRate));
    const minTotalInterest = (minPayment * minPayoffMonths) - balance;
    
    // Scenario 2: 2x minimum payment
    const doublePayment = minPayment * 2;
    const doublePayoffMonths = Math.ceil(Math.log(1 + (balance * monthlyRate) / doublePayment) / Math.log(1 + monthlyRate));
    const doubleTotalInterest = (doublePayment * doublePayoffMonths) - balance;
    
    // Scenario 3: 10% of balance
    const tenPercentPayment = Math.max(balance * 0.1, minPayment);
    const tenPercentPayoffMonths = Math.ceil(Math.log(1 + (balance * monthlyRate) / tenPercentPayment) / Math.log(1 + monthlyRate));
    const tenPercentTotalInterest = (tenPercentPayment * tenPercentPayoffMonths) - balance;
    
    return {
      minPayment: {
        payment: Math.round(minPayment),
        months: minPayoffMonths,
        totalInterest: Math.round(minTotalInterest),
      },
      doublePayment: {
        payment: Math.round(doublePayment),
        months: doublePayoffMonths,
        totalInterest: Math.round(doubleTotalInterest),
        savings: Math.round(minTotalInterest - doubleTotalInterest),
      },
      recommendedPayment: {
        payment: Math.round(tenPercentPayment),
        months: tenPercentPayoffMonths,
        totalInterest: Math.round(tenPercentTotalInterest),
        savings: Math.round(minTotalInterest - tenPercentTotalInterest),
      },
    };
  }

  /**
   * Determine transaction type
   */
  determineTransactionType(textLower) {
    if (textLower.includes('refund') || (textLower.includes('credited') && !textLower.includes('payment'))) {
      return this.transactionTypes.REFUND;
    } else if (textLower.includes('payment') && (textLower.includes('received') || textLower.includes('credited') || textLower.includes('thank'))) {
      return this.transactionTypes.PAYMENT;
    } else if (textLower.includes('fee') || (textLower.includes('charge') && !textLower.includes('finance') && !textLower.includes('charged to'))) {
      return this.transactionTypes.FEE;
    } else if (textLower.includes('interest') || textLower.includes('finance charge')) {
      return this.transactionTypes.INTEREST;
    } else if (textLower.includes('cash advance') || (textLower.includes('atm') && textLower.includes('withdrawal'))) {
      return this.transactionTypes.CASH_ADVANCE;
    } else if (textLower.includes('spent') || textLower.includes('used') || textLower.includes('charged') ||
      textLower.includes('debited') || textLower.includes('purchase') || textLower.includes('txn')) {
      return this.transactionTypes.PURCHASE;
    } else if (textLower.includes('statement') || textLower.includes('bill generated')) {
      return this.transactionTypes.STATEMENT;
    } else if (textLower.includes('reminder') || textLower.includes('overdue') || textLower.includes('payment due')) {
      return this.transactionTypes.REMINDER;
    } else {
      return this.transactionTypes.BALANCE_UPDATE;
    }
  }

  /**
   * Extract merchant name
   */
  extractMerchant(text) {
    const patterns = [
      /(?:spent|used|charged|debited|purchase).*?at\s+([A-Z][A-Z0-9\s&.,\-*+\/]{2,})(?:\s+on|\s+dated|\.|$)/i,
      /at\s+([A-Z][A-Z0-9\s&.,\-*+\/]{3,}?)(?:\s+on|\s+dated|\s*\.|$)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        let merchant = match[1].trim();
        merchant = merchant.replace(/\s+(?:has|on|at|for|with|dated).*$/i, '');
        merchant = merchant.replace(/[.,;:]+$/, '');
        
        if (merchant.length >= 3 && merchant.length <= 50) {
          return merchant;
        }
      }
    }

    return null;
  }

  /**
   * Categorize transaction
   */
  categorizeTransaction(merchant, body) {
    if (!merchant) return 'Other';
    
    const merchantLower = merchant.toLowerCase();
    const bodyLower = body.toLowerCase();
    
    const categories = {
      'Food & Dining': ['swiggy', 'zomato', 'uber eats', 'dominos', 'pizza', 'mcdonald', 'kfc', 'restaurant'],
      'Shopping': ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping', 'mall'],
      'Transport': ['uber', 'ola', 'metro', 'fuel', 'petrol', 'diesel', 'irctc'],
      'Entertainment': ['netflix', 'prime', 'hotstar', 'spotify', 'bookmyshow', 'cinema'],
      'Utilities': ['electricity', 'gas', 'water', 'broadband', 'mobile', 'recharge'],
      'Medical': ['hospital', 'pharmacy', 'medical', 'doctor', 'clinic'],
      'Education': ['school', 'college', 'university', 'course', 'training'],
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => merchantLower.includes(keyword) || bodyLower.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  }

  /**
   * Extract transaction date
   */
  extractTransactionDate(text, fallbackDate) {
    const patterns = [
      /(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /(\d{1,2})[- ]?([a-zA-Z]{3,9})[- ]?(\d{2,4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const day = parseInt(match[1], 10);
          let month;
          if (/^\d+$/.test(match[2])) {
            month = parseInt(match[2], 10) - 1;
          } else {
            month = this.monthMap[match[2].toLowerCase()];
            if (month === undefined) continue;
          }
          let year = parseInt(match[3], 10);
          
          if (year < 100) {
            year += 2000;
          }
          
          const date = new Date(year, month, day);
          if (!isNaN(date.getTime()) && date <= new Date()) {
            return date;
          }
        } catch (error) {
          // Continue to fallback
        }
      }
    }

    return fallbackDate;
  }

  /**
   * Extract transaction time
   */
  extractTransactionTime(text) {
    const timePatterns = [
      /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(?:hrs|IST)?/i,
    ];

    for (const pattern of timePatterns) {
      const match = text.match(pattern);
      if (match) {
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
      }
    }

    return null;
  }

  /**
   * Check if transaction was declined
   */
  isDeclinedTransaction(text) {
    const declinedPatterns = [
      /declined|denied|unsuccessful|not\s*successful|failed|rejected/i,
      /could\s*not\s*(?:be\s*)?process|cannot\s*(?:be\s*)?process/i,
      /transaction\s*failed|payment\s*failed|not\s*approved/i,
    ];

    return declinedPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Extract all relevant information from an SMS (method expected by SMSReader)
   */
  extractAllInfo(sms) {
    try {
      const basicParsed = this.parseSMS(sms);
      
      if (!basicParsed.success) {
        return {
          success: false,
          creditCards: [],
          transactions: [],
          statements: [],
          reminders: [],
          rewards: [],
          originalSMS: sms,
          error: basicParsed.error,
        };
      }
      
      // Convert to the format expected by SMSReader
      return {
        success: true,
        creditCards: basicParsed.allCreditCards || (basicParsed.creditCard ? [basicParsed.creditCard] : []),
        transactions: basicParsed.allTransactions || (basicParsed.transaction ? [basicParsed.transaction] : []),
        statements: basicParsed.allStatements || (basicParsed.statement ? [basicParsed.statement] : []),
        reminders: [], // We can add this later if needed
        rewards: [],  // We can add this later if needed
        originalSMS: {
          body: sms.body,
          sender: sms.address,
          date: new Date(parseInt(sms.date)).toISOString(),
        },
        error: null,
      };
    } catch (error) {
      console.error('Advanced SMS parsing error:', error);
      return {
        success: false,
        creditCards: [],
        transactions: [],
        statements: [],
        reminders: [],
        rewards: [],
        originalSMS: sms,
        error: error.message || 'Unknown parsing error',
      };
    }
  }
}

export default SMSParser;