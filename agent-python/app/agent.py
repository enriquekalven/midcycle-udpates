import os
import google.auth
from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import Gemini
from google.adk.tools import google_search, get_user_choice

# 1. Environment & Auth
try:
    _, project_id = google.auth.default()
    os.environ["GOOGLE_CLOUD_PROJECT"] = project_id
except Exception:
    pass

os.environ["GOOGLE_CLOUD_LOCATION"] = "us-central1"
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"

# 2. Models
model = Gemini(model="gemini-2.5-flash") 

# 3. Tools
def generate_pdf_report(content: str, citations: list[str] = None) -> str:
    """Generates a summary of the report.
    
    Args:
        content: The synthesized report content.
        citations: List of citations to include.
    """
    return f"Report content received. Length: {len(content)} characters."

# 4. Agents
planner_agent = LlmAgent(
    name="ResearchPlanner",
    description="Creates a structured research plan for Fisherman's Wharf dining trends and requests approval.",
    instruction="""
        You are a Research Architect. 
        1. Generate a 5-step plan to analyze dining trends at Fisherman's Wharf. 
           Focus on seafood quality and footfall.
        2. After generating the plan as text, you MUST call 'get_user_choice' with 
           options=['Approve', 'Reject'] to ask for user approval before 
           completing your task.
        3. Once the user approves (the tool returns 'Approve'), summarize 
           the plan and finish.
    """,
    tools=[get_user_choice],
    model=model,
    output_key="research_plan"
)

section_researcher = LlmAgent(
    name="SectionResearcher",
    description="Performs deep research on Fisherman's Wharf dining using live search.",
    instruction="""
        You are a professional researcher. Use live search to find current information about 
        dining trends at Fisherman's Wharf. Focus on data from the last 6-12 months.
        Provide citations.
    """,
    tools=[google_search],
    model=model,
    output_key="research_findings"
)

culinary_critic = LlmAgent(
    name="CulinaryCritic",
    description="Analyzes dining trends with a focus on seafood quality and culinary innovation.",
    instruction="""
        You are a Michelin-star culinary critic. Analyze the research findings and provide 
        a deep culinary perspective on the quality of seafood and dining innovation.
    """,
    model=model,
    output_key="culinary_analysis"
)

report_composer = LlmAgent(
    name="ReportComposer",
    description="Synthesizes all findings into a grounded report and generates a file.",
    instruction="""
        You are a report writer. Synthesize the research and culinary analysis into a 
        professional report. Use headings and citations. 
        Invoke 'generate_pdf_report' as the final step.
    """,
    tools=[generate_pdf_report],
    model=model
)

# 5. Orchestrator
def orchestrator_callback(callback_context: CallbackContext):
    agent = callback_context.invocation_context.agent
    if agent.name == "ResearchPlanner":
        callback_context.state.set("plan_approved", True)
    return None

root_agent = SequentialAgent(
    name="FishermansWharfAgentV2",
    description="Comprehensive research and reporting on Fisherman's Wharf dining trends.",
    sub_agents=[
        planner_agent,
        section_researcher,
        culinary_critic,
        report_composer
    ],
    after_agent_callback=orchestrator_callback
)

from google.adk.apps import App, ResumabilityConfig

app = App(
    root_agent=root_agent, 
    name="app",
    resumability_config=ResumabilityConfig(is_resumable=True)
)
