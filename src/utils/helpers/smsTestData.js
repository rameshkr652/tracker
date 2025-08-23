// src/utils/helpers/smsTestData.js - Enhanced test SMS data with real-world examples
export const testSMSData = [
  // Complex real-world SMS examples
  {
    address: 'ICICIBK',
    body: 'Payment of Rs 8,000.00 has been received on your ICICI Bank Credit Card XX6000 through Bharat Bill Payment System on 21-JUL-25.ICICI Bank Credit Card XX6000 debited for INR 212.20 on 24-Jun-25 for UPI-881684068980-ZOMATO. To dispute call 18001080/SMS BLOCK 6000 to 9215676766Pay Total Due of Rs 3,61,544.58 or Minimum Due Rs 20,420.00 by 30-Aug-25 for ICICI Bank Credit Card XX4001. Delayed/No payments are reported to Credit Bureaus.Payment of Rs 8,000.00 has been received on your ICICI Bank Credit Card XX6000 through Bharat Bill Payment System on 20-JUN-25.',
    date: '1692758400000', // Aug 23, 2025
  },
  {
    address: 'AXISBK',
    body: 'Statement for your Axis Bank Credit Card no. XX2546 has been generated.\nDue on: 04-09-25\nTotal amt: INR  Dr. 84356.07\nMin amt due: INR  Dr. 5893.00\nTo pay, visit axisbank.com/ccpaynow\nTo view the fees & charges, visit https://ccm.axbk.in/AXISBK/ApCh7aMn\nTo view / download the statement, visit https://ccm.axbk.in/AXISBK/sTve2DYIYou have earned a total cash back of INR 22.00 in August on your Flipkart Axis Bank Credit CardXX2546. It will be credited in the next statement. T&C.',
    date: '1692672000000', // Aug 22, 2025
  },
  {
    address: 'AXISBK',
    body: 'Spent\nCard no. XX2546\nINR 444\n09-08-25 14:29:25\nFLIPKART PA\nAvl Lmt INR 8240.31\nSMS BLOCK 2546 to 919951860002, if not you - Axis Bank',
    date: '1691596800000', // Aug 9, 2025
  },
  {
    address: 'AXISBK',
    body: 'Transaction of INR 75 on Axis Bank Credit Card no. XX2546 on 17-08-25 10:55:12 IST at CANVA* PAAA has been reversed. Available limit: INR 3052.39. Call 18001035577, if not done by you - Axis Bank',
    date: '1692292800000', // Aug 17, 2025
  },
  
  // Original samples still kept for backward compatibility
  {
    address: 'AD-HDFCBK',
    body: 'You have spent Rs.2,500.00 on your HDFC Bank Credit Card xx1234 at AMAZON on 15-Aug-24. Available limit: Rs.47,500.00',
    date: '1692086400000',
  },
  {
    address: 'HDFCBANK',
    body: 'Your HDFC Bank Credit Card xx1234 payment of Rs.5000.00 has been received on 16-Aug-24. Outstanding: Rs.15,400.00',
    date: '1692172800000',
  },
  {
    address: 'AD-SBICAR',
    body: 'SBI Card transaction: Rs.1,200 spent at SWIGGY on Card xx5678 on 15-Aug-24. Available limit: Rs.88,800',
    date: '1692086400000',
  },
  {
    address: 'SBICARD',
    body: 'SBI Card payment of Rs.10000 received for Card xx5678. New outstanding: Rs.8,500',
    date: '1692172800000',
  },
  {
    address: 'AD-ICICIB',
    body: 'ICICI Bank Credit Card xx9012 used for Rs.800.00 at UBER on 15-Aug-24. Available credit limit Rs.49,200.00',
    date: '1692086400000',
  },
  {
    address: 'ICICIBANK',
    body: 'Payment of Rs.15000 received on ICICI Bank Credit Card xx9012. Current outstanding: Rs.12,300',
    date: '1692172800000',
  }
];

