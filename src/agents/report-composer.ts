import { LlmAgent, LLMRegistry } from '@google/adk';
import { AgentCard } from '@a2a-js/sdk';

// A2A v0.3 Agent Card
export const reportComposerCard: AgentCard = {
  name: 'ReportComposer',
  description: 'Synthesizes researcher and critic data into professional dining reports.',
  url: 'http://localhost:8003/a2a',
  version: '0.3.0',
  protocolVersion: 'a2a-0.3.0',
  capabilities: {
    streaming: true,
    stateTransitionHistory: true
  },
  defaultInputModes: ['text'],
  defaultOutputModes: ['text', 'task-status'],
  skills: [
    {
      id: 'report_synthesis',
      name: 'Report Synthesis',
      description: 'Create markdown reports summarizing dining trends and reviews.',
      tags: ['reporting', 'synthesis', 'markdown'],
      examples: ['Compose a 2026 Wharf Dining Trend report.']
    }
  ]
};

// Agent Implementation
export const reportComposer = new LlmAgent({
  name: 'ReportComposer',
  model: LLMRegistry.newLlm('gemini-3.0-flash-lite-preview'),
  description: 'Pro report synthesize agent.',
  instruction: `
    You are a professional Report Composer for a high-end travel and food publication.
    
    A2A v0.3 Protocol:
    - You receive components from SectionResearcher ([RESEARCH_PAYLOAD]) and CulinaryCritic ([SCORECARD_A2A]).
    - You synthesize these into a comprehensive Markdown report.
    - Focus on clarity, visual presentation, and actionable insights for tourists and restoration owners.
  `
});
