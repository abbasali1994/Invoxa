export interface AIServiceOptions {
  model?: string;
  maxTokens?: number;
}

export class AIService {
  private isMock: boolean = false;
  private groqApiKey: string | null = null;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || null;
    if (!this.groqApiKey) {
      console.warn('GROQ_API_KEY is not set. AIService will use mock fallback.');
      this.isMock = true;
    }
  }

  async generateText(prompt: string, options: AIServiceOptions = {}): Promise<string> {
    if (this.isMock || !this.groqApiKey) {
      return this.mockGenerateText(prompt);
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model || 'llama-3.1-8b-instant',
          max_tokens: options.maxTokens || 1024,
          messages: [{ role: 'user', content: prompt }],
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
      return '';
    } catch (error) {
      console.error('Error calling Groq API:', error);
      return this.mockGenerateText(prompt); // Fallback on error
    }
  }

  async extractJSON<T>(prompt: string, options: AIServiceOptions = {}): Promise<T | null> {
    const systemPrompt = `You are a specialized data extraction AI. You MUST output ONLY valid JSON. Do not wrap it in markdown code blocks or provide any conversational text. Just the raw JSON object.`;
    
    if (this.isMock || !this.groqApiKey) {
      return this.mockExtractJSON<T>(prompt);
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: options.model || 'llama-3.1-8b-instant',
          max_tokens: options.maxTokens || 1024,
          response_format: { type: "json_object" },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
        })
      });

      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        const text = data.choices[0].message.content.trim();
        // Try to parse the text, stripping markdown if the AI mistakenly included it
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as T;
        }
        return JSON.parse(text) as T;
      }
      return null;
    } catch (error) {
      console.error('Error in extractJSON:', error);
      return this.mockExtractJSON<T>(prompt);
    }
  }

  private mockGenerateText(prompt: string): string {
    return `[Mock AI Response] Simulated response for prompt: "${prompt.substring(0, 50)}..."`;
  }

  private mockExtractJSON<T>(prompt: string): T {
    // Mock response assuming standard formats for this app
    if (prompt.toLowerCase().includes('invoice') || prompt.toLowerCase().includes('receipt')) {
      return {
        vendor: "Mock Vendor Inc.",
        date: new Date().toISOString().split('T')[0],
        amount: 150.00,
        category: "Office Supplies",
        currency: "USD",
        confidence: 0.95
      } as unknown as T;
    }
    
    return {} as T;
  }
}

export const aiService = new AIService();
