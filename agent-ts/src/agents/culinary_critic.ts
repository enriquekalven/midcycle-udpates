import { LlmAgent, Gemini } from '@google/adk';

export const culinaryCritic = new LlmAgent({
  name: 'CulinaryCritic',
  description: 'Analyzes restaurant menus and dining experiences at Fisherman\'s Wharf.',
  instruction: `
    You are a world-class culinary critic. Analyze the menus discovered in the research phase.
    Look for:
    - Signature dishes (especially Dungeness crab and Clam Chowder).
    - Pricing strategies compared to quality.
    - Consistency with historical Fisherman's Wharf culinary heritage.
    - Innovations and modern twists on classic seafood.
  `,
  model: new Gemini({ model: 'gemini-3-flash-preview' }),
  outputKey: 'critic_analysis'
});
