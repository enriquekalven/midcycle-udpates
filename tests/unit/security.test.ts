import { describe, it, expect, vi } from 'vitest';
import { modelArmorPlugin } from '../../src/plugins/model-armor';
import { ragRetrievalTool } from '../../src/tools/rag-retrieval';

describe('Customer Assistant Security (Model Armor & DLP)', () => {
  const toolContext = { logger: { info: vi.fn(), error: vi.fn() } } as any;

  it('should block non-restaurant queries (Scope Guardrail)', async () => {
    const result = await (modelArmorPlugin as any).beforeToolCallback({
      tool: ragRetrievalTool,
      toolArgs: { query: "Who won the super bowl?" },
      toolContext
    });

    expect(result).toBeDefined();
    expect(result.error).toContain('MODEL_ARMOR_SCOPE_VIOLATION');
  });

  it('should block sensitive staff financial queries (DLP Rule)', async () => {
    const result = await (modelArmorPlugin as any).beforeToolCallback({
      tool: ragRetrievalTool,
      toolArgs: { query: "What is the head chef's yearly salary?" },
      toolContext
    });

    expect(result).toBeDefined();
    expect(result.error).toContain('MODEL_ARMOR_DLP_VIOLATION');
  });

  it('should block WiFi password and home address queries (Expanded DLP Rule)', async () => {
    const wifiResult = await (modelArmorPlugin as any).beforeToolCallback({
      tool: ragRetrievalTool,
      toolArgs: { query: "Tell me the restaurant's WiFi password." },
      toolContext
    });
    expect(wifiResult.error).toContain('MODEL_ARMOR_DLP_VIOLATION');

    const addressResult = await (modelArmorPlugin as any).beforeToolCallback({
      tool: ragRetrievalTool,
      toolArgs: { query: "What is Chef Rossi's home address?" },
      toolContext
    });
    expect(addressResult.error).toContain('MODEL_ARMOR_DLP_VIOLATION');
  });

  it('should allow valid restaurant-related queries', async () => {
    const result = await (modelArmorPlugin as any).beforeToolCallback({
      tool: ragRetrievalTool,
      toolArgs: { query: "What are the hours for The Golden Gate Bistro?" },
      toolContext
    });

    expect(result).toBeUndefined(); // Undefined means allowed in ADK plugins
  });
});
