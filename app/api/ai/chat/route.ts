import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

// 1. Vercel Edge Runtime for blazing-fast cold starts
export const runtime = 'edge';

// The key where our dynamic context is stored in Vercel KV
const KV_CONTEXT_KEY = 'admin_ai_context';

// CORS Headers (optional, if your chat widget is hosted on a different domain)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid payload. "messages" array is required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Step 1: Fetch the dynamic context text from Vercel KV
    // Fallback to a default string if KV is empty or fails gracefully
    let dynamicContext = "No context provided.";
    try {
      const storedContext = await kv.get<string>(KV_CONTEXT_KEY);
      if (storedContext) dynamicContext = storedContext;
    } catch (kvError) {
      console.error('Failed to fetch context from Vercel KV:', kvError);
      // We log the error but allow the chat to continue with the default/empty context
    }

    // Step 2: Construct the system message using the fetched dynamic context
    const systemPrompt = `
      You are the Operix AI assistant. Answer the user's questions strictly using the following company context. Do not invent information.

      --- Company Context ---
      ${dynamicContext}
    `;

    // Step 4: Call OpenAI gpt-4o-mini and stream the response
    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages, // Step 3: Append the user's prompt (handled automatically by passing the messages array)
    });

    // Return the response as a standard data stream with CORS headers
    return result.toDataStreamResponse({
        headers: corsHeaders
    });

  } catch (error: any) {
    console.error('API Error:', error);
    
    // Proper error handling if OpenAI fails
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message || 'Unknown error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
