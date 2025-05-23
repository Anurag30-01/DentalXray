import requests

# Set your Roboflow credentials and model endpoint
ROBOFLOW_API_KEY = "G8wF44TwnlYtwgQtUf9U"
ROBOFLOW_MODEL_URL = "https://detect.roboflow.com/adr/6/1"

def detect_pathologies(image_bytes):
    try:
        print("[INFO] Sending image to Roboflow...")
        
        response = requests.post(
            ROBOFLOW_MODEL_URL,
            params={"api_key": ROBOFLOW_API_KEY},
            files={"file": ("image.png", image_bytes, "image/png")},
        )
        
        print(f"[DEBUG] Roboflow status code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"[ERROR] Roboflow response: {response.text}")
            response.raise_for_status()  # Raise error for FastAPI to catch if integrated

        json_data = response.json()
        print(f"[SUCCESS] Roboflow response JSON: {json_data}")
        return json_data

    except requests.exceptions.RequestException as e:
        print(f"[EXCEPTION] Roboflow request failed: {e}")
        return {"error": "Failed to connect to Roboflow", "details": str(e)}

