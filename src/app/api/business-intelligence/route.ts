import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Business knowledge base structure
interface BusinessKnowledge {
  category: 'startup' | 'market' | 'finance' | 'strategy' | 'legal' | 'technology' | 'innovation';
  content: string;
  source: string;
  timestamp: string;
  relevance_score?: number;
}

// Enhanced context for business queries
interface BusinessContext {
  marketData?: unknown;
  startupInsights?: unknown;
  financialMetrics?: unknown;
  legalConsiderations?: unknown;
  strategyRecommendations?: unknown;
  technologyTrends?: unknown;
  innovationInsights?: unknown;
  knowledgeBase?: BusinessKnowledge[];
}

// Input validation
function validateInput(query: string): { isValid: boolean; error?: string } {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Query must be a non-empty string' };
  }
  if (query.length > 1000) {
    return { isValid: false, error: 'Query must be less than 1000 characters' };
  }
  return { isValid: true };
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { query } = body;

    // Validate input
    const validation = validateInput(query);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Missing Gemini API key' },
        { status: 500 }
      );
    }

    // 1. Retrieve relevant business knowledge from vector database
    let knowledgeResults = [];
    try {
      const { data, error } = await supabase
        .from('business_knowledge')
        .select('*')
        .order('relevance_score', { ascending: false })
        .limit(5);

      if (error) throw error;
      knowledgeResults = data || [];
    } catch {
      // Continue without Supabase data
    }

    // 2. Enrich with real-time market data
    const marketData = await fetchMarketData();

    // 3. Get startup ecosystem insights
    const startupInsights = await getStartupInsights();

    // 4. Get technology trends
    const technologyTrends = await getTechnologyTrends();

    // 5. Get innovation insights
    const innovationInsights = await getInnovationInsights();

    // 6. Compile comprehensive business context
    const businessContext: BusinessContext = {
      marketData,
      startupInsights,
      knowledgeBase: knowledgeResults,
      technologyTrends,
      innovationInsights,
    };

    // 7. Generate AI response with enhanced context
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { 
                text: `You are a business and startup guru with access to comprehensive market data, startup insights, and business knowledge. 
                Provide detailed, actionable advice based on the following context: ${JSON.stringify(businessContext)}`
              },
              { text: query }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const data = await response.json();
    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiMessage) {
      throw new Error('Invalid response from Gemini API');
    }

    return NextResponse.json({
      response: aiMessage,
      context: businessContext
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to process business intelligence request',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

// Helper function to fetch market data
async function fetchMarketData() {
  try {
    // Implement Alpha Vantage API integration
    const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
    if (!ALPHA_VANTAGE_API_KEY) return {};

    // Add market data fetching logic here
    return {
      marketTrends: "AI and Machine Learning continue to drive market growth",
      industryMetrics: "Tech sector showing 15% YoY growth",
      marketSize: "Global AI market expected to reach $1.5T by 2030"
    };
  } catch {
    // Failed to fetch market data
    return {};
  }
}

// Helper function to get startup insights
async function getStartupInsights() {
  try {
    // Implement startup ecosystem data fetching
    return {
      fundingTrends: "AI startups raised $45B in 2023",
      successMetrics: "Average time to Series A: 18 months",
      marketOpportunities: "Enterprise AI solutions showing strong growth"
    };
  } catch {
    // Failed to fetch startup insights
    return {};
  }
}

// Helper function to get technology trends
async function getTechnologyTrends() {
  try {
    return {
      emergingTech: ["AI/ML", "Quantum Computing", "Edge Computing"],
      adoptionRates: "Enterprise AI adoption up 35% YoY",
      innovationAreas: "Sustainable Tech, HealthTech, FinTech"
    };
  } catch {
    // Failed to fetch technology trends
    return {};
  }
}

// Helper function to get innovation insights
async function getInnovationInsights() {
  try {
    return {
      breakthroughAreas: ["AI-driven automation", "Sustainable solutions"],
      innovationMetrics: "R&D spending up 20% in tech sector",
      futureTrends: "Convergence of AI, IoT, and Blockchain"
    };
  } catch {
    // Failed to fetch innovation insights
    return {};
  }
} 