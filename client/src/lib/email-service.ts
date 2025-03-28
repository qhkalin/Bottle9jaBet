import { apiRequest } from './queryClient';

type EmailMessageType = 
  | "welcome" 
  | "verifyEmail" 
  | "resetPassword" 
  | "depositConfirmation" 
  | "withdrawalConfirmation" 
  | "gameGuide" 
  | "twoFactorCode" 
  | "bankAccountAdded" 
  | "cardAdded";

interface SendEmailParams {
  recipientEmail: string;
  subject: string;
  messageType: EmailMessageType;
  data: Record<string, any>;
}

/**
 * Generic function to send emails through the API
 */
export async function sendEmail({ recipientEmail, subject, messageType, data }: SendEmailParams): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/email/send', {
      to: recipientEmail,
      subject,
      templateName: messageType,
      data
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Specialized function to send game guide email
 */
export async function sendGameGuideEmail(email: string, userName: string): Promise<boolean> {
  try {
    const response = await apiRequest('POST', '/api/email/send-game-guide', {});
    return response.ok;
  } catch (error) {
    console.error('Failed to send game guide email:', error);
    return false;
  }
}

/**
 * Send a welcome email to newly registered users
 */
export async function sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Welcome to Bottle9jaBet!',
    messageType: 'welcome',
    data: { name: userName }
  });
}

/**
 * Send email verification code
 */
export async function sendVerificationEmail(email: string, userName: string, verificationCode: string): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Verify Your Bottle9jaBet Account',
    messageType: 'verifyEmail',
    data: { 
      name: userName,
      code: verificationCode
    }
  });
}

/**
 * Send two-factor authentication code
 */
export async function sendTwoFactorCodeEmail(email: string, userName: string, twoFactorCode: string): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Your Bottle9jaBet 2FA Code',
    messageType: 'twoFactorCode',
    data: { 
      name: userName,
      code: twoFactorCode
    }
  });
}

/**
 * Send deposit confirmation
 */
export async function sendDepositConfirmationEmail(
  email: string,
  userName: string,
  amount: number,
  reference: string,
  date: string
): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Deposit Confirmation - Bottle9jaBet',
    messageType: 'depositConfirmation',
    data: { 
      name: userName,
      amount: amount.toFixed(2),
      reference,
      date
    }
  });
}

/**
 * Send withdrawal confirmation
 */
export async function sendWithdrawalConfirmationEmail(
  email: string,
  userName: string,
  amount: number,
  reference: string,
  date: string,
  bankName: string,
  accountNumber: string
): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Withdrawal Confirmation - Bottle9jaBet',
    messageType: 'withdrawalConfirmation',
    data: { 
      name: userName,
      amount: amount.toFixed(2),
      reference,
      date,
      bankName,
      accountNumber
    }
  });
}

/**
 * Send bank account added confirmation
 */
export async function sendBankAccountAddedEmail(
  email: string,
  userName: string,
  bankName: string,
  accountNumber: string
): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Bank Account Added - Bottle9jaBet',
    messageType: 'bankAccountAdded',
    data: { 
      name: userName,
      bankName,
      accountNumber
    }
  });
}

/**
 * Send card added confirmation
 */
export async function sendCardAddedEmail(
  email: string,
  userName: string,
  cardType: string,
  last4: string
): Promise<boolean> {
  return sendEmail({
    recipientEmail: email,
    subject: 'Card Added - Bottle9jaBet',
    messageType: 'cardAdded',
    data: { 
      name: userName,
      cardType,
      last4
    }
  });
}