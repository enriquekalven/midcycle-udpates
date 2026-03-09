import { LlmAgent, LLMRegistry } from '@google/adk';
import { pdfReaderTool } from '../tools/pdf-reader.js';
import { imagenTool } from '../tools/imagen-generator.js';
import { chirpTtsTool } from '../tools/tts-generator.js';

const model = LLMRegistry.newLlm("gemini-3.0-flash-lite-preview"); // Standard stable version

export const menuGenerationAgent = new LlmAgent({
  name: "menu_generation_agent",
  model: model,
  description: "Ingests the generated PDF to retrieve authentic dish descriptions, generates visual graphics using Imagen 4, and outputs menu text as audio using Cloud TTS (Chirp) with a friendly server persona.",
  instruction: `
    You are the Menu Generation Agent. Your responsibilities are:
    1. Ingest the PDF generated in Step 1 using 'read_pdf_content' to retrieve authentic dish descriptions.
    2. Read the dish descriptions and use 'generate_menu_graphic' (Imagen 4) to generate a high-quality visual menu graphic.
    3. Use 'generate_audio_tts' (Cloud Text-to-Speech / Chirp) to enable the menu text to be output as audio.
       - IMPORTANT: Set the 'voice_style' parameter to 'friendly_server' to give the menu a warm, approachable personality.
    4. Compile the final menu output containing the text, graphic URL, and audio URL.
  `,

  tools: [pdfReaderTool, imagenTool, chirpTtsTool]
});