// More realistic test data generator
export const generateBankingSMS = (count = 10) => {
  const banks = [
    { sender: 'HDFCBK', name: 'HDFC Bank' },
    { sender: 'SBIINB', name: 'SBI Card' },
    { sender: 'ICICIB', name: 'ICICI Bank' },
    { sender: 'AXISBK', name: 'Axis Bank' },
    { sender: 'KOTAKB', name: 'Kotak Bank' },
  ];

  const merchants = [
    'AMAZON', 'FLIPKART', 'SWIGGY', 'ZOMATO', 'UBER', 'OLA', 'MYNTRA', 'NYKAA',
    'NETFLIX', 'AMAZON PRIME', 'DOMINOS', 'MCDONALD', 'BIG BASKET', 'AIRTEL'
  ];
  
  const cardNumbers = ['1234', '5678', '9012', '3456', '7890'];
  const smsTemplates = [
    // Transaction template
    (bank, card, merchant, amount, limit) => 
      `${bank.name} Credit Card XX${card} debited for INR ${amount.toFixed(2)} on ${formatDate()} at ${merchant}. Available limit: INR ${limit.toFixed(2)}`,
    
    // Payment template
    (bank, card, amount, balance) => 
      `Payment of Rs ${amount.toFixed(2)} has been received on your ${bank.name} Credit Card XX${card}. Current outstanding: Rs ${balance.toFixed(2)}`,
    
    // Statement template
    (bank, card, total, min, dueDate) => 
      `Statement for your ${bank.name} Credit Card no. XX${card} has been generated.\nDue on: ${dueDate}\nTotal amt: INR ${total.toFixed(2)}\nMin amt due: INR ${min.toFixed(2)}\nTo pay, visit ${bank.name.toLowerCase().replace(/\s+/g, '')}bank.com`,
    
    // Reminder template
    (bank, card, total, min, dueDate) =>
      `Reminder: Pay Total Due of Rs ${total.toFixed(2)} or Minimum Due Rs ${min.toFixed(2)} by ${dueDate} for ${bank.name} Credit Card XX${card}. Delayed payments are reported to Credit Bureaus.`
  ];

  const smsMessages = [];

  for (let i = 0; i < count; i++) {
    const bank = banks[i % banks.length];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const cardNumber = cardNumbers[i % cardNumbers.length];
    const amount = Math.floor(Math.random() * 5000) + 500; // Rs. 500 to Rs. 5500
    const availableLimit = Math.floor(Math.random() * 90000) + 10000; // Rs. 10k to Rs. 100k
    const balance = Math.floor(Math.random() * 50000) + 5000; // Rs. 5k to Rs. 55k
    const minDue = Math.floor(balance * 0.05); // 5% of balance
    
    // Generate due date - random day next month
    const today = new Date();
    const nextMonth = today.getMonth() + 1;
    const dueDate = `${Math.floor(Math.random() * 28) + 1}-${(nextMonth > 11 ? nextMonth - 12 : nextMonth) + 1}-${nextMonth > 11 ? today.getFullYear() + 1 : today.getFullYear()}`;
    
    // Pick a template
    const templateIndex = Math.floor(Math.random() * smsTemplates.length);
    const template = smsTemplates[templateIndex];
    
    let body;
    switch (templateIndex) {
      case 0: // Transaction
        body = template(bank, cardNumber, merchant, amount, availableLimit);
        break;
      case 1: // Payment
        body = template(bank, cardNumber, amount, balance);
        break;
      case 2: // Statement
        body = template(bank, cardNumber, balance, minDue, dueDate);
        break;
      case 3: // Reminder
        body = template(bank, cardNumber, balance, minDue, dueDate);
        break;
    }

    const sms = createTestSMS(
      bank.sender,
      body,
      Math.floor(Math.random() * 30) // Random day in last 30 days
    );

    smsMessages.push(sms);
  }

  return smsMessages;
};

// Helper function to format date as DD-MMM-YY
function formatDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const day = date.getDate().toString().padStart(2, '0');
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  
  return `${day}-${month}-${year}`;
}

export const createTestSMS = (address, body, daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return {
    address,
    body,
    date: date.getTime().toString(),
  };
};

export default {
  testSMSData,
  createTestSMS,
  generateBankingSMS,
};