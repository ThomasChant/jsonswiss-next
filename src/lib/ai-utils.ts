export interface AIProvider {
  name: string;
  apiUrl: string;
  apiKey?: string;
  model: string;
  enabled: boolean;
  headers?: Record<string, string>;
}

export interface AIRepairResult {
  success: boolean;
  repairedJson?: string;
  provider?: string;
  error?: string;
}

export const defaultAIProviders: AIProvider[] = [
  {
    name: "OpenRouter",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: "anthropic/claude-3-haiku",
    enabled: false,
  },
  {
    name: "Groq",
    apiUrl: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama3-8b-8192",
    enabled: false,
  },
  {
    name: "HuggingFace",
    apiUrl: "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
    model: "microsoft/DialoGPT-medium",
    enabled: false,
  }
];

export class AIRepairService {
  private providers: AIProvider[] = [];
  private requestCounts: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private rateLimits: Map<string, number> = new Map([
    ['OpenRouter', 10], // 10 requests per minute
    ['Groq', 30], // 30 requests per minute
    ['HuggingFace', 5], // 5 requests per minute
  ]);

  constructor() {
    this.loadProviders();
  }

  private loadProviders() {
    try {
      const stored = localStorage.getItem('ai-providers');
      if (stored) {
        this.providers = JSON.parse(stored);
      } else {
        this.providers = [...defaultAIProviders];
      }
    } catch {
      this.providers = [...defaultAIProviders];
    }
  }

  saveProviders() {
    localStorage.setItem('ai-providers', JSON.stringify(this.providers));
  }

  getProviders(): AIProvider[] {
    return [...this.providers];
  }

  updateProvider(index: number, provider: AIProvider) {
    if (index >= 0 && index < this.providers.length) {
      this.providers[index] = { ...provider };
      this.saveProviders();
    }
  }

  private isRateLimited(providerName: string): boolean {
    const limit = this.rateLimits.get(providerName) || 10;
    const count = this.requestCounts.get(providerName) || 0;
    const lastRequest = this.lastRequestTime.get(providerName) || 0;
    const now = Date.now();

    // Reset count if more than a minute has passed
    if (now - lastRequest > 60000) {
      this.requestCounts.set(providerName, 0);
      return false;
    }

    return count >= limit;
  }

  private incrementRequestCount(providerName: string) {
    const count = this.requestCounts.get(providerName) || 0;
    this.requestCounts.set(providerName, count + 1);
    this.lastRequestTime.set(providerName, Date.now());
  }

  async repairJson(invalidJson: string): Promise<AIRepairResult> {
    // First try basic repair without AI
    try {
      const basicRepaired = this.basicJsonRepair(invalidJson);
      const parsed = JSON.parse(basicRepaired);
      return {
        success: true,
        repairedJson: JSON.stringify(parsed, null, 2),
        provider: "Basic Repair"
      };
    } catch {
      // Continue with AI repair if basic repair fails
    }

    // Try AI providers
    const enabledProviders = this.providers.filter(p => p.enabled && p.apiKey);
    
    for (const provider of enabledProviders) {
      if (this.isRateLimited(provider.name)) {
        continue;
      }

      try {
        const result = await this.repairWithProvider(provider, invalidJson);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn(`AI repair failed with ${provider.name}:`, error);
      }
    }

    return {
      success: false,
      error: "Could not repair JSON with available providers"
    };
  }

  private basicJsonRepair(json: string): string {
    let repaired = json.trim();
    
    // Fix common issues
    repaired = repaired
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
      .replace(/([}\]]),\s*$/g, '$1'); // Remove trailing comma at end

    return repaired;
  }

  private async repairWithProvider(provider: AIProvider, invalidJson: string): Promise<AIRepairResult> {
    this.incrementRequestCount(provider.name);

    const prompt = `Please repair this invalid JSON and return only the valid JSON without any explanation:

${invalidJson}

The response should be valid JSON that can be parsed. Fix syntax errors, quote keys properly, and ensure proper formatting.`;

    const requestBody = {
      model: provider.model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.1,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...provider.headers
    };

    if (provider.apiKey) {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(provider.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      let repairedJson = data.choices?.[0]?.message?.content || data.generated_text || '';

      // Clean up the response
      repairedJson = this.cleanAIResponse(repairedJson);

      // Validate the repaired JSON
      JSON.parse(repairedJson);

      return {
        success: true,
        repairedJson: JSON.stringify(JSON.parse(repairedJson), null, 2),
        provider: provider.name
      };

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private cleanAIResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```json\s*\n?/g, '').replace(/```\s*$/g, '');
    
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Find JSON content (look for first { or [)
    const jsonStart = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
    if (jsonStart !== -1) {
      cleaned = cleaned.substring(jsonStart);
    }
    
    // Find the end of JSON (last } or ])
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const jsonEnd = Math.max(lastBrace, lastBracket);
    
    if (jsonEnd !== -1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
    
    return cleaned;
  }
}