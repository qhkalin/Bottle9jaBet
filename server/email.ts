import nodemailer from "nodemailer";

// Set up nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "exesoftware010@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "lmgz etkx gude udar",
  },
});

const SENDER_NAME = "Bottle9jaBet";
const SENDER_EMAIL = process.env.EMAIL_USER || "exesoftware010@gmail.com";

// Email templates
const emailTemplates = {
  verification: (name: string, code: string) => ({
    subject: "Verify Your Email - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>Thank you for registering with Bottle9jaBet. Please verify your email by entering the following code:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">This code will expire in 30 minutes</p>
        </div>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  twoFactorAuth: (name: string, code: string) => ({
    subject: "Your 2-Step Verification Code - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>Your 2-Step Verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #999; margin-top: 10px;">This code will expire in 5 minutes</p>
        </div>
        <p>If you did not request this code, someone might be trying to access your account. Please change your password immediately.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  twoFactorEnabled: (name: string) => ({
    subject: "2-Step Verification Enabled - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>This is to confirm that 2-Step Verification has been successfully enabled for your account.</p>
        <p>From now on, you'll need to enter a verification code sent to your email when signing in.</p>
        <p>This adds an extra layer of security to your account, helping to keep your funds safe.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  depositConfirmation: (name: string, amount: string, reference: string) => ({
    subject: "Deposit Confirmation - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>Your deposit has been successfully processed:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₦${amount}</p>
          <p><strong>Reference:</strong> ${reference}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Your account balance has been updated. You can now place bets and enjoy our games!</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  withdrawalConfirmation: (name: string, amount: string, bankName: string, accountNumber: string) => ({
    subject: "Withdrawal Confirmation - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>Your withdrawal request has been successfully processed:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₦${amount}</p>
          <p><strong>Bank:</strong> ${bankName}</p>
          <p><strong>Account:</strong> ${accountNumber}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>The funds should reflect in your bank account shortly.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  bankAccountAdded: (name: string, bankName: string, accountNumber: string) => ({
    subject: "Bank Account Added - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>A new bank account has been added to your Bottle9jaBet account:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Bank:</strong> ${bankName}</p>
          <p><strong>Account Number:</strong> ${accountNumber}</p>
        </div>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  bankAccountRemoved: (name: string, bankName: string) => ({
    subject: "Bank Account Removed - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>A bank account has been removed from your Bottle9jaBet account:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Bank:</strong> ${bankName}</p>
        </div>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  cardAdded: (name: string, cardType: string, last4: string) => ({
    subject: "Card Added - Bottle9jaBet",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>A new card has been added to your Bottle9jaBet account:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Card Type:</strong> ${cardType}</p>
          <p><strong>Card Number:</strong> **** **** **** ${last4}</p>
        </div>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
      </div>
    `,
  }),
  
  gameGuide: (name: string) => ({
    subject: "Your Bottle9jaBet Game Guide",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>Thank you for your interest in Bottle9jaBet! We've attached a comprehensive game guide to help you get started.</p>
        
        <div style="background-color: #f9f4e8; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h2 style="color: #8B4513; margin-top: 0;">Quick Start Guide</h2>
          
          <div style="margin-bottom: 15px;">
            <h3 style="color: #8B4513; margin-bottom: 5px;">How to Play:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Log in to your account</li>
              <li>Deposit funds using your preferred payment method</li>
              <li>Go to the homepage and select a number (2, 5, 8, 10, 13, 15, 18, or 20)</li>
              <li>Enter your bet amount (min ₦500, max ₦10 million)</li>
              <li>Click "Place Bet" and watch the bottle spin!</li>
            </ol>
          </div>
          
          <div style="margin-bottom: 15px;">
            <h3 style="color: #8B4513; margin-bottom: 5px;">Winning:</h3>
            <p style="margin: 0;">If the bottle lands on your selected number, you win an amount equal to your stake multiplied by the number.</p>
            <p style="margin-top: 5px;"><strong>Example:</strong> Bet ₦1,000 on number 20 → Win ₦20,000</p>
          </div>
          
          <div>
            <h3 style="color: #8B4513; margin-bottom: 5px;">Tips:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Start with smaller bets to get familiar with the game</li>
              <li>Set a budget for your gaming session</li>
              <li>Play responsibly and for entertainment</li>
            </ul>
          </div>
        </div>
        
        <p>We've attached a detailed PDF guide to this email that includes complete instructions, strategies, and tips for using our platform.</p>
        
        <div style="background-color: #e8f4f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #0066CC; margin-top: 0;">Install as an App</h3>
          <p style="margin-bottom: 5px;">Did you know you can install Bottle9jaBet on your phone's home screen?</p>
          <p style="margin-top: 0;"><strong>On Android:</strong> Open Chrome → Menu (⋮) → Add to Home screen</p>
          <p style="margin-top: 0;"><strong>On iPhone:</strong> Open Safari → Share (📤) → Add to Home Screen</p>
        </div>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The Bottle9jaBet Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p>18+ | Please play responsibly</p>
        </div>
      </div>
    `,
  }),
  
  welcome: (name: string) => ({
    subject: "Welcome to Bottle9jaBet!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8B4513; margin: 0;">Bottle<span style="color: #FFD700;">9ja</span>Bet</h1>
          <p style="color: #666;">Spin the bottle & win big!</p>
        </div>
        <p>Hello ${name},</p>
        <p>Welcome to Bottle9jaBet! We're excited to have you join our community of players.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #8B4513; margin-top: 0;">Getting Started:</h3>
          <ol style="padding-left: 20px;">
            <li>Complete your profile</li>
            <li>Add a payment method</li>
            <li>Make your first deposit</li>
            <li>Start playing and winning!</li>
          </ol>
        </div>
        
        <p>To help you get started, we've attached our comprehensive game guide that explains how to play, winning strategies, and tips for maximizing your experience.</p>
        
        <p>If you have any questions or need assistance, our support team is always here to help.</p>
        
        <p>Best regards,<br>The Bottle9jaBet Team</p>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999;">
          <p>18+ | Please play responsibly</p>
        </div>
      </div>
    `,
  }),
};

export async function sendEmail(to: string, templateName: keyof typeof emailTemplates, data: any): Promise<boolean> {
  try {
    const template = emailTemplates[templateName];
    if (!template) {
      console.error(`Email template ${templateName} not found`);
      return false;
    }
    
    const { subject, html } = template(...data);
    
    await transporter.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      to,
      subject,
      html
    });
    
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

// Generate a random 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
