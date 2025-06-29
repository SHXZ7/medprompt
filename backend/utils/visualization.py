import plotly.graph_objects as go
import matplotlib.pyplot as plt
import os

def generate_glucose_chart(glucose_readings: list, timestamps: list):
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=timestamps,
        y=glucose_readings,
        mode='lines+markers',
        name='Glucose Level',
        line=dict(color='blue')
    ))

    fig.update_layout(
        title='Glucose Trend Over Time',
        xaxis_title='Time',
        yaxis_title='Glucose (mg/dL)',
        template='plotly_white'
    )

    return fig.to_json()

def save_bmi_chart(bmi_values: list, labels: list, output_path="bmi_chart.png"):
    plt.figure(figsize=(6,4))
    plt.bar(labels, bmi_values, color='green')
    plt.title("BMI Comparison")
    plt.xlabel("Patient")
    plt.ylabel("BMI")
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

def generate_bmi_chart(bmi_values: list, timestamps: list):
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=timestamps,
        y=bmi_values,
        mode='lines+markers',
        name='BMI',
        line=dict(color='green')
    ))

    fig.update_layout(
        title='BMI Trend Over Time',
        xaxis_title='Date',
        yaxis_title='BMI (kg/m²)',
        template='plotly_white'
    )

    return fig.to_json()
