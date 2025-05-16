import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Input validation
function validateInput(message: string): { isValid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { isValid: false, error: 'Message must be a non-empty string' };
  }
  if (message.length > 2000) {
    return { isValid: false, error: 'Message must be less than 2000 characters' };
  }
  return { isValid: true };
}

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Accept conversation array for adaptive context
    const { message, format, businessContext, conversation } = body;

    // Validate input
    const validation = validateInput(message);
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

    // Build conversation context string (excluding the current message)
    let conversationContext = '';
    if (Array.isArray(conversation) && conversation.length > 0) {
      conversationContext = conversation
        .filter((msg: any) => msg.role && msg.content && msg.role !== 'ai' && msg.content !== message)
        .map((msg: any) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join('\n');
    }

    const systemPrompt = `You are an expert in economics, business, and project management. For every user question:

1. Search for and cite the most relevant, up-to-date research, articles, or books from the web or literature (use real or plausible sources, and compare at least two if possible).
2. Analyze and compare the data, findings, or viewpoints from these sources in your reasoning process.
3. Synthesize the information to provide a compelling, insightful, and evidence-based answer.
4. Your reasoning should be sophisticated, critical, and reference the sources you found (with brief citations in the reasoning section).
5. Your final response should be concise, actionable, and reflect the best available knowledge.
6. If the question is ambiguous, clarify assumptions and suggest what further information would help.
7. Maintain a professional, approachable tone. No markdown or hashtags.

Business Context:
${businessContext ? JSON.stringify(businessContext, null, 2) : 'No specific business context available.'}

Conversation so far:
${conversationContext || 'No prior conversation.'}

Format your response as:
REASONING:
[Your detailed, evidence-based analysis with citations]

RESPONSE:
[Your concise, actionable answer]`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              { text: message }
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

    // Split the response into reasoning and final response
    const [reasoning, finalResponse] = aiMessage.split('RESPONSE:').map((part: string) => part.trim());

    return NextResponse.json({ 
      message: finalResponse,
      reasoning: reasoning.replace('REASONING:', '').trim()
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to process chat request',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}