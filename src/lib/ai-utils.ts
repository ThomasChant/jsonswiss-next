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

// Recommended maximum input size (characters) for AI-based repair requests.
// This keeps prompts within typical model context limits while allowing
// reasonably large JSON inputs. Used for documentation/UX hints.
export const AI_MAX_INPUT_CHARS = 51200;

// Local type for tracking DeepSeek usage per day (per browser)
interface DeepSeekUsage {
  date: string; // YYYY-MM-DD
  count: number;
}

export const defaultAIProviders: AIProvider[] = [
  // {
  //   name: "OpenRouter",
  //   apiUrl: "https://openrouter.ai/api/v1/chat/completions",
  //   model: "anthropic/claude-3-haiku",
  //   enabled: true,
  //   apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  // },
  {
    name: "DeepSeek",
    apiUrl: process.env.NEXT_PUBLIC_DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions",
    model: "deepseek-chat",
    enabled: true,
    apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY,
  }
  
];

export class AIRepairService {
  private providers: AIProvider[] = [];
  private requestCounts: Map<string, number> = new Map();
  private lastRequestTime: Map<string, number> = new Map();
  private rateLimits: Map<string, number> = new Map([
    ['DeepSeek', 60], // 60 requests per minute (DeepSeek has generous limits)
    ['OpenRouter', 10]// 30 requests per minute
  ]);
  // Daily usage limit for free users (DeepSeek calls)
  private deepSeekDailyLimit = 10;

  constructor() {
    this.loadProviders();
  }

  private loadProviders() {
    try {
     
       // Fallback to default providers
      this.providers = [...defaultAIProviders];
      console.log('Using default providers:', this.providers);
    } catch (error) {
      console.log('Error loading providers, using defaults:', error);
      this.providers = [...defaultAIProviders];
    }
  }

