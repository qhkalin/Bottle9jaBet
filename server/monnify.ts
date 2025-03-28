import axios from "axios";
import { randomBytes } from "crypto";

// Monnify API Configuration
const API_KEY = process.env.MONNIFY_API_KEY || "MK_TEST_PUMJ0V3WZL";
const SECRET_KEY = process.env.MONNIFY_SECRET_KEY || "7ULH6NT8YKJ5SR1S2M62ZJ61PRW58NNC";
const BASE_URL = process.env.MONNIFY_BASE_URL || "https://sandbox.monnify.com";
const CONTRACT_CODE = process.env.MONNIFY_CONTRACT_CODE || "2022829732";
const ACCOUNT_NUMBER = process.env.MONNIFY_ACCOUNT_NUMBER || "9393579338";

// Authenticate and get bearer token
async function getAuthToken(): Promise<string> {
  try {
    const credentials = Buffer.from(`${API_KEY}:${SECRET_KEY}`).toString("base64");
    const response = await axios.post(
      `${BASE_URL}/api/v1/auth/login`,
      {},
      {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      }
    );
    return response.data.responseBody.accessToken;
  } catch (error) {
    console.error("Failed to get Monnify auth token:", error);
    throw new Error("Failed to authenticate with Monnify");
  }
}

// Generate a unique transaction reference
export function generateTransactionReference(): string {
  return `TRX-${randomBytes(8).toString("hex").toUpperCase()}`;
}

// Initialize transaction for payment
export async function initializeTransaction(
  amount: number,
  customerName: string,
  customerEmail: string,
  paymentMethods: string[] = ["CARD", "ACCOUNT_TRANSFER", "USSD"],
  redirectUrl: string = ""
): Promise<{
  transactionReference: string;
  paymentReference: string;
  checkoutUrl: string;
}> {
  try {
    const token = await getAuthToken();
    const reference = generateTransactionReference();
    
    const response = await axios.post(
      `${BASE_URL}/api/v1/merchant/transactions/init-transaction`,
      {
        amount,
        currencyCode: "NGN",
        contractCode: CONTRACT_CODE,
        paymentReference: reference,
        customerName,
        customerEmail,
        paymentMethods,
        redirectUrl,
        paymentDescription: "Deposit to Bottle9jaBet account",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return {
      transactionReference: reference,
      paymentReference: reference,
      checkoutUrl: response.data.responseBody.checkoutUrl,
    };
  } catch (error) {
    console.error("Failed to initialize Monnify transaction:", error);
    throw new Error("Failed to initialize payment");
  }
}

// Verify transaction status
export async function verifyTransaction(paymentReference: string): Promise<{
  amount: number;
  status: string;
  paymentMethod: string;
  paidOn: string;
  cardDetails?: {
    cardType: string;
    last4: string;
    expiryMonth: string;
    expiryYear: string;
  };
}> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${BASE_URL}/api/v1/merchant/transactions/query?paymentReference=${paymentReference}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const { responseBody } = response.data;
    return {
      amount: responseBody.amount,
      status: responseBody.paymentStatus,
      paymentMethod: responseBody.paymentMethod,
      paidOn: responseBody.paidOn,
      cardDetails: responseBody.paymentMethod === "CARD" ? {
        cardType: responseBody.paymentSourceInformation?.cardType || "",
        last4: responseBody.paymentSourceInformation?.last4 || "",
        expiryMonth: responseBody.paymentSourceInformation?.expiryMonth || "",
        expiryYear: responseBody.paymentSourceInformation?.expiryYear || "",
      } : undefined,
    };
  } catch (error) {
    console.error("Failed to verify Monnify transaction:", error);
    throw new Error("Failed to verify payment");
  }
}

// Process bank transfer withdrawal
export async function initiateTransfer(
  amount: number,
  accountName: string,
  accountNumber: string,
  bankCode: string,
  narration: string = "Withdrawal from Bottle9jaBet"
): Promise<{
  reference: string;
  status: string;
}> {
  try {
    const token = await getAuthToken();
    const reference = generateTransactionReference();
    
    const response = await axios.post(
      `${BASE_URL}/api/v1/disbursements/single`,
      {
        amount,
        currency: "NGN",
        reference,
        narration,
        destinationBankCode: bankCode,
        destinationAccountNumber: accountNumber,
        destinationAccountName: accountName,
        sourceAccountNumber: ACCOUNT_NUMBER,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    return {
      reference,
      status: response.data.responseBody.status,
    };
  } catch (error) {
    console.error("Failed to initiate Monnify transfer:", error);
    throw new Error("Failed to process withdrawal");
  }
}

// Get bank list
export async function getBanks(): Promise<Array<{ name: string; code: string }>> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${BASE_URL}/api/v1/banks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data.responseBody.map((bank: any) => ({
      name: bank.name,
      code: bank.code,
    }));
  } catch (error) {
    console.error("Failed to get bank list from Monnify:", error);
    throw new Error("Failed to fetch bank list");
  }
}

// Validate bank account
export async function validateBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<{
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}> {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${BASE_URL}/api/v1/disbursements/account/validate?accountNumber=${accountNumber}&bankCode=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    const { responseBody } = response.data;
    return {
      accountNumber: responseBody.accountNumber,
      accountName: responseBody.accountName,
      bankCode: responseBody.bankCode,
      bankName: responseBody.bankName,
    };
  } catch (error) {
    console.error("Failed to validate bank account with Monnify:", error);
    throw new Error("Failed to validate bank account");
  }
}

// Create a virtual account for a user
export async function createVirtualAccount(
  customerName: string,
  customerEmail: string
): Promise<{
  accountNumber: string;
  bankName: string;
  bankCode: string;
  accountName: string;
}> {
  try {
    const token = await getAuthToken();
    const accountReference = `VA-${randomBytes(8).toString("hex").toUpperCase()}`;
    
    const response = await axios.post(
      `${BASE_URL}/api/v1/bank-transfer/reserved-accounts`,
      {
        contractCode: CONTRACT_CODE,
        accountReference,
        accountName: customerName,
        currencyCode: "NGN",
        customerEmail,
        customerName,
        getAllAvailableBanks: false,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    const { responseBody } = response.data;
    const account = responseBody.accounts[0];
    
    return {
      accountNumber: account.accountNumber,
      bankName: account.bankName,
      bankCode: account.bankCode,
      accountName: account.accountName,
    };
  } catch (error) {
    console.error("Failed to create virtual account with Monnify:", error);
    throw new Error("Failed to create virtual account");
  }
}
