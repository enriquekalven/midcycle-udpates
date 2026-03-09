# Fisherman's Wharf Agent v2 (Harden & Grounded Version)

A deep research multi-agent system built with Google ADK (TypeScript) and A2A v0.3 spec, focusing on **Fisherman's Wharf dining trends 2026**.

## Features
- **ResearchPlanner**: Hardened logic generates a mandatory **5-point ResearchPlan** for HITL (Human-in-the-Loop) approval before execution.
- **SectionResearcher**: MCP-inspired live research using `google_search` to find real-time data with URL-based **citations**.
- **CulinaryCritic**: Expert AI analysis for menu trends, seafood sustainability, and pricing strategies.
- **ReportComposer**: Advanced synthesis engine that produces a **Grounded Report** where every fact matches a research finding.
- **PDFTool**: Custom TypeScript tool that exports findings into a professional PDF with formatted citations and standard fonts.
- **A2A v0.3 Agent Registry**: Digital business card (`agent-card.json`) served at `.well-known/agent-card.json` for agent discovery.

## Usage & Approval Flow
1. **Plan Generation**: The system starts by listing 5 focus areas for the research.
2. **Mandatory Approval**: The orchestrator checks the plan for completeness (simulated HITL).
3. **Execution**: Researcher and Critic gather and analyze data.
4. **Final Delivery**: ReportComposer synthesizes all data, ensuring in-text citations [1], and calls `PDFTool` for the binary export.

## Development
```bash
# Run local runner demo
npm run dev

# Run server with A2A v0.3 Discovery
npm run start-server
```

## Deployment
This project is configured for **Vertex AI Agent Engine** deployment.
```bash
adk deploy agent_engine --project project-maui --location us-east1
```

---
*Note: Ensure citations are present in both the CLI output and the generated PDF.*
