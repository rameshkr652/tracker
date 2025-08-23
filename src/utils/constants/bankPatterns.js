// src/utils/constants/bankPatterns.js - Bank SMS Patterns for Indian Banks
export const bankPatterns = {
  // Major Private Banks
  HDFC: {
    name: 'HDFC Bank',
    senderPatterns: [/hdfc/i, /hdfcbank/i, /ad-hdfcbk/i],
    transactionPatterns: [
      /you have spent rs\.?\s*([0-9,]+\.?\d*)/i,
      /transaction of rs\.?\s*([0-9,]+\.?\d*)/i,
      /debited.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  ICICI: {
    name: 'ICICI Bank',
    senderPatterns: [/icici/i, /icicibank/i, /ad-icicib/i],
    transactionPatterns: [
      /used for rs\.?\s*([0-9,]+\.?\d*)/i,
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /spent rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  SBI: {
    name: 'State Bank of India',
    senderPatterns: [/sbi/i, /sbicard/i, /ad-sbicar/i],
    transactionPatterns: [
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /spent.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /purchase.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  AXIS: {
    name: 'Axis Bank',
    senderPatterns: [/axis/i, /axisbank/i, /ad-axisbk/i],
    transactionPatterns: [
      /spent rs\.?\s*([0-9,]+\.?\d*)/i,
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /charged rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  KOTAK: {
    name: 'Kotak Mahindra Bank',
    senderPatterns: [/kotak/i, /kotakbank/i, /ad-kotak/i],
    transactionPatterns: [
      /transaction of rs\.?\s*([0-9,]+\.?\d*)/i,
      /spent rs\.?\s*([0-9,]+\.?\d*)/i,
      /purchase.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  // Additional Banks
  YES_BANK: {
    name: 'Yes Bank',
    senderPatterns: [/yes.*bank/i, /yesbank/i, /ad-yesbk/i],
    transactionPatterns: [
      /spent rs\.?\s*([0-9,]+\.?\d*)/i,
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  INDUSIND: {
    name: 'IndusInd Bank',
    senderPatterns: [/indusind/i, /indusbank/i, /ad-indus/i],
    transactionPatterns: [
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /spent.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  AMEX: {
    name: 'American Express',
    senderPatterns: [/amex/i, /american.*express/i, /ad-amex/i],
    transactionPatterns: [
      /charge of rs\.?\s*([0-9,]+\.?\d*)/i,
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  CITI: {
    name: 'Citibank',
    senderPatterns: [/citi/i, /citibank/i, /ad-citi/i],
    transactionPatterns: [
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /spent rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },

  STANDARD_CHARTERED: {
    name: 'Standard Chartered',
    senderPatterns: [/standard.*chartered/i, /stanchart/i, /ad-stcbk/i],
    transactionPatterns: [
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /spent.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ],
    cardPatterns: [/xx(\d{4})/i, /\*\*\*\*(\d{4})/i],
    merchantPatterns: [/at\s+([A-Z][A-Z0-9\s&.-]+?)(?:\s+on|\s+dated|\s*\.|$)/i],
  },
};

// Common SMS keywords for transaction detection
export const transactionKeywords = [
  'spent', 'paid', 'charged', 'debited', 'credited', 'transaction', 'purchase',
  'payment', 'transfer', 'withdrawal', 'deposit', 'balance', 'available',
  'credit card', 'card', 'limit', 'outstanding', 'due', 'minimum due',
  'statement', 'bill', 'overdue', 'interest', 'late fee',
  'rs.', 'rs ', 'inr', '₹', 'rupees',
  'account', 'bank', 'atm', 'pos', 'online', 'upi', 'imps', 'neft', 'rtgs'
];

// Common merchant categories
export const merchantCategories = {
  FOOD: ['swiggy', 'zomato', 'uber eats', 'dominos', 'pizza hut', 'mcdonald', 'kfc', 'subway'],
  SHOPPING: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'big basket', 'grofers'],
  TRANSPORT: ['uber', 'ola', 'rapido', 'metro', 'irctc', 'makemytrip', 'goibibo'],
  ENTERTAINMENT: ['netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube', 'bookmyshow'],
  FUEL: ['indian oil', 'bharat petroleum', 'hindustan petroleum', 'reliance', 'shell'],
  UTILITIES: ['electricity', 'gas', 'water', 'broadband', 'mobile', 'dth', 'recharge'],
  MEDICAL: ['apollo', 'fortis', 'max', 'medanta', 'pharmeasy', 'netmeds', '1mg'],
  EDUCATION: ['byju', 'unacademy', 'vedantu', 'coursera', 'udemy', 'khan academy'],
};

// Transaction type detection patterns
export const transactionTypes = {
  PURCHASE: {
    keywords: ['spent', 'purchase', 'transaction', 'used', 'charged', 'debited'],
    patterns: [
      /spent.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /purchase.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /transaction.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ]
  },
  PAYMENT: {
    keywords: ['payment', 'paid', 'credited', 'received'],
    patterns: [
      /payment.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /paid.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /credited.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ]
  },
  FEE: {
    keywords: ['fee', 'charge', 'penalty', 'late'],
    patterns: [
      /fee.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /charge.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /penalty.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ]
  },
  INTEREST: {
    keywords: ['interest', 'finance charge'],
    patterns: [
      /interest.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /finance.*charge.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ]
  },
  REFUND: {
    keywords: ['refund', 'reversal'],
    patterns: [
      /refund.*rs\.?\s*([0-9,]+\.?\d*)/i,
      /reversal.*rs\.?\s*([0-9,]+\.?\d*)/i,
    ]
  }
};

// Balance and limit extraction patterns
export const balancePatterns = {
  AVAILABLE_LIMIT: [
    /available\s*limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /available\s*credit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /limit\s*available\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
  ],
  OUTSTANDING: [
    /outstanding\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /balance\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /current\s*balance\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /total\s*due\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
  ],
  CREDIT_LIMIT: [
    /credit\s*limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
    /total\s*limit\s*:?\s*rs\.?\s*([0-9,]+\.?\d*)/i,
  ]
};

// Date extraction patterns
export const datePatterns = [
  /on\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
  /dated\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
  /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i,
  /on\s+(\d{1,2}\s+\w+\s+\d{2,4})/i, // "on 15 Aug 2024"
];

// Amount extraction patterns
export const amountPatterns = [
  /rs\.?\s*([0-9,]+\.?\d*)/i,     // Rs. 1,000.00 or Rs 1000
  /₹\s*([0-9,]+\.?\d*)/i,         // ₹1,000.00
  /inr\s*([0-9,]+\.?\d*)/i,       // INR 1000
  /amount\s*rs\.?\s*([0-9,]+\.?\d*)/i, // Amount Rs. 1000
  /spent\s*rs\.?\s*([0-9,]+\.?\d*)/i,  // spent Rs. 1000
  /paid\s*rs\.?\s*([0-9,]+\.?\d*)/i,   // paid Rs. 1000
];

// Card number extraction patterns
export const cardNumberPatterns = [
  /xx(\d{4})/i,           // xx1234
  /\*\*\*\*(\d{4})/i,     // ****1234
  /xxxx(\d{4})/i,         // xxxx1234
  /ending\s*(\d{4})/i,    // ending 1234
  /card\s*(\d{4})/i,      // card 1234
  /\*(\d{4})/i,           // *1234
];

export default {
  bankPatterns,
  transactionKeywords,
  merchantCategories,
  transactionTypes,
  balancePatterns,
  datePatterns,
  amountPatterns,
  cardNumberPatterns,
};