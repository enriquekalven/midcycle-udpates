import 'dotenv/config';
import { customerAssistantAgent } from './agents/customer-assistant.js';
import { InMemoryRunner, StreamingMode } from '@google/adk';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const runner = new InMemoryRunner({
  agent: customerAssistantAgent
});

const USER_ID = 'local-tester';
const SESSION_ID = 'local-session-123';

async function main() {
  // Ensure session exists
  await runner.sessionService.createSession({
    appName: runner.appName,
    userId: USER_ID,
    sessionId: SESSION_ID
  });

  console.log("\x1b[36m--- Fisherman's Wharf Customer Assistant Local Test ---\x1b[0m");
  console.log("Type your message to chat with the agent. Type 'exit' to quit.\n");

  const askQuestion = () => {
    rl.question('\x1b[32mUser:\x1b[0m ', async (input) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        return;
      }

      try {
        const stream = runner.runAsync({
          userId: USER_ID,
          sessionId: SESSION_ID,
          newMessage: {
            role: 'user',
            parts: [{ text: input }]
          },
          runConfig: {
            streamingMode: StreamingMode.SSE
          }
        });

        process.stdout.write('\x1b[33mAssistant:\x1b[0m ');
        
        for await (const event of stream) {
          if (event.errorCode) {
            process.stdout.write(`\n\x1b[31m[ADK Error ${event.errorCode}]: ${event.errorMessage}\x1b[0m\n`);
          }
          if (event.content?.parts) {
            for (const part of event.content.parts) {
              if (part.text) {
                process.stdout.write(part.text);
              }
              if (part.functionCall) {
                process.stdout.write(`\n\x1b[90m[Calling tool: ${part.functionCall.name}...]\x1b[0m\n`);
              }
              if (part.functionResponse) {
                process.stdout.write(`\n\x1b[90m[Tool ${part.functionResponse.name} response received]\x1b[0m\n`);
              }
            }
          }
        }
        process.stdout.write('\n\n');
      } catch (error) {
        console.error('\x1b[31mError during runAsync:\x1b[0m', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);
