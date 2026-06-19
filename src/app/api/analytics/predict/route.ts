import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai';
import { addMonths, format, parseISO } from 'date-fns'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { historicalData, lastDate } = await req.json();

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json({ error: 'No historical data provided' }, { status: 400 });
    }

    const prompt = `
      You are an expert financial analyst and AI predictor.
      Given the following historical financial data for a company, predict the next 6 months.
      
      The parameters provided in the historical data are:
      1. realizedRevenueINR: Realized revenue in INR
      2. expensesINR: Expenses in INR
      3. avgDollarValue: Average Dollar value in INR for that month
      
      Historical Data:
      ${JSON.stringify(historicalData, null, 2)}
      
      Your task:
      Predict the next 6 months of data. 
      While you must factor in the precise dollar to INR conversion rate to determine realized values, you MUST also predict realistic business volatility, seasonality, and natural growth trends.
      Do NOT just flatline the revenue or tie it strictly 1:1 to the exchange rate. Let the revenue and expenses fluctuate naturally with ups and downs, mimicking the momentum and variance seen in the historical data.
      
      Return ONLY a JSON object containing two keys: "predictions" and "dollarRateAnalysis". Do NOT wrap in markdown blocks, just return the raw JSON object.
      The "dollarRateAnalysis" should be a highly insightful, well-structured markdown string (1-2 paragraphs) analyzing the potential ups and downs predicted in the conversion rate of the dollar based on the historical data and your future projections.
      The "predictions" must be an array of 6 objects, one for each future month.
      Format MUST exactly match:
      {
        "predictions": [
          {
            "predictedExchangeRate": <number in INR>,
            "realizedRevenueINR": <number in INR>,
            "expensesINR": <number in INR>
          }
        ],
        "dollarRateAnalysis": "<markdown analysis string>"
      }
      
      Do NOT predict zero revenue or expenses if there's an ongoing trend. Ensure your numbers reflect logical business continuity based on the historical conversion rate and overall growth.
    `;

    let response;
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-pro'];
    let lastError: any;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        break; // success, exit the loop
      } catch (e: any) {
        lastError = e;
        console.warn(`Model ${model} failed with:`, e.message);
      }
    }

    if (!response) {
      throw lastError || new Error("All Gemini prediction models failed.");
    }

    let rawText = response.text || "[]";
    // Clean up potential markdown formatting
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const predictionsJson = JSON.parse(rawText);
    const predictionsArray = predictionsJson.predictions || [];
    const dollarRateAnalysis = predictionsJson.dollarRateAnalysis || '';

    // Format predictions to match chart expectations
    const baseDate = parseISO(lastDate);
    const chartPredictions = predictionsArray.map((pred: any, i: number) => {
      const predDate = addMonths(baseDate, i + 1);
      const fx = pred.predictedExchangeRate || 85;
      
      return {
        name: format(predDate, 'MMM yy'),
        date: predDate.toISOString(),
        predictedRevenue: Math.max(0, (pred.realizedRevenueINR || 0) / fx),
        predictedExpense: Math.max(0, (pred.expensesINR || 0) / fx),
        predictedExchangeRate: fx,
        expensesINR: pred.expensesINR,
        realizedRevenueINR: pred.realizedRevenueINR,
        isPrediction: true
      };
    });

    return NextResponse.json({ predictions: chartPredictions, dollarRateAnalysis });
  } catch (error: any) {
    console.error('Gemini Predict error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate predictions' }, { status: 500 });
  }
}
