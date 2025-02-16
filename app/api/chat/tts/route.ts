import { NextResponse } from 'next/server';
import { synthesizeSpeech } from '@/lib/tts-service';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const audioContent = await synthesizeSpeech(text);

    return new Response(audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Speech synthesis error:', error);
    return NextResponse.json(
      { error: 'Failed to synthesize speech' },
      { status: 500 }
    );
  }
}