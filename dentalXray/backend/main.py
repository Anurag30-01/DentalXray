from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
import base64
from gemini import generate_report
from utils import dicom_to_png_bytes
from roboflow_inference import detect_pathologies

# Configure Gemini API key

# Gemini report generation function
def generate_gemini_report(predictions):
    detections_json = str([pred.dict() for pred in predictions])
    return generate_report(detections_json)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Roboflow analysis endpoint
@app.post("/roboflow-analyze")
async def roboflow_analyze(file: UploadFile = File(...)):
    print(f"[INFO] Received file: {file.filename}")
    dicom_bytes = await file.read()
    print(f"[INFO] DICOM size: {len(dicom_bytes)} bytes")

    try:
        png_bytes = dicom_to_png_bytes(dicom_bytes)
        print(f"[INFO] Converted to PNG: {len(png_bytes)} bytes")
    except Exception as e:
        print(f"[ERROR] DICOM to PNG failed: {e}")
        return {"error": "Failed to convert DICOM to PNG."}

    result = detect_pathologies(png_bytes)
    png_base64 = base64.b64encode(png_bytes).decode("utf-8")
    print(f"[INFO] Roboflow result: {result}")

    return {
        "image": png_base64,
        "predictions": result.get("predictions", []),
        "roboflow_raw": result
    }

# Pydantic models for Gemini report request
class Prediction(BaseModel):
    x: float
    y: float
    width: float
    height: float
    confidence: float
    class_: str = Field(..., alias="class")

class ReportRequest(BaseModel):
    predictions: List[Prediction]

# Gemini report endpoint
@app.post("/gemini-report")
async def gemini_report(request: ReportRequest):
    predictions = request.predictions
    if not predictions:
        return {"report": "No pathologies detected in the image."}
    
    print(f"[INFO] Generating report for {len(predictions)} predictions")

    report_text = generate_gemini_report(predictions)
    print(f"[INFO] Generated report: {report_text}")

    return {
        "predictions": predictions,
        "report": report_text
    }
