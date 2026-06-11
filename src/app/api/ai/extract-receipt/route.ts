export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    let text = '';
    let receiptUrl = '';
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64Content = buffer.toString('base64');
      const apiKey = process.env.GOOGLE_VISION_API_KEY;

      // Save file locally
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
      await fs.mkdir(uploadDir, { recursive: true });
      const ext = file.name.split('.').pop() || 'tmp';
      const filename = `${crypto.randomUUID()}.${ext}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      receiptUrl = `/uploads/receipts/${filename}`;

      if (!apiKey) {
        return NextResponse.json({ error: 'Google Vision API key not configured' }, { status: 500 });
      }

      if (file.type === 'application/pdf') {
        const payload = {
          requests: [
            {
              inputConfig: {
                mimeType: 'application/pdf',
                content: base64Content
              },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
            }
          ]
        };

        const res = await fetch(`https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
           console.error('Vision API PDF error:', await res.text());
           return NextResponse.json({ error: 'Failed to extract text from PDF' }, { status: 500 });
        }

        const data = await res.json();
        const pages = data.responses?.[0]?.responses || [];
        text = pages.map((p: any) => p.fullTextAnnotation?.text || '').join('\n');
      } else if (file.type.startsWith('image/')) {
        const payload = {
          requests: [
            {
              image: {
                content: base64Content
              },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
            }
          ]
        };

        const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
           console.error('Vision API Image error:', await res.text());
           return NextResponse.json({ error: 'Failed to extract text from Image' }, { status: 500 });
        }

        const data = await res.json();
        text = data.responses?.[0]?.fullTextAnnotation?.text || '';
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
Vendor name, Total amount (number), Currency (e.g. USD, INR, EUR, GBP), Date (YYYY-MM-DD), and guess the Category.
Return ONLY valid JSON with keys: vendor, amount, currency, date, category, confidence.
Text: ${text}`;

    const structuredData = await aiService.extractJSON<{
      vendor: string;
      amount: number;
      currency: string;
      date: string;
      category: string;
      confidence: number;
    }>(prompt);

    return NextResponse.json({ ...structuredData, receiptUrl });
  } catch (error) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
