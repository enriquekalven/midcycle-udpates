import { marketingAvatarAgent } from './src/agents/marketing-avatar.js';
import dotenv from 'dotenv';

dotenv.config();

async function simulateConversation() {
  console.log("--- SIMULATING ENHANCED GESTURE & GREETING FLOW (Gemini 2.5 Flash) ---");

  const conversation = [
    {
      name: "Initial Greeting (Spanish)",
      message: "¡Hola! ¿Qué tal?"
    },
    {
      name: "Asking for something hot and seafood-rich",
      message: "Tengo mucho frío, ¿qué me recomiendas que tenga marisco y esté caliente?"
    },
    {
      name: "Closing Interaction",
      message: "Gracias, suena delicioso. ¡Hasta luego!"
    }
  ];

  for (const turn of conversation) {
    console.log(`\n\x1b[36m>>> TURN: ${turn.name}\x1b[0m`);
    console.log(`User: "${turn.message}"`);

    const result = await (marketingAvatarAgent as any).runAsync({
      userId: 'sim-user-1',
      sessionData: 'sim-session-1',
      newMessage: {
        role: 'user',
        parts: [{ text: turn.message }]
      }
    });

    // Extracting response text
    const responseText = result.content?.parts?.map((p: any) => p.text).join('') || "";
    console.log(`\x1b[32mAvatar:\x1b[0m "${responseText}"`);

    // Extracting tool calls (Movements)
    const toolCalls = result.content?.parts?.filter((p: any) => p.toolCall) || [];
    if (toolCalls.length > 0) {
      console.log("\x1b[33m[Gestures Triggered]:\x1b[0m");
      toolCalls.forEach((tc: any) => {
        console.log(` - ${tc.toolCall.name}: ${JSON.stringify(tc.toolCall.args)}`);
      });
    }
  }
  
  console.log("\n--- Simulation Complete ---");
}

simulateConversation().catch(err => {
  console.error("Simulation failed:", err);
});
