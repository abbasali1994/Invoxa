import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload } = await req.json()
    if (!payload) return NextResponse.json({ error: 'No data provided' }, { status: 400 })

    // Compress payload to bypass 12k TPM limits and prevent LLM math hallucinations
    const invoices = payload.invoices || []
    const expenses = payload.expenses || []
    const settlements = payload.settlements || []
    
    const clientRevenueUSD: Record<string, number> = {}
    let totalInvoicedUSD = 0
    let totalOverdueUSD = 0
    
    invoices.forEach((inv: any) => {
      const clientName = inv.client?.name || 'Unknown'
      clientRevenueUSD[clientName] = (clientRevenueUSD[clientName] || 0) + inv.total
      totalInvoicedUSD += inv.total
      if (inv.status === 'OVERDUE') totalOverdueUSD += inv.total
    })

    const expenseByCategoryINR: Record<string, number> = {}
    const expenseByVendorINR: Record<string, number> = {}
    let totalExpensesINR = 0

    expenses.forEach((exp: any) => {
      expenseByCategoryINR[exp.category] = (expenseByCategoryINR[exp.category] || 0) + exp.amount
      expenseByVendorINR[exp.vendor] = (expenseByVendorINR[exp.vendor] || 0) + exp.amount
      totalExpensesINR += exp.amount
    })

    let realizedRevenueINR = 0
    let totalFXLossINR = 0
    let totalInvoicedSettledUSD = 0
    
    settlements.forEach((s: any) => {
      realizedRevenueINR += s.realizedINR || 0
      totalInvoicedSettledUSD += s.invoicedUSD || 0
      const expectedINR = (s.invoicedUSD || 0) * (s.exchangeRate || 83) // fallback to 83 if missing
      const fees = (s.platformFee || 0) + (s.transferFee || 0)
      const loss = expectedINR - (s.realizedINR || 0) + fees
      if (loss > 0) totalFXLossINR += loss
    })

    const realizedProfitINR = realizedRevenueINR - totalExpensesINR
    const grossMargin = realizedRevenueINR > 0 ? (realizedProfitINR / realizedRevenueINR) * 100 : 0
    const netMargin = grossMargin // Simplified for this scope
    const settlementEfficiency = totalInvoicedSettledUSD > 0 ? (realizedRevenueINR / (totalInvoicedSettledUSD * 83)) * 100 : 100

    const compressedPayload = {
      exact_financial_metrics: {
        totalInvoicedUSD,
        realizedRevenueINR,
        totalExpensesINR,
        realizedProfitINR,
        totalOverdueUSD,
        totalFXLossINR,
        grossMarginPercentage: Number(grossMargin.toFixed(1)),
        netMarginPercentage: Number(netMargin.toFixed(1)),
        settlementEfficiencyPercentage: Number(settlementEfficiency.toFixed(1)),
      },
      breakdowns: {
        revenueByClientUSD: clientRevenueUSD,
        expenseByCategoryINR,
        expenseByVendorINR,
      },
      fxLossData: settlements.slice(0, 50).map((s: any) => ({ invoicedUSD: s.invoicedUSD, realizedINR: s.realizedINR, exchangeRate: s.exchangeRate, fees: (s.platformFee || 0) + (s.transferFee || 0) })),
    }

    const systemInstruction = `You are an elite Chief Financial Officer (CFO) and Data Analyst AI for Invoxa.
Your task is to analyze the provided pre-calculated financial metrics and categorical breakdowns to generate a deeply insightful, brutally honest, and actionable financial report.

CRITICAL INSTRUCTION: DO NOT calculate your own totals, margins, or FX losses. You MUST exactly use the numbers provided in the \`exact_financial_metrics\` object.
- If \`grossMarginPercentage\` is provided, use exactly that number.
- For business health score, use a logical formula based on the exact margins, cashflow gaps, and profit provided. If the business is highly profitable, the score should be > 80 (Excellent).
- \`totalFXLossINR\` is exact. Use it.

Analyze margins, FX losses (if settlements have exchange rates/fees), revenue concentration by client, expense bloat, cashflow gaps (overdue invoices), and overall business health.

Return your analysis strictly as a JSON object matching this schema exactly. DO NOT include markdown blocks like \`\`\`json or \`\`\`, just return the raw JSON object.

Schema:
{
  "healthScore": { "score": <number 0-100>, "label": "<Excellent | Good | Fair | At Risk | Critical>" },
  "executiveSummary": {
    "summary": "<2-3 sentence high-level summary of financial standing>",
    "metrics": {
      "grossMargin": <number percentage>,
      "netMargin": <number percentage>,
      "settlementEfficiency": <number percentage (e.g. realized / invoiced)>
    }
  },
  "profitAnalysis": {
    "trend": "<improving | declining | neutral>",
    "headline": "<short headline>",
    "details": "<detailed analysis of profitability>",
    "trendReason": "<short explanation for the trend>"
  },
  "revenueInsights": {
    "headline": "<short headline>",
    "topPerformingClient": "<client name>",
    "topClientRevenue": <number>,
    "revenueConcentrationRisk": "<high | medium | low>",
    "details": "<analysis of revenue streams>"
  },
  "expenseAnalysis": {
    "headline": "<short headline>",
    "details": "<analysis of spending patterns>",
    "painPoints": ["<point 1>", "<point 2>"]
  },
  "fxLoss": {
    "headline": "<short headline regarding foreign exchange or transfer losses>",
    "totalFXLoss": <number>,
    "lossPerDollar": <number>,
    "bestPaymentMethod": "<e.g. Wise, Crypto, Bank>",
    "recommendation": "<how to minimize fx loss>"
  },
  "cashflow": {
    "headline": "<short headline>",
    "overdueRisk": "<high | medium | low>",
    "overdueAmount": <number>,
    "cashflowGaps": ["<gap 1>", "<gap 2>"]
  },
  "keyMetrics": {
    "revenueGrowthRate": <number percentage>,
    "expenseGrowthRate": <number percentage>,
    "clientRetentionScore": <number percentage>
  },
  "lossAreas": [
    { "area": "<name>", "amount": <number>, "severity": "<high | medium | low>", "description": "<desc>", "fix": "<how to fix>" }
  ],
  "winningAreas": [
    { "area": "<name>", "impact": "<short impact>", "description": "<desc>" }
  ],
  "futureTrends": [
    { "trend": "<trend name>", "direction": "<positive | negative | neutral>", "timeframe": "<e.g. Q3 2026>", "description": "<desc with numeric backing>", "confidence": "<high | medium | low>", "dataPoints": [10, 25, 45, 60, 80] }
  ],
  "recommendations": [
    { "priority": "<critical | high | medium>", "action": "<action>", "expectedImpact": "<impact>", "timeframe": "<e.g. Immediate, 30 days>" }
  ]
}`

    const prompt = `Analyze the following aggregated financial ledger data and generate the JSON report:
${JSON.stringify(compressedPayload)}`

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })

    const text = response.choices[0]?.message?.content
    if (!text) throw new Error('No text returned from Groq')

    // Parse the JSON to ensure it's valid before sending it to the client
    const jsonResponse = JSON.parse(text)

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error('Groq Analysis Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate analysis' }, { status: 500 })
  }
}
