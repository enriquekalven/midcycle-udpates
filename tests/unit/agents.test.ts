import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Global Vitest Mocks for ADK ---
vi.mock('@google/adk', () => {
  return {
    LlmAgent: class { 
      constructor(params: any) { 
        Object.assign(this, params); 
        // Normalize instructions for tests
        (this as any).instruction = (this as any).instruction || (this as any).systemInstruction;
      }
      runAsync = vi.fn();
    },
    SequentialAgent: class { constructor(params: any) { Object.assign(this, params); } },
    ParallelAgent: class { constructor(params: any) { Object.assign(this, params); } },
    AgentTool: class { constructor(params: any) { Object.assign(this, params); } },
    LLMRegistry: {
      newLlm: vi.fn().mockReturnValue({ model: 'mocked' })
    },
    SecurityPlugin: class { constructor(params: any) { Object.assign(this, params); } },
    FunctionTool: class { constructor(params: any) { Object.assign(this, params); } }
  };
});

import { marketingAvatarAgent } from '../../src/agents/marketing-avatar.js';
import { customerAssistantAgent } from '../../src/agents/customer-assistant.js';
import { culinaryAgent } from '../../src/agents/culinary-agent.js';
import { menuGenerationAgent } from '../../src/agents/menu-generation-agent.js';

describe('Fisherman\'s Wharf Agents - Structural Verification', () => {
  
  describe('marketingAvatarAgent', () => {
    it('should be defined with A2UI protocol and visual guidance', () => {
      expect(marketingAvatarAgent).toBeDefined();
      expect(marketingAvatarAgent.instruction).toContain('A2UI_GESTURE: WAVE');
      expect(marketingAvatarAgent.instruction).toContain('A2UI_INTENT: RECOMMEND_ITEM');
    });

    it('should have the expected tools registered', () => {
      const toolNames = (marketingAvatarAgent as any).tools.map((t: any) => t.name);
      expect(toolNames).toContain('generate_avatar_movement');
    });

  });

  describe('customerAssistantAgent', () => {
    it('should be defined with A2UI protocol and grounding rules', () => {
      expect(customerAssistantAgent).toBeDefined();
      expect(customerAssistantAgent.name).toBe('customer_assistant');
      expect(customerAssistantAgent.instruction).toContain('A2UI: SHOW_MAP');
      expect(customerAssistantAgent.instruction).toContain('A2UI: HIGHLIGHT_MENU_ITEM');
    });
  });

  describe('culinaryAgent', () => {
    it('should be defined with A2A protocol', () => {
      expect(culinaryAgent).toBeDefined();
      expect(culinaryAgent.name).toBe('culinary_agent');
      expect(culinaryAgent.instruction).toContain('A2A PROTOCOL');
      expect(culinaryAgent.instruction).toContain('[SCORECARD_A2A]');
    });
  });

  describe('menuGenerationAgent', () => {
    it('should be defined with PDF, Imagen, and TTS tools', () => {
      expect(menuGenerationAgent).toBeDefined();
      expect(menuGenerationAgent.name).toBe('menu_generation_agent');
      const toolNames = (menuGenerationAgent as any).tools.map((t: any) => t.name);
      expect(toolNames).toContain('read_pdf_content');
      expect(toolNames).toContain('generate_menu_graphic');
      expect(toolNames).toContain('generate_audio_tts');
    });
  });
});
