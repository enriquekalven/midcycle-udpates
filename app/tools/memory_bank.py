import os
import json
from datetime import datetime
from google.adk.tools import FunctionTool
from pydantic import BaseModel, Field
from typing import Optional, Literal

MEMORY_FILE = os.path.join(os.getcwd(), 'data', 'memory_bank.json')

def memory_bank_tool(action: Literal['save', 'retrieve', 'clear'], key: Optional[str] = None, value: Optional[str] = None) -> dict:
    """A persistent memory store for the agent. Use this to save important facts, user preferences, or session context.
    
    Args:
        action: The action to perform ('save', 'retrieve', or 'clear').
        key: The unique identifier for the fact or preference.
        value: The content to be saved (required for 'save' action).
    """
    os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)
    memory = {}
    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE, 'r') as f:
            try:
                memory = json.load(f)
            except json.JSONDecodeError:
                pass

    if action == 'save' and key and value:
        memory[key] = {
            "content": value,
            "timestamp": datetime.now().isoformat()
        }
        with open(MEMORY_FILE, 'w') as f:
            json.dump(memory, f, indent=2)
        return {"status": "success", "message": f"Saved {key} to memory bank."}

    if action == 'retrieve':
        if key:
            return {"status": "success", "data": memory.get(key, "Key not found in memory.")}
        return {"status": "success", "data": memory}

    if action == 'clear':
        if os.path.exists(MEMORY_FILE):
            os.remove(MEMORY_FILE)
        return {"status": "success", "message": "Memory bank cleared."}

    return {"status": "error", "message": "Invalid action or missing parameters."}
