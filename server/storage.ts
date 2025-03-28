import { 
  users, type User, type InsertUser,
  verificationCodes, type VerificationCode, type InsertVerificationCode,
  bankAccounts, type BankAccount, type InsertBankAccount,
  cards, type Card, type InsertCard,
  transactions, type Transaction, type InsertTransaction,
  bettingHistory, type BettingHistory, type InsertBettingHistory 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface for all database operations
export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  updateUserBalance(id: number, amount: number): Promise<User | undefined>;
  
  // Verification code operations
  createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode>;
  getVerificationCode(userId: number, code: string, type: string): Promise<VerificationCode | undefined>;
  markCodeAsUsed(id: number): Promise<void>;
  
  // Bank account operations
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  getBankAccounts(userId: number): Promise<BankAccount[]>;
  getBankAccount(id: number): Promise<BankAccount | undefined>;
  updateBankAccount(id: number, data: Partial<BankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: number): Promise<void>;
  
  // Card operations
  createCard(card: InsertCard): Promise<Card>;
  getCards(userId: number): Promise<Card[]>;
  getCard(id: number): Promise<Card | undefined>;
  updateCard(id: number, data: Partial<Card>): Promise<Card | undefined>;
  deleteCard(id: number): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionByReference(reference: string): Promise<Transaction | undefined>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined>;
  
  // Betting history operations
  createBettingHistory(history: InsertBettingHistory): Promise<BettingHistory>;
  getBettingHistory(userId: number): Promise<BettingHistory[]>;
  getRecentBettingHistory(limit: number): Promise<BettingHistory[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private verificationCodes: Map<number, VerificationCode>;
  private bankAccounts: Map<number, BankAccount>;
  private cards: Map<number, Card>;
  private transactions: Map<number, Transaction>;
  private bettingHistory: Map<number, BettingHistory>;
  sessionStore: session.Store;
  
  private userId: number = 1;
  private verificationCodeId: number = 1;
  private bankAccountId: number = 1;
  private cardId: number = 1;
  private transactionId: number = 1;
  private bettingHistoryId: number = 1;

  constructor() {
    this.users = new Map();
    this.verificationCodes = new Map();
    this.bankAccounts = new Map();
    this.cards = new Map();
    this.transactions = new Map();
    this.bettingHistory = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isEmailVerified: false, 
      isTwoFactorEnabled: false, 
      balance: 0, 
      createdAt: now,
      loginAttempts: 0,
      lockedUntil: undefined
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserBalance(id: number, amount: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, balance: user.balance + amount };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Verification code operations
  async createVerificationCode(code: InsertVerificationCode): Promise<VerificationCode> {
    const id = this.verificationCodeId++;
    const verificationCode: VerificationCode = { ...code, id, isUsed: false };
    this.verificationCodes.set(id, verificationCode);
    return verificationCode;
  }

  async getVerificationCode(userId: number, code: string, type: string): Promise<VerificationCode | undefined> {
    return Array.from(this.verificationCodes.values()).find(
      (vc) => vc.userId === userId && vc.code === code && vc.type === type && !vc.isUsed && new Date(vc.expiresAt) > new Date()
    );
  }

  async markCodeAsUsed(id: number): Promise<void> {
    const code = this.verificationCodes.get(id);
    if (code) {
      this.verificationCodes.set(id, { ...code, isUsed: true });
    }
  }

  // Bank account operations
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const id = this.bankAccountId++;
    const bankAccount: BankAccount = { ...account, id };
    this.bankAccounts.set(id, bankAccount);
    return bankAccount;
  }

  async getBankAccounts(userId: number): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values()).filter(
      (account) => account.userId === userId
    );
  }

  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }

  async updateBankAccount(id: number, data: Partial<BankAccount>): Promise<BankAccount | undefined> {
    const account = this.bankAccounts.get(id);
    if (!account) return undefined;
    
    const updatedAccount = { ...account, ...data };
    this.bankAccounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteBankAccount(id: number): Promise<void> {
    this.bankAccounts.delete(id);
  }

  // Card operations
  async createCard(card: InsertCard): Promise<Card> {
    const id = this.cardId++;
    const newCard: Card = { ...card, id };
    this.cards.set(id, newCard);
    return newCard;
  }

  async getCards(userId: number): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(
      (card) => card.userId === userId
    );
  }

  async getCard(id: number): Promise<Card | undefined> {
    return this.cards.get(id);
  }

  async updateCard(id: number, data: Partial<Card>): Promise<Card | undefined> {
    const card = this.cards.get(id);
    if (!card) return undefined;
    
    const updatedCard = { ...card, ...data };
    this.cards.set(id, updatedCard);
    return updatedCard;
  }

  async deleteCard(id: number): Promise<void> {
    this.cards.delete(id);
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const now = new Date();
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionByReference(reference: string): Promise<Transaction | undefined> {
    return Array.from(this.transactions.values()).find(
      (tx) => tx.reference === reference
    );
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updatedTransaction = { 
      ...transaction, 
      ...data, 
      updatedAt: new Date() 
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Betting history operations
  async createBettingHistory(history: InsertBettingHistory): Promise<BettingHistory> {
    const id = this.bettingHistoryId++;
    const now = new Date();
    const newHistory: BettingHistory = { 
      ...history, 
      id, 
      createdAt: now 
    };
    this.bettingHistory.set(id, newHistory);
    return newHistory;
  }

  async getBettingHistory(userId: number): Promise<BettingHistory[]> {
    return Array.from(this.bettingHistory.values())
      .filter((history) => history.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getRecentBettingHistory(limit: number): Promise<BettingHistory[]> {
    return Array.from(this.bettingHistory.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
