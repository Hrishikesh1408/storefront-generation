import os
import requests
import asyncio

OLLAMA_URL = os.getenv("OLLAMA_URL")

def call_ollama(prompt: str):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]


async def call_ollama_async(prompt: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, call_ollama, prompt)