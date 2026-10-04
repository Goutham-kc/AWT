import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendVerificationEmail } from '../utils/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const testEmail = process.argv[2] || process.env.SMTP_USER;

if (!testEmail) {
  console.log('Usage: node backend/scripts/test_email.js <recipient-email@tkmce.ac.in>');
  process.exit(1);
}

console.log(`Testing SMTP with user: ${process.env.SMTP_USER}...`);
console.log(`Sending test verification email to: ${testEmail}...`);

const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

sendVerificationEmail(testEmail, testOtp, 'TKMCE Test Student')
  .then((result) => {
    if (result.success) {
      console.log(`\nSUCCESS! Verification email sent successfully to ${testEmail}!`);
      console.log(`MessageId: ${result.messageId}`);
    } else if (result.fallback) {
      console.log(`\nFALLBACK MODE: SMTP credentials not set or failed.`);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error(`\nERROR sending email:`, err);
    process.exit(1);
  });
