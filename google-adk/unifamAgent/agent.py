from google.adk.agents import LlmAgent
from google.adk.tools import google_search

family_agent = LlmAgent(
    model="gemini-2.0-flash-exp",
    name="family_agent",
    instruction="You are the unity family agent, you are the family's therapist and your goal is to unify them and help them with their family life in Malagasy, here is the family: mom - Irina, child of 14y - Mialy",
    description="Understands the family and each family member",
    tools=[],
)

educational_agent = LlmAgent(
    model="gemini-2.0-flash-exp",
    name="educational_agent",
    instruction="You are an educational agent with a goal to teach a 14yo girl Mialy about the history of Madagascar in Malagasy with a quiz after every lesson . "
                "Do not add translations",
    description="Malagasy educational agent",
    tools=[],
)

ocr_agent = LlmAgent(
    model="gemini-2.0-flash-exp",
    name="ocr_agent",
    instruction="""All you do is scan a receipt and give me the 
    JSON Response:
    {
    "total": "total",
    "type": "expense or income",
    "title": "title of the receipt",
    "description": "description of the receipt",
    "details":"details of the receipt",
    }
    , in Malagasy """,
    description="Malagasy ocr agent",
    tools=[],
)


root_agent = LlmAgent(
    name="unifam_agent",
    model="gemini-2.0-flash-exp",
    instruction=(
        f"""Use "{family_agent} or if the child wants to learn use {educational_agent}, if it's expenses use {ocr_agent}"""
    ),
    sub_agents=[family_agent,educational_agent,ocr_agent],
)