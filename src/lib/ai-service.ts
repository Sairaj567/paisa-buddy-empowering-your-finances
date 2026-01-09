// AI Service for Paisa Buddy
// Uses OpenRouter API for financial insights with fallback models and keys

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Primary and fallback models (all free tier on OpenRouter)
const AI_MODELS = [
  'nvidia/nemotron-nano-12b-v2-vl:free',        // Primary - fast, good quality
  'meta-llama/llama-3.2-3b-instruct:free',      // Fallback 1 - Meta Llama
  'google/gemma-2-9b-it:free',                   // Fallback 2 - Google Gemma
  'microsoft/phi-3-mini-128k-instruct:free',    // Fallback 3 - Microsoft Phi
  'qwen/qwen-2-7b-instruct:free',               // Fallback 4 - Qwen
];

// Get all available API keys from environment variables
const getApiKeys = (): string[] => {
  const keys: string[] = [];
  
  // Primary key
  const primaryKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (primaryKey) {
    keys.push(primaryKey);
  }
  
  // Additional fallback keys (VITE_OPENROUTER_API_KEY_2, VITE_OPENROUTER_API_KEY_3, etc.)
  const key2 = import.meta.env.VITE_OPENROUTER_API_KEY_2;
  const key3 = import.meta.env.VITE_OPENROUTER_API_KEY_3;
  
  if (key2) keys.push(key2);
  if (key3) keys.push(key3);
  
  return keys;
};

// Rate limit tracking for both models and API keys
const rateLimitState = {
  blockedModels: new Map<string, number>(), // model -> unblock timestamp
  blockedKeys: new Map<string, number>(),   // key -> unblock timestamp
  lastRequestTime: 0,
  minRequestInterval: 1500, // 1.5 seconds between requests
  currentKeyIndex: 0,
};

export interface FinancialSnapshot {
  totals: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
  };
  highestCategory: { category: string; amount: number } | null;
  topDay: { day: string; amount: number } | null;
  recent: Array<{
    name: string;
    category: string;
    amount: number;
    date: string;
  }>;
  goals?: Array<{
    name: string;
    current: number;
    target: number;
    progress: number;
  }>;
  budgets?: Array<{
    category: string;
    limit: number;
    spent: number;
    percentUsed: number;
  }>;
}

export interface AIInsight {
  summary: string;
  recommendations: string[];
  warnings: string[];
  opportunities: string[];
}

const getApiKey = () => import.meta.env.VITE_OPENROUTER_API_KEY;

export const isAIConfigured = () => getApiKeys().length > 0;

// Get next available API key that isn't rate limited
const getAvailableKey = (): string | null => {
  const keys = getApiKeys();
  const now = Date.now();
  
  // Try starting from current index, then wrap around
  for (let i = 0; i < keys.length; i++) {
    const index = (rateLimitState.currentKeyIndex + i) % keys.length;
    const key = keys[index];
    const blockedUntil = rateLimitState.blockedKeys.get(key);
    
    if (!blockedUntil || blockedUntil < now) {
      if (blockedUntil && blockedUntil < now) {
        rateLimitState.blockedKeys.delete(key);
      }
      rateLimitState.currentKeyIndex = index;
      return key;
    }
  }
  
  return null;
};

// Mark an API key as rate limited
const markKeyRateLimited = (key: string, retryAfterSeconds: number = 60) => {
  const unblockTime = Date.now() + (retryAfterSeconds * 1000);
  rateLimitState.blockedKeys.set(key, unblockTime);
  // Move to next key
  rateLimitState.currentKeyIndex = (rateLimitState.currentKeyIndex + 1) % getApiKeys().length;
  console.log(`API key ...${key.slice(-8)} rate limited until ${new Date(unblockTime).toLocaleTimeString()}`);
};

