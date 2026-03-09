import { FunctionTool, ToolContext } from '@google/adk';
import { z } from 'zod';

const MenuMatchSchema = z.object({
  userSpeech: z.string().describe('The transcribed user text to match against the menu.'),
});

type MenuMatchParams = z.infer<typeof MenuMatchSchema>;

const MENU_DATA = [
  { id: "1", name: "Signature Wharf Sourdough Chowder", keywords: ["chowder", "sourdough", "soup", "clams"] },
  { id: "2", name: "Dungeness Crab Deviled Eggs", keywords: ["crab", "eggs", "deviled"] },
  { id: "3", name: "The Wharf Cioppino", keywords: ["cioppino", "seafood stew", "stew", "guiso"] },
  { id: "4", name: "Anchor Steam Fish & Chips", keywords: ["fish and chips", "fish", "chips", "fries"] },
  { id: "5", name: "Ghirardelli Bread Pudding", keywords: ["bread pudding", "dessert", "chocolate", "ghirardelli"] },
];

async function matchMenuItem(
  params: MenuMatchParams,
  context?: ToolContext
): Promise<{ matchedItem: any | null; confidence: number }> {
  const text = params.userSpeech.toLowerCase();
  
  let bestMatch = null;
  let maxScore = 0;

  for (const item of MENU_DATA) {
    let score = 0;
    if (text.includes(item.name.toLowerCase())) score += 10;
    for (const kw of item.keywords) {
      if (text.includes(kw.toLowerCase())) score += 5;
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  return {
    matchedItem: bestMatch,
    confidence: maxScore > 0 ? 0.9 : 0
  };
}

export const menuMatcherTool = new FunctionTool({
  name: "match_menu_item",
  description: "Intelligently matches user speech/text to specific items on the Golden Gate Bistro menu.",
  execute: matchMenuItem as any,
  parameters: MenuMatchSchema as any,
});
