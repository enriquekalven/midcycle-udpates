import os
import google.auth
from google.adk.agents import Agent, LlmAgent, SequentialAgent, ParallelAgent
from google.adk.apps import App
from google.adk.models import Gemini
from google.genai import types

# 1. Environment & Auth
_, project_id = google.auth.default()
os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

# 2. Models
# Using Gemini 1.5 Flash for production stability in Agent Engine
model = Gemini(
    model="gemini-1.5-flash",
    retry_options=types.HttpRetryOptions(attempts=3),
)

# 3. Tools
def mcp_web_search(query: str) -> dict:
    """Delegates a web search query to an MCP-compliant search server.
    
    Args:
        query: The search query to delegate via MCP.
    """
    print(f"--- MCP: Delegating search for: {query} ---")
    return {
        "status": "success",
        "results": [
            {
                "title": "Fisherman's Wharf Fine Dining",
                "snippet": "A guide to the best high-end restaurants at Fisherman's Wharf.",
                "url": "https://example.com/fishermans-wharf-dining"
            }
        ]
    }

def generate_multimodal_pdf(report_text: str) -> dict:
    """Converts the final report into a multimodal PDF.
    
    Args:
        report_text: The markdown text to convert to PDF.
    """
    return {
        "status": "success",
        "pdf_url": "https://storage.googleapis.com/reports/fishermans-wharf-report.pdf"
    }

def retrieve_restaurant_data(query: str) -> str:
    """Retrieves grounded restaurant data from the research report.
    
    Args:
        query: The topic or dish to look up.
    """
    return f"Grounded data match for {query}: The Golden Gate Bistro offers Dungeness Crab at $38.50 and Sourdough Chowder at $14.00."

def generate_avatar_video(gesture: str) -> dict:
    """Coordinates avatar movements (wave, point, present) via Veo.
    
    Args:
        gesture: The motion to perform (wave, point_left, point_right, present).
    """
    return {"status": "success", "motion": gesture}

# 5. A2A Protocol Handlers
def a2a_handoff(source: str, target: str, payload: dict) -> dict:
    """Standardized A2A Protocol for inter-agent communication."""
    print(f"[A2A_PROTOCOL] Handoff: {source} -> {target}")
    return {"protocol": "A2A_v1", "metadata": payload}

# 6. Deep Research Agents (A2A Enhanced)
plan_generator = LlmAgent(
    name="plan_generator",
    model=model,
    description="Generates a 5-point research plan with A2A metadata.",
    instruction="""
        You are a Research Architect. 
        A2A RULE: Your output must include a [HANDOFF_READY] flag when the plan is finalized for the Orchestrator.
        Focus on Fisherman's Wharf restaurants and seafood quality.
        Prefix each line with [RESEARCH].
    """,
    tools=[mcp_web_search]
)

culinary_agent = LlmAgent(
    name="culinary_agent",
    model=model,
    description="Analyzes seafood quality via A2A protocol.",
    instruction="""
        A2A RULE: You accept [RESEARCH_PAYLOAD] from the SectionResearcher.
        Evaluate the culinary quality and return a [SCORECARD_A2A] payload to the Composer.
    """
)

section_researcher = LlmAgent(
    name="section_researcher",
    model=model,
    description="Performs web research on Fisherman's Wharf.",
    instruction="Research specialties at Fisherman's Wharf using web search.",
    tools=[mcp_web_search]
)

report_composer = LlmAgent(
    name="report_composer",
    model=model,
    description="Synthesizes research into a final report.",
    instruction="Combine research and culinary analysis into a professional Markdown report."
)

pdf_producer = LlmAgent(
    name="pdf_producer",
    model=model,
    description="Generates PDF from report.",
    instruction="Convert the final report into a PDF.",
    tools=[generate_multimodal_pdf]
)

research_pipeline = SequentialAgent(
    name="research_pipeline",
    description="Executes the full research and analysis flow.",
    sub_agents=[
        ParallelAgent(
            name="research_and_analysis",
            sub_agents=[section_researcher, culinary_agent]
        ),
        report_composer,
        pdf_producer
    ]
)

# 7. Production Agents (A2UI Enhanced)
customer_assistant = LlmAgent(
    name="customer_assistant",
    model=model,
    description="A friendly chatbot using A2UI protocol.",
    instruction="""
        You are the Fisherman's Wharf Customer Assistant.
        A2UI PROTOCOL: For any location query, trigger [A2UI: SHOW_MAP]. 
        For any price query, trigger [A2UI: HIGHLIGHT_MENU_ITEM].
        SECURITY: NEVER disclose staff salaries. State "A2UI_SECURITY_BLOCK: DLP Violation."
    """,
    tools=[retrieve_restaurant_data]
)

marketing_avatar = LlmAgent(
    name="golden_gate_concierge",
    model=model,
    description="Digital human using A2UI/Multimodal protocol.",
    instruction="""
        You are the "Golden Gate Concierge."
        A2UI PROTOCOL: 
        1. When welcoming, trigger [A2UI_GESTURE: WAVE].
        2. When discussing a dish, trigger [A2UI_INTENT: RECOMMEND_ITEM, id: {id}].
        3. Maintain A2A heartbeat with the CustomerAssistant to share context.
    """,
    tools=[generate_avatar_video, retrieve_restaurant_data]
)

# 6. Root Orchestrator
root_agent = LlmAgent(
    name="fishermans_wharf_orchestrator",
    model=model,
    description="Primary orchestrator for Fisherman's Wharf research.",
    instruction="""
        You are the head concierge for Fisherman's Wharf.
        1. Greet the user warmly as the head concierge.
        2. Propose a research plan using 'plan_generator'.
        3. Wait for user approval before delegating to 'research_pipeline'.
    """,
    sub_agents=[research_pipeline, plan_generator, customer_assistant, marketing_avatar]
)

app = App(
    root_agent=root_agent,
    name="fishermans_wharf_agent"
)
