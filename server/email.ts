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
