// src/utils/helpers/errorHandler.js - Comprehensive Error Handling for SMS Parsing
export class SMSParsingError extends Error {
  constructor(message, type, originalError = null) {
    super(message);
    this.name = 'SMSParsingError';
    this.type = type;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export const ErrorTypes = {
  SMS_PERMISSION_DENIED: 'SMS_PERMISSION_DENIED',
  SMS_READ_FAILED: 'SMS_READ_FAILED',
  SMS_PARSE_FAILED: 'SMS_PARSE_FAILED',
  STORAGE_FAILED: 'STORAGE_FAILED',
  INVALID_SMS_FORMAT: 'INVALID_SMS_FORMAT',
  BANK_NOT_RECOGNIZED: 'BANK_NOT_RECOGNIZED',
  AMOUNT_EXTRACTION_FAILED: 'AMOUNT_EXTRACTION_FAILED',
  CARD_NUMBER_EXTRACTION_FAILED: 'CARD_NUMBER_EXTRACTION_FAILED',
  DATE_PARSING_FAILED: 'DATE_PARSING_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

export class ErrorHandler {
  static logError(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        type: error.type || ErrorTypes.UNKNOWN_ERROR,
        stack: error.stack,
      },
      context,
    };

    console.error('SMS Parsing Error:', errorLog);
    
    // In production, you might want to send this to a logging service
    // this.sendToLoggingService(errorLog);
  }

  static handleSMSPermissionError(originalError) {
    const error = new SMSParsingError(
      'SMS permission was denied. The app cannot function without SMS access.',
      ErrorTypes.SMS_PERMISSION_DENIED,
      originalError
    );
    
    this.logError(error, { 
      action: 'requesting_sms_permission',
      platform: 'android' 
    });
    
    return {
      success: false,
      error,
      userMessage: 'SMS access is required for the app to work. Please grant permission in settings.',
      canRetry: true,
    };
  }

  static handleSMSReadError(originalError) {
    const error = new SMSParsingError(
      'Failed to read SMS messages from device.',
      ErrorTypes.SMS_READ_FAILED,
      originalError
    );
    
    this.logError(error, { 
      action: 'reading_sms_messages' 
    });
    
    return {
      success: false,
      error,
      userMessage: 'Unable to read SMS messages. Please try again.',
      canRetry: true,
    };
  }

  static handleSMSParseError(sms, originalError) {
    const error = new SMSParsingError(
      'Failed to parse SMS message for credit card information.',
      ErrorTypes.SMS_PARSE_FAILED,
      originalError
    );
    
    this.logError(error, { 
      action: 'parsing_sms',
      sms_sender: sms?.address,
      sms_length: sms?.body?.length,
    });
    
    return {
      success: false,
      error,
      userMessage: 'Some SMS messages could not be processed.',
      canRetry: false,
    };
  }

  static handleStorageError(operation, originalError) {
    const error = new SMSParsingError(
      `Failed to ${operation} data in storage.`,
      ErrorTypes.STORAGE_FAILED,
      originalError
    );
    
    this.logError(error, { 
      action: 'storage_operation',
      operation 
    });
    
    return {
      success: false,
      error,
      userMessage: 'Failed to save your data. Please try again.',
      canRetry: true,
    };
  }

  static handleInvalidSMSFormat(sms) {
    const error = new SMSParsingError(
      'SMS format is not recognized as a banking message.',
      ErrorTypes.INVALID_SMS_FORMAT
    );
    
    this.logError(error, { 
      action: 'validating_sms_format',
      sms_sender: sms?.address,
      sms_preview: sms?.body?.substring(0, 100),
    });
    
    return {
      success: false,
      error,
      userMessage: null, // Don't show to user, this is expected
      canRetry: false,
    };
  }

  static handleBankNotRecognized(sms) {
    const error = new SMSParsingError(
      'Bank could not be identified from SMS.',
      ErrorTypes.BANK_NOT_RECOGNIZED
    );
    
    this.logError(error, { 
      action: 'identifying_bank',
      sms_sender: sms?.address,
      sms_preview: sms?.body?.substring(0, 100),
    });
    
    return {
      success: false,
      error,
      userMessage: null, // Don't show to user, this is expected
      canRetry: false,
    };
  }

  static handleAmountExtractionError(sms) {
    const error = new SMSParsingError(
      'Could not extract transaction amount from SMS.',
      ErrorTypes.AMOUNT_EXTRACTION_FAILED
    );
    
    this.logError(error, { 
      action: 'extracting_amount',
      sms_sender: sms?.address,
      sms_preview: sms?.body?.substring(0, 100),
    });
    
    return {
      success: false,
      error,
      userMessage: null, // Don't show to user, this is expected
      canRetry: false,
    };
  }

  static handleCardNumberExtractionError(sms) {
    const error = new SMSParsingError(
      'Could not extract card number from SMS.',
      ErrorTypes.CARD_NUMBER_EXTRACTION_FAILED
    );
    
    this.logError(error, { 
      action: 'extracting_card_number',
      sms_sender: sms?.address,
      sms_preview: sms?.body?.substring(0, 100),
    });
    
    return {
      success: false,
      error,
      userMessage: null, // Don't show to user, this is expected
      canRetry: false,
    };
  }

  static handleDateParsingError(dateString, originalError) {
    const error = new SMSParsingError(
      'Could not parse date from SMS.',
      ErrorTypes.DATE_PARSING_FAILED,
      originalError
    );
    
    this.logError(error, { 
      action: 'parsing_date',
      date_string: dateString,
    });
    
    return {
      success: false,
      error,
      userMessage: null, // Don't show to user, this is expected
      canRetry: false,
    };
  }

  static handleNetworkError(originalError) {
    const error = new SMSParsingError(
      'Network connection failed.',
      ErrorTypes.NETWORK_ERROR,
      originalError
    );
    
    this.logError(error, { 
      action: 'network_request' 
    });
    
    return {
      success: false,
      error,
      userMessage: 'Please check your internet connection and try again.',
      canRetry: true,
    };
  }

  static handleUnknownError(originalError, context = {}) {
    const error = new SMSParsingError(
      'An unexpected error occurred.',
      ErrorTypes.UNKNOWN_ERROR,
      originalError
    );
    
    this.logError(error, { 
      action: 'unknown_operation',
      ...context 
    });
    
    return {
      success: false,
      error,
      userMessage: 'Something went wrong. Please try again.',
      canRetry: true,
    };
  }

  static getErrorStats(errors) {
    const stats = {};
    
    errors.forEach(error => {
      const type = error.type || ErrorTypes.UNKNOWN_ERROR;
      stats[type] = (stats[type] || 0) + 1;
    });
    
    return {
      total: errors.length,
      byType: stats,
      mostCommon: Object.keys(stats).reduce((a, b) => stats[a] > stats[b] ? a : b, ''),
    };
  }

  static isRetryableError(error) {
    const retryableTypes = [
      ErrorTypes.SMS_PERMISSION_DENIED,
      ErrorTypes.SMS_READ_FAILED,
      ErrorTypes.STORAGE_FAILED,
      ErrorTypes.NETWORK_ERROR,
      ErrorTypes.UNKNOWN_ERROR,
    ];
    
    return retryableTypes.includes(error.type);
  }

  static shouldShowToUser(error) {
    const userVisibleTypes = [
      ErrorTypes.SMS_PERMISSION_DENIED,
      ErrorTypes.SMS_READ_FAILED,
      ErrorTypes.STORAGE_FAILED,
      ErrorTypes.NETWORK_ERROR,
      ErrorTypes.UNKNOWN_ERROR,
    ];
    
    return userVisibleTypes.includes(error.type);
  }

  static getRecoveryAction(error) {
    switch (error.type) {
      case ErrorTypes.SMS_PERMISSION_DENIED:
        return {
          action: 'REQUEST_PERMISSION',
          message: 'Grant SMS permission',
          buttonText: 'Grant Permission',
        };
        
      case ErrorTypes.SMS_READ_FAILED:
        return {
          action: 'RETRY_SMS_READ',
          message: 'Try reading SMS again',
          buttonText: 'Retry',
        };
        
      case ErrorTypes.STORAGE_FAILED:
        return {
          action: 'RETRY_STORAGE',
          message: 'Try saving data again',
          buttonText: 'Retry',
        };
        
      case ErrorTypes.NETWORK_ERROR:
        return {
          action: 'RETRY_NETWORK',
          message: 'Check connection and retry',
          buttonText: 'Retry',
        };
        
      default:
        return {
          action: 'RETRY_GENERAL',
          message: 'Try again',
          buttonText: 'Retry',
        };
    }
  }

  // Validation helpers
  static validateSMS(sms) {
    if (!sms) {
      throw new SMSParsingError('SMS object is null or undefined', ErrorTypes.INVALID_SMS_FORMAT);
    }
    
    if (!sms.body || typeof sms.body !== 'string') {
      throw new SMSParsingError('SMS body is missing or invalid', ErrorTypes.INVALID_SMS_FORMAT);
    }
    
    if (!sms.address || typeof sms.address !== 'string') {
      throw new SMSParsingError('SMS sender address is missing or invalid', ErrorTypes.INVALID_SMS_FORMAT);
    }
    
    if (!sms.date || isNaN(parseInt(sms.date))) {
      throw new SMSParsingError('SMS date is missing or invalid', ErrorTypes.INVALID_SMS_FORMAT);
    }
    
    return true;
  }

  static validateAmount(amount) {
    if (amount === null || amount === undefined) {
      throw new SMSParsingError('Amount is null or undefined', ErrorTypes.AMOUNT_EXTRACTION_FAILED);
    }
    
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new SMSParsingError('Amount is not a valid number', ErrorTypes.AMOUNT_EXTRACTION_FAILED);
    }
    
    if (amount <= 0) {
      throw new SMSParsingError('Amount must be greater than zero', ErrorTypes.AMOUNT_EXTRACTION_FAILED);
    }
    
    if (amount > 10000000) { // 1 crore limit
      throw new SMSParsingError('Amount seems unreasonably high', ErrorTypes.AMOUNT_EXTRACTION_FAILED);
    }
    
    return true;
  }

  static validateCardNumber(cardNumber) {
    if (!cardNumber || typeof cardNumber !== 'string') {
      throw new SMSParsingError('Card number is missing or invalid', ErrorTypes.CARD_NUMBER_EXTRACTION_FAILED);
    }
    
    if (!/^\d{4}$/.test(cardNumber)) {
      throw new SMSParsingError('Card number must be exactly 4 digits', ErrorTypes.CARD_NUMBER_EXTRACTION_FAILED);
    }
    
    return true;
  }

  static validateBankName(bankName) {
    if (!bankName || typeof bankName !== 'string') {
      throw new SMSParsingError('Bank name is missing or invalid', ErrorTypes.BANK_NOT_RECOGNIZED);
    }
    
    if (bankName.length < 2) {
      throw new SMSParsingError('Bank name is too short', ErrorTypes.BANK_NOT_RECOGNIZED);
    }
    
    return true;
  }
}

export default ErrorHandler;