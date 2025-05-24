import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get the API key from environment
api_key = os.getenv("GEMINI_API_KEY")

# Configure the Gemini client
genai.configure(api_key=api_key)

def generate_report(detections_json):
    prompt = f"""
    You are a dental radiologist. Based on the image annotations provided below
(which include detected pathologies), write a concise diagnostic report in clinical
language.

Detections:
{detections_json}

Please write a brief paragraph highlighting:
- Detected pathologies,
- Their approximate location if possible (e.g., upper left molar),
- Clinical advice or recommendations."""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text.strip()