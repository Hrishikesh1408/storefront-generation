"""
Ollama Service — LangChain Integration.

Provides a centralized ChatOllama instance for use across the application,
as well as a legacy synchronous helper for backward compatibility.
"""

import os
import asyncio
import logging

import requests
from langchain_ollama import ChatOllama

logger = logging.getLogger("services.ollama")

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")


def get_chat_model(temperature: float = 0.2) -> ChatOllama:
    """
    Returns a LangChain ChatOllama instance configured with the
    project's default model and base URL.

    Args:
        temperature: Sampling temperature (lower = more deterministic).

    Returns:
        A ChatOllama instance.
    """
    return ChatOllama(
        model=OLLAMA_MODEL,
        base_url=OLLAMA_BASE_URL,
        temperature=temperature,
    )


# ── Legacy helpers (kept for any non-LangChain callers) ──────────────

def call_ollama(prompt: str):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()["response"]


async def call_ollama_async(prompt: str):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, call_ollama, prompt)
