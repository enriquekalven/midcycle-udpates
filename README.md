# Fisherman's Wharf Marketing Agent

This project implements a multi-agent AI system for a restaurant chain expanding to Fisherman's Wharf, San Francisco. It demonstrates advanced GenAI capabilities including deep research, multimodal menu generation, and a secure, grounded customer assistant.

## AI Agent Capabilities

### 🛡️ Customer AI Assistant (Chatbot)
The Customer Assistant is powered by **Gemini 2.5 Flash** and is strictly grounded in restaurant documentation via **RAG (Retrieval-Augmented Generation)**. It features a robust **Model Armor** security layer to enforce scope and protect sensitive data.

#### ✅ Questions That WILL Return (Grounded Info)
These questions are answered using the `retrieve_restaurant_data` tool, which is grounded in the Step 1 PDF report:

*   **Menu & Pricing**: "What is on the menu?", "How much does the Cioppino cost?", "Do you have any crab dishes?"
*   **Recommendations**: "What is the best dish for a tourist?", "What would you recommend for dinner?"
*   **Logistics**: "Where is The Golden Gate Bistro located?", "What are your opening hours?", "Do you take reservations for Pier 39?"
*   **Public Staff Info**: "Who is the executive chef?" (The bot will identify Marco Rossi from the grounded data).
*   **Bilingual**: All the above questions work in Spanish (e.g., "¿A qué hora cierran?").

#### ❌ Questions That WILL Be Blocked (DLP & Scope)
These are intercepted by our Model Armor Plugin before the model even processes them, or caught by the agent's internal scope rules:

*   **DLP (Data Leak Prevention)**: ANY question about staff pay will be blocked with a `MODEL_ARMOR_DLP_VIOLATION`.
    *   *Example*: "What is the head chef's salary?", "How much do your servers make?", "What is the annual compensation for staff?"
*   **Scope Guardrails**: Any non-restaurant or non-Wharf topics are blocked to prevent the bot from being used as a general-purpose AI.
    *   *Example*: "What is the current price of Bitcoin?", "Who won the Super Bowl?", "What is the weather in New York?"
*   **Unrelated Research**: "Can you help me with my math homework?" or "What are the best hiking trails in LA?" (The bot will politely refocus the user on Fisherman's Wharf dining).

### 🎙️ Marketing Avatar (Digital Human)
A photorealistic avatar powered by **Veo 3** and **Chirp TTS** for high-fidelity movement and speech.
*   **Visual Guidance**: The avatar physically indicates menu items on the digital menu using its pointing and indicator actions.
*   **7 Voice Personas**: Support for specific tones including Fisherman, Gourmet, and Historian in both English and Spanish.

## Getting Started

### Prerequisites
- Node.js 18+
- Google Cloud Project (`project-maui`)

### Installation & Build
```bash
npm install
npm run build
```

### Testing & Verification
```bash
npm run test           # Executes 23+ unit tests for tools and agents
npm run simulate-convo # Simulates a multimodal interaction
```