  saveProviders() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('ai-providers', JSON.stringify(this.providers));
      }
    } catch (error) {
      console.log('Cannot save providers to localStorage:', error);
    }
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

  // ===== Daily DeepSeek usage (per browser) =====
  private getTodayISO(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private getDeepSeekUsage(): DeepSeekUsage {
    const key = 'deepseek-usage';
    const today = this.getTodayISO();
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { date: today, count: 0 };
      }
      const raw = localStorage.getItem(key);
      if (!raw) return { date: today, count: 0 };
      const parsed = JSON.parse(raw) as DeepSeekUsage | null;
      if (!parsed || typeof parsed.count !== 'number' || typeof parsed.date !== 'string') {
        return { date: today, count: 0 };
      }
      if (parsed.date !== today) {
        return { date: today, count: 0 };
      }
      return parsed;
    } catch {
      return { date: today, count: 0 };
    }
  }

  private saveDeepSeekUsage(usage: DeepSeekUsage) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('deepseek-usage', JSON.stringify(usage));
      }
    } catch {
      // ignore storage errors
    }
  }

  private canUseDeepSeekToday(): boolean {
    const usage = this.getDeepSeekUsage();
    return usage.count < this.deepSeekDailyLimit;
  }

  private recordDeepSeekCall() {
    const today = this.getTodayISO();
    const usage = this.getDeepSeekUsage();
    const next: DeepSeekUsage = {
      date: today,
      count: usage.date === today ? usage.count + 1 : 1,
    };
    this.saveDeepSeekUsage(next);
  }

  async repairJson(invalidJson: string): Promise<AIRepairResult> {
    // First try jsonrepair library (third-party repair)
    try {
      const { jsonrepair } = await import('jsonrepair');
      const repairedJson = jsonrepair(invalidJson);
      
      // Validate the repaired JSON
      const parsed = JSON.parse(repairedJson);
      
      return {
        success: true,
        repairedJson: JSON.stringify(parsed, null, 2),
        provider: "JSONRepair Library"
      };
    } catch (error) {
      console.log('JSONRepair library failed:', error instanceof Error ? error.message : String(error));
    }

    // Second, try enhanced basic repair
    try {
      const basicRepaired = this.enhancedBasicRepair(invalidJson);
      const parsed = JSON.parse(basicRepaired);
      return {
        success: true,
        repairedJson: JSON.stringify(parsed, null, 2),
        provider: "Basic Repair"
      };
    } catch (error) {
      console.log('Basic repair failed:', error instanceof Error ? error.message : String(error));
    }

    // Finally, try AI providers (DeepSeek first, then others)
    console.log('Available providers:', this.providers);
    const enabledProviders = this.providers.filter(p => p.enabled && p.apiKey);
    console.log('Enabled providers:', enabledProviders);
    
    if (enabledProviders.length === 0) {
      console.log('No enabled providers found. Providers list:', this.providers.map(p => ({name: p.name, enabled: p.enabled, hasApiKey: !!p.apiKey})));
      return {
        success: false,
        error: "Local repair methods failed, and no AI providers are configured. The JSON may have complex structural issues."
      };
    }
    let lastError: string | undefined;

    for (const provider of enabledProviders) {
      if (this.isRateLimited(provider.name)) {
        console.log(`Skipping ${provider.name} due to rate limiting`);
        continue;
      }

      try {
        const result = await this.repairWithProvider(provider, invalidJson);
        if (result.success) {
          return result;
        } else if (result.error) {
          lastError = result.error;
        }
      } catch (error) {
        console.warn(`AI repair failed with ${provider.name}:`, error instanceof Error ? error.message : String(error));
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    return {
      success: false,
      error: lastError || "Could not repair JSON with any available method. The JSON may have severe structural issues that require manual correction."
    };
  }

  private enhancedBasicRepair(json: string): string {
    let repaired = json.trim();
    
    // Enhanced repair with more comprehensive fixes
    repaired = repaired
      // Fix quotes
      .replace(/'/g, '"') // Replace single quotes with double quotes
      .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
      
      // Fix commas
      .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas before closing brackets
      .replace(/([}\]]),\s*$/g, '$1') // Remove trailing comma at end
      .replace(/([^,\s])\s*([}\]])/g, '$1$2') // Ensure no missing commas before closing
      
      // Fix missing commas between properties
      .replace(/("\s*:\s*"[^"]*")\s+(")/g, '$1, $2') // Add comma between string properties
      .replace(/("\s*:\s*\d+)\s+(")/g, '$1, $2') // Add comma between number properties
      .replace(/("\s*:\s*(?:true|false|null))\s+(")/g, '$1, $2') // Add comma between boolean/null properties
      
      // Fix brackets
      .replace(/\s*{\s*,/g, '{') // Remove comma after opening brace
      .replace(/,\s*}/g, '}') // Remove comma before closing brace
      .replace(/\s*\[\s*,/g, '[') // Remove comma after opening bracket
      .replace(/,\s*\]/g, ']') // Remove comma before closing bracket
      
      // Fix spacing around colons
      .replace(/"\s*:\s*/g, '": ')
      
      // Fix multiple commas
      .replace(/,+/g, ',')
      
      // Fix line breaks and whitespace issues
      .replace(/\n\s*,/g, ',')
      .replace(/,\s*\n/g, ',\n');

    return repaired;
  }


  private async repairWithProvider(provider: AIProvider, invalidJson: string): Promise<AIRepairResult> {
    this.incrementRequestCount(provider.name);

    // Enforce per-user daily limit for DeepSeek calls (free plan)
    if (provider.name === 'DeepSeek') {
      if (!this.canUseDeepSeekToday()) {
        return {
          success: false,
          error: `Daily free limit reached: up to ${this.deepSeekDailyLimit} DeepSeek repairs per day. Please try again tomorrow or use local fixes.`
        };
      }
      // We will record the call right before making the network request
    }

    // Calculate a conservative max_tokens and pre-check input size
    const maxTokens = Math.min(4000, Math.floor(AI_MAX_INPUT_CHARS / 4));

    // If input exceeds our documented character guideline, bail early with a helpful hint
    if (invalidJson.length > AI_MAX_INPUT_CHARS) {
      return {
        success: false,
        error: `Input JSON is too large for AI repair: ${invalidJson.length.toLocaleString()} characters (limit: ${AI_MAX_INPUT_CHARS.toLocaleString()}). Please split the JSON into smaller parts.`
      };
    }

    // Also warn if character length exceeds the configured max_tokens budget
    if (invalidJson.length > maxTokens) {
      return {
        success: false,
        error: `Input exceeds current AI max_tokens budget (${maxTokens.toLocaleString()}). Please reduce input size or split it before using AI repair.`
      };
    }

    const prompt = `Please repair this invalid JSON,fix syntax errors, quote keys properly, return only the valid raw JSON 
    that can be parsed and without any explanation or format. The broken json is:
    ${invalidJson}`
;

    const requestBody = {
      model: provider.model,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: maxTokens,
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
      // If using DeepSeek, record this API call attempt
      if (provider.name === 'DeepSeek') {
        this.recordDeepSeekCall();
      }
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
      console.log('AI "response":', response);

      // Clean up the response
      // repairedJson = this.cleanAIResponse(repairedJson);

      // Try to validate and parse the repaired JSON
      try {
        const parsed = JSON.parse(repairedJson);
        return {
          success: true,
          repairedJson: JSON.stringify(parsed, null, 2),
          provider: provider.name
        };
      } catch (parseError) {
        console.log(`JSON parse failed for ${provider.name}:`, parseError);
        console.log('Failed JSON content:', repairedJson);
        
        // Try a more aggressive cleaning approach
        const aggressivelyCleaned = this.aggressiveClean(repairedJson);
        try {
          const parsed = JSON.parse(aggressivelyCleaned);
          console.log('Aggressive cleaning succeeded');
          return {
            success: true,
            repairedJson: JSON.stringify(parsed, null, 2),
            provider: provider.name + " (aggressive clean)"
          };
        } catch (secondParseError) {
          console.log('Aggressive cleaning also failed:', secondParseError);
          throw parseError; // Throw the original parse error
        }
      }

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private cleanAIResponse(response: string): string {
    console.log('Raw AI response:', response);
    
    // Remove all markdown code blocks (various formats)
    let cleaned = response
      .replace(/```json\s*\n?/gi, '')
      .replace(/```javascript\s*\n?/gi, '')
      .replace(/```\s*\n?/g, '')
      .replace(/```\s*$/g, '');
    
    // Remove common AI explanatory text patterns
    cleaned = cleaned
      .replace(/^Here is the repaired JSON:?\s*/i, '')
      .replace(/^The repaired JSON is:?\s*/i, '')
      .replace(/^Repaired JSON:?\s*/i, '')
      .replace(/^JSON:?\s*/i, '')
      .replace(/Here's the fixed JSON:?\s*/i, '')
      .replace(/Fixed JSON:?\s*/i, '');
    
    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();
    
    // Find JSON content (look for first { or [)
    const jsonStart = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
    if (jsonStart !== -1) {
      cleaned = cleaned.substring(jsonStart);
    }
    
    // Find the end of JSON using bracket counting for better accuracy
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    let jsonEnd = -1;
    
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && cleaned[0] === '{') {
            jsonEnd = i;
            break;
          }
        }
        else if (char === '[') bracketCount++;
        else if (char === ']') {
          bracketCount--;
          if (bracketCount === 0 && cleaned[0] === '[') {
            jsonEnd = i;
            break;
          }
        }
      }
    }
    
    if (jsonEnd !== -1) {
      cleaned = cleaned.substring(0, jsonEnd + 1);
    }
    
    console.log('Cleaned AI response:', cleaned);
    return cleaned;
  }

  private aggressiveClean(response: string): string {
    // More aggressive cleaning for problematic responses
    let cleaned = response;
    
    // Remove any text before the first JSON structure
    const jsonStartIndex = Math.max(cleaned.indexOf('{'), cleaned.indexOf('['));
    if (jsonStartIndex !== -1) {
      cleaned = cleaned.substring(jsonStartIndex);
    }
    
    // Find the last complete JSON structure
    const lastBrace = cleaned.lastIndexOf('}');
    const lastBracket = cleaned.lastIndexOf(']');
    const jsonEndIndex = Math.max(lastBrace, lastBracket);
    
    if (jsonEndIndex !== -1) {
      // Keep everything up to and including the closing bracket/brace
      cleaned = cleaned.substring(0, jsonEndIndex + 1);
    }
    
    // Remove line breaks and normalize whitespace
    cleaned = cleaned
      .replace(/\n\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Aggressively cleaned response:', cleaned);
    return cleaned;
  }
}

// (Daily DeepSeek usage helpers moved inside AIRepairService class)
