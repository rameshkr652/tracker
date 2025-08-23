// src/services/sms/SMSParser.js - Improved SMS Parser for Indian Banks
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
   * Split the SMS into logical segments and process each one
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

      // First, identify the bank from sender or body
      const bankName = this.extractBankName(body.toLowerCase(), sender.toLowerCase());
      if (!bankName) {
        return {
          success: false,
          creditCard: null,
          transaction: null,
          originalSMS: sms,
          error: 'Bank not identified',
        };
      }

      // Split the SMS into logical segments (sentences or transaction blocks)
      const segments = this.splitIntoSegments(body);
      
      // Arrays to hold extracted data
      const creditCards = [];
      const transactions = [];
      
      // Process each segment
      for (const segment of segments) {
        // Try to extract card number from segment
        const cardNumber = this.extractCardNumber(segment);
        
        // If we found a card number, create or update a credit card object
        if (cardNumber) {
          const existingCardIndex = creditCards.findIndex(card => card.lastFourDigits === cardNumber);
          
          if (existingCardIndex >= 0) {
            // Update existing card with any new info from this segment
            this.updateCreditCardFromSegment(creditCards[existingCardIndex], segment);
          } else {
            // Create new card entry
            const newCard = {
              id: `${bankName.replace(/\s+/g, '_').toLowerCase()}_${cardNumber}`,
              bankName,
              lastFourDigits: cardNumber,
              cardType: this.extractCardType(segment.toLowerCase()),
              creditLimit: this.extractCreditLimit(segment),
              currentBalance: this.extractCurrentBalance(segment),
              lastUpdated: new Date().toISOString(),
            };
            
            creditCards.push(newCard);
          }
        }
        
        // Try to extract transaction information
        const amount = this.extractAmount(segment);
        if (amount) {
          const type = this.determineTransactionType(segment.toLowerCase());
          const merchant = this.extractMerchant(segment);
          
          // Only create transaction if we have a card number and amount
          if (cardNumber) {
            const transaction = {
              id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              cardId: `${bankName.replace(/\s+/g, '_').toLowerCase()}_${cardNumber}`,
              amount,
              type,
              merchant,
              date: this.extractTransactionDate(segment, date).toISOString(),
              availableLimit: this.extractAvailableLimit(segment),
              description: segment.trim(),
            };
            
            transactions.push(transaction);
          }
        }
      }
      
      // Return the first credit card and transaction for backward compatibility
      return {
        success: creditCards.length > 0 || transactions.length > 0,
        creditCard: creditCards.length > 0 ? creditCards[0] : null,
        transaction: transactions.length > 0 ? transactions[0] : null,
        allCreditCards: creditCards,
        allTransactions: transactions,
        originalSMS: {
          body,
          sender,
          date,
        },
        error: null,
      };
    } catch (error) {
      console.error('SMS parsing error:', error);
      return {
        success: false,
        creditCard: null,
        transaction: null,
        originalSMS: sms,
        error: error.message || 'Unknown parsing error',
      };
    }
  }

  /**
   * Split SMS into logical segments for processing
   * @param {string} body - SMS body text
   * @returns {Array} Array of segments
   */
  splitIntoSegments(body) {
    // Split by common separators
    let segments = [];
    
    // First try to split by common transaction separators
    if (body.includes('INR') || body.includes('Rs')) {
      // Split by sentences, but be careful with decimal points
      segments = body.replace(/(\d)\.\s+/g, '$1.\n')
                     .replace(/\.\s+/g, '.\n')
                     .split(/\n+/);
                     
      // Further split segments that might contain multiple transactions
      const refineSegments = [];
      for (const segment of segments) {
        // If segment contains multiple INR or Rs mentions, split further
        if ((segment.match(/INR/g) || []).length > 1 || (segment.match(/Rs/g) || []).length > 1) {
          // Split by INR or Rs, but preserve the markers
          const parts = segment.split(/(INR|Rs\.?)/g);
          let currentPart = '';
          
          for (let i = 0; i < parts.length; i++) {
            if (parts[i] === 'INR' || parts[i] === 'Rs' || parts[i] === 'Rs.') {
              // Start a new segment with the marker
              if (currentPart.trim()) {
                refineSegments.push(currentPart.trim());
              }
              currentPart = parts[i];
            } else {
              // Continue current segment
              currentPart += parts[i];
            }
            
            // If this part has a clear ending, push it
            if (/\.\s*$/.test(currentPart)) {
              refineSegments.push(currentPart.trim());
              currentPart = '';
            }
          }
          
          // Add any remaining part
          if (currentPart.trim()) {
            refineSegments.push(currentPart.trim());
          }
        } else {
          refineSegments.push(segment.trim());
        }
      }
      
      segments = refineSegments;
    } else {
      // Fallback: just split by sentences
      segments = body.split(/\.(?:\s+|$)/);
    }
    
    // Filter out empty segments and trim each segment
    return segments.filter(segment => segment.trim().length > 0)
                   .map(segment => segment.trim());
  }

  /**
   * Update a credit card object with information from a segment
   * @param {Object} card - Credit card object to update
   * @param {string} segment - SMS segment text
   */
  updateCreditCardFromSegment(card, segment) {
    // Update credit limit if present
    const creditLimit = this.extractCreditLimit(segment);
    if (creditLimit && (!card.creditLimit || creditLimit > 0)) {
      card.creditLimit = creditLimit;
    }
    
    // Update current balance if present
    const currentBalance = this.extractCurrentBalance(segment);
    if (currentBalance !== null) {
      card.currentBalance = currentBalance;
      card.lastUpdated = new Date().toISOString();
    }
    
    // Update card type if not already set
    if (!card.cardType || card.cardType === 'Credit Card') {
      const cardType = this.extractCardType(segment.toLowerCase());
      if (cardType !== 'Credit Card') {
        card.cardType = cardType;
      }
    }
  }

  /**
   * Extract bank name from SMS content with improved patterns
   * @param {string} bodyLower - Lowercase SMS body
   * @param {string} senderLower - Lowercase sender
   * @returns {string|null} Bank name
   */
  extractBankName(bodyLower, senderLower) {
    // Enhanced bank name patterns for major Indian banks
    const bankPatterns = [
      // Major private banks
      { pattern: /hdfc\s*bank|hdfcbank|ad-hdfcbk/i, name: 'HDFC Bank' },
      { pattern: /icici\s*bank|icicibank|ad-icicib/i, name: 'ICICI Bank' },
      { pattern: /axis\s*bank|axisbank|ad-axisbk|axbk/i, name: 'Axis Bank' },
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

      // Credit card companies
      { pattern: /american\s*express|amex/i, name: 'American Express' },
      { pattern: /standard\s*chartered/i, name: 'Standard Chartered' },
      { pattern: /citibank|citi/i, name: 'Citibank' },
      { pattern: /hsbc/i, name: 'HSBC' },
      { pattern: /flipkart.+axis/i, name: 'Axis Bank' },
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
   * Extract card number (last 4 digits) from SMS with improved patterns
   * @param {string} text - SMS text segment
   * @returns {string|null} Last 4 digits of card
   */
  extractCardNumber(text) {
    // Enhanced patterns for card numbers in SMS
    const patterns = [
      /xx(\d{4})/i,                 // xx1234
      /XX(\d{4})/i,                 // XX1234 (uppercase)
      /\*\*\*\*(\d{4})/i,           // ****1234
      /xxxx(\d{4})/i,               // xxxx1234
      /X+(\d{4})/i,                 // X1234 or XXXX1234
      /ending\s*(\d{4})/i,          // ending 1234
      /card\s*(?:no\.?|number)?\s*\.?\s*(?:XX|xx|\*\*)?(\d{4})(?:[^\d]|$)/i, // card no. XX1234
      /(?:XX|xx|\*\*)(\d{4})(?:[^\d]|$)/i, // XX1234 standalone
      /credit\s*card\s*(?:no\.?|number)?\s*\.?\s*(?:XX|xx|\*\*)?(\d{4})(?:[^\d]|$)/i, // credit card no. XX1234
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
   * Extract card type from SMS with more patterns
   * @param {string} textLower - Lowercase SMS segment
   * @returns {string} Card type
   */
  extractCardType(textLower) {
    // Check for specific card types
    if (textLower.includes('credit card') || textLower.includes(' credit ')) {
      return 'Credit Card';
    }
    if (textLower.includes('debit card') || textLower.includes(' debit ')) {
      return 'Debit Card';
    }
    if (textLower.includes('prepaid')) {
      return 'Prepaid Card';
    }
    
    // Check for co-branded cards
    if (textLower.includes('flipkart axis')) {
      return 'Flipkart Axis Credit Card';
    }
    if (textLower.includes('amazon pay')) {
      return 'Amazon Pay Credit Card';
    }
    
    // Default assumption for banking SMS
    return 'Credit Card';
  }

  /**
   * Extract transaction amount from SMS with improved patterns
   * @param {string} text - SMS text segment
   * @returns {number|null} Transaction amount
   */
  extractAmount(text) {
    // Enhanced amount patterns
    const patterns = [
      /rs\.?\s*([0-9,]+\.?\d*)/i,             // Rs. 1,000.00 or Rs 1000
      /rs[^0-9.,]*([0-9,]+\.?\d*)/i,          // Rs 1,000.00 (with possible space/characters)
      /₹\s*([0-9,]+\.?\d*)/i,                 // ₹1,000.00
      /inr\s*([0-9,]+\.?\d*)/i,               // INR 1000
      /inr[^0-9.,]*([0-9,]+\.?\d*)/i,         // INR Dr. 1000
      /amount\s*(?:of|:)?\s*rs\.?\s*([0-9,]+\.?\d*)/i, // Amount Rs. 1000
      /(?:spent|paid|payment of|debited for|received|due of|due|amt|total amt|min amt due)\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,  // spent Rs. 1000
      /(?:dr|cr)\.?\s*([0-9,]+\.?\d*)/i,      // Dr. 1000
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
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
   * Determine transaction type from SMS content with improved detection
   * @param {string} textLower - Lowercase SMS segment
   * @returns {string} Transaction type
   */
  determineTransactionType(textLower) {
    // Mapping of keywords to transaction types
    const typeKeywords = {
      [this.transactionTypes.PURCHASE]: [
        'spent', 'purchase', 'transaction', 'used', 'charged', 'debited',
        'shopping', 'payment to', 'paid to', 'at', 'debit', 'purchase'
      ],
      [this.transactionTypes.PAYMENT]: [
        'payment', 'paid', 'credited', 'received', 'credit', 'thank you for your payment',
        'payment received', 'bill payment', 'thank you for payment'
      ],
      [this.transactionTypes.FEE]: [
        'fee', 'charge', 'penalty', 'late', 'annual fee', 'service charge',
        'joining fee', 'renewal fee', 'membership fee'
      ],
      [this.transactionTypes.INTEREST]: [
        'interest', 'finance charge', 'finance charges'
      ],
      [this.transactionTypes.REFUND]: [
        'refund', 'reversal', 'reversed', 'cashback', 'returned'
      ],
      [this.transactionTypes.CASH_ADVANCE]: [
        'cash advance', 'atm withdrawal', 'cash withdrawal'
      ],
      [this.transactionTypes.BALANCE_UPDATE]: [
        'statement', 'generated', 'balance', 'outstanding', 'total due', 'min due',
        'minimum due', 'total amount due', 'credit limit', 'available limit'
      ]
    };

    // Check for specific types based on keywords
    for (const [type, keywords] of Object.entries(typeKeywords)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          return type;
        }
      }
    }

    // Look for context-based clues
    if (textLower.includes('due') && (textLower.includes('total') || textLower.includes('min'))) {
      return this.transactionTypes.BALANCE_UPDATE;
    }
    
    if (textLower.includes('avl lmt') || textLower.includes('available limit')) {
      if (textLower.includes('spent') || textLower.includes('transaction')) {
        return this.transactionTypes.PURCHASE;
      }
      return this.transactionTypes.BALANCE_UPDATE;
    }

    // Default based on presence of merchant
    if (this.extractMerchant(textLower)) {
      return this.transactionTypes.PURCHASE;
    }

    // Final default
    return this.transactionTypes.BALANCE_UPDATE;
  }

  /**
   * Extract merchant name from SMS with improved patterns
   * @param {string} text - SMS text segment
   * @returns {string|null} Merchant name
   */
  extractMerchant(text) {
    // Enhanced merchant patterns
    const patterns = [
      /at\s+([A-Z0-9][A-Z0-9\s&.,\-*+\/]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
      /merchant\s*:?\s*([A-Z0-9][A-Z0-9\s&.,\-*+\/]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
      /(?:spent|transaction|purchase).*?(?:at|on|with)\s+([A-Z0-9][A-Z0-9\s&.,\-*+\/]+?)(?:\s+on|\s+dated|\s*\.|$)/i,
      /([A-Z0-9]{2,}(?:\s*[*&.]\s*[A-Z0-9]{2,})*)/i, // For patterns like FLIPKART*PAY
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Clean up merchant name
        let merchant = match[1].trim();
        
        // Remove any trailing junk
        merchant = merchant.replace(/\s+(?:has|on|at|for|with|dated).*$/i, '');
        
        // Handle special cases like AMAZON*IN
        if (/^[A-Z0-9]+\*[A-Z0-9]+$/i.test(merchant)) {
          const parts = merchant.split('*');
          merchant = parts[0]; // Use just the main merchant name
        }
        
        // Remove any trailing punctuation
        merchant = merchant.replace(/[.,;:]+$/, '');
        
        return merchant;
      }
    }

    return null;
  }

  /**
   * Extract transaction date from SMS with improved date parsing
   * @param {string} text - SMS text segment
   * @param {Date} fallbackDate - SMS receipt date as fallback
   * @returns {Date} Transaction date
   */
  extractTransactionDate(text, fallbackDate) {
    // Enhanced date patterns
    const patterns = [
      // DD-MMM-YY format
      { regex: /(\d{1,2})[-\.\/]([A-Za-z]{3})[-\.\/](\d{2})/i, format: 'DD-MMM-YY' },
      
      // DD-MM-YY format
      { regex: /(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2})/i, format: 'DD-MM-YY' },
      
      // YY-MM-DD format
      { regex: /(\d{2})[-\.\/](\d{1,2})[-\.\/](\d{1,2})/i, format: 'YY-MM-DD' },
      
      // DD-MM-YYYY format
      { regex: /(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{4})/i, format: 'DD-MM-YYYY' },
      
      // DD MMM YY format
      { regex: /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2})/i, format: 'DD MMM YY' },
      
      // Dates with time
      { regex: /(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i, format: 'DD-MM-YY HH:MM:SS' },
    ];

    // Try each pattern
    for (const { regex, format } of patterns) {
      const match = text.match(regex);
      
      if (match) {
        try {
          let year, month, day, hours = 0, minutes = 0, seconds = 0;
          
          switch (format) {
            case 'DD-MMM-YY':
              day = parseInt(match[1], 10);
              month = this.getMonthNumber(match[2]);
              year = 2000 + parseInt(match[3], 10); // Assume 20xx for YY
              break;
              
            case 'DD-MM-YY':
              day = parseInt(match[1], 10);
              month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
              year = 2000 + parseInt(match[3], 10); // Assume 20xx for YY
              break;
              
            case 'YY-MM-DD':
              year = 2000 + parseInt(match[1], 10); // Assume 20xx for YY
              month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
              day = parseInt(match[3], 10);
              break;
              
            case 'DD-MM-YYYY':
              day = parseInt(match[1], 10);
              month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
              year = parseInt(match[3], 10);
              break;
              
            case 'DD MMM YY':
              day = parseInt(match[1], 10);
              month = this.getMonthNumber(match[2]);
              year = 2000 + parseInt(match[3], 10); // Assume 20xx for YY
              break;
              
            case 'DD-MM-YY HH:MM:SS':
              day = parseInt(match[1], 10);
              month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
              year = match[3].length === 2 ? 2000 + parseInt(match[3], 10) : parseInt(match[3], 10);
              hours = parseInt(match[4], 10);
              minutes = parseInt(match[5], 10);
              seconds = match[6] ? parseInt(match[6], 10) : 0;
              break;
          }
          
          // Validate extracted date components
          if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
            const date = new Date(year, month, day, hours, minutes, seconds);
            
            // Check if date is valid and not in the future
            const now = new Date();
            if (!isNaN(date.getTime()) && date <= now) {
              return date;
            }
          }
        } catch (error) {
          console.log('Date parsing error:', error);
          // Continue to next pattern
        }
      }
    }

    // If no valid date found, return the fallback date
    return fallbackDate;
  }

  /**
   * Convert month name to month number (0-11)
   * @param {string} monthStr - Month name (full or abbreviated)
   * @returns {number} Month number (0-11)
   */
  getMonthNumber(monthStr) {
    const months = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11,
    };
    
    return months[monthStr.toLowerCase()] || 0;
  }

  /**
   * Extract available credit limit from SMS with improved patterns
   * @param {string} text - SMS text segment
   * @returns {number|null} Available limit
   */
  extractAvailableLimit(text) {
    const patterns = [
      /available\s*limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /available\s*credit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /limit\s*available\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /avl\s*(?:limit|lmt)\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /avbl\s*bal\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

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
   * Extract current balance/outstanding from SMS with improved patterns
   * @param {string} text - SMS text segment
   * @returns {number|null} Current balance
   */
  extractCurrentBalance(text) {
    const patterns = [
      /outstanding\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /balance\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /current\s*balance\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /total\s*(?:amt|amount|due)\s*:?\s*(?:rs\.?|inr|₹)?\s*(?:dr\.?|cr\.?)?\s*([0-9,]+\.?\d*)/i,
      /min\s*(?:amt|amount|due)\s*(?:due)?\s*:?\s*(?:rs\.?|inr|₹)?\s*(?:dr\.?)?\s*([0-9,]+\.?\d*)/i,
      /new\s*outstanding\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /due\s*(?:amt|amount)?\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

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
   * Extract credit limit from SMS with improved patterns
   * @param {string} text - SMS text segment
   * @returns {number|null} Credit limit
   */
  extractCreditLimit(text) {
    const patterns = [
      /credit\s*limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /(?:(?<!available|avl)\s)limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /total\s*limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /card\s*limit\s*:?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
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
   * Extract minimum due amount
   * @param {string} text - SMS text segment
   * @returns {number|null} Minimum due amount
   */
  extractMinimumDue(text) {
    const patterns = [
      /min(?:imum)?\s*(?:amt|amount)?\s*due\s*(?:of|:)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /min\s*due\s*(?:of|:)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /min\s*(?:amt|amount)\s*(?:of|:)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
    ];

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
   * Extract due date from SMS
   * @param {string} text - SMS text segment
   * @returns {Date|null} Due date
   */
  extractDueDate(text) {
    // Look for common due date patterns
    const patterns = [
      /due\s*(?:on|date)?\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /pay\s*by\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /payment\s*due\s*(?:on|date)?\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /due\s*(?:on|date)?\s*:?\s*(\d{1,2})[-\s\.\/]([A-Za-z]{3})[-\s\.\/](\d{2,4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          let day = parseInt(match[1], 10);
          let month, year;
          
          // Check if month is a name (e.g., "Jan") or a number
          if (isNaN(parseInt(match[2], 10))) {
            month = this.getMonthNumber(match[2]);
          } else {
            month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
          }
          
          // Handle 2-digit or 4-digit year
          year = parseInt(match[3], 10);
          if (year < 100) {
            year += 2000; // Assume 20xx for 2-digit years
          }
          
          const dueDate = new Date(year, month, day);
          if (!isNaN(dueDate.getTime())) {
            return dueDate;
          }
        } catch (error) {
          console.log('Due date parsing error:', error);
        }
      }
    }

    return null;
  }

  /**
   * Extract statement generation date
   * @param {string} text - SMS text segment
   * @returns {Date|null} Statement date
   */
  extractStatementDate(text) {
    // Look for statement generation patterns
    const patterns = [
      /statement\s*(?:generated|date)\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
      /statement\s*(?:generated|date)\s*:?\s*(\d{1,2})[-\s\.\/]([A-Za-z]{3})[-\s\.\/](\d{2,4})/i,
      /bill\s*(?:generated|date)\s*:?\s*(\d{1,2})[-\.\/](\d{1,2})[-\.\/](\d{2,4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          let day = parseInt(match[1], 10);
          let month, year;
          
          // Check if month is a name (e.g., "Jan") or a number
          if (isNaN(parseInt(match[2], 10))) {
            month = this.getMonthNumber(match[2]);
          } else {
            month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
          }
          
          // Handle 2-digit or 4-digit year
          year = parseInt(match[3], 10);
          if (year < 100) {
            year += 2000; // Assume 20xx for 2-digit years
          }
          
          const statementDate = new Date(year, month, day);
          if (!isNaN(statementDate.getTime())) {
            return statementDate;
          }
        } catch (error) {
          console.log('Statement date parsing error:', error);
        }
      }
    }

    return null;
  }

  /**
   * Extract transaction time if available
   * @param {string} text - SMS text segment
   * @returns {string|null} Transaction time (HH:MM format)
   */
  extractTransactionTime(text) {
    // Look for time patterns
    const timePatterns = [
      /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(?:hrs|IST)?/i,
      /at\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i,
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
   * Extract cashback or rewards information
   * @param {string} text - SMS text segment
   * @returns {Object|null} Cashback/rewards info
   */
  extractRewards(text) {
    // Look for rewards/cashback patterns
    const patterns = [
      /earned\s*(?:a\s*)?(?:cashback|reward|points)\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /cashback\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /reward\s*(?:of)?\s*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?\d*)/i,
      /earned\s*(\d+)\s*points/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const value = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(value) && value > 0) {
          return {
            type: text.toLowerCase().includes('point') ? 'points' : 'cashback',
            value: value,
            currency: text.toLowerCase().includes('point') ? 'points' : 'INR',
          };
        }
      }
    }

    return null;
  }

  /**
   * Check if the SMS is a payment reminder
   * @param {string} text - SMS text segment
   * @returns {boolean} True if this is a payment reminder
   */
  isPaymentReminder(text) {
    const reminderPatterns = [
      /reminder|payment\s*due|due\s*date|pay\s*by|please\s*pay|kindly\s*pay/i,
      /pay\s*your|make\s*payment|pay\s*total\s*due|pay\s*min\s*due/i,
      /avoid\s*late\s*(?:charges|fees)|delayed\s*payment/i,
    ];

    return reminderPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Check if the SMS indicates a declined transaction
   * @param {string} text - SMS text segment
   * @returns {boolean} True if this is a declined transaction
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
   * Extract all relevant information from an SMS
   * @param {Object} sms - SMS message object
   * @returns {Object} Complete parsed information
   */
  extractAllInfo(sms) {
    try {
      // Basic SMS parsing first
      const basicParsed = this.parseSMS(sms);
      
      if (!basicParsed.success) {
        return basicParsed;
      }
      
      // Enhanced extraction for each segment
      const segments = this.splitIntoSegments(sms.body);
      const enhancedData = {
        creditCards: [],
        transactions: [],
        reminders: [],
        statements: [],
        rewards: [],
      };
      
      // Process each segment for detailed information
      for (const segment of segments) {
        const cardNumber = this.extractCardNumber(segment);
        if (!cardNumber) continue;
        
        // Find or create credit card object
        let creditCard = enhancedData.creditCards.find(c => c.lastFourDigits === cardNumber);
        if (!creditCard) {
          creditCard = {
            id: `${basicParsed.creditCard?.bankName || 'unknown'}_${cardNumber}`.toLowerCase(),
            bankName: basicParsed.creditCard?.bankName || 'Unknown Bank',
            lastFourDigits: cardNumber,
            cardType: this.extractCardType(segment.toLowerCase()),
            lastUpdated: new Date().toISOString(),
          };
          enhancedData.creditCards.push(creditCard);
        }
        
        // Update credit card details
        const creditLimit = this.extractCreditLimit(segment);
        if (creditLimit) creditCard.creditLimit = creditLimit;
        
        const currentBalance = this.extractCurrentBalance(segment);
        if (currentBalance !== null) creditCard.currentBalance = currentBalance;
        
        const minimumDue = this.extractMinimumDue(segment);
        if (minimumDue !== null) creditCard.minimumDue = minimumDue;
        
        const dueDate = this.extractDueDate(segment);
        if (dueDate) creditCard.dueDate = dueDate.toISOString();
        
        // Process transactions
        const amount = this.extractAmount(segment);
        if (amount) {
          const txnType = this.determineTransactionType(segment.toLowerCase());
          const merchant = this.extractMerchant(segment);
          const txnDate = this.extractTransactionDate(segment, new Date(parseInt(sms.date)));
          
          enhancedData.transactions.push({
            id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            cardId: creditCard.id,
            amount,
            type: txnType,
            merchant,
            date: txnDate.toISOString(),
            time: this.extractTransactionTime(segment),
            availableLimit: this.extractAvailableLimit(segment),
            description: segment.trim(),
            declined: this.isDeclinedTransaction(segment),
          });
        }
        
        // Check for statement
        const statementDate = this.extractStatementDate(segment);
        if (statementDate) {
          enhancedData.statements.push({
            cardId: creditCard.id,
            generationDate: statementDate.toISOString(),
            dueDate: dueDate ? dueDate.toISOString() : null,
            totalDue: currentBalance,
            minimumDue: minimumDue,
          });
        }
        
        // Check for payment reminder
        if (this.isPaymentReminder(segment)) {
          enhancedData.reminders.push({
            cardId: creditCard.id,
            dueDate: dueDate ? dueDate.toISOString() : null,
            totalDue: currentBalance,
            minimumDue: minimumDue,
            reminderDate: new Date(parseInt(sms.date)).toISOString(),
          });
        }
        
        // Check for rewards
        const rewards = this.extractRewards(segment);
        if (rewards) {
          enhancedData.rewards.push({
            cardId: creditCard.id,
            ...rewards,
            date: new Date(parseInt(sms.date)).toISOString(),
          });
        }
      }
      
      return {
        success: true,
        ...enhancedData,
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
        originalSMS: sms,
        error: error.message || 'Unknown parsing error',
      };
    }
  }
}

export default SMSParser;