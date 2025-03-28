import { DepositResponse, Bank, BankAccountDetails } from './types';
import { apiRequest } from './queryClient';

// Initialize deposit transaction
export async function initializeDeposit(amount: number, paymentMethod?: string): Promise<DepositResponse> {
  const res = await apiRequest('POST', '/api/deposits/initialize', {
    amount,
    paymentMethod
  });
  return await res.json();
}

// Verify deposit
export async function verifyDeposit(reference: string): Promise<{
  status: string;
  amount?: number;
  message?: string;
}> {
  const res = await apiRequest('GET', `/api/deposits/verify/${reference}`);
  return await res.json();
}

// Process withdrawal
export async function processWithdrawal(amount: number, bankAccountId: number): Promise<{
  status: string;
  amount?: number;
  reference?: string;
}> {
  const res = await apiRequest('POST', '/api/withdrawals', {
    amount,
    bankAccountId
  });
  return await res.json();
}

// Get bank list
export async function getBankList(): Promise<Bank[]> {
  const res = await apiRequest('GET', '/api/banks');
  return await res.json();
}

// Validate bank account
export async function validateBankAccount(accountNumber: string, bankCode: string): Promise<BankAccountDetails> {
  const res = await apiRequest('POST', '/api/bank-accounts', {
    accountNumber,
    bankCode
  });
  return await res.json();
}

// Get user's bank accounts
export async function getUserBankAccounts(): Promise<BankAccountDetails[]> {
  const res = await apiRequest('GET', '/api/bank-accounts');
  return await res.json();
}

// Delete bank account
export async function deleteBankAccount(accountId: number): Promise<{ message: string }> {
  const res = await apiRequest('DELETE', `/api/bank-accounts/${accountId}`);
  return await res.json();
}

// Set default bank account
export async function setDefaultBankAccount(accountId: number): Promise<BankAccountDetails> {
  const res = await apiRequest('PUT', `/api/bank-accounts/${accountId}/default`);
  return await res.json();
}

// Get user's cards
export async function getUserCards(): Promise<any[]> {
  const res = await apiRequest('GET', '/api/cards');
  return await res.json();
}

// Delete card
export async function deleteCard(cardId: number): Promise<{ message: string }> {
  const res = await apiRequest('DELETE', `/api/cards/${cardId}`);
  return await res.json();
}

// Set default card
export async function setDefaultCard(cardId: number): Promise<any> {
  const res = await apiRequest('PUT', `/api/cards/${cardId}/default`);
  return await res.json();
}
