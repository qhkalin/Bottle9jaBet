import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { apiRequest } from './queryClient';

/**
 * Captures specified DOM elements as images and generates a comprehensive guide PDF 
 * with step-by-step instructions
 */
export async function generateComprehensiveGuide(): Promise<string> {
  try {
    // Capture key elements of the UI
    const screenshots: Record<string, string> = {};
    
    // Game wheel area
    if (document.getElementById('game-wheel')) {
      screenshots.wheel = await captureElement('game-wheel');
    }
    
    // Betting controls
    if (document.getElementById('betting-controls')) {
      screenshots.controls = await captureElement('betting-controls');
    }
    
    // Live feed
    if (document.getElementById('live-feed')) {
      screenshots.liveFeed = await captureElement('live-feed');
    }
    
    // Submit screenshots to the server to generate PDF
    const response = await apiRequest('POST', '/api/guides/with-screenshots', { screenshots });
    const data = await response.json();
    
    return data.url;
  } catch (error) {
    console.error('Error generating comprehensive guide:', error);
    throw error;
  }
}

/**
 * Captures a DOM element to an image and returns the data URL
 */
export async function captureElement(elementId: string): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id '${elementId}' not found`);
  }
  
  const canvas = await html2canvas(element, {
    scale: 2, // Better resolution
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  });
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

/**
 * Requests the server to generate a guide PDF with multiple screenshots
 */
export async function generateGuideWithScreenshots(): Promise<string> {
  // Capture screenshots of key UI elements
  const screenshots: Record<string, string> = {};
  
  try {
    if (document.getElementById('game-wheel')) {
      screenshots.wheel = await captureElement('game-wheel');
    }
    
    if (document.getElementById('betting-controls')) {
      screenshots.controls = await captureElement('betting-controls');
    }
    
    if (document.getElementById('live-feed')) {
      screenshots.liveFeed = await captureElement('live-feed');
    }
    
    // Send screenshots to server to generate PDF
    const response = await apiRequest('POST', '/api/guides/with-screenshots', { screenshots });
    const data = await response.json();
    
    // Return the URL to the generated PDF
    return data.url;
  } catch (error) {
    console.error('Error generating guide with screenshots:', error);
    throw error;
  }
}

/**
 * Generates a simplified guide PDF directly in the browser
 */
export async function generateSimpleGuide(): Promise<Blob> {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(0, 0, 128);
  doc.text('Bottle9jaBet Game Guide', 105, 20, { align: 'center' });
  
  // Introduction
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Welcome to Bottle9jaBet!', 20, 40);
  
  doc.setFontSize(10);
  doc.text(
    'This guide will help you understand how to play the Spin the Bottle game ' +
    'and make the most of your experience on our platform.', 
    20, 50, { maxWidth: 170 }
  );
  
  // How To Play
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 0);
  doc.text('How To Play', 20, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text([
    '1. Deposit funds into your account using the Deposit button.',
    '2. On the home page, select a number between 1 and 36 to bet on.',
    '3. Enter your bet amount (minimum bet is ₦100).',
    '4. Click "Place Bet" to confirm your wager.',
    '5. Watch the bottle spin! If it lands on your number, you win!',
    '6. Your winnings are calculated as: Bet Amount × Number Value',
    '   (e.g., betting ₦1,000 on number 20 pays ₦20,000 if you win)'
  ], 20, 80, { lineHeightFactor: 1.5 });
  
  // Deposit Instructions
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 0);
  doc.text('How To Deposit', 20, 130);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text([
    '1. Click the Deposit button in the top navigation bar.',
    '2. Enter the amount you wish to deposit.',
    '3. Select your preferred payment method.',
    '4. Follow the payment instructions to complete your deposit.',
    '5. Your account will be credited instantly upon successful payment.'
  ], 20, 140, { lineHeightFactor: 1.5 });
  
  // Withdrawal Instructions
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 0);
  doc.text('How To Withdraw', 20, 175);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text([
    '1. Click on your profile icon and select "Withdraw" from the menu.',
    '2. Enter the amount you wish to withdraw.',
    '3. Select your preferred withdrawal method.',
    '4. Provide the necessary account details for the transaction.',
    '5. Confirm the withdrawal request.',
    '6. Your funds will be processed within 24 hours.'
  ], 20, 185, { lineHeightFactor: 1.5 });
  
  // Add to Home Screen (Mobile)
  doc.addPage();
  
  doc.setFontSize(14);
  doc.setTextColor(0, 100, 0);
  doc.text('Add to Home Screen (Mobile Devices)', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('For Android:', 20, 30);
  doc.text([
    '1. Open Bottle9jaBet in Chrome.',
    '2. Tap the menu button (three dots) in the top-right corner.',
    '3. Select "Add to Home screen".',
    '4. Confirm by tapping "Add".'
  ], 20, 40, { lineHeightFactor: 1.5 });
  
  doc.text('For iOS:', 20, 70);
  doc.text([
    '1. Open Bottle9jaBet in Safari.',
    '2. Tap the Share button at the bottom of the screen.',
    '3. Scroll down and tap "Add to Home Screen".',
    '4. Tap "Add" in the top-right corner.'
  ], 20, 80, { lineHeightFactor: 1.5 });
  
  // Responsible Gaming
  doc.setFontSize(14);
  doc.setTextColor(200, 0, 0);
  doc.text('Responsible Gaming', 20, 110);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text([
    '• Set betting limits for yourself and stick to them.',
    '• Only bet what you can afford to lose.',
    '• Take regular breaks from betting.',
    '• Never chase losses by increasing your bets.',
    '• Betting should be for entertainment, not a way to make money.',
    '• If you feel you may have a gambling problem, seek help immediately.',
    '',
    '18+ Only. Play Responsibly. Gambling Can Be Addictive.'
  ], 20, 120, { lineHeightFactor: 1.5 });
  
  // Contact Information
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 128);
  doc.text('Contact Us', 20, 170);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text([
    'Email: support@bottle9jabet.com',
    'Phone: +234 XXX XXX XXXX',
    'Live Chat: Available 24/7 on our website',
    '',
    'We\'re here to help! Feel free to contact us with any questions or concerns.'
  ], 20, 180, { lineHeightFactor: 1.5 });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('© 2025 Bottle9jaBet. All rights reserved.', 105, 280, { align: 'center' });
  
  return doc.output('blob');
}

/**
 * Downloads the generated PDF
 */
export function downloadPDF(pdfBlob: Blob, filename: string = 'bottle9jabet-guide.pdf'): void {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  }, 100);
}

/**
 * One-step function to generate and download a guide PDF
 */
export async function generateAndDownloadGuide(): Promise<void> {
  const pdfBlob = await generateSimpleGuide();
  downloadPDF(pdfBlob);
}