// Get next available model that isn't rate limited
const getAvailableModel = (): string | null => {
  const now = Date.now();
  
  for (const model of AI_MODELS) {
    const blockedUntil = rateLimitState.blockedModels.get(model);
    if (!blockedUntil || blockedUntil < now) {
      // Clear expired blocks
      if (blockedUntil && blockedUntil < now) {
        rateLimitState.blockedModels.delete(model);
      }
      return model;
    }
  }
  
  return null; // All models are rate limited
};

// Mark a model as rate limited
const markModelRateLimited = (model: string, retryAfterSeconds: number = 60) => {
  const unblockTime = Date.now() + (retryAfterSeconds * 1000);
  rateLimitState.blockedModels.set(model, unblockTime);
  console.log(`Model ${model} rate limited until ${new Date(unblockTime).toLocaleTimeString()}`);
};

// Throttle requests to avoid hitting rate limits
const throttleRequest = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - rateLimitState.lastRequestTime;
  
  if (timeSinceLastRequest < rateLimitState.minRequestInterval) {
    const waitTime = rateLimitState.minRequestInterval - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  rateLimitState.lastRequestTime = Date.now();
};

// Make API request with automatic fallback for both models and API keys
interface AIRequestOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

async function makeAIRequest(options: AIRequestOptions): Promise<string> {
  const keys = getApiKeys();
  
  if (keys.length === 0) {
    throw new Error('No OpenRouter API keys available.');
  }

  let lastError: Error | null = null;
  const triedCombinations = new Set<string>(); // Track tried key+model combinations

  // Try each key with each model
  const maxAttempts = keys.length * AI_MODELS.length;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const apiKey = getAvailableKey();
    const model = getAvailableModel();
    
    if (!apiKey && !model) {
      // Both all keys and models are rate limited
      const keyUnblock = rateLimitState.blockedKeys.size > 0 
        ? Math.min(...Array.from(rateLimitState.blockedKeys.values())) 
        : Date.now();
      const modelUnblock = rateLimitState.blockedModels.size > 0
        ? Math.min(...Array.from(rateLimitState.blockedModels.values()))
        : Date.now();
      const nextUnblock = Math.min(keyUnblock, modelUnblock);
      const waitSeconds = Math.max(1, Math.ceil((nextUnblock - Date.now()) / 1000));
      throw new Error(`All AI resources are rate limited. Please wait ${waitSeconds} seconds and try again.`);
    }
    
    if (!apiKey) {
      const nextUnblock = Math.min(...Array.from(rateLimitState.blockedKeys.values()));
      const waitSeconds = Math.ceil((nextUnblock - Date.now()) / 1000);
      throw new Error(`All API keys are rate limited. Please wait ${waitSeconds} seconds.`);
    }
    
    if (!model) {
      const nextUnblock = Math.min(...Array.from(rateLimitState.blockedModels.values()));
      const waitSeconds = Math.ceil((nextUnblock - Date.now()) / 1000);
      throw new Error(`All AI models are rate limited. Please wait ${waitSeconds} seconds.`);
    }

    const combination = `${apiKey.slice(-8)}:${model}`;
    if (triedCombinations.has(combination)) {
      continue;
    }
    triedCombinations.add(combination);

    try {
      await throttleRequest();

      console.log(`Trying: key ...${apiKey.slice(-8)} with model ${model.split('/')[1]}`);
      
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Paisa Buddy',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'user', content: options.prompt }
          ],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1024,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          // Rate limited - check if it's the key or model
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          const errorMsg = error.error?.message?.toLowerCase() || '';
          
          // If error mentions credits/quota, it's likely the key
          if (errorMsg.includes('credit') || errorMsg.includes('quota') || errorMsg.includes('limit')) {
            markKeyRateLimited(apiKey, retryAfter);
          }
          // Also block the model
          markModelRateLimited(model, retryAfter);
          
          lastError = new Error(`Rate limited`);
          continue; // Try next combination
        }
        
        if (response.status === 401) {
          // Invalid key - block it for a long time
          markKeyRateLimited(apiKey, 3600); // 1 hour
          lastError = new Error('Invalid API key');
          continue;
        }
        
        lastError = new Error(error.error?.message || `API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        lastError = new Error('Empty response from AI');
        continue;
      }

      console.log(`✓ Success with key ...${apiKey.slice(-8)} and model ${model.split('/')[1]}`);
      return text;
      
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('fetch')) {
        // Network error - don't blame the key/model
        lastError = new Error('Network error. Check your connection.');
      } else {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
      console.warn(`✗ Failed:`, lastError.message);
    }
  }

  throw lastError || new Error('All AI attempts failed. Please try again later.');
}

const buildFinancialPrompt = (snapshot: FinancialSnapshot): string => {
  return `You are a friendly and knowledgeable Indian financial advisor named "पैसा Buddy AI". Analyze this user's financial data and provide personalized insights in a warm, encouraging tone.

## User's Financial Snapshot (amounts in INR ₹):

**Monthly Overview:**
- Total Income: ₹${snapshot.totals.income.toLocaleString('en-IN')}
- Total Expenses: ₹${snapshot.totals.expenses.toLocaleString('en-IN')}
- Net Savings: ₹${snapshot.totals.net.toLocaleString('en-IN')}
- Savings Rate: ${snapshot.totals.savingsRate}%

${snapshot.highestCategory ? `**Top Spending Category:** ${snapshot.highestCategory.category} (₹${snapshot.highestCategory.amount.toLocaleString('en-IN')})` : ''}

${snapshot.topDay ? `**Highest Spending Day:** ${snapshot.topDay.day} (₹${snapshot.topDay.amount.toLocaleString('en-IN')})` : ''}

**Recent Transactions (last 20):**
${snapshot.recent.map(t => `- ${t.name}: ₹${t.amount.toLocaleString('en-IN')} (${t.category})`).join('\n')}

${snapshot.goals?.length ? `
**Savings Goals:**
${snapshot.goals.map(g => `- ${g.name}: ₹${g.current.toLocaleString('en-IN')} / ₹${g.target.toLocaleString('en-IN')} (${g.progress}% complete)`).join('\n')}
` : ''}

${snapshot.budgets?.length ? `
**Budget Status:**
${snapshot.budgets.map(b => `- ${b.category}: ₹${b.spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')} (${b.percentUsed}% used)`).join('\n')}
` : ''}

---

Please provide a comprehensive financial analysis with:

1. **Summary** (2-3 sentences): Overall financial health assessment
2. **Key Recommendations** (3-4 bullet points): Actionable advice to improve finances
3. **Warnings** (1-2 bullet points): Any concerning patterns or risks
4. **Opportunities** (2-3 bullet points): Ways to save more or grow wealth

Use Indian financial context (mention SIP, PPF, NPS, mutual funds where relevant). Be encouraging but honest. Include specific numbers from the data. Use simple language suitable for someone new to personal finance.

IMPORTANT: Return ONLY valid JSON without any markdown code blocks or extra text. Use this exact format:
{"summary": "Your overall assessment here", "recommendations": ["Recommendation 1", "Recommendation 2"], "warnings": ["Warning 1"], "opportunities": ["Opportunity 1"]}`;
};

const buildQuickInsightPrompt = (question: string, snapshot: FinancialSnapshot): string => {
  return `You are पैसा Buddy AI, a friendly Indian financial advisor. Answer this question based on the user's financial data.

User's Question: "${question}"

Financial Context (INR):
- Income: ₹${snapshot.totals.income.toLocaleString('en-IN')}
- Expenses: ₹${snapshot.totals.expenses.toLocaleString('en-IN')}
- Net: ₹${snapshot.totals.net.toLocaleString('en-IN')}
- Savings Rate: ${snapshot.totals.savingsRate}%
${snapshot.highestCategory ? `- Top Category: ${snapshot.highestCategory.category} (₹${snapshot.highestCategory.amount.toLocaleString('en-IN')})` : ''}

Provide a concise, helpful answer (2-4 sentences) with specific advice. Use ₹ for currency. Do not format as JSON - just respond in plain conversational text.`;
};

export async function generateFinancialInsights(snapshot: FinancialSnapshot): Promise<AIInsight> {
  if (!getApiKey()) {
    throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  if (!snapshot.recent.length) {
    throw new Error('No transaction data available. Add some transactions to get AI insights.');
  }

  const text = await makeAIRequest({
    prompt: buildFinancialPrompt(snapshot),
    maxTokens: 1024,
    temperature: 0.7,
  });

  if (!text) {
    throw new Error('No response from AI. Please try again.');
  }

  // Parse JSON from response (handle markdown code blocks)
  try {
    // Remove markdown code block wrappers if present
    let cleanText = text.trim();
    cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
        opportunities: Array.isArray(parsed.opportunities) ? parsed.opportunities : [],
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e, 'Raw text:', text);
  }

  // Fallback: extract text content without JSON formatting
  let cleanSummary = text.trim();
  // Remove any JSON-like structures from the summary
  cleanSummary = cleanSummary.replace(/[\{\}\[\]",]/g, ' ').replace(/\s+/g, ' ').trim();
  
  return {
    summary: cleanSummary || 'Analysis complete. Check your spending patterns above.',
    recommendations: [],
    warnings: [],
    opportunities: [],
  };
}

export async function askFinancialQuestion(question: string, snapshot: FinancialSnapshot): Promise<string> {
  if (!getApiKey()) {
    throw new Error('OpenRouter API key not configured.');
  }

  const text = await makeAIRequest({
    prompt: buildQuickInsightPrompt(question, snapshot),
    maxTokens: 256,
    temperature: 0.7,
  });

  return text?.trim() || 'Sorry, I could not generate an answer. Please try again.';
}

// Predefined quick insights that don't need API calls
export function getLocalInsights(snapshot: FinancialSnapshot): string[] {
  const insights: string[] = [];

  // Savings rate insight
  if (snapshot.totals.savingsRate >= 30) {
    insights.push(`🌟 Excellent! Your ${snapshot.totals.savingsRate}% savings rate is above the recommended 20%. Keep it up!`);
  } else if (snapshot.totals.savingsRate >= 20) {
    insights.push(`👍 Good job! Your ${snapshot.totals.savingsRate}% savings rate meets the recommended target.`);
  } else if (snapshot.totals.savingsRate > 0) {
    insights.push(`💡 Your savings rate is ${snapshot.totals.savingsRate}%. Try to reach 20% by cutting discretionary spending.`);
  } else {
    insights.push(`⚠️ You're spending more than you earn. Review your expenses to find areas to cut.`);
  }

  // Top spending insight
  if (snapshot.highestCategory) {
    const percent = Math.round((snapshot.highestCategory.amount / snapshot.totals.expenses) * 100);
    insights.push(`📊 ${snapshot.highestCategory.category} is your biggest expense (${percent}% of total). Is this aligned with your priorities?`);
  }

  // Weekend spending pattern
  if (snapshot.topDay?.day === 'Sat' || snapshot.topDay?.day === 'Sun') {
    insights.push(`📅 You spend most on weekends. Consider planning weekend activities that cost less.`);
  }

  // Income vs expense ratio
  if (snapshot.totals.income > 0) {
    const ratio = snapshot.totals.expenses / snapshot.totals.income;
    if (ratio > 0.9) {
      insights.push(`🔴 You're using ${Math.round(ratio * 100)}% of income on expenses. Build an emergency buffer.`);
    } else if (ratio > 0.7) {
      insights.push(`🟡 ${Math.round(ratio * 100)}% of income goes to expenses. Good, but there's room to save more.`);
    }
  }

  return insights;
}
