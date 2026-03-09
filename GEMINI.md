# Fisherman's Wharf Agent - A2A v0.3 & Registry

## 🚀 Project Overview
This agent project leverages the **Agent Development Kit (ADK)** and the **A2A v0.3 Specification** to coordinate a swarm of specialized dining agents.

### Specialized Agents (Scaffolded)
1. **SectionResearcher**: Uses **MCP (Model Context Protocol)** for live web search via Google. Provides `[RESEARCH_PAYLOAD]`.
2. **CulinaryCritic**: MICHELIN-star persona for menu analysis. Provides `[SCORECARD_A2A]`.
3. **ReportComposer**: Synthesizes all data into a professional Markdown report.

## 📡 A2A v0.3 & Registry Integration
This project explicitly implements the A2A v0.3 standard:
- **Agent Cards**: Each agent has a structured `AgentCard` in `src/agents/`.
- **Discovery**: The `AgentRegistry` (`src/registry.ts`) manages agent discovery via tags and skills.
- **Interoperability**: Agents are designed to pass structured payloads (Research -> Critic -> Composer).

## 🛠️ Commands
- `npm install`: Install dependencies (including `@a2a-js/sdk`).
- `npm run start`: Start the orchestrator demo.
- `npm run dev`: Start in watch mode.

## 📂 Structure
- `src/agents/`: Specialized agent implementations and their A2A Cards.
- `src/registry.ts`: The mock Agent Registry for v0.3 discovery.
- `src/index.ts`: The root orchestrator using ADK's `SequentialAgent`.
