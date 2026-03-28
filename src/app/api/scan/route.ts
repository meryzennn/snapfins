import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API Key is not configured in .env.local' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert file object to Base64 String for Gemini Processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || "image/jpeg";

    const prompt = `
      You are an expert financial extraction AI.
      Analyze this receipt image and extract the following data in a structured JSON format:
      - date: Transaction date (YYYY-MM-DD). If not found, use today's date.
      - description: The name of the store, merchant, or specific items bought. Keep original language.
      - amount: The total numerical amount extracted as a string, e.g., "$12.45" or "12.45". Clean it to include a currency symbol like '$' or 'Rp' prefix if applicable, defaulting to '$' if none is found.
      - category: A single UPPERCASE word representing the category (e.g., DINING, GROCERY, RETAIL, TECH, TRANSPORT, HEALTH).

      Return EXACTLY one JSON object representing this transaction, following this exact schema:
      {
        "date": "2024-05-20",
        "description": "Starbucks Coffee",
        "amount": "$5.40",
        "category": "DINING"
      }
    `;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    let transactionData;
    
    try {
      transactionData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Gemini JSON:", responseText);
      return NextResponse.json({ error: 'Failed to parse Gemini response' }, { status: 500 });
    }

    return NextResponse.json({ transaction: transactionData });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
