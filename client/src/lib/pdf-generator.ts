import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

// Function to generate a game guide PDF
export async function generateGameGuidePDF() {
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
  
  return pdf.save('bottle9jabet-game-guide.pdf');
}

// Function to generate betting history PDF
export async function generateBettingHistoryPDF(bettingHistory: any[]) {
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(20);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Bottle9jaBet - Betting History', 105, 20, { align: 'center' });
  
  // Format date
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Add date
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Report generated on: ${formattedDate}`, 20, 30);
  
  // Add betting history table
  (pdf as any).autoTable({
    startY: 40,
    head: [['Date', 'Bet Amount (₦)', 'Selected Number', 'Winning Number', 'Result', 'Winnings (₦)']],
    body: bettingHistory.map(bet => [
      new Date(bet.createdAt).toLocaleDateString(),
      (bet.betAmount / 100).toLocaleString(), // Convert kobo to naira
      bet.selectedNumber,
      bet.winningNumber,
      bet.isWin ? 'WIN' : 'LOSS',
      bet.isWin ? (bet.winAmount / 100).toLocaleString() : '-' // Convert kobo to naira
    ]),
    theme: 'striped',
    headStyles: { fillColor: [139, 69, 19], textColor: [255, 255, 255] },
    columnStyles: {
      4: { 
        halign: 'center',
        fontStyle: (cell, row) => {
          return cell.raw === 'WIN' ? 'bold' : 'normal';
        },
        textColor: (cell, row) => {
          return cell.raw === 'WIN' ? [0, 128, 0] : [255, 0, 0];
        }
      }
    }
  });
  
  // Add summary
  const totalBets = bettingHistory.length;
  const winningBets = bettingHistory.filter(bet => bet.isWin).length;
  const totalBetAmount = bettingHistory.reduce((sum, bet) => sum + bet.betAmount, 0) / 100; // Convert kobo to naira
  const totalWinnings = bettingHistory.filter(bet => bet.isWin).reduce((sum, bet) => sum + (bet.winAmount || 0), 0) / 100; // Convert kobo to naira
  
  const tableHeight = (pdf as any).lastAutoTable.finalY;
  
  pdf.setFontSize(14);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Summary', 20, tableHeight + 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total Bets: ${totalBets}`, 20, tableHeight + 30);
  pdf.text(`Winning Bets: ${winningBets} (${Math.round((winningBets / totalBets) * 100)}%)`, 20, tableHeight + 40);
  pdf.text(`Total Bet Amount: ₦${totalBetAmount.toLocaleString()}`, 20, tableHeight + 50);
  pdf.text(`Total Winnings: ₦${totalWinnings.toLocaleString()}`, 20, tableHeight + 60);
  
  // Add footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('© ' + new Date().getFullYear() + ' Bottle9jaBet. All rights reserved.', 105, 270, { align: 'center' });
  
  return pdf.save('bottle9jabet-betting-history.pdf');
}

// Function to generate transaction history PDF
export async function generateTransactionHistoryPDF(transactions: any[]) {
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(20);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Bottle9jaBet - Transaction History', 105, 20, { align: 'center' });
  
  // Format date
  const today = new Date();
  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Add date
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Report generated on: ${formattedDate}`, 20, 30);
  
  // Add transaction history table
  (pdf as any).autoTable({
    startY: 40,
    head: [['Date', 'Type', 'Amount (₦)', 'Status', 'Reference']],
    body: transactions.map(tx => [
      new Date(tx.createdAt).toLocaleDateString(),
      tx.type.toUpperCase(),
      (tx.amount / 100).toLocaleString(), // Convert kobo to naira
      tx.status.toUpperCase(),
      tx.reference
    ]),
    theme: 'striped',
    headStyles: { fillColor: [139, 69, 19], textColor: [255, 255, 255] },
    columnStyles: {
      1: { 
        fontStyle: 'bold',
        textColor: (cell, row) => {
          return cell.raw === 'DEPOSIT' ? [0, 128, 0] : (cell.raw === 'WITHDRAWAL' ? [255, 0, 0] : [0, 0, 0]);
        }
      },
      3: {
        fontStyle: 'bold',
        textColor: (cell, row) => {
          return cell.raw === 'SUCCESSFUL' ? [0, 128, 0] : (cell.raw === 'FAILED' ? [255, 0, 0] : [255, 165, 0]);
        }
      }
    }
  });
  
  // Add summary
  const deposits = transactions.filter(tx => tx.type.toLowerCase() === 'deposit' && tx.status.toLowerCase() === 'successful');
  const withdrawals = transactions.filter(tx => tx.type.toLowerCase() === 'withdrawal' && tx.status.toLowerCase() === 'successful');
  
  const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0) / 100; // Convert kobo to naira
  const totalWithdrawals = withdrawals.reduce((sum, tx) => sum + tx.amount, 0) / 100; // Convert kobo to naira
  
  const tableHeight = (pdf as any).lastAutoTable.finalY;
  
  pdf.setFontSize(14);
  pdf.setTextColor(139, 69, 19);
  pdf.text('Summary', 20, tableHeight + 20);
  
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`Total Successful Deposits: ₦${totalDeposits.toLocaleString()}`, 20, tableHeight + 30);
  pdf.text(`Total Successful Withdrawals: ₦${totalWithdrawals.toLocaleString()}`, 20, tableHeight + 40);
  pdf.text(`Net Transaction Balance: ₦${(totalDeposits - totalWithdrawals).toLocaleString()}`, 20, tableHeight + 50);
  
  // Add footer
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('© ' + new Date().getFullYear() + ' Bottle9jaBet. All rights reserved.', 105, 270, { align: 'center' });
  
  return pdf.save('bottle9jabet-transaction-history.pdf');
}

// Function to create a screenshot of a DOM element and add it to a PDF
export async function captureDOMElementToPDF(elementId: string, fileName: string, title: string) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  try {
    // Capture the DOM element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    // Calculate dimensions to fit in PDF
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Add title
    pdf.setFontSize(20);
    pdf.setTextColor(139, 69, 19);
    pdf.text(title, 105, 20, { align: 'center' });
    
    // Add date
    const today = new Date();
    const formattedDate = today.toLocaleDateString();
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Generated on: ${formattedDate}`, 20, 30);
    
    // Add image
    pdf.addImage(imgData, 'PNG', 10, 40, imgWidth - 20, imgHeight);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('© ' + new Date().getFullYear() + ' Bottle9jaBet. All rights reserved.', 105, 290, { align: 'center' });
    
    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error capturing element to PDF:', error);
  }
}