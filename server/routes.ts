import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { WebSocketServer, WebSocket } from "ws";
import { randomBytes } from "crypto";
import { 
  initializeTransaction, 
  verifyTransaction, 
  initiateTransfer, 
  getBanks, 
  validateBankAccount,
  generateTransactionReference
} from "./monnify";
import { sendEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Create HTTP server for both Express and WebSockets
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // WebSocket connection handling
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      // We'll mostly use this for broadcasting events
      console.log('received: %s', message);
    });
  });
  
  // Broadcast to all connected clients
  function broadcast(data: any) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
  
  // API routes
  
  // User profile route
  app.get("/api/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password: _, ...userProfile } = user;
      res.status(200).json(userProfile);
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Bank Accounts
  
  // Get user's bank accounts
  app.get("/api/bank-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const accounts = await storage.getBankAccounts(req.user.id);
      res.status(200).json(accounts);
    } catch (error) {
      console.error("Bank accounts fetch error:", error);
      res.status(500).json({ message: "Failed to fetch bank accounts" });
    }
  });
  
  // Add bank account
  app.post("/api/bank-accounts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { accountNumber, bankCode } = req.body;
      
      if (!accountNumber || !bankCode) {
        return res.status(400).json({ message: "Account number and bank code are required" });
      }
      
      // Validate bank account with Monnify
      const validatedAccount = await validateBankAccount(accountNumber, bankCode);
      
      // Check if account already exists
      const existingAccounts = await storage.getBankAccounts(req.user.id);
      const accountExists = existingAccounts.some(acc => acc.accountNumber === accountNumber);
      
      if (accountExists) {
        return res.status(400).json({ message: "Bank account already exists" });
      }
      
      // Create bank account
      const bankAccount = await storage.createBankAccount({
        userId: req.user.id,
        accountNumber: validatedAccount.accountNumber,
        accountName: validatedAccount.accountName,
        bankCode: validatedAccount.bankCode,
        bankName: validatedAccount.bankName,
        isDefault: existingAccounts.length === 0 // Make default if first account
      });
      
      // Send email notification
      await sendEmail(req.user.email, "bankAccountAdded", [
        req.user.fullName,
        bankAccount.bankName,
        bankAccount.accountNumber
      ]);
      
      res.status(201).json(bankAccount);
    } catch (error) {
      console.error("Bank account add error:", error);
      res.status(500).json({ message: "Failed to add bank account" });
    }
  });
  
  // Delete bank account
  app.delete("/api/bank-accounts/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const accountId = parseInt(req.params.id);
      
      // Check if account exists and belongs to user
      const account = await storage.getBankAccount(accountId);
      if (!account || account.userId !== req.user.id) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Store bank name for email notification
      const bankName = account.bankName;
      
      // Delete account
      await storage.deleteBankAccount(accountId);
      
      // Send email notification
      await sendEmail(req.user.email, "bankAccountRemoved", [
        req.user.fullName,
        bankName
      ]);
      
      res.status(200).json({ message: "Bank account removed successfully" });
    } catch (error) {
      console.error("Bank account delete error:", error);
      res.status(500).json({ message: "Failed to delete bank account" });
    }
  });
  
  // Set default bank account
  app.put("/api/bank-accounts/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const accountId = parseInt(req.params.id);
      
      // Check if account exists and belongs to user
      const account = await storage.getBankAccount(accountId);
      if (!account || account.userId !== req.user.id) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Get all user's accounts
      const accounts = await storage.getBankAccounts(req.user.id);
      
      // Update all accounts to not default
      for (const acc of accounts) {
        if (acc.isDefault) {
          await storage.updateBankAccount(acc.id, { isDefault: false });
        }
      }
      
      // Set the selected account as default
      const updatedAccount = await storage.updateBankAccount(accountId, { isDefault: true });
      
      res.status(200).json(updatedAccount);
    } catch (error) {
      console.error("Set default bank account error:", error);
      res.status(500).json({ message: "Failed to set default bank account" });
    }
  });
  
  // Get bank list
  app.get("/api/banks", async (req, res) => {
    try {
      const banks = await getBanks();
      res.status(200).json(banks);
    } catch (error) {
      console.error("Banks fetch error:", error);
      res.status(500).json({ message: "Failed to fetch banks" });
    }
  });
  
  // Cards
  
  // Get user's cards
  app.get("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const cards = await storage.getCards(req.user.id);
      res.status(200).json(cards);
    } catch (error) {
      console.error("Cards fetch error:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });
  
  // Save card after payment (will be triggered after a successful card payment)
  app.post("/api/cards", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { cardRef, last4, expiryMonth, expiryYear, cardType } = req.body;
      
      if (!cardRef || !last4 || !expiryMonth || !expiryYear || !cardType) {
        return res.status(400).json({ message: "All card details are required" });
      }
      
      // Check if card already exists
      const existingCards = await storage.getCards(req.user.id);
      const cardExists = existingCards.some(card => card.last4 === last4);
      
      if (cardExists) {
        return res.status(400).json({ message: "Card already exists" });
      }
      
      // Create card
      const card = await storage.createCard({
        userId: req.user.id,
        cardRef,
        last4,
        expiryMonth,
        expiryYear,
        cardType,
        isDefault: existingCards.length === 0 // Make default if first card
      });
      
      // Send email notification
      await sendEmail(req.user.email, "cardAdded", [
        req.user.fullName,
        cardType,
        last4
      ]);
      
      res.status(201).json(card);
    } catch (error) {
      console.error("Card add error:", error);
      res.status(500).json({ message: "Failed to add card" });
    }
  });
  
  // Delete card
  app.delete("/api/cards/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const cardId = parseInt(req.params.id);
      
      // Check if card exists and belongs to user
      const card = await storage.getCard(cardId);
      if (!card || card.userId !== req.user.id) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      // Delete card
      await storage.deleteCard(cardId);
      
      res.status(200).json({ message: "Card removed successfully" });
    } catch (error) {
      console.error("Card delete error:", error);
      res.status(500).json({ message: "Failed to delete card" });
    }
  });
  
  // Set default card
  app.put("/api/cards/:id/default", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const cardId = parseInt(req.params.id);
      
      // Check if card exists and belongs to user
      const card = await storage.getCard(cardId);
      if (!card || card.userId !== req.user.id) {
        return res.status(404).json({ message: "Card not found" });
      }
      
      // Get all user's cards
      const cards = await storage.getCards(req.user.id);
      
      // Update all cards to not default
      for (const c of cards) {
        if (c.isDefault) {
          await storage.updateCard(c.id, { isDefault: false });
        }
      }
      
      // Set the selected card as default
      const updatedCard = await storage.updateCard(cardId, { isDefault: true });
      
      res.status(200).json(updatedCard);
    } catch (error) {
      console.error("Set default card error:", error);
      res.status(500).json({ message: "Failed to set default card" });
    }
  });
  
  // Deposits
  
  // Initialize deposit
  app.post("/api/deposits/initialize", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { amount, paymentMethod } = req.body;
      
      if (!amount || amount < 500) {
        return res.status(400).json({ message: "Amount must be at least ₦500" });
      }
      
      // Convert amount to kobo (Monnify accepts amount in the smallest currency unit)
      const amountInKobo = Math.round(parseFloat(amount) * 100);
      
      // Initialize transaction with Monnify
      const paymentMethods = paymentMethod ? [paymentMethod] : ["CARD", "ACCOUNT_TRANSFER", "USSD"];
      const transaction = await initializeTransaction(
        amountInKobo,
        req.user.fullName,
        req.user.email,
        paymentMethods
      );
      
      // Create transaction record
      await storage.createTransaction({
        userId: req.user.id,
        type: "deposit",
        amount: amountInKobo,
        status: "pending",
        reference: transaction.paymentReference,
        metadata: { checkoutUrl: transaction.checkoutUrl }
      });
      
      res.status(200).json({
        reference: transaction.paymentReference,
        checkoutUrl: transaction.checkoutUrl
      });
    } catch (error) {
      console.error("Deposit initialization error:", error);
      res.status(500).json({ message: "Failed to initialize deposit" });
    }
  });
  
  // Verify deposit
  app.get("/api/deposits/verify/:reference", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { reference } = req.params;
      
      // Check if transaction exists
      const transaction = await storage.getTransactionByReference(reference);
      if (!transaction || transaction.userId !== req.user.id) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Already processed?
      if (transaction.status !== "pending") {
        return res.status(200).json({
          status: transaction.status,
          amount: transaction.amount / 100 // Convert kobo to naira
        });
      }
      
      // Verify with Monnify
      const verified = await verifyTransaction(reference);
      
      // Update transaction status
      if (verified.status === "PAID") {
        // Update transaction
        await storage.updateTransaction(transaction.id, {
          status: "completed",
          metadata: { ...transaction.metadata, paymentDetails: verified }
        });
        
        // Update user balance
        await storage.updateUserBalance(req.user.id, verified.amount);
        
        // Send email confirmation
        await sendEmail(req.user.email, "depositConfirmation", [
          req.user.fullName,
          (verified.amount / 100).toLocaleString(), // Convert kobo to naira
          reference
        ]);
        
        // If card payment, save card details if provided
        if (verified.paymentMethod === "CARD" && verified.cardDetails) {
          const { cardType, last4, expiryMonth, expiryYear } = verified.cardDetails;
          
          // Check if card already exists
          const existingCards = await storage.getCards(req.user.id);
          const cardExists = existingCards.some(card => card.last4 === last4);
          
          if (!cardExists) {
            // Create card
            await storage.createCard({
              userId: req.user.id,
              cardRef: reference, // Use payment reference as card reference
              last4,
              expiryMonth,
              expiryYear,
              cardType,
              isDefault: existingCards.length === 0 // Make default if first card
            });
            
            // Send email notification for new card
            await sendEmail(req.user.email, "cardAdded", [
              req.user.fullName,
              cardType,
              last4
            ]);
          }
        }
        
        res.status(200).json({
          status: "completed",
          amount: verified.amount / 100 // Convert kobo to naira
        });
      } else if (verified.status === "PENDING") {
        res.status(200).json({
          status: "pending",
          message: "Payment is still processing"
        });
      } else {
        // Update transaction as failed
        await storage.updateTransaction(transaction.id, {
          status: "failed",
          metadata: { ...transaction.metadata, paymentDetails: verified }
        });
        
        res.status(200).json({
          status: "failed",
          message: "Payment failed or was cancelled"
        });
      }
    } catch (error) {
      console.error("Deposit verification error:", error);
      res.status(500).json({ message: "Failed to verify deposit" });
    }
  });
  
  // Withdrawals
  
  // Initiate withdrawal
  app.post("/api/withdrawals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { amount, bankAccountId } = req.body;
      
      if (!amount || amount < 500) {
        return res.status(400).json({ message: "Amount must be at least ₦500" });
      }
      
      if (!bankAccountId) {
        return res.status(400).json({ message: "Bank account is required" });
      }
      
      // Check if bank account exists and belongs to user
      const bankAccount = await storage.getBankAccount(bankAccountId);
      if (!bankAccount || bankAccount.userId !== req.user.id) {
        return res.status(404).json({ message: "Bank account not found" });
      }
      
      // Convert amount to kobo
      const amountInKobo = Math.round(parseFloat(amount) * 100);
      
      // Check if user has sufficient balance
      const user = await storage.getUser(req.user.id);
      if (!user || user.balance < amountInKobo) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Generate reference
      const reference = generateTransactionReference();
      
      // Create transaction record first
      const transaction = await storage.createTransaction({
        userId: req.user.id,
        type: "withdrawal",
        amount: amountInKobo,
        status: "pending",
        reference,
        metadata: { bankAccountId }
      });
      
      // Deduct from user's balance
      await storage.updateUserBalance(req.user.id, -amountInKobo);
      
      // Initiate transfer with Monnify
      const transfer = await initiateTransfer(
        amountInKobo,
        bankAccount.accountName,
        bankAccount.accountNumber,
        bankAccount.bankCode,
        `Withdrawal from Bottle9jaBet - ${reference}`
      );
      
      // Update transaction status based on transfer result
      if (transfer.status === "SUCCESS" || transfer.status === "PROCESSING") {
        await storage.updateTransaction(transaction.id, {
          status: "completed",
          metadata: { ...transaction.metadata, transferDetails: transfer }
        });
        
        // Send email confirmation
        await sendEmail(req.user.email, "withdrawalConfirmation", [
          req.user.fullName,
          (amountInKobo / 100).toLocaleString(), // Convert kobo to naira
          bankAccount.bankName,
          bankAccount.accountNumber
        ]);
        
        res.status(200).json({
          status: "completed",
          amount: amountInKobo / 100, // Convert kobo to naira
          reference: transfer.reference
        });
      } else {
        // If transfer failed, revert the balance
        await storage.updateUserBalance(req.user.id, amountInKobo);
        await storage.updateTransaction(transaction.id, {
          status: "failed",
          metadata: { ...transaction.metadata, transferDetails: transfer }
        });
        
        res.status(400).json({
          status: "failed",
          message: "Withdrawal failed"
        });
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });
  
  // Betting
  
  // Place bet
  app.post("/api/bets", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { betAmount, selectedNumber } = req.body;
      
      // Validate input
      if (!betAmount || betAmount < 500) {
        return res.status(400).json({ message: "Bet amount must be at least ₦500" });
      }
      
      if (!selectedNumber || ![2, 5, 8, 10, 13, 15, 18, 20].includes(Number(selectedNumber))) {
        return res.status(400).json({ message: "Invalid number selection" });
      }
      
      // Convert bet amount to kobo
      const betAmountInKobo = Math.round(parseFloat(betAmount) * 100);
      
      // Check if user has sufficient balance
      const user = await storage.getUser(req.user.id);
      if (!user || user.balance < betAmountInKobo) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Generate a random winning number
      const possibleNumbers = [2, 5, 8, 10, 13, 15, 18, 20];
      const winningNumber = possibleNumbers[Math.floor(Math.random() * possibleNumbers.length)];
      
      // Determine if user won
      const isWin = Number(selectedNumber) === winningNumber;
      
      // Calculate win amount if user won (multiply bet by number value)
      let winAmount = 0;
      if (isWin) {
        winAmount = Math.round(betAmountInKobo * (winningNumber / 2));
      }
      
      // Generate unique reference
      const reference = `BET-${randomBytes(8).toString("hex").toUpperCase()}`;
      
      // Create transaction for the bet
      const transaction = await storage.createTransaction({
        userId: req.user.id,
        type: "bet",
        amount: betAmountInKobo,
        status: "completed",
        reference,
        metadata: { selectedNumber, winningNumber, isWin }
      });
      
      // Deduct bet amount from user's balance
      await storage.updateUserBalance(req.user.id, -betAmountInKobo);
      
      // If user won, create win transaction and add to balance
      let winTransaction = null;
      if (isWin) {
        const winReference = `WIN-${randomBytes(8).toString("hex").toUpperCase()}`;
        winTransaction = await storage.createTransaction({
          userId: req.user.id,
          type: "win",
          amount: winAmount,
          status: "completed",
          reference: winReference,
          metadata: { betTransactionId: transaction.id }
        });
        
        // Add win amount to user's balance
        await storage.updateUserBalance(req.user.id, winAmount);
      }
      
      // Create betting history record
      const betHistory = await storage.createBettingHistory({
        userId: req.user.id,
        betAmount: betAmountInKobo,
        selectedNumber: Number(selectedNumber),
        winningNumber,
        isWin,
        winAmount: isWin ? winAmount : null,
        transactionId: transaction.id
      });
      
      // Broadcast bet result to all connected clients
      broadcast({
        type: 'betResult',
        data: {
          username: `UserXXXX${req.user.id.toString().padStart(4, '0')}`,
          betAmount: betAmountInKobo / 100, // Convert kobo to naira for display
          winAmount: isWin ? winAmount / 100 : 0, // Convert kobo to naira for display
          isWin
        }
      });
      
      res.status(200).json({
        betId: betHistory.id,
        selectedNumber,
        winningNumber,
        isWin,
        betAmount: betAmountInKobo / 100, // Convert kobo to naira
        winAmount: isWin ? winAmount / 100 : 0, // Convert kobo to naira
        reference
      });
    } catch (error) {
      console.error("Betting error:", error);
      res.status(500).json({ message: "Failed to process bet" });
    }
  });
  
  // Get betting history
  app.get("/api/bets/history", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const history = await storage.getBettingHistory(req.user.id);
      
      // Format amounts from kobo to naira
      const formattedHistory = history.map(bet => ({
        ...bet,
        betAmount: bet.betAmount / 100,
        winAmount: bet.winAmount ? bet.winAmount / 100 : 0
      }));
      
      res.status(200).json(formattedHistory);
    } catch (error) {
      console.error("Betting history fetch error:", error);
      res.status(500).json({ message: "Failed to fetch betting history" });
    }
  });
  
  // Get live feed (recent bets)
  app.get("/api/bets/live-feed", async (req, res) => {
    try {
      const recentBets = await storage.getRecentBettingHistory(8);
      
      // Format the data for display
      const liveFeed = recentBets.map(bet => ({
        username: `UserXXXX${bet.userId.toString().padStart(4, '0')}`,
        betAmount: bet.betAmount / 100, // Convert kobo to naira
        winAmount: bet.isWin ? bet.winAmount / 100 : 0, // Convert kobo to naira
        isWin: bet.isWin,
        timestamp: bet.createdAt
      }));
      
      res.status(200).json(liveFeed);
    } catch (error) {
      console.error("Live feed fetch error:", error);
      res.status(500).json({ message: "Failed to fetch live feed" });
    }
  });
  
  // Transactions
  
  // Get transaction history
  app.get("/api/transactions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const transactions = await storage.getTransactions(req.user.id);
      
      // Format amounts from kobo to naira
      const formattedTransactions = transactions.map(tx => ({
        ...tx,
        amount: tx.amount / 100 // Convert kobo to naira
      }));
      
      res.status(200).json(formattedTransactions);
    } catch (error) {
      console.error("Transaction history fetch error:", error);
      res.status(500).json({ message: "Failed to fetch transaction history" });
    }
  });
  
  // Email API endpoints
  
  // Send email with various templates
  app.post("/api/email/send", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { to, subject, templateName, data } = req.body;
      
      // Basic validation
      if (!to || !templateName || !data) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Security check: Only allow sending to logged-in user's email
      if (to !== req.user.email) {
        return res.status(403).json({ message: "Can only send emails to the logged-in user" });
      }
      
      // Send the email
      const success = await sendEmail(to, templateName, Object.values(data));
      
      if (success) {
        res.status(200).json({ message: "Email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });
  
  // Send Game Guide email
  app.post("/api/email/send-game-guide", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userName = req.user.fullName || req.user.username;
      
      // Send the email with game guide template
      const success = await sendEmail(req.user.email, "gameGuide", [userName]);
      
      if (success) {
        res.status(200).json({ message: "Game guide sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send game guide" });
      }
    } catch (error) {
      console.error("Game guide email error:", error);
      res.status(500).json({ message: "Failed to send game guide" });
    }
  });
  
  return httpServer;
}
