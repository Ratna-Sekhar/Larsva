import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { getUserFromRequest } from '@/lib/olv/auth';
import { incrementUsage, getUsage, addHistoryRecord } from '@/lib/olv/db';
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES, OPENAI_MODEL, OPENAI_MAX_TOKENS, PLANS } from '@/lib/olv/config';
import { buildAnalysisPrompt } from '@/lib/olv/prompts';
import { generateId } from '@/lib/olv/auth';
import type { VerificationResult } from '@/lib/olv/types';

export const maxDuration = 60; // Vercel function timeout (60s)

export async function POST(req: Request) {
  try {
    const pdfParse = require('pdf-parse');
    
    // 1. Authenticate user
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    // 2. Check usage limits
    const usage = getUsage(user.id);
    const limit = PLANS[user.plan].monthlyLimit;
    if (usage.count >= limit) {
      return NextResponse.json({
        success: false,
        error: 'Monthly verification limit reached.',
        limitReached: true
      }, { status: 403 });
    }

    // 3. Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
    }

    // 4. Validate file
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: 'File size exceeds limit (15MB).' }, { status: 400 });
    }
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only PDF files are supported.' }, { status: 400 });
    }

    // 5. Extract text from PDF
    let documentText = '';
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(buffer);
      documentText = pdfData.text.trim();
      
      if (!documentText || documentText.length < 50) {
        return NextResponse.json({ success: false, error: 'Could not extract sufficient text from the PDF. It may be scanned or empty.' }, { status: 400 });
      }
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      return NextResponse.json({ success: false, error: 'Failed to read the PDF. It might be corrupted or password-protected.' }, { status: 400 });
    }

    // 6. OpenAI Analysis
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json({ success: false, error: 'Service is temporarily unavailable (Configuration Error).' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = buildAnalysisPrompt(documentText);

    let parsedResult: VerificationResult;

    try {
      const response = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: OPENAI_MAX_TOKENS,
      });

      const responseContent = response.choices[0].message.content;
      if (!responseContent) throw new Error('Empty response from OpenAI');

      parsedResult = JSON.parse(responseContent) as VerificationResult;

      // Basic validation of structured output
      if (!parsedResult.overallAssessment || typeof parsedResult.riskScore !== 'number') {
        throw new Error('Invalid JSON structure returned by OpenAI');
      }
    } catch (aiError) {
      console.error('OpenAI Analysis Error:', aiError);
      return NextResponse.json({ success: false, error: 'Failed to analyze the document. Please try again.' }, { status: 500 });
    }

    // 7. Update usage and history
    incrementUsage(user.id);
    
    addHistoryRecord({
      id: generateId(),
      userId: user.id,
      timestamp: new Date().toISOString(),
      riskLevel: parsedResult.overallAssessment,
      riskScore: parsedResult.riskScore,
      candidateRef: parsedResult.extractedInfo?.candidate?.name || 'Unknown Candidate',
      resultSummary: parsedResult.executiveSummary
    });

    // 8. Return result
    return NextResponse.json({
      success: true,
      data: parsedResult
    });

  } catch (error) {
    console.error('Analysis route error:', error);
    return NextResponse.json({ success: false, error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
