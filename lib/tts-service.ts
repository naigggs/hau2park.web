import { TextToSpeechClient } from '@google-cloud/text-to-speech';

const ttsClient = new TextToSpeechClient({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

export async function synthesizeSpeech(text: string) {
  try {
    const [response] = await ttsClient.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    return response.audioContent;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    throw error;
  }
}