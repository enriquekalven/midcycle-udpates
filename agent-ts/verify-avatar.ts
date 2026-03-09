import { rootAgent } from './src/index.js';
import dotenv from 'dotenv';

dotenv.config();

async function verifyAvatar() {
  console.log("--- Verifying Marketing Avatar Integration & Movement ---");

  const testCases = [
    {
      name: "Greeting in Spanish",
      message: "¡Hola! ¿Quién eres?"
    },
    {
      name: "Asking for Recommendation (Cioppino)",
      message: "Me gustaría probar algo con marisco, ¿qué me recomiendas?"
    },
    {
      name: "Asking about Fish & Chips",
      message: "Tell me about the Fish and Chips."
    }
  ];

  for (const test of testCases) {
    console.log(`\n>>> TEST CASE: ${test.name}`);
    console.log(`Input: "${test.message}"`);

    const result = await rootAgent.runAsync({
      userId: 'test-user',
      sessionData: 'test-session',
      newMessage: {
        role: 'user',
        parts: [{ text: test.message }]
      }
    } as any) as any;

    console.log(`Agent: ${result.agentName || 'unknown'}`);
    
    // Check for tool calls in the history or response
    const toolCalls = result.content?.parts?.filter((p: any) => p.toolCall) || [];
    if (toolCalls.length > 0) {
      console.log("Tool Calls Detected:");
      toolCalls.forEach((tc: any) => {
        console.log(` - ${tc.toolCall.name}: ${JSON.stringify(tc.toolCall.args)}`);
      });
    }

    const responseText = result.content?.parts?.map((p: any) => p.text).join('') || "";
    console.log(`Response: ${responseText}`);
  }
}

verifyAvatar().catch(console.error);
