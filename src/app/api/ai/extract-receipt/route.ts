export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import { PDFParse } from 'pdf-parse';
import Tesseract from 'tesseract.js';

export async function POST(request: NextRequest) {
  try {
    let text = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.type === 'application/pdf') {
        const parser = new PDFParse({ data: buffer });
        const pdfData = await parser.getText();
        await parser.destroy();
        text = pdfData.text;
      } else if (file.type.startsWith('image/')) {
        const result = await Tesseract.recognize(buffer, 'eng');
        text = result.data.text;
      } else {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
      }
    } else {
      // Fallback for old text-based payload if still used elsewhere
      const body = await request.json();
      text = body.text;
    }

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    const prompt = `Extract the following details from this text:
Vendor name, Total amount (number), Date (YYYY-MM-DD), and guess the Category.
Return ONLY valid JSON with keys: vendor, amount, date, category, confidence.
Text: ${text}`;

    const structuredData = await aiService.extractJSON<{
      vendor: string;
      amount: number;
      date: string;
      category: string;
      confidence: number;
    }>(prompt);

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
