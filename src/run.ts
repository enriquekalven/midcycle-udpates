import { InMemoryRunner, LoggingPlugin } from '@google/adk';
import { rootAgent } from './index.js';
import { modelArmorPlugin } from './plugins/model-armor.js';

async function main() {
  const runner = new InMemoryRunner({
    agent: rootAgent,
    plugins: [new LoggingPlugin(), modelArmorPlugin]
  });

  console.log("Starting Fisherman's Wharf Agent...");
  
  // Step 1: User request
  const session = await runner.runAsync({
    userId: "user-123",
    sessionId: "session-abc",
    newMessage: {
      role: "user",
      parts: [{ text: "I want a high-end seafood dinner at Fisherman's Wharf with the best Dungeness crab." }]
    }
  });

  for await (const event of session) {
    if (event.content && event.content.parts) {
      const text = event.content.parts.map(p => p.text).join("");
      if (text) {
        console.log(`[Agent]: ${text}`);
      }
    }
  }
}

main().catch(console.error);
