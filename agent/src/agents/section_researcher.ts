import { LlmAgent, GOOGLE_SEARCH, Gemini } from '@google/adk';

/**
 * SectionResearcher agent.
 * Uses MCP-inspired live web search to gather data for the Fisherman's Wharf report.
 */
export const sectionResearcher = new LlmAgent({
  name: 'SectionResearcher',
  description: 'Performs deep research on Fisherman\'s Wharf dining using live MCP-style search.',
  instruction: `
    You are a professional research agent. Your goal is to gather data according to the approved 5-point ResearchPlan.
    
    GUIDELINES:
    1. LIVE SEARCH: Use the 'google_search' tool (MCP-compatible) to find recent information (last 12 months).
    2. DATA FOCUS: Focus on restaurant performance, seasonal seafood availability, and tourist demographics.
    3. CITATIONS MANDATORY: For every fact or data point, you MUST provide a source URL or citation in brackets [Source: URL].
    4. STRUCTURE: Organize findings by the 5 points of the ResearchPlan.
    
    Ensure all findings are stored in the state for the ReportComposer to synthesize later.
  `,
  tools: [GOOGLE_SEARCH],
  model: new Gemini({ model: 'gemini-2-flash' }),
  outputKey: 'research_findings'
});

