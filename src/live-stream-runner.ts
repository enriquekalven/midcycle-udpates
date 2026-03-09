import { marketingAvatarAgent } from "./agents/marketing-avatar.js";
import dotenv from 'dotenv';


dotenv.config();

/**
 * Multimodal Live API Runner for Marketing Avatar
 * 
 * This script demonstrates the integration of the Marketing Avatar with 
 * Gemini's real-time bidirectional audio/video streaming.
 */
async function runMarketingAvatarLive() {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || "";
  
  console.log("--- Initializing Marketing Avatar Live Session ---");
  console.log(`Agent: ${marketingAvatarAgent.name}`);
  console.log("Guardrails: Model Armor & DLP Enabled");

  // Simulating a real-time interaction
  const simulatedConversation = [
    { role: 'user', text: "¡Hola! ¿Qué me recomiendas para cenar?" },
    { role: 'user', text: "I'd like to try the Cioppino." }
  ];

  for (const turn of simulatedConversation) {
    console.log(`\n[User Speech]: "${turn.text}"`);
    
    // In a real live session, the agent would process this via the Multimodal Live API.
    // For this simulation, we'll run the agent explicitly to show tool orchestration.
    
    const result = await (marketingAvatarAgent as any).runAsync({
      userId: 'live-session-123',
      sessionData: 'multimodal-stream',
      newMessage: {
        role: 'user',
        parts: [{ text: turn.text }]
      }
    });

    const responseText = result.content?.parts?.map((p: any) => p.text).join('') || "";
    console.log(`[Avatar Output]: "${responseText}"`);

    // Check for movement tool calls in the result
    const toolCalls = result.content?.parts?.filter((p: any) => p.toolCall) || [];
    toolCalls.forEach((tc: any) => {
      console.log(`[Veo 3 Movement Triggered]: ${tc.toolCall.name} -> ${JSON.stringify(tc.toolCall.args)}`);
    });
  }
}


// Only run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMarketingAvatarLive().catch(console.error);
}

export { runMarketingAvatarLive };
