from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from services.openrouter_client import get_openrouter_response
from services.ml_model import predict_risk_score
from utils.parse_pdf import extract_pdf_text, extract_vitals
from utils.rag import add_texts_to_index
from utils.ocr_parser import extract_text_from_image
import re
import tempfile
import traceback

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str

class HealthTipsRequest(BaseModel):
    age: int
    bmi: float
    glucose: float
    blood_pressure: float
    risk_score: float  # From your model

class HealthPlanRequest(BaseModel):
    glucose: float
    bmi: float
    blood_pressure: float
    age: int

class ChatRequest(BaseModel):
    history: list[str]
    user_message: str

@router.post("/ask")
def ask_openrouter(req: PromptRequest):
    response = get_openrouter_response(req.prompt)
    return {"response": response}

@router.post("/parse-pdf")
async def parse_and_summarize_pdf(file: UploadFile = File(...)):
    try:
        import traceback
        # Save the uploaded file to a temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Step 1: Extract raw text
        extracted_text = extract_pdf_text(tmp_path)
        paragraphs = extracted_text.split("\n\n")
        add_texts_to_index(paragraphs)

        # Step 2: Extract vitals
        vitals = extract_vitals(extracted_text)
        print("Extracted Vitals:", vitals)

        # Step 3: Fill in default values for missing fields
        features = {
            "Pregnancies": 0,
            "Glucose": vitals.get("glucose", 120),
            "BloodPressure": vitals.get("blood_pressure", 70),
            "SkinThickness": 20,
            "Insulin": 85,
            "BMI": vitals.get("bmi", 26.5),
            "DiabetesPedigreeFunction": 0.35,
            "Age": vitals.get("age", 45),
        }
        print("Final ML Input Features:", features)

        risk_score = predict_risk_score(features)

        # Step 4: Generate summary via OpenRouter
        summary_prompt = f"""
        Summarize the following medical document for a patient in simple language:

        {extracted_text[:3000]}
        """
        summary = get_openrouter_response(summary_prompt)

        return {
            "summary": summary,
            "risk_score": risk_score,
            "extracted_text": extracted_text[:1000]  # Optional for debug
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/explain-risk")
def explain_risk(prompt: PromptRequest):
    from utils.rag import search_similar_chunks
    # Step 1: Retrieve context
    relevant_chunks = search_similar_chunks(prompt.prompt)
    context = "\n\n".join(relevant_chunks)

    # Step 2: Extract vitals → Predict
    vitals = extract_vitals(context)
    risk = predict_risk_score(vitals)

    # Step 3: Ask LLM to explain based on data
    full_prompt = f"""
    Patient medical context:
    {context}

    Risk score: {risk}

    Please explain in simple terms why this patient may be at risk.
    Mention key contributing factors (e.g., glucose, BMI, age).
    """

    explanation = get_openrouter_response(full_prompt)
    return {
        "risk_score": risk,
        "explanation": explanation,
        "context_used": context
    }

@router.post("/ask-rag")
def ask_rag(prompt: PromptRequest):
    from utils.rag import search_similar_chunks
    # search chunks relevant to the question
    relevant_chunks = search_similar_chunks(prompt.prompt, top_k=3)
    context = "\n\n".join(relevant_chunks)

    full_prompt = (
        f"Context from medical records:\n{context}\n\n"
        f"Patient question: {prompt.prompt}\n\n"
        "Answer:"
    )

    response = get_openrouter_response(full_prompt)
    return {"response": response, "context_used": context}

@router.post("/generate-health-tips")
def generate_health_tips(req: HealthTipsRequest):
    try:
        prompt = f"""
        A {req.age}-year-old person has:
        - BMI: {req.bmi}
        - Glucose: {req.glucose}
        - Blood pressure: {req.blood_pressure}
        - Predicted health risk score: {req.risk_score}

        Based on this data, provide friendly, personalized lifestyle improvement tips, including:
        - Diet recommendations
        - Physical activity suggestions
        - Any other preventive steps
        Format as bullet points.
        """
        result = get_openrouter_response(prompt)
        return {"tips": result}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-plan")
def generate_health_plan(data: HealthPlanRequest):
    prompt = (
        f"Create a 7-day health improvement plan for a person with:\n"
        f"- Glucose level: {data.glucose}\n"
        f"- BMI: {data.bmi}\n"
        f"- Blood pressure: {data.blood_pressure}\n"
        f"- Age: {data.age}\n\n"
        "Include daily diet suggestions, physical activity recommendations, and general lifestyle tips. "
        "Keep it concise, practical, and beginner-friendly. Format as Day 1 to Day 7."
    )

    response = get_openrouter_response(prompt)
    return {"plan": response}

def extract_vitals_from_text(text: str):
    def find(pattern, default=None):
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            print(f"✅ Match for '{pattern}':", match.groups())
            return float(match.group(1))
        return default

    return {
        "glucose": find(r"glucose[:\-]?\s*(\d+(\.\d+)?)"),
        "bmi": find(r"bmi[:\-]?\s*(\d+(\.\d+)?)"),
        "blood_pressure": find(r"(?:bp|blood pressure)[:\-]?\s*(\d+(\.\d+)?)"),
        "age": find(r"age[:\-]?\s*(\d+)")
    }

@router.post("/parse-image")
async def parse_and_analyze_image(file: UploadFile = File(...)):
    try:
        import traceback

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        raw_text = extract_text_from_image(tmp_path)
        print("📄 OCR Extracted Text:\n", raw_text)

        vitals = extract_vitals_from_text(raw_text)
        print("🔍 Extracted Vitals:", vitals)

        # Fill missing fields with defaults
        features = {
            "Pregnancies": 0,
            "Glucose": vitals.get("glucose", 120),
            "BloodPressure": vitals.get("blood_pressure", 75),
            "SkinThickness": 20,
            "Insulin": 85,
            "BMI": vitals.get("bmi", 26.0),
            "DiabetesPedigreeFunction": 0.3,
            "Age": vitals.get("age", 40),
        }

        risk = predict_risk_score(features)
        print("📈 Risk Prediction:", risk)

        # Avoid KeyErrors by using .get()
        prompt = f"""
        Given this lab report text:\n{raw_text}\n
        And detected values:\n
        - Age: {features['Age']}
        - BMI: {features['BMI']}
        - Glucose: {features['Glucose']}
        - Blood Pressure: {features['BloodPressure']}
        - Risk Score: {risk['risk_score']} ({risk['risk_level']})

        Provide a clear, beginner-friendly explanation of what this report indicates and any health risks.
        """

        explanation = get_openrouter_response(prompt)

        return {
            "raw_text": raw_text,
            "vitals": vitals,
            "risk_score": risk,
            "ai_explanation": explanation
        }

    except Exception as e:
        print("=== OCR Route Exception ===")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
def chat_with_memory(data: ChatRequest):
    # Build prompt from history
    chat_history = "\n".join(data.history)
    full_prompt = f"""You are a helpful medical assistant. This is the conversation:

{chat_history}
User: {data.user_message}
Assistant:"""

    response = get_openrouter_response(full_prompt)
    return {"response": response}
