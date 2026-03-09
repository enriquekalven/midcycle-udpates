import { LlmAgent, LLMRegistry, GOOGLE_SEARCH } from '@google/adk';
import { AgentCard } from '@a2a-js/sdk';

/**
 * @A2A_v0.3_AgentCard
 */
export const sectionResearcherCard: AgentCard = {
  name: 'SectionResearcher',
  description: 'Performs deep web research on specific dining trends, focusing on Fisherman\'s Wharf.',
  url: 'http://localhost:8001/a2a',
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
      id: 'web_research',
      name: 'Web Research',
      description: 'Search the live web for restaurant data, trends, and reviews.',
      tags: ['research', 'web-search', 'fishermans-wharf'],
      examples: ['What are the latest seafood trends at Pier 39?', 'Find reviews for Scoma\'s Restaurant.']
    }
  ]
};

// Agent Implementation
export const sectionResearcher = new LlmAgent({
  name: 'SectionResearcher',
  model: LLMRegistry.newLlm('gemini-3.0-flash-lite-preview'),
  description: 'Expert web researcher for San Francisco dining.',
  instruction: `
    You are an elite Research Specialist focusing on the San Francisco Fisherman's Wharf area.
    Your goal is to provide deep, fact-based research on restaurant trends, tourist preferences, and seafood sourcing.
    
    A2A v0.3 Protocol:
    - You receive research queries.
    - You MUST use the google_search tool to find the latest information.
    - Format your output as a [RESEARCH_PAYLOAD] for the CulinaryCritic or ReportComposer.
  `,
  tools: [GOOGLE_SEARCH]
});
