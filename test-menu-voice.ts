import 'dotenv/config';
import { menuGenerationAgent } from './src/agents/menu-generation-agent.js';
import { InMemoryRunner } from '@google/adk';

async function testMenuVoice() {
  console.log("--- Testing Menu Generation Agent with Enthusiastic Chef Voice ---");

  const runner = new InMemoryRunner({
    agent: menuGenerationAgent
  });

  const USER_ID = 'voice-tester';
  const SESSION_ID = 'voice-session-' + Date.now();

  // Ensure session exists
  await runner.sessionService.createSession({
    appName: runner.appName,
    userId: USER_ID,
    sessionId: SESSION_ID
  });

  const stream = runner.runAsync({
    userId: USER_ID,
    sessionId: SESSION_ID,
    newMessage: {
      role: 'user',
      parts: [{ text: "Please generate the menu audio for the Wharf signature dishes. Using friendly server voice style." }]
    }
  });

  for await (const event of stream) {
    if (event.content?.parts) {
      for (const part of event.content.parts) {
        if (part.text) {
          process.stdout.write(part.text);
        }
        if (part.functionCall) {
          console.log(`\n[Calling tool: ${part.functionCall.name} with args: ${JSON.stringify(part.functionCall.args)}]`);
        }
        if (part.functionResponse) {
          console.log(`\n[Tool response: ${JSON.stringify(part.functionResponse.response)}]`);
        }
      }
    }
    if (event.errorMessage) {
      console.error("\nADK Error:", event.errorMessage);
    }
  }
}

testMenuVoice().catch(console.error);
