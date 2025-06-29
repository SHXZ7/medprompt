import pdfplumber
import re

def extract_pdf_text(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def extract_vitals(text):
    def extract_value(pattern):
        match = re.search(pattern, text)
        return float(match.group(1)) if match else 0

    return {
        "age": 45,  # hardcoded unless you want to extract it
        "bmi": extract_value(r"BMI:\s*([\d.]+)"),
        "glucose": extract_value(r"Glucose.*?:\s*([\d.]+)"),
        "blood_pressure": 90  # extract if needed
    }
