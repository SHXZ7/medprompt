import re

def clean_vitals_text(text: str) -> dict:
    vitals = {}
    patterns = {
        "bmi": r"BMI[:\s]+(\d+\.?\d*)",
        "glucose": r"Glucose[:\s]+(\d+)",
        "blood_pressure": r"Blood Pressure[:\s]+(\d+)",
        "age": r"Age[:\s]+(\d+)"
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            vitals[key] = float(match.group(1))

    return vitals
