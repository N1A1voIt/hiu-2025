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

emotion_agent = LlmAgent(
    model="gemini-2.0-flash-exp",
    name="emotion_agent",
    instruction="""You are an emotion agent, all you do is scanning an array [['happy', 0.99], ['sad', 0.01], ...],
        give me the emotion that has the highest mean and then analyze the emotion and give me a description of that emotion in Malagasy
        and give me a JSON Response:
        {
            "emotion": "happy",
            "details": "which emotion the person has and how should I handle it",
        }
        """,

    description="Malagasy emotion agent",
    tools=[],
)

root_agent = LlmAgent(
    name="unifam_agent",
    model="gemini-2.0-flash-exp",
    instruction=(
        f"""Use "{family_agent} or if the child wants to learn use {educational_agent}, if it's expenses use {ocr_agent}"""
    ),
    sub_agents=[family_agent,educational_agent,ocr_agent, emotion_agent],
)