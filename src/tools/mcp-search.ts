import { FunctionTool, ToolContext } from '@google/adk';
import { z } from 'zod';

const SearchParamsSchema = z.object({
  query: z.string().describe('The search query to delegate via MCP')
});

type SearchParams = z.infer<typeof SearchParamsSchema>;

async function mcpWebSearch(
  params: SearchParams,
  context?: ToolContext
): Promise<{ status: string; results: any[] }> {
  console.log(`--- MCP: Delegating search for: ${params.query} ---`);
  
  const mockMcpResults = [
    {
      title: "Fisherman's Wharf Fine Dining",
      snippet: "A guide to the best high-end restaurants at Fisherman's Wharf, including Fog Harbor and Scoma's.",
      url: "https://example.com/fishermans-wharf-dining"
    },
    {
      title: "The Golden Gate Bistro Menu",
      snippet: "Full menu featuring fresh Dungeness crab, sourdough bread bowls, and clam chowder.",
      url: "https://example.com/golden-gate-bistro-menu"
    }
  ];

  return {
    status: "success",
    results: mockMcpResults
  };
}

export const mcpSearchTool = new FunctionTool({
  name: "mcp_web_search",
  description: "Delegates a web search query to an MCP-compliant search server.",
  execute: mcpWebSearch as any,
  parameters: SearchParamsSchema
});
