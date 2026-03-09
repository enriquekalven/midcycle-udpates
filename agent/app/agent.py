import os
import google.auth
from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import Gemini
from google.adk.tools import google_search

# 1. Models
model = Gemini(model="gemini-3-flash-preview")

# 2. Tools
def generate_pdf_report(content: str, citations: list[str] = None) -> str:
    """Generates a summary of the report. In the playground, this saves to a local file.
    
    Args:
        content: The synthesized report content.
        citations: List of citations to include.
    """
    filename = f"report_py_{os.getpid()}.txt" # Use txt for simplicity in RE
    with open(filename, "w") as f:
        f.write(f"REPORT TITLE: Fisherman's Wharf Dining Trends\n\n")
        f.write(content)
        if citations:
            f.write("\n\nCITATIONS:\n")
            for c in citations:
                f.write(f"- {c}\n")
    return f"Report generated successfully at: {filename}"

# 3. Agents
planner_agent = LlmAgent(
    name="ResearchPlanner",
    description="Creates a structured research plan for Fisherman's Wharf dining trends.",
    instruction="""
        You are a Research Architect. Generate a 5-step plan to analyze dining trends at 
        Fisherman's Wharf. Focus on seafood quality and footfall.
    """,
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

# 4. Orchestrator
def orchestrator_callback(callback_context: CallbackContext):
    agent = callback_context.invocation_context.agent
    print(f"[Orchestrator] Completed step: {agent.name}")
    if agent.name == "ResearchPlanner":
        # Simulate approval in playground
        callback_context.state.set("plan_approved", True)
    return None

orchestrator = SequentialAgent(
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
