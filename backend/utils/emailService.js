import nodemailer from 'nodemailer';

// Create transporter using environment variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : null;
  // Automatically strip all spaces from the 16-character Google App Password
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : null;

  if (!user || !pass) {
    return null;
  }

  // If using Gmail, use the native 'gmail' service config
  if (host === 'smtp.gmail.com' || (user && user.endsWith('@gmail.com'))) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000
  });
};

// Send via Resend HTTP API (Port 443 HTTPS - works everywhere including Render free tier where SMTP ports are blocked)
const sendViaResend = async (apiKey, toEmail, otp, userName, htmlContent) => {
  const from = process.env.RESEND_FROM || 'TKMCE Student Rental Hub <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: [toEmail],
      subject: `${otp} is your TKMCE Student Rental Hub verification code`,
      html: htmlContent
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || JSON.stringify(data));
  }
  return data;
};

/**
 * Send 6-digit verification OTP email
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - Optional student name
 */
export const sendVerificationEmail = async (toEmail, otp, userName = 'Student') => {
  const fromName = process.env.SMTP_FROM_NAME || 'TKMCE Student Rental Hub';
  const fromAddress = `"${fromName}" <${process.env.SMTP_USER || 'no-reply@tkmce.ac.in'}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background: #002d62; padding: 28px 24px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .header p { color: #93c5fd; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; }
        .body { padding: 32px 24px; text-align: center; }
        .body p { font-size: 15px; line-height: 1.6; color: #334155; margin: 0 0 20px 0; }
        .otp-box { background: #f1f5f9; border: 2px dashed #002d62; border-radius: 8px; padding: 18px 24px; margin: 24px 0; display: inline-block; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #002d62; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5; }
        .badge { display: inline-block; background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 600; margin-bottom: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Student Rental Hub</h1>
          <p>TKM College of Engineering, Kollam</p>
        </div>
        <div class="body">
          <div class="badge">Official Email Verification</div>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Thank you for signing up on the TKMCE peer-to-peer equipment rental exchange. Use the 6-digit verification code below to activate your account:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>

          <p style="font-size: 13px; color: #64748b;">This OTP is valid for <strong>15 minutes</strong>. For your security, never share this code with anyone.</p>
        </div>
        <div class="footer">
          <p>This automated message was sent to ${toEmail} because a student account registration was requested on Academica Exchange.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. If Resend HTTPS API key is available, use it (Port 443 HTTPS - 100% reliable on Render)
  if (process.env.RESEND_API_KEY) {
    try {
      const result = await sendViaResend(process.env.RESEND_API_KEY, toEmail, otp, userName, htmlContent);
      console.log(`[EMAIL SERVICE via RESEND HTTPS] Verification email sent to ${toEmail}. Id: ${result.id}`);
      return { success: true, messageId: result.id };
    } catch (resendError) {
      console.warn(`[RESEND HTTPS WARNING]: ${resendError.message}. Trying SMTP fallback...`);
    }
  }

  // 2. Try Nodemailer SMTP
  const transporter = createTransporter();
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: `${otp} is your TKMCE Student Rental Hub verification code`,
        text: `Hello ${userName},\n\nYour 6-digit verification code is: ${otp}\n\nThis code will expire in 15 minutes.\n\n- TKMCE Student Rental Hub`,
        html: htmlContent
      });

      console.log(`[EMAIL SERVICE via SMTP] Verification email successfully sent to ${toEmail}. MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.warn(`[EMAIL SMTP NOTICE] SMTP connection to ${toEmail} failed (${error.message}).`);
    }
  }

  // 3. Fallback: Log to console
  console.log(`\n======================================================`);
  console.log(`[EMAIL FALLBACK ACTIVE]`);
  console.log(`[OTP VERIFICATION CODE FOR ${toEmail}]: ${otp}`);
  console.log(`======================================================\n`);
  return { success: false, fallback: true, otp };
};
