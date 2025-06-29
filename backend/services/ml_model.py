import pandas as pd
import numpy as np
import joblib
import os
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

MODEL_PATH = "services/risk_model.pkl"

def train_diabetes_model():
    if not os.path.exists(MODEL_PATH):
        # Load dataset
        df = pd.read_csv("data/diabetes.csv")  # Save your CSV to backend/data

        # Features and target
        X = df.drop("Outcome", axis=1)
        y = df["Outcome"]

        # Scaling for better performance
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

        # Train model
        model = LogisticRegression()
        model.fit(X_train, y_train)

        # Save model and scaler
        joblib.dump((model, scaler), MODEL_PATH)

train_diabetes_model()

def predict_risk_score(features: dict):
    model, scaler = joblib.load(MODEL_PATH)

    # Ensure the same input order as dataset
    input_order = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
                   "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]
    input_data = np.array([features[feat] for feat in input_order]).reshape(1, -1)
    input_scaled = scaler.transform(input_data)

    probability = model.predict_proba(input_scaled)[0][1]
    risk_score = round(float(probability), 2)

    # Map to risk level
    if risk_score < 0.33:
        risk_label = "Low Risk"
    elif risk_score < 0.66:
        risk_label = "Moderate Risk"
    else:
        risk_label = "High Risk"

    return {"risk_score": risk_score, "risk_level": risk_label}
