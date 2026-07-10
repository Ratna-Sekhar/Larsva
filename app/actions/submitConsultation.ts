'use server';

import nodemailer from 'nodemailer';
import { google } from 'googleapis';

interface ConsultationData {
  fullName: string;
  email: string;
  phone: string;
  startupIdea: string;
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // max submissions
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

/** Escape HTML entities to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendEmailNotification(data: ConsultationData): Promise<void> {
  const SMTP_HOST = process.env.SMTP_HOST;
  const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
  const SMTP_USER = process.env.SMTP_USER;
  const SMTP_PASS = process.env.SMTP_PASS;
  const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'vnsst123@gmail.com';

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP credentials not configured. Skipping email notification.');
    console.log('Form submission data:', JSON.stringify(data, null, 2));
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  // Sanitize all user inputs before embedding in HTML
  const safeName = escapeHtml(data.fullName);
  const safeEmail = escapeHtml(data.email);
  const safePhone = escapeHtml(data.phone);
  const safeIdea = escapeHtml(data.startupIdea).replace(/\n/g, '<br>');

  await transporter.sendMail({
    from: `"Larsva Website" <${SMTP_USER}>`,
    to: NOTIFICATION_EMAIL,
    subject: 'New Founder Consultation Request - Larsva',
    text: `Name: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone}\n\nStartup Idea:\n${data.startupIdea}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0A1628; border-bottom: 2px solid #00C2A8; padding-bottom: 10px;">
          New Founder Consultation Request
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Name:</strong></td>
            <td style="padding: 8px 0;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
            <td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${safePhone}">${safePhone}</a></td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #F0FAF8; border-radius: 8px; border-left: 3px solid #00C2A8;">
          <p style="color: #666; margin: 0 0 8px;"><strong>Startup Idea:</strong></p>
          <p style="margin: 0; color: #333; line-height: 1.6;">${safeIdea}</p>
        </div>
        <p style="margin-top: 24px; font-size: 12px; color: #999;">
          Submitted via larsva.com · ${new Date().toISOString()}
        </p>
      </div>
    `,
  });
}

async function storeInGoogleSheets(data: ConsultationData): Promise<void> {
  const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.warn('Google Sheets credentials not configured. Skipping storage.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sheet1!A:E',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          data.fullName,
          data.email,
          data.phone,
          data.startupIdea,
        ],
      ],
    },
  });
}

export async function submitConsultation(
  data: ConsultationData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Basic validation
    if (!data.fullName?.trim() || !data.email?.trim() || !data.phone?.trim() || !data.startupIdea?.trim()) {
      return { success: false, error: 'All fields are required.' };
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    // Phone format validation (basic)
    const phoneRegex = /^[\d\s+\-()]{7,20}$/;
    if (!phoneRegex.test(data.phone)) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }

    // Startup idea minimum length
    if (data.startupIdea.trim().length < 30) {
      return { success: false, error: 'Please describe your startup idea in at least 3-5 sentences.' };
    }

    // Rate limiting by email
    if (!checkRateLimit(data.email.toLowerCase())) {
      return { success: false, error: 'Too many submissions. Please try again later.' };
    }

    // Honeypot check — if the frontend sends a honeypot value, it's caught here
    // (Honeypot field is handled in the form component)

    // Send email notification
    try {
      await sendEmailNotification(data);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // Don't fail the whole submission if email fails
    }

    // Store in Google Sheets
    try {
      await storeInGoogleSheets(data);
    } catch (sheetError) {
      console.error('Google Sheets storage failed:', sheetError);
      // Don't fail the whole submission if sheets fails
    }

    return { success: true };
  } catch (error) {
    console.error('Consultation submission error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}

// ===== Open Orbit Waitlist =====

interface WaitlistData {
  name: string;
  email: string;
  linkedin: string;
}

async function storeWaitlistInGoogleSheets(data: WaitlistData): Promise<void> {
  const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
  const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

  if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    console.warn('Google Sheets credentials not configured. Skipping waitlist storage.');
    return;
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_CLIENT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Waitlist!A:D',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          new Date().toISOString(),
          data.name,
          data.email,
          data.linkedin || '',
        ],
      ],
    },
  });
}

export async function submitOpenOrbitWaitlist(
  data: WaitlistData
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!data.name?.trim() || !data.email?.trim()) {
      return { success: false, error: 'Name and email are required.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (!checkRateLimit(data.email.toLowerCase())) {
      return { success: false, error: 'Too many submissions. Please try again later.' };
    }

    // Store in Google Sheets (Waitlist tab)
    try {
      await storeWaitlistInGoogleSheets(data);
    } catch (sheetError) {
      console.error('Waitlist Google Sheets storage failed:', sheetError);
    }

    // Send notification email
    try {
      const safeName = escapeHtml(data.name);
      const safeEmail = escapeHtml(data.email);
      const safeLinkedin = escapeHtml(data.linkedin || 'Not provided');

      const SMTP_HOST = process.env.SMTP_HOST;
      const SMTP_USER = process.env.SMTP_USER;
      const SMTP_PASS = process.env.SMTP_PASS;
      const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
      const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || 'vnsst123@gmail.com';

      if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: SMTP_PORT === 465,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"Larsva Website" <${SMTP_USER}>`,
          to: NOTIFICATION_EMAIL,
          subject: 'New Open Orbit Waitlist Signup - Larsva',
          text: `Name: ${data.name}\nEmail: ${data.email}\nLinkedIn: ${data.linkedin || 'Not provided'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0A1628; border-bottom: 2px solid #F59E0B; padding-bottom: 10px;">
                New Open Orbit Waitlist Signup
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 120px;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>LinkedIn:</strong></td>
                  <td style="padding: 8px 0;">${safeLinkedin}</td>
                </tr>
              </table>
              <p style="margin-top: 24px; font-size: 12px; color: #999;">
                Submitted via larsva.com · ${new Date().toISOString()}
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Waitlist email notification failed:', emailError);
    }

    return { success: true };
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
