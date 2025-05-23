# roboflow_inference.py
import os
from dotenv import load_dotenv
import requests

load_dotenv()
ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
ROBOFLOW_MODEL_URL = "https://detect.roboflow.com/adr/6"

def detect_pathologies(image_bytes: bytes):
    try:
        response = requests.post(
            ROBOFLOW_MODEL_URL,
            params={"api_key": ROBOFLOW_API_KEY},
            files={"file": ("image.png", image_bytes, "image/png")}
        )
        response.raise_for_status()  # Raise an error for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        print("[ERROR] Roboflow request failed:", e)
        return {"error": str(e)}
