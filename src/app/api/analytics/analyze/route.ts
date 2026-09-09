import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { payload, dateRange } = await req.json()
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
      if (inv.status === 'OVERDUE' || inv.status === 'SENT') totalOverdueUSD += inv.total
    })

    const expenseByCategoryINR: Record<string, number> = {}
    const expenseByVendorINR: Record<string, number> = {}
    let totalExpensesINR = 0

    expenses.forEach((exp: any) => {
      expenseByCategoryINR[exp.category] = (expenseByCategoryINR[exp.category] || 0) + exp.amount
      expenseByVendorINR[exp.vendor] = (expenseByVendorINR[exp.vendor] || 0) + exp.amount
      totalExpensesINR += exp.amount
    })

    let totalExpectedINR = 0
    let realizedRevenueINR = 0
    let totalFXLossINR = 0
    let totalInvoicedSettledUSD = 0
    
    settlements.forEach((s: any) => {
      realizedRevenueINR += s.realizedINR || 0
      totalInvoicedSettledUSD += s.invoicedUSD || 0
      const actualExchangeRate = s.exchangeRate || (s.invoicedUSD ? (s.realizedINR / s.invoicedUSD) : 83)
      const expectedINR = (s.invoicedUSD || 0) * actualExchangeRate
      totalExpectedINR += expectedINR
      const fees = (s.platformFee || 0) + (s.transferFee || 0)
      const loss = expectedINR - (s.realizedINR || 0) + fees
      if (loss > 0) totalFXLossINR += loss
    })

    // Calculate top client
    let topClientName = 'Unknown'
    let topClientRevenueUSD = 0
    Object.entries(clientRevenueUSD).forEach(([client, revenue]) => {
      if (revenue > topClientRevenueUSD) {
        topClientRevenueUSD = revenue
        topClientName = client
      }
    })

    // Calculate growth rates by splitting the date range into two halves
    let firstHalfRevenue = 0, secondHalfRevenue = 0
    if (invoices.length > 0) {
      const dates = invoices.map((i: any) => new Date(i.createdAt).getTime())
      const midPoint = (Math.min(...dates) + Math.max(...dates)) / 2
      invoices.forEach((i: any) => {
        if (new Date(i.createdAt).getTime() < midPoint) firstHalfRevenue += i.total
        else secondHalfRevenue += i.total
      })
    }
    const revenueGrowthRate = firstHalfRevenue > 0 ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : (secondHalfRevenue > 0 ? 100 : 0)

    let firstHalfExpense = 0, secondHalfExpense = 0
    if (expenses.length > 0) {
      const dates = expenses.map((e: any) => new Date(e.date).getTime())
      const midPoint = (Math.min(...dates) + Math.max(...dates)) / 2
      expenses.forEach((e: any) => {
        if (new Date(e.date).getTime() < midPoint) firstHalfExpense += e.amount
        else secondHalfExpense += e.amount
      })
    }
    const expenseGrowthRate = firstHalfExpense > 0 ? ((secondHalfExpense - firstHalfExpense) / firstHalfExpense) * 100 : (secondHalfExpense > 0 ? 100 : 0)

    // Calculate Client Retention: percentage of clients with more than 1 invoice
    const clientInvoiceCounts: Record<string, number> = {}
    invoices.forEach((i: any) => {
      const clientName = i.client?.name || 'Unknown'
      clientInvoiceCounts[clientName] = (clientInvoiceCounts[clientName] || 0) + 1
    })
    const totalClients = Object.keys(clientInvoiceCounts).length
    const retainedClients = Object.values(clientInvoiceCounts).filter(count => count > 1).length
    const clientRetentionScore = totalClients > 0 ? (retainedClients / totalClients) * 100 : 100

    const realizedProfitINR = realizedRevenueINR - totalExpensesINR
    const profitMargin = realizedRevenueINR > 0 ? (realizedProfitINR / realizedRevenueINR) * 100 : 0
    const settlementEfficiency = Math.min(100, totalExpectedINR > 0 ? (realizedRevenueINR / totalExpectedINR) * 100 : 100)
    const lossPerDollar = totalInvoicedSettledUSD > 0 ? (totalFXLossINR / totalInvoicedSettledUSD) : 0

    const dateRangeStr = dateRange?.from && dateRange?.to ? `${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}` : 'the current period'

    let currentExchangeRate = 83.50
    try {
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } })
      const fxData = await fxRes.json()
      if (fxData?.rates?.INR) {
        currentExchangeRate = fxData.rates.INR
      }
    } catch (e) {
      console.warn('Failed to fetch realtime FX rate', e)
    }

    const compressedPayload = {
      exact_financial_metrics: {
        totalInvoicedUSD,
        realizedRevenueINR,
        totalExpensesINR,
        realizedProfitINR,
        totalOverdueUSD,
        totalFXLossINR,
        lossPerDollar: Number(lossPerDollar.toFixed(2)),
        profitMarginPercentage: Number(profitMargin.toFixed(1)),
        settlementEfficiencyPercentage: Number(settlementEfficiency.toFixed(1)),
        topClientName,
        topClientRevenueUSD,
        revenueGrowthRate: Number(revenueGrowthRate.toFixed(1)),
        expenseGrowthRate: Number(expenseGrowthRate.toFixed(1)),
        clientRetentionScore: Number(clientRetentionScore.toFixed(1)),
        currentRealtimeExchangeRate: Number(currentExchangeRate.toFixed(2))
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
- The data you are analyzing is specifically for the date range: ${dateRangeStr}.
- If \`profitMarginPercentage\` is provided, use exactly that number.
- For business health score, use a logical formula based on the exact margins, cashflow gaps, and profit provided. If the business is highly profitable, the score should be > 80 (Excellent).
- \`totalFXLossINR\` is exact. Use it.
- \`lossPerDollar\` is exact. Use it precisely as the lossPerDollar field in your JSON output.
- REALTIME FX DATA: The current live USD/INR exchange rate is exactly ₹${currentExchangeRate.toFixed(2)}. 
- For Future Trends, you MUST base your predictions on estimated future USD-to-INR exchange rate fluctuations FOR THE PERIODS IMMEDIATELY FOLLOWING THE SELECTED DATE RANGE (${dateRangeStr}). Your \`dataPoints.value\` array MUST be mathematically grounded, starting close to the current live baseline of ₹${currentExchangeRate.toFixed(2)} and projecting realistic macro-economic trends. DO NOT hallucinate random baseline numbers like 79 or 82.
- "Loss Areas" must ONLY contain pure financial losses or leaks (e.g. FX transfer losses, unpaid overdue invoices, penalties, or bank fees). Do NOT classify regular operational business expenses (like Software, Rent, Salaries, Marketing) as losses.

Analyze margins, FX losses (if settlements have exchange rates/fees), revenue concentration by client, expense bloat, cashflow gaps (overdue invoices), and overall business health.

Return your analysis strictly as a JSON object matching this schema exactly. DO NOT include markdown blocks like \`\`\`json or \`\`\`, just return the raw JSON object.

Schema:
{
  "healthScore": { "score": <number 0-100>, "label": "<Excellent | Good | Fair | At Risk | Critical>" },
  "executiveSummary": {
    "summary": "<2-3 sentence high-level summary of financial standing>",
    "metrics": {
      "profitMargin": <number percentage>,
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
    { "area": "<name of pure financial loss>", "amount": <number>, "severity": "<high | medium | low>", "description": "<desc>", "fix": "<how to fix>" }
  ],
  "winningAreas": [
    { "area": "<name>", "impact": "<short impact>", "description": "<desc>" }
  ],
  "futureTrends": [
    { "trend": "<trend name (e.g. USD/INR Exchange Rate Projection)>", "direction": "<positive | negative | neutral>", "timeframe": "<e.g. Q3 2026>", "description": "<Explain how projected USD/INR conversion rate changes will affect expenses and settlement gaps/FX losses>", "confidence": "<high | medium | low>", "dataPoints": [ { "label": "<e.g. Jan 2026>", "value": 82 }, { "label": "<e.g. Feb 2026>", "value": 83.5 } ] }
  ],
  "recommendations": [
    { "priority": "<critical | high | medium>", "action": "<action>", "expectedImpact": "<impact>", "timeframe": "<e.g. Immediate, 30 days>" }
  ]
}`

    const prompt = `Analyze the following aggregated financial ledger data and generate the JSON report:
${JSON.stringify(compressedPayload)}`

    const model = process.env.AI_MODEL || 'openai/gpt-oss-120b'
    const response = await groq.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    })

    const text = response.choices[0]?.message?.content
    if (!text) throw new Error(`No text returned from ${model}`)

    // Parse the JSON to ensure it's valid before sending it to the client
    const jsonResponse = JSON.parse(text)

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error('Groq Analysis Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate analysis' }, { status: 500 })
  }
}
