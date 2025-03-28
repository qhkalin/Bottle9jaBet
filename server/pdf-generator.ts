import { jsPDF } from 'jspdf';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const writeFileAsync = promisify(fs.writeFile);

// Function to generate a game guide PDF and save it to a temp location
export async function generateGameGuidePDF(): Promise<string> {
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(22);
  pdf.setTextColor(139, 69, 19); // Brown color
  pdf.text('Bottle9jaBet Game Guide', 105, 20, { align: 'center' });
  
  // Add subtitle
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('How to Play & Win', 105, 30, { align: 'center' });
  
  // Add section: Game Overview
  pdf.setFontSize(16);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Game Overview', 20, 45);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    'Bottle9jaBet is an exciting betting game where you place bets on where the bottle will land after spinning. ' +
    'The game wheel is divided into 8 sections with different numbers (2, 5, 8, 10, 13, 15, 18, 20). ' +
    'If the bottle lands on your selected number, you win!',
    20, 55, { maxWidth: 170 }
  );
  
  // Add section: How to Play
  pdf.setFontSize(16);
  pdf.setTextColor(139, 69, 19);
  pdf.text('How to Play', 20, 85);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  const howToPlaySteps = [
    '1. Log in to your Bottle9jaBet account',
    '2. Deposit funds into your account using any available payment method',
    '3. Go to the home page to access the game',
    '4. Select one of the numbers on the wheel (2, 5, 8, 10, 13, 15, 18, 20)',
    '5. Enter your bet amount (minimum stake: ₦500, maximum: ₦10 million)',
    '6. Click "Place Bet" to confirm your selection',
    '7. Watch the bottle spin and see if you win!',
  ];
  
  let yPos = 95;
  howToPlaySteps.forEach(step => {
    pdf.text(step, 20, yPos, { maxWidth: 170 });
    yPos += 8;
  });
  
  // Add section: Winning & Payouts
  pdf.setFontSize(16);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Winning & Payouts', 20, 150);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    'When you win, your payout is calculated as: Stake Amount × Selected Number' +
    '\n\nFor example:' +
    '\n• If you bet ₦1,000 on number 20 and win, you receive ₦20,000' +
    '\n• If you bet ₦500 on number 8 and win, you receive ₦4,000' +
    '\n• If you bet ₦2,000 on number 15 and win, you receive ₦30,000',
    20, 160, { maxWidth: 170 }
  );
  
  // Add section: Tips & Strategies
  pdf.setFontSize(16);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Tips & Strategies', 20, 200);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    '• Start with smaller bets to get familiar with the game' +
    '\n• Higher numbers offer bigger payouts but have lower odds' +
    '\n• Track the results to see if any patterns emerge' +
    '\n• Set a budget for each gaming session and stick to it' +
    '\n• Remember that the game is based on chance - play responsibly!',
    20, 210, { maxWidth: 170 }
  );
  
  // Add section: Installing as PWA
  pdf.addPage();
  pdf.setFontSize(16);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Installing Bottle9jaBet on Your Phone', 20, 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text('On Android:', 20, 30);
  
  const androidSteps = [
    '1. Open the Bottle9jaBet website in Chrome browser',
    '2. Tap the menu icon (three dots) in the top-right corner',
    '3. Select "Add to Home screen" or "Install app"',
    '4. Confirm by tapping "Add" or "Install"',
    '5. The app icon will appear on your home screen'
  ];
  
  yPos = 40;
  androidSteps.forEach(step => {
    pdf.text(step, 20, yPos, { maxWidth: 170 });
    yPos += 8;
  });
  
  pdf.text('On iOS (iPhone/iPad):', 20, 85);
  
  const iosSteps = [
    '1. Open the Bottle9jaBet website in Safari browser',
    '2. Tap the share icon (rectangle with arrow) at the bottom',
    '3. Scroll down and select "Add to Home Screen"',
    '4. Tap "Add" in the top-right corner',
    '5. The app icon will appear on your home screen'
  ];
  
  yPos = 95;
  iosSteps.forEach(step => {
    pdf.text(step, 20, yPos, { maxWidth: 170 });
    yPos += 8;
  });
  
  // Add responsible gaming disclaimer
  pdf.setFontSize(14);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Responsible Gaming', 20, 140);
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  pdf.text(
    'Bottle9jaBet promotes responsible gaming. Our games are designed for adults (18+) only. ' +
    'Always set limits on your time and money spent. Remember that gaming should be fun and entertaining, not a way to make money. ' +
    'If you feel you may have a gambling problem, please seek help from appropriate support services.',
    20, 150, { maxWidth: 170 }
  );
  
  // Add footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('© ' + new Date().getFullYear() + ' Bottle9jaBet. All rights reserved.', 105, 270, { align: 'center' });
  
  // Create a file path for the temporary PDF
  const fileName = `bottle9jabet-game-guide-${Date.now()}.pdf`;
  const filePath = path.join(process.cwd(), 'temp', fileName);
  
  // Ensure the temp directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'temp'))) {
    fs.mkdirSync(path.join(process.cwd(), 'temp'), { recursive: true });
  }
  
  // Save the PDF to the file system
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  await writeFileAsync(filePath, pdfBuffer);
  
  return filePath;
}