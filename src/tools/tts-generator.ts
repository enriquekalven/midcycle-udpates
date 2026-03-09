import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';

const client = new textToSpeech.TextToSpeechClient();

/**
 * Chirp TTS Tool
 * Integrates Google Cloud Chirp 3 HD voices for expressive, human-like speech.
 * Saves generated MP3s to the website public folder for immediate playback.
 */
export const chirpTtsTool = new FunctionTool({
  name: "generate_audio_tts",
  description: "Converts menu text to high-quality audio using Google Cloud Chirp 3 (HD) models. Returns a local URL for the generated audio file.",
  parameters: z.object({
    text: z.string().describe("The menu text to be output as audio"),
    voice_style: z.enum(['friendly_server', 'enthusiastic_chef', 'professional_narrator', 'warm_welcome']).optional().describe("The vocal style or persona for the audio output."),
    lang: z.string().optional().default('en-US').describe("The language code (e.g., 'en-US' or 'es-ES')")
  }),
  async execute({ text, voice_style, lang }: any) {
    console.log(`[TTS] Generating audio for: "${text.substring(0, 30)}..." with style: ${voice_style}, lang: ${lang}`);
    
    const isSpanish = lang?.startsWith('es') || /hola|tienes|quiero|opciones|huevos|menu|plato|recomienda|precio|costo|pescado|mariscos|cangrejo|sopa/.test(text.toLowerCase());
    const targetLang = isSpanish ? 'es-ES' : 'en-US';

    // Mapping expressive Chirp 3 HD voices
    const voiceMapping: Record<string, string> = {
      'en-US-friendly_server': 'en-US-Chirp3-HD-Aoede',
      'en-US-warm_welcome': 'en-US-Chirp3-HD-Autonoe',
      'es-ES-friendly_server': 'es-ES-Chirp3-HD-Aoede', // Using Spanish counterpart if available
      'es-ES-warm_welcome': 'es-ES-Chirp3-HD-Aoede'
    };

    let voiceName = isSpanish ? 'es-ES-Chirp3-HD-Aoede' : 'en-US-Chirp3-HD-Aoede';
    if (voice_style) {
        const key = `${targetLang}-${voice_style}`;
        if (voiceMapping[key]) voiceName = voiceMapping[key];
    }

    const request = {
      input: { text: text },
      voice: { 
        name: voiceName,
        languageCode: targetLang 
      },
      audioConfig: { 
        audioEncoding: 'MP3' as const,
        effectsProfileId: ['small-bluetooth-speaker-class-device'] 
      },
    };

    try {
      const [response] = await client.synthesizeSpeech(request);
      
      const hash = crypto.createHash('md5').update(text + voiceName).digest('hex').substring(0, 12);
      const fileName = `menu_${hash}.mp3`;
      
      const targetDir = '/Users/enriq/.gemini/jetski/scratch/fishermans-wharf-menu/public/audio';
      const filePath = path.join(targetDir, fileName);

      await fs.ensureDir(targetDir);
      
      if (response.audioContent) {
        await fs.writeFile(filePath, response.audioContent as Buffer);
        console.log(`[TTS] Saved audio to: ${filePath}`);
      }

      return {
        status: "success",
        audio_url: `/audio/${fileName}`,
        voice_used: voiceName,
        style: voice_style
      };
    } catch (error: any) {
      console.error("[TTS Error]:", error);
      return {
        status: "error",
        message: error.message
      };
    }
  }
} as any);
