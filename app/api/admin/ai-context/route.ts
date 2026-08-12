import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

// Use Edge Runtime for speed and low latency
export const runtime = 'edge';

// A constant key to store our dynamic context
const KV_CONTEXT_KEY = 'admin_ai_context';

/**
 * GET: Fetches the currently saved AI context from Vercel KV.
 * This is used to populate the textarea when the Admin Panel loads.
 */
export async function GET(req: NextRequest) {
  try {
    // Fetch the string from KV. If it doesn't exist, it returns null.
    const context = await kv.get<string>(KV_CONTEXT_KEY);
    
    return NextResponse.json({ context: context || '' }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching AI context from KV:', error);
    return NextResponse.json(
      { error: 'Failed to fetch context.' }, 
      { status: 500 }
    );
  }
}

/**
 * POST: Saves the new AI context provided by the Admin to Vercel KV.
 */
export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();

    if (typeof context !== 'string') {
      return NextResponse.json(
        { error: 'Invalid payload. "context" must be a string.' }, 
        { status: 400 }
      );
    }

    // Save the context string to Vercel KV
    await kv.set(KV_CONTEXT_KEY, context);
    
    return NextResponse.json(
      { success: true, message: 'Context saved successfully.' }, 
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error saving AI context to KV:', error);
    return NextResponse.json(
      { error: 'Failed to save context.' }, 
      { status: 500 }
    );
  }
}
