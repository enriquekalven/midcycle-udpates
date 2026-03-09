import vertexai
from google.adk.apps import App
from app.agent import orchestrator

# Initialize Vertex AI
vertexai.init()

# Create the App for Agent Engine
agent_engine = App(
    name="fishermans_wharf_agent",
    root_agent=orchestrator,
)
