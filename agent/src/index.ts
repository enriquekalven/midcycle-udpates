import { InMemoryRunner, toStructuredEvents, EventType } from '@google/adk';
export { orchestrator } from './agents/orchestrator.js';
import { orchestrator } from './agents/orchestrator.js';

async function main() {
  const runner = new InMemoryRunner({
    agent: orchestrator,
    appName: 'fishermans-wharf-agent-v2'
  });
  
  const query = "Analyze current dining trends at Fisherman's Wharf, focusing on seasonal seafood and tourist shifts.";
  
  console.log(`\n🚀 Starting Research Project for: "${query}"\n`);
  
  try {
    const events = runner.runEphemeral({
      userId: 'test-user',
      newMessage: { role: 'user', parts: [{ text: query }] }
    });
    
    for await (const event of events) {
      const structuredEvents = toStructuredEvents(event);
      for (const sEvent of structuredEvents) {
        switch (sEvent.type) {
          case EventType.CONTENT:
            process.stdout.write(sEvent.content);
            break;
          case EventType.THOUGHT:
            console.log(`\n[Agent Thought]: ${sEvent.content}\n`);
            break;
          case EventType.TOOL_CALL:
            console.log(`\n[Tool Call]: ${sEvent.call.name}(${JSON.stringify(sEvent.call.args)})\n`);
            break;
          case EventType.TOOL_RESULT:
            console.log(`\n[Tool Result]: ${JSON.stringify(sEvent.result.response).substring(0, 100)}...\n`);
            break;
          case EventType.ERROR:
            console.error('\n[Agent Error]:', sEvent.error, '\n');
            break;
        }
      }
    }
    
    console.log('\n\n✅ --- RESEARCH PIPELINE FINISHED ---');
  } catch (error) {
    console.error('\n❌ Error during execution:', error);
  }
}

main();
