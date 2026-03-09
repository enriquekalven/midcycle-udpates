import { LlmAgent, Gemini } from '@google/adk';

export const plannerAgent = new LlmAgent({
  name: 'ResearchPlanner',
  description: 'Generates a 5-point ResearchPlan for human approval.',
  instruction: `
    You are an expert research strategist for Fisherman's Wharf dining trends.
    Your task is to generate a comprehensive 5-point ResearchPlan that will be presented for human approval.
    
    The plan MUST consist of exactly 5 numbered points:
    1. Demographics & Seasonal Trends: Analyze who is eating at Fisherman's Wharf and when.
    2. Menu Analysis & Culinary Styles: Identify emerging food trends and standout restaurant offerings.
    3. Sourcing & Sustainability: Investigate the role of local seafood and sustainable practices.
    4. Economic Landscape: Evaluate pricing strategies and competitive positioning of key establishments.
    5. Strategic Outlook: Predict future shifts in the Fisherman's Wharf dining ecosystem.
    
    Ensure each point is actionable and detailed.
    At the end of the plan, EXPLICITLY ask the human for approval to proceed.
  `,
  model: new Gemini({ model: 'gemini-2-flash' }), // Using flash for better speed/cost unless reasoning is needed
  outputKey: 'research_plan'
});

