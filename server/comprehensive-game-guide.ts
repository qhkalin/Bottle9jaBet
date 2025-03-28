import * as fs from 'fs';
import * as path from 'path';
import { jsPDF } from 'jspdf';

/**
 * Creates a comprehensive game guide PDF with images and detailed instructions
 */
export async function generateComprehensiveGameGuidePDF(): Promise<string> {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    const tempDir = path.join(__dirname, '../temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Title and branding
    doc.setFontSize(24);
    doc.setTextColor(0, 51, 102); // Dark blue
    doc.text('Bottle9jaBet', 105, 20, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 0); // Dark green
    doc.text('Comprehensive Game Guide', 105, 30, { align: 'center' });
    
    // Introduction
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black
    doc.text('Welcome to Bottle9jaBet!', 20, 45);
    
    doc.setFontSize(10);
    doc.text(
      'This comprehensive guide will teach you everything you need to know about playing and winning ' +
      'at Bottle9jaBet. Follow these instructions to maximize your experience and potential earnings.', 
      20, 55, { maxWidth: 170 }
    );
    
    // Table of Contents
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text('Table of Contents', 20, 75);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      '1. Getting Started',
      '2. How to Play the Bottle Spinning Game',
      '3. Making Deposits',
      '4. Withdrawing Winnings',
      '5. Betting Strategies',
      '6. Account Management',
      '7. Mobile Experience (Add to Home Screen)',
      '8. Responsible Gaming',
      '9. Frequently Asked Questions',
      '10. Customer Support'
    ], 25, 85, { lineHeightFactor: 1.5 });
    
    // Section 1: Getting Started
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('1. Getting Started', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      '• Create an account or log in to your existing account',
      '• Verify your email address to enable deposits and withdrawals',
      '• Navigate to the home page to find the Bottle Spinning game',
      '• Fund your account with a minimum of ₦500 to start playing',
      '• Familiarize yourself with the game interface and controls'
    ], 20, 35, { lineHeightFactor: 1.5 });
    
    // Section 2: How to Play
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('2. How to Play the Bottle Spinning Game', 20, 80);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 0);
    doc.text('Game Rules:', 20, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      '• Select a number from 1 to 36 to place your bet on',
      '• Enter your bet amount (minimum bet is ₦100)',
      '• Click "Place Bet" to confirm your wager',
      '• Watch the bottle spin and land on a random number',
      '• If the bottle lands on your chosen number, you win!',
      '• Your winnings are calculated as: Bet Amount × Number Value',
      '  (e.g., betting ₦1,000 on number 20 pays ₦20,000 if you win)'
    ], 25, 105, { lineHeightFactor: 1.5 });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 0);
    doc.text('Game Interface:', 20, 150);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      '• Game Wheel: Shows the spinning bottle and numbers',
      '• Betting Controls: Where you select your number and enter your bet amount',
      '• Timer: Countdown to the next automatic spin',
      '• Live Feed: Real-time updates of other players\' bets and winnings',
      '• Balance: Shows your current account balance in Naira'
    ], 25, 160, { lineHeightFactor: 1.5 });
    
    // Section 3: Making Deposits
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('3. Making Deposits', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      '1. Click the Deposit button in the top navigation bar',
      '2. Enter the amount you wish to deposit (minimum ₦500)',
      '3. Select your preferred payment method:',
      '   - Card Payment: Pay with Visa, Mastercard, or Verve',
      '   - Bank Transfer: Transfer from your Nigerian bank account',
      '   - USSD: Pay using USSD codes from your mobile phone',
      '4. Complete the payment process through our secure payment gateway',
      '5. Your account will be credited instantly upon successful payment',
      '6. You can save your payment method for faster deposits in the future'
    ], 20, 35, { lineHeightFactor: 1.5 });
    
    // Section 4: Withdrawing Winnings
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('4. Withdrawing Winnings', 20, 95);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      '1. Click on your profile icon and select "Withdraw" from the menu',
      '2. Enter the amount you wish to withdraw',
      '3. Select your preferred withdrawal method:',
      '   - Bank Account: Withdraw to your registered Nigerian bank account',
      '4. Provide the necessary account details if not already saved',
      '5. Confirm the withdrawal request',
      '6. Your funds will be processed within 24 hours',
      '7. You will receive an email confirmation once your withdrawal is processed',
      '',
      'Note: You must verify your identity before making your first withdrawal'
    ], 20, 110, { lineHeightFactor: 1.5 });
    
    // Section 5: Betting Strategies
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('5. Betting Strategies', 20, 170);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      'While Bottle9jaBet is primarily a game of chance, here are some strategies to consider:',
      '',
      '• Start with smaller bets to get familiar with the game',
      '• Consider betting on lower numbers for more frequent wins (though smaller payouts)',
      '• Higher numbers offer bigger payouts but have lower probability',
      '• Set a budget for each gaming session and stick to it',
      '• Don\'t chase losses by increasing your bet amounts',
      '• Take breaks regularly to maintain clear decision-making'
    ], 20, 185, { lineHeightFactor: 1.5 });
    
    // Section 6: Account Management
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('6. Account Management', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      'Managing your account effectively ensures a smooth gaming experience:',
      '',
      '• Profile Settings: Update your personal information and contact details',
      '• Security: Enable two-factor authentication for added account protection',
      '• Payment Methods: Add and manage your bank accounts and cards',
      '• Transaction History: View all your past deposits, withdrawals, and bets',
      '• Betting History: Track your gaming performance over time',
      '• Notifications: Configure email and in-app notification preferences',
      '• Limits: Set daily, weekly, or monthly deposit and betting limits'
    ], 20, 35, { lineHeightFactor: 1.5 });
    
    // Section 7: Mobile Experience
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('7. Mobile Experience (Add to Home Screen)', 20, 100);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('For Android:', 20, 115);
    doc.text([
      '1. Open Bottle9jaBet in Chrome',
      '2. Tap the menu button (three dots) in the top-right corner',
      '3. Select "Add to Home screen"',
      '4. Confirm by tapping "Add"'
    ], 25, 125, { lineHeightFactor: 1.5 });
    
    doc.text('For iOS:', 20, 155);
    doc.text([
      '1. Open Bottle9jaBet in Safari',
      '2. Tap the Share button at the bottom of the screen',
      '3. Scroll down and tap "Add to Home Screen"',
      '4. Tap "Add" in the top-right corner'
    ], 25, 165, { lineHeightFactor: 1.5 });
    
    doc.text(
      'After adding to your home screen, you can launch Bottle9jaBet like any other app, ' +
      'enjoying a full-screen experience without browser navigation bars.',
      20, 195, { maxWidth: 170 }
    );
    
    // Section 8: Responsible Gaming
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(200, 0, 0); // Red for emphasis
    doc.text('8. Responsible Gaming', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      'At Bottle9jaBet, we promote responsible gaming:',
      '',
      '• Set betting limits for yourself and stick to them',
      '• Only bet what you can afford to lose',
      '• Take regular breaks from betting',
      '• Never chase losses by increasing your bets',
      '• Never bet under the influence of alcohol or when emotionally distressed',
      '• Betting should be for entertainment, not a way to make money',
      '• Monitor your gaming habits and time spent on betting',
      '• If you feel you may have a gambling problem, seek help immediately',
      '',
      '18+ Only. Play Responsibly. Gambling Can Be Addictive.'
    ], 20, 35, { lineHeightFactor: 1.5 });
    
    // Section 9: FAQs
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('9. Frequently Asked Questions', 20, 110);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Q: How do I know the game is fair?', 20, 125);
    doc.text(
      'A: Bottle9jaBet uses a certified random number generator to ensure all spins are completely ' +
      'random and fair. Our platform is regularly audited for fairness and transparency.',
      25, 135, { maxWidth: 165 }
    );
    
    doc.text('Q: How long do withdrawals take?', 20, 155);
    doc.text(
      'A: Most withdrawals are processed within 24 hours. Bank transfers may take an additional ' +
      '1-2 business days to reflect in your account, depending on your bank.',
      25, 165, { maxWidth: 165 }
    );
    
    doc.text('Q: Is there a minimum or maximum bet amount?', 20, 185);
    doc.text(
      'A: The minimum bet amount is ₦100. The maximum bet amount depends on your account level ' +
      'and may be adjusted based on your playing history.',
      25, 195, { maxWidth: 165 }
    );
    
    // Section 10: Customer Support
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor(0, 51, 102);
    doc.text('10. Customer Support', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text([
      'Our dedicated support team is available to assist you:',
      '',
      '• Email: support@bottle9jabet.com',
      '• Phone: +234 XXX XXX XXXX',
      '• Live Chat: Available 24/7 on our website',
      '• Social Media: Contact us through our official social media accounts',
      '',
      'We are committed to providing prompt and helpful service. Please include your ' +
      'account username and specific details about your inquiry when contacting support.'
    ], 20, 35, { lineHeightFactor: 1.5 });
    
    // Conclusion
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 0);
    doc.text('Ready to Play?', 105, 100, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      'Now that you are familiar with Bottle9jaBet, it is time to start playing! ' +
      'Remember to play responsibly and have fun. Good luck!',
      105, 110, { align: 'center', maxWidth: 150 }
    );
    
    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Page ${i} of ${totalPages}`, 20, 280);
      doc.text('© 2025 Bottle9jaBet. All rights reserved.', 105, 280, { align: 'center' });
      doc.text('18+ Only. Play Responsibly.', 190, 280, { align: 'right' });
    }
    
    // Save the PDF to a temporary file
    const filename = `guide-${Date.now()}.pdf`;
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, Buffer.from(doc.output('arraybuffer')));
    
    return filePath;
  } catch (error) {
    console.error('Error generating comprehensive game guide:', error);
    throw error;
  }
}