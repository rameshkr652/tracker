// src/utils/helpers/smsTestData.js - Test SMS data for debugging
export const testSMSData = [
  // HDFC Bank SMS samples
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

  // SBI Card SMS samples
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

  // ICICI Bank SMS samples
  {
    address: 'AD-ICICIB',
    body: 'ICICI Bank Credit Card xx9012 used for Rs.800.00 at UBER on 15-Aug-24. Available credit limit Rs.49,200.00',
    date: '1692086400000',
  },
  {
    address: 'ICICIBANK',
    body: 'Payment of Rs.15000 received on ICICI Bank Credit Card xx9012. Current outstanding: Rs.12,300',
    date: '1692172800000',
  },

  // Axis Bank SMS samples
  {
    address: 'AD-AXISBK',
    body: 'You have spent Rs.3,200 on Axis Bank Credit Card xx3456 at FLIPKART on 15-Aug-24. Available limit: Rs.96,800',
    date: '1692086400000',
  },
  {
    address: 'AXISBANK',
    body: 'Axis Bank Credit Card xx3456 payment of Rs.8000 processed. Outstanding balance: Rs.18,200',
    date: '1692172800000',
  },

  // Kotak Bank SMS samples
  {
    address: 'AD-KOTAK',
    body: 'Transaction of Rs.1,800 on Kotak Credit Card xx7890 at ZOMATO on 15-Aug-24. Available credit: Rs.78,200',
    date: '1692086400000',
  },

  // American Express SMS samples
  {
    address: 'AD-AMEX',
    body: 'American Express Card xx4567 charge of Rs.5,500 at BOOKMYSHOW on 15-Aug-24. Available credit: Rs.44,500',
    date: '1692086400000',
  },

  // Non-banking SMS (should be filtered out)
  {
    address: '+919876543210',
    body: 'Hi, how are you doing today?',
    date: '1692086400000',
  },
  {
    address: 'PROMO',
    body: 'Get 50% off on your next order! Use code SAVE50',
    date: '1692086400000',
  },
];

export const createTestSMS = (address, body, daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  return {
    address,
    body,
    date: date.getTime().toString(),
  };
};

export const generateBankingSMS = (count = 10) => {
  const banks = [
    { sender: 'AD-HDFCBK', name: 'HDFC Bank' },
    { sender: 'AD-SBICAR', name: 'SBI Card' },
    { sender: 'AD-ICICIB', name: 'ICICI Bank' },
    { sender: 'AD-AXISBK', name: 'Axis Bank' },
    { sender: 'AD-KOTAK', name: 'Kotak Bank' },
  ];

  const merchants = ['AMAZON', 'FLIPKART', 'SWIGGY', 'ZOMATO', 'UBER', 'OLA', 'MYNTRA', 'NYKAA'];
  const cardNumbers = ['1234', '5678', '9012', '3456', '7890'];

  const smsMessages = [];

  for (let i = 0; i < count; i++) {
    const bank = banks[i % banks.length];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const cardNumber = cardNumbers[i % cardNumbers.length];
    const amount = Math.floor(Math.random() * 5000) + 500; // Rs. 500 to Rs. 5500
    const availableLimit = Math.floor(Math.random() * 90000) + 10000; // Rs. 10k to Rs. 100k

    const sms = createTestSMS(
      bank.sender,
      `You have spent Rs.${amount}.00 on your ${bank.name} Credit Card xx${cardNumber} at ${merchant} on ${new Date().toLocaleDateString('en-GB')}. Available limit: Rs.${availableLimit}.00`,
      Math.floor(Math.random() * 30) // Random day in last 30 days
    );

    smsMessages.push(sms);
  }

  return smsMessages;
};

export default {
  testSMSData,
  createTestSMS,
  generateBankingSMS,
};