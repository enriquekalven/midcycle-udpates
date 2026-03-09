import 'dotenv/config';
import { LlmAgent, LLMRegistry, SequentialAgent, AgentTool } from '@google/adk';
import { AgentRegistry } from './registry.js';
import { sectionResearcher } from './agents/section-researcher.js';
import { culinaryCritic } from './agents/culinary-critic.js';
import { reportComposer } from './agents/report-composer.js';

// Initialize Discovery
await AgentRegistry.initialize();

// Root Orchestrator
export const rootAgent = new LlmAgent({
  name: 'fishermans_wharf_master',
  model: LLMRegistry.newLlm('gemini-3.0-flash-lite-preview'),
  description: 'Master orchestrator for Fisherman\'s Wharf Deep Research.',
  instruction: `
    You are the Master Concierge for Fisherman's Wharf.
    Your task is to orchestrate a multi-agent research mission using discovered specialized agents.
    
    A2A v0.3 & Registry Discovery:
    1. You have access to specialized agents discovered via the Agent Registry.
    2. When the user asks for deep research:
       - Use 'SectionResearcher' for live web data.
       - Use 'CulinaryCritic' for menu and food quality analysis.
       - Use 'ReportComposer' to synthesize the result.
       
    Workflow:
    - Discovery: Verify agents are available in the registry.
    - Delegation: Use the 'research_pipeline' to execute the sequence.
  `,
  subAgents: [
    new SequentialAgent({
      name: 'research_pipeline',
      description: 'The standard sequential flow for dining research.',
      subAgents: [sectionResearcher, culinaryCritic, reportComposer]
    })
  ]
});

// Demo Run Logic
async function main() {
  console.log('--- Fisherman\'s Wharf A2A v0.3 Agent System ---');
  
  // Example Discovery Check
  const researchers = AgentRegistry.discoverByTag('research');
  console.log(`[Discovery] Found ${researchers.length} research agents:`, researchers.map(r => r.name));
  
  console.log('\nReady for requests. Example: "Research the current seafood trends and menu innovation at Fisherman\'s Wharf for 2026."');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
