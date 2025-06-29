import requests
import os
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def get_openrouter_response(prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",  # Optional but recommended
        "X-Title": "medprompt-backend"
    }

    body = {
        "model": "mistralai/mistral-7b-instruct",  # or openai/gpt-3.5-turbo
        "messages": [{"role": "user", "content": prompt}],
    }

    try:
        res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=body)
        return res.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"❌ OpenRouter Error: {e}"
