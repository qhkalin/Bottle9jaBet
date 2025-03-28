import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, verifyEmailSchema, verify2FASchema } from "@shared/schema";
import { sendEmail, generateVerificationCode } from "./email";

declare global {
  namespace Express {
    interface User extends Omit<User, "password"> {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET ?? "bottle9jabet-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          // Check if user exists
          if (!user) {
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          // Check if account is locked
          if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            return done(null, false, { 
              message: "Account is locked due to too many failed attempts. Try again later." 
            });
          }
          
          // Check password
          const passwordValid = await comparePasswords(password, user.password);
          
          if (!passwordValid) {
            // Increment login attempts
            const attemptsUpdated = user.loginAttempts + 1;
            
            // Lock account after 5 failed attempts
            if (attemptsUpdated >= 5) {
              const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
              await storage.updateUser(user.id, { 
                loginAttempts: attemptsUpdated,
                lockedUntil: lockUntil 
              });
              return done(null, false, { 
                message: "Account locked due to too many failed attempts. Try again in 30 minutes." 
              });
            }
            
            await storage.updateUser(user.id, { loginAttempts: attemptsUpdated });
            return done(null, false, { message: "Incorrect email or password" });
          }
          
          // If 2FA is enabled, don't log in yet - will be handled separately
          if (user.isTwoFactorEnabled) {
            return done(null, false, { 
              message: "2FA",
              userId: user.id,
              requiresTwoFactor: true 
            });
          }
          
          // Reset login attempts on successful login
          if (user.loginAttempts > 0) {
            await storage.updateUser(user.id, { 
              loginAttempts: 0,
              lockedUntil: null 
            });
          }
          
          // Remove password from user object before serializing
          const { password: _, ...userWithoutPassword } = user;
          return done(null, userWithoutPassword);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      const { password: _, ...userWithoutPassword } = user;
      done(null, userWithoutPassword);
    } catch (error) {
      done(error);
    }
  });

  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, fullName, confirmPassword } = req.body;
      
      // Validate input
      if (!username || !email || !password || !fullName || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords don't match" });
      }
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        fullName
      });
      
      // Generate verification code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      await storage.createVerificationCode({
        userId: user.id,
        code,
        type: "email",
        expiresAt
      });
      
      // Send verification email
      await sendEmail(email, "verification", [fullName, code]);
      
      res.status(201).json({ 
        message: "Registration successful. Please verify your email.", 
        requiresEmailVerification: true,
        userId: user.id
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Verify email route
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { userId, code } = req.body;
      
      const parseResult = verifyEmailSchema.safeParse({ code });
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const verificationCode = await storage.getVerificationCode(userId, code, "email");
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      
      // Mark code as used
      await storage.markCodeAsUsed(verificationCode.id);
      
      // Update user as verified
      await storage.updateUser(userId, { isEmailVerified: true });
      
      // Log user in
      const { password: _, ...userWithoutPassword } = user;
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after verification" });
        }
        res.status(200).json({ message: "Email verified successfully", user: userWithoutPassword });
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Email verification failed" });
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      // If 2FA is required
      if (info && info.requiresTwoFactor) {
        // Generate 2FA code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        // Store 2FA code
        (async () => {
          const userData = await storage.getUser(info.userId);
          if (userData) {
            await storage.createVerificationCode({
              userId: info.userId,
              code,
              type: "login",
              expiresAt
            });
            
            // Send 2FA email
            await sendEmail(userData.email, "twoFactorAuth", [userData.fullName, code]);
            
            return res.status(200).json({ 
              message: "2FA code sent to your email",
              requiresTwoFactor: true,
              userId: info.userId
            });
          } else {
            return res.status(404).json({ message: "User not found" });
          }
        })().catch(next);
        
        return;
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Login failed" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  // Verify 2FA code
  app.post("/api/verify-2fa", async (req, res, next) => {
    try {
      const { userId, code } = req.body;
      
      const parseResult = verify2FASchema.safeParse({ code });
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const verificationCode = await storage.getVerificationCode(userId, code, "login");
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      
      // Mark code as used
      await storage.markCodeAsUsed(verificationCode.id);
      
      // Reset login attempts
      await storage.updateUser(userId, { 
        loginAttempts: 0,
        lockedUntil: null 
      });
      
      // Log user in
      const { password: _, ...userWithoutPassword } = user;
      req.login(userWithoutPassword, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after 2FA" });
        }
        res.status(200).json({ message: "2FA verification successful", user: userWithoutPassword });
      });
    } catch (error) {
      console.error("2FA verification error:", error);
      return res.status(500).json({ message: "2FA verification failed" });
    }
  });

  // Enable 2FA
  app.post("/api/enable-2fa", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate 2FA setup code
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      
      // Store code
      await storage.createVerificationCode({
        userId: user.id,
        code,
        type: "2fa",
        expiresAt
      });
      
      // Send email with code
      await sendEmail(user.email, "twoFactorAuth", [user.fullName, code]);
      
      res.status(200).json({ message: "2FA setup code sent to your email" });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to set up 2FA" });
    }
  });

  // Verify and complete 2FA setup
  app.post("/api/verify-2fa-setup", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const { code } = req.body;
      
      const parseResult = verify2FASchema.safeParse({ code });
      if (!parseResult.success) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      const verificationCode = await storage.getVerificationCode(req.user.id, code, "2fa");
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      
      // Mark code as used
      await storage.markCodeAsUsed(verificationCode.id);
      
      // Update user to enable 2FA
      const updatedUser = await storage.updateUser(req.user.id, { isTwoFactorEnabled: true });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Send confirmation email
      await sendEmail(updatedUser.email, "twoFactorEnabled", [updatedUser.fullName]);
      
      res.status(200).json({ 
        message: "2-Step Verification has been enabled",
        user: { ...req.user, isTwoFactorEnabled: true }
      });
    } catch (error) {
      console.error("2FA setup verification error:", error);
      res.status(500).json({ message: "Failed to verify 2FA setup" });
    }
  });

  // Disable 2FA
  app.post("/api/disable-2fa", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const updatedUser = await storage.updateUser(req.user.id, { isTwoFactorEnabled: false });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ 
        message: "2-Step Verification has been disabled",
        user: { ...req.user, isTwoFactorEnabled: false }
      });
    } catch (error) {
      console.error("Disable 2FA error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json(req.user);
  });

  // Logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
}
