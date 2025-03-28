export type WheelNumber = 2 | 5 | 8 | 10 | 13 | 15 | 18 | 20;

export type BetResult = {
  betId: number;
  selectedNumber: number;
  winningNumber: number;
  isWin: boolean;
  betAmount: number;
  winAmount: number;
  reference: string;
};

export type LiveFeedItem = {
  username: string;
  betAmount: number;
  winAmount: number;
  isWin: boolean;
  timestamp: string;
};

export type PaymentMethod = "CARD" | "ACCOUNT_TRANSFER" | "USSD";

export type DepositResponse = {
  reference: string;
  checkoutUrl: string;
};

export type BankType = {
  name: string;
  code: string;
};

export type BankAccountDetails = {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
};

export type CardDetails = {
  cardRef: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string;
  isDefault?: boolean;
};

export type TwoStepModalMode = 'setup' | 'verification' | 'login';

export type WheelSectionData = {
  number: WheelNumber;
  color: string;
};
