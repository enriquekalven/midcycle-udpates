import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import fs from 'fs-extra';
import path from 'path';

const MEMORY_FILE = path.join(process.cwd(), 'data/memory_bank.json');

/**
 * Memory Bank Tool
 * Allows the agent to persistently store and retrieve key facts about the user or session.
 * Optimizes reasoning by reducing the need for repetitive grounding calls.
 */
export const memoryBankTool = new FunctionTool({
  name: "memory_bank",
  description: "A persistent memory store for the agent. Use this to save important facts, user preferences, or session context that should persist across multiple turns. It also simulates 'context caching' by providing a fast lookup of previously retrieved data.",
  parameters: z.object({
    action: z.enum(['save', 'retrieve', 'clear']).describe("The action to perform on the memory bank."),
    key: z.string().optional().describe("The name of the fact or preference to save/retrieve."),
    value: z.string().optional().describe("The content of the fact or preference to save.")
  }),
  async execute({ action, key, value }: any) {
    await fs.ensureDir(path.dirname(MEMORY_FILE));
    let memory: any = {};
    if (await fs.pathExists(MEMORY_FILE)) {
      memory = await fs.readJson(MEMORY_FILE);
    }

    if (action === 'save' && key && value) {
      memory[key] = {
        content: value,
        timestamp: new Date().toISOString()
      };
      await fs.writeJson(MEMORY_FILE, memory, { spaces: 2 });
      return { status: "success", message: `Saved ${key} to memory bank.` };
    }

    if (action === 'retrieve') {
      if (key) {
        return { status: "success", data: memory[key] || "Key not found in memory." };
      }
      return { status: "success", data: memory };
    }

    if (action === 'clear') {
      await fs.remove(MEMORY_FILE);
      return { status: "success", message: "Memory bank cleared." };
    }

    return { status: "error", message: "Invalid action or missing parameters." };
  }
} as any);
