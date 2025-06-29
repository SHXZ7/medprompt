from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.ml_model import predict_risk_score
from utils.visualization import generate_glucose_chart, save_bmi_chart, generate_bmi_chart
from fastapi.responses import FileResponse
import datetime

router = APIRouter()

class PatientData(BaseModel):
    age: int
    bmi: float
    glucose: float
    blood_pressure: float

class GlucoseData(BaseModel):
    glucose: list[float]
    timestamps: list[str]  # e.g. ["2025-06-20", "2025-06-21", ...]

class BMIData(BaseModel):
    bmi: list[float]
    timestamps: list[str]

class PatientFeatures(BaseModel):
    Pregnancies: int
    Glucose: float
    BloodPressure: float
    SkinThickness: float
    Insulin: float
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int

@router.post("/predict")
def predict_risk(features: PatientFeatures):
    try:
        result = predict_risk_score(features.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/visualize/glucose")
def get_glucose_chart():
    # Example data — replace with real from DB later
    glucose_readings = [110, 125, 140, 115, 130]
    timestamps = [
        (datetime.datetime.now() - datetime.timedelta(days=i)).strftime("%Y-%m-%d")
        for i in range(len(glucose_readings))
    ]
    chart_json = generate_glucose_chart(glucose_readings, timestamps)
    return {"chart": chart_json}

@router.post("/visualize/glucose")
def plot_dynamic_glucose(data: GlucoseData):
    chart_json = generate_glucose_chart(data.glucose, data.timestamps)
    return {"chart": chart_json}

@router.get("/visualize/bmi")
def get_bmi_chart():
    bmi_values = [22.5, 27.8, 31.2]
    labels = ["John", "Emma", "Ali"]
    chart_path = "bmi_chart.png"
    save_bmi_chart(bmi_values, labels, chart_path)
    return FileResponse(chart_path, media_type="image/png")

@router.post("/visualize/bmi")
def plot_dynamic_bmi(data: BMIData):
    chart_json = generate_bmi_chart(data.bmi, data.timestamps)
    return {"chart": chart_json}


