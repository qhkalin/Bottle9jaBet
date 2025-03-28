import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  isEmailVerified: boolean("is_email_verified").default(false),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  balance: integer("balance").default(0), // Amount in kobo (₦1 = 100 kobo)
  createdAt: timestamp("created_at").defaultNow(),
  loginAttempts: integer("login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
});

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  code: text("code").notNull(),
  type: text("type").notNull(), // 'email', 'login', '2fa'
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false),
});

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  bankCode: text("bank_code").notNull(),
  bankName: text("bank_name").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  cardRef: text("card_ref").notNull(), // reference from payment processor
  last4: text("last4").notNull(),
  expiryMonth: text("expiry_month").notNull(),
  expiryYear: text("expiry_year").notNull(),
  cardType: text("card_type").notNull(),
  isDefault: boolean("is_default").default(false),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'bet', 'win'
  amount: integer("amount").notNull(), // Amount in kobo
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  reference: text("reference").notNull().unique(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bettingHistory = pgTable("betting_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  betAmount: integer("bet_amount").notNull(), // Amount in kobo
  selectedNumber: integer("selected_number").notNull(),
  winningNumber: integer("winning_number").notNull(),
  isWin: boolean("is_win").notNull(),
  winAmount: integer("win_amount"), // Amount in kobo if won
  transactionId: integer("transaction_id"), // Related transaction if any
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).pick({
  userId: true,
  code: true,
  type: true,
  expiresAt: true,
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).pick({
  userId: true,
  accountNumber: true,
  accountName: true,
  bankCode: true,
  bankName: true,
  isDefault: true,
});

export const insertCardSchema = createInsertSchema(cards).pick({
  userId: true,
  cardRef: true,
  last4: true,
  expiryMonth: true,
  expiryYear: true,
  cardType: true,
  isDefault: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  status: true,
  reference: true,
  metadata: true,
});

export const insertBettingHistorySchema = createInsertSchema(bettingHistory).pick({
  userId: true,
  betAmount: true,
  selectedNumber: true,
  winningNumber: true,
  isWin: true,
  winAmount: true,
  transactionId: true,
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  code: z.string().length(6),
});

export const verify2FASchema = z.object({
  code: z.string().length(6),
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type BettingHistory = typeof bettingHistory.$inferSelect;
export type InsertBettingHistory = z.infer<typeof insertBettingHistorySchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
