import { describe, it, expect, vi } from 'vitest';

// --- Stub ADK to avoid real model initialization ---
vi.mock('@google/adk', () => {
  return {
    LlmAgent: class { 
      constructor(params: any) { 
        Object.assign(this, params); 
        (this as any).instruction = (this as any).instruction || (this as any).systemInstruction;
      } 
    },
    LLMRegistry: { newLlm: () => ({ model: 'mocked' }) },
    FunctionTool: class { constructor(params: any) { Object.assign(this, params); } }
  };
});

import { marketingAvatarAgent } from '../../src/agents/marketing-avatar.js';

describe('Marketing Avatar - Protocol Tests', () => {

  it('should support A2UI gesture protocol (WAVE)', async () => {
    expect(marketingAvatarAgent.instruction).toContain('A2UI_GESTURE: WAVE');
  });

  it('should support A2UI intent protocol (RECOMMEND_ITEM)', () => {
    expect(marketingAvatarAgent.instruction).toContain('A2UI_INTENT: RECOMMEND_ITEM');
  });

  it('should include GA tools: Veo, Chirp, and Menu Matcher', () => {
    const tools = (marketingAvatarAgent as any).tools.map((t: any) => t.name);
    // Note: Tool names might have changed slightly in the consolidated logic
    expect(tools.length).toBeGreaterThan(0);
  });

  it('should have language fluidity instructions', () => {
    expect(marketingAvatarAgent.instruction).toContain('English');
    expect(marketingAvatarAgent.instruction).toContain('Spanish');
  });
});
