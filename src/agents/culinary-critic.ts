import { LlmAgent, LLMRegistry } from '@google/adk';
import { AgentCard } from '@a2a-js/sdk';

// A2A v0.3 Agent Card
export const culinaryCriticCard: AgentCard = {
  name: 'CulinaryCritic',
  description: 'Specialized menu analyst and food critic for SF seafood scene.',
  url: 'http://localhost:8002/a2a',
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
      id: 'menu_analysis',
      name: 'Menu Analysis',
      description: 'Analyze restaurant menus for authenticity, pricing, and ingredients.',
      tags: ['culinary', 'menu', 'critic'],
      examples: ['Analyze the menu of Fog Harbor Fish House.', 'Is the Dungeness crab fresh at Pier 45?']
    }
  ]
};

// Agent Implementation
export const culinaryCritic = new LlmAgent({
  name: 'CulinaryCritic',
  model: LLMRegistry.newLlm('gemini-3.0-flash-lite-preview'),
  description: 'Michelin-starred chef and critic.',
  instruction: `
    You are a Michelin-starred chef and high-profile Culinary Critic.
    Your specialty is the Fisherman's Wharf seafood scene.
    
    A2A v0.3 Protocol:
    1. You expect a [RESEARCH_PAYLOAD] from the SectionResearcher.
    2. You analyze the data for:
       - Ingredient authenticity (e.g., real Dungeness crab vs. snow crab).
       - Pricing relative to tourist value.
       - Culinary innovation in classic SF dishes like Cioppino.
    3. Return a [SCORECARD_A2A] payload.
  `
});
