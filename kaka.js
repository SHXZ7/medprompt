"use client";
import { useState, useEffect } from "react";
import { AlertCircle, Heart, Activity, Thermometer, User } from "lucide-react";
import dynamic from "next/dynamic";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function Home() {
  const [formData, setFormData] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  });

  const [riskScore, setRiskScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [errors, setErrors] = useState({});
  const [customPrompt, setCustomPrompt] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfSummary, setPdfSummary] = useState("");
  const [glucoseChart, setGlucoseChart] = useState(null);
  const [bmiChart, setBmiChart] = useState(null);
  const [bmiChartUrl, setBmiChartUrl] = useState("");
  const [glucoseData, setGlucoseData] = useState(["110", "120", "135"]);
  const [glucoseDates, setGlucoseDates] = useState([
    "2025-06-20",
    "2025-06-21",
    "2025-06-22",
  ]);
  const [bmiData, setBmiData] = useState(["22.5", "24.0", "25.2"]);
  const [bmiDates, setBmiDates] = useState([
    "2025-06-01",
    "2025-06-08",
    "2025-06-15",
  ]);
  const [ragPrompt, setRagPrompt] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [ragContext, setRagContext] = useState("");
  const [pdfResponse, setPdfResponse] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [healthTips, setHealthTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);
  const [healthPlan, setHealthPlan] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarStartDate, setCalendarStartDate] = useState(new Date());
  const [calendarPlan, setCalendarPlan] = useState({});
  const [reportImage, setReportImage] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (formData.Age < 1 || formData.Age > 120)
      newErrors.Age = "Age must be between 1 and 120";
    if (formData.BMI < 10 || formData.BMI > 60)
      newErrors.BMI = "BMI must be between 10 and 60";
    if (formData.Glucose < 50 || formData.Glucose > 500)
      newErrors.Glucose = "Glucose must be between 50 and 500";
    if (formData.BloodPressure < 40 || formData.BloodPressure > 250)
      newErrors.BloodPressure = "Blood pressure must be between 40 and 250";
    if (formData.SkinThickness < 0)
      newErrors.SkinThickness = "Skin thickness must be a positive number";
    if (formData.Insulin < 0)
      newErrors.Insulin = "Insulin must be a positive number";
    if (formData.Pregnancies < 0)
      newErrors.Pregnancies = "Pregnancies cannot be negative";
    if (formData.DiabetesPedigreeFunction < 0)
      newErrors.DiabetesPedigreeFunction = "DPF must be positive";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRiskLevel = (score) => {
    if (score < 0.3)
      return { level: "Low", color: "text-green-600", bg: "bg-green-50" };
    if (score < 0.7)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    return { level: "High", color: "text-red-600", bg: "bg-red-50" };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handlePredict = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setRiskScore(null);
    setRiskLevel("");

    try {
      const res = await fetch("http://localhost:8000/ml/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Pregnancies: Number(formData.Pregnancies),
          Glucose: Number(formData.Glucose),
          BloodPressure: Number(formData.BloodPressure),
          SkinThickness: Number(formData.SkinThickness),
          Insulin: Number(formData.Insulin),
          BMI: Number(formData.BMI),
          DiabetesPedigreeFunction: Number(formData.DiabetesPedigreeFunction),
          Age: Number(formData.Age),
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();
      setRiskScore(data.risk_score);
      setRiskLevel(getRiskLevel(data.risk_score));
    } catch (error) {
      console.error("Prediction failed:", error);
      setErrors({
        api: "Failed to get prediction. Please check your input and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAskAI = async (prompt) => {
    const question = prompt?.trim() || userInput.trim();
    if (!question) return alert("Please enter a question");

    try {
      console.log("Sending prompt:", question);
      const res = await fetch("http://localhost:8000/openrouter/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: question }),
      });
      const data = await res.json();
      console.log("Response from server:", data);
      setAiResponse(data.response);
    } catch (error) {
      console.error("Ask AI failed:", error);
      alert("Failed to contact the AI.");
    }
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;

    setPdfSummary("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", pdfFile);

    try {
      const res = await fetch("http://localhost:8000/openrouter/parse-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      console.log(data); // Debug log for response
      setPdfSummary(data.summary);
      setPdfResponse(data); // Store full response
    } catch (err) {
      setPdfSummary("Failed to process PDF. Please try again.");
      setPdfResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const predefinedQuestions = [
    "What are the symptoms of diabetes?",
    "How can I prevent heart disease?",
    "What foods help lower blood pressure?",
    "What are healthy BMI ranges by age?",
    "How often should I check my glucose levels?",
  ];

  const clearForm = () => {
    setFormData({ age: "", bmi: "", glucose: "", blood_pressure: "" });
    setRiskScore(null);
    setRiskLevel("");
    setErrors({});
  };

  const getHealthTips = async () => {
    setLoadingTips(true);
    try {
      const res = await fetch(
        "http://localhost:8000/openrouter/generate-health-tips",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: Number(formData.Age),
            bmi: Number(formData.BMI),
            glucose: Number(formData.Glucose),
            blood_pressure: Number(formData.BloodPressure),
            risk_score: riskScore,
          }),
        }
      );
      const data = await res.json();
      setHealthTips(data.tips);
    } catch (err) {
      alert("Error generating tips");
    } finally {
      setLoadingTips(false);
    }
  };

  const generatePlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch(
        "http://localhost:8000/openrouter/generate-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            age: Number(formData.Age),
            bmi: Number(formData.BMI),
            glucose: Number(formData.Glucose),
            blood_pressure: Number(formData.BloodPressure),
          }),
        }
      );

      const data = await res.json();
      const raw = data.plan;
      const dayBlocks = raw.split(/(?=Day \d+:?)/g).filter(Boolean); // split by "Day 1:", "Day 2:" etc.

      const today = new Date();
      const planMap = {};

      dayBlocks.forEach((block, index) => {
        const date = new Date(today);
        date.setDate(date.getDate() + index);
        planMap[date.toDateString()] = block.trim();
      });

      setCalendarStartDate(today);
      setCalendarPlan(planMap);
    } catch (err) {
      alert("Failed to generate plan");
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/ml/visualize/glucose")
      .then((res) => res.json())
      .then((data) => setGlucoseChart(JSON.parse(data.chart)))
      .catch((err) => console.error("Glucose chart fetch failed:", err));

    setBmiChartUrl("http://localhost:8000/ml/visualize/bmi"); // static PNG image
  }, []);

  const sendChatMessage = async () => {
    const historyFormatted = chatHistory.map(
      (entry) => `User: ${entry.user}\nAssistant: ${entry.ai}`
    );

    const res = await fetch("http://localhost:8000/openrouter/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: historyFormatted,
        user_message: message,
      }),
    });

    const data = await res.json();
    setChatHistory([...chatHistory, { user: message, ai: data.response }]);
    setMessage("");
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (e) => {
      console.error("Speech error:", e);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage((prev) => prev + " " + transcript);
    };
    recognition.start();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 text-red-500 mr-2" />
              <h1 className="text-3xl font-bold text-gray-800">
                MedPrompt+ AI Health Assistant
              </h1>
            </div>
            <p className="text-gray-600">
              Get personalized health risk assessments and AI-powered medical
              insights
            </p>
          </div>

          {/* Health Assessment Form */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Health Risk Assessment (Updated)
            </h2>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {[
                { label: "Pregnancies", name: "Pregnancies", type: "number" },
                { label: "Glucose (mg/dL)", name: "Glucose", type: "number" },
                {
                  label: "Blood Pressure (mmHg)",
                  name: "BloodPressure",
                  type: "number",
                },
                {
                  label: "Skin Thickness (mm)",
                  name: "SkinThickness",
                  type: "number",
                },
                { label: "Insulin (μU/mL)", name: "Insulin", type: "number" },
                {
                  label: "BMI (kg/m²)",
                  name: "BMI",
                  type: "number",
                  step: "0.1",
                },
                {
                  label: "Diabetes Pedigree Function",
                  name: "DiabetesPedigreeFunction",
                  type: "number",
                  step: "0.01",
                },
                { label: "Age (years)", name: "Age", type: "number" },
              ].map(({ label, name, type, step }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                  </label>
                  <input
                    type={type}
                    step={step || "1"}
                    name={name}
                    placeholder={`Enter ${label}`}
                    value={formData[name]}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[name] ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors[name] && (
                    <p className="text-red-500 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors[name]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePredict}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Analyzing..." : "🧮 Predict Risk Score"}
              </button>

              <button
                onClick={clearForm}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Form
              </button>
            </div>

            {errors.api && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.api}
                </p>
              </div>
            )}
          </div>

          {/* Risk Score Results */}
          {riskScore !== null && riskLevel && (
            <div
              className={`${riskLevel.bg} border border-opacity-20 rounded-xl p-6 mb-8`}
            >
              <h3 className="text-lg font-semibold mb-3">
                📊 Risk Assessment Results
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold mb-1">
                    Risk Score:{" "}
                    <span className={riskLevel.color}>
                      {riskScore.toFixed(3)}
                    </span>
                  </p>
                  <p className={`text-lg font-medium ${riskLevel.color}`}>
                    Risk Level: {riskLevel.level}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Score Range: 0.000 - 1.000</p>
                  <p>Lower scores indicate better health</p>
                </div>
              </div>
              <button
                onClick={getHealthTips}
                className="btn btn-blue mt-4 bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loadingTips ? "Generating..." : "Get Health Tips"}
              </button>
              <button
                onClick={generatePlan}
                className="bg-green-600 text-white px-4 py-2 rounded mt-4"
              >
                {loadingPlan
                  ? "Generating..."
                  : "🗓️ Generate 7-Day Health Plan"}
              </button>

              {Object.keys(calendarPlan).length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    📅 7-Day Health Calendar
                  </h3>
                  <Calendar
                    value={selectedDate}
                    onChange={setSelectedDate}
                    tileContent={({ date }) => {
                      const text = calendarPlan[date.toDateString()];
                      return text ? (
                        <div className="text-xs text-green-700 mt-1 font-medium">
                          Plan
                        </div>
                      ) : null;
                    }}
                    tileClassName={({ date }) => {
                      if (calendarPlan[date.toDateString()]) {
                        return "bg-green-100 border border-green-300 rounded";
                      }
                    }}
                  />
                  {calendarPlan[selectedDate.toDateString()] && (
                    <div className="mt-4 p-4 bg-white border rounded shadow">
                      <h4 className="font-bold mb-2">
                        {selectedDate.toDateString()} Plan:
                      </h4>
                      <p className="whitespace-pre-line">
                        {calendarPlan[selectedDate.toDateString()]}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {healthPlan.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">
                    📅 7-Day Health Plan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {healthPlan.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-4 border rounded bg-white shadow"
                      >
                        <h4 className="font-bold mb-2">Day {idx + 1}</h4>
                        <p className="text-sm whitespace-pre-line">{day}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Health Suggestions - Remains unchanged */}
              {healthTips && (
                <div className="bg-green-100 text-green-900 p-4 rounded mt-4">
                  <h3 className="font-bold">AI Health Suggestions:</h3>
                  <p className="whitespace-pre-line">{healthTips}</p>
                </div>
              )}
            </div>
          )}

          {/* AI Assistant Section */}
          <div className="bg-purple-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-800">
              🤖 AI Health Assistant
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ask a custom question:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your health question..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    customPrompt.trim() &&
                    handleAskAI(customPrompt)
                  }
                />
                <button
                  onClick={() =>
                    customPrompt.trim() && handleAskAI(customPrompt)
                  }
                  disabled={loading || !customPrompt.trim()}
                  className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ask
                </button>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Or choose a common question:
              </p>
              <div className="flex flex-wrap gap-2">
                {predefinedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleAskAI(question)}
                    disabled={loading}
                    className="bg-white text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm border border-purple-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {aiResponse && (
              <div className="mt-4 bg-white border p-4 rounded shadow">
                <h3 className="text-md font-semibold">AI Response:</h3>
                <p className="text-sm">{aiResponse}</p>
              </div>
            )}
          </div>

          {/* Conversational Chat Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              💬 Chat with MedPrompt+ AI
            </h2>
            <div className="border p-4 rounded max-h-[400px] overflow-y-auto bg-white shadow-sm">
              {chatHistory.map((msg, i) => (
                <div key={i} className="mb-3">
                  <p>
                    <strong>You:</strong> {msg.user}
                  </p>
                  <p>
                    <strong>AI:</strong> {msg.ai}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex">
              <button
                onClick={startListening}
                className={`bg-gray-200 text-black px-3 rounded-l hover:bg-gray-300 ${
                  isListening ? "animate-pulse bg-yellow-200" : ""
                }`}
                title="Start voice input"
              >
                🎙️
              </button>
              <input
                className="flex-grow p-2 border-t border-b"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask something about your health..."
              />
              <button
                onClick={sendChatMessage}
                className="bg-blue-600 text-white px-4 rounded-r"
              >
                Send
              </button>
            </div>
          </div>

          {/* RAG-based Q&A Section */}
          <div className="mt-10 p-6 bg-indigo-50 border-2 border-indigo-300 rounded-lg">
            <h2 className="text-xl font-bold text-indigo-700 mb-2">
              🔎 Ask MedPrompt with RAG
            </h2>
            <textarea
              className="w-full border p-2 rounded mb-2 text-sm"
              placeholder="Ask a health question based on uploaded records..."
              value={ragPrompt}
              onChange={(e) => setRagPrompt(e.target.value)}
            />
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded"
              onClick={async () => {
                const res = await fetch(
                  "http://localhost:8000/openrouter/ask-rag",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: ragPrompt }),
                  }
                );
                const data = await res.json();
                setRagAnswer(data.response);
                setRagContext(data.context_used);
              }}
            >
              Ask AI
            </button>

            {ragAnswer && (
              <div className="mt-4">
                <h4 className="font-medium text-indigo-800">🧠 Answer:</h4>
                <p className="bg-white p-3 rounded border text-sm">
                  {ragAnswer}
                </p>

                <details className="text-xs mt-2 text-gray-500">
                  <summary>📚 Context Used</summary>
                  <pre className="bg-gray-100 p-2 rounded">{ragContext}</pre>
                </details>
              </div>
            )}
          </div>

          {/* PDF Upload Section */}
          <div className="bg-green-50 rounded-xl p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4 text-green-800">
              📤 Upload Medical PDF for Summary
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePdfUpload();
              }}
              encType="multipart/form-data"
            >
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === "application/pdf") {
                    setPdfFile(file);
                    console.log("Dropped file:", file);
                  } else {
                    alert("Only PDF files are supported.");
                  }
                }}
                className="border-2 border-dashed border-green-400 p-6 rounded-lg text-center cursor-pointer bg-green-100 mb-4"
              >
                <p className="text-gray-700 text-sm">
                  Drag and drop your medical PDF here, or click below:
                </p>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    setPdfFile(e.target.files?.[0] || null);
                  }}
                  className="mt-2 block mx-auto text-sm text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={!pdfFile || loading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Upload & Summarize"}
              </button>
            </form>

            {pdfResponse && (
              <div className="mt-4 bg-white p-4 rounded shadow">
                <h2 className="text-green-700 text-lg font-bold">
                  🧠 Gemini Summary:
                </h2>
                <p className="text-sm mt-2">{pdfResponse.summary}</p>
                <h3 className="text-pink-600 mt-4 font-bold">📊 Risk Score:</h3>
                <p className="text-sm">
                  Score: {pdfResponse.risk_score?.risk_score?.toFixed(3)} <br />
                  Level: {pdfResponse.risk_score?.risk_level}
                </p>
              </div>
            )}

            {/* Image Lab Report (OCR) Section */}
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              📷 Image Lab Report (OCR)
            </h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setReportImage(e.target.files?.[0] || null)}
              className="mb-2"
            />
            <button
              onClick={async () => {
                if (!reportImage) return alert("Please upload an image");
                const formData = new FormData();
                formData.append("file", reportImage);
                const res = await fetch(
                  "http://localhost:8000/openrouter/parse-image",
                  {
                    method: "POST",
                    body: formData,
                  }
                );
                const data = await res.json();
                setImageResult(data);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
            >
              Analyze Image Report
            </button>
            {imageResult && (
              <div className="bg-white border p-4 rounded shadow mt-4">
                <h3 className="font-bold text-blue-800 mb-2">
                  📄 Extracted Text:
                </h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {imageResult.raw_text}
                </pre>
                <h3 className="mt-4 font-semibold text-green-700">
                  🧮 Risk Score:
                </h3>
                {imageResult?.risk_score && (
                  <div className="text-sm text-gray-700">
                    <p>
                      <strong>Score:</strong>{" "}
                      {imageResult.risk_score.risk_score.toFixed(3)}
                    </p>
                    <p>
                      <strong>Level:</strong>{" "}
                      {imageResult.risk_score.risk_level}
                    </p>
                  </div>
                )}
                <h3 className="mt-4 font-semibold text-purple-700">
                  🧠 AI Explanation:
                </h3>
                <p className="whitespace-pre-line text-sm text-gray-800">
                  {imageResult.ai_explanation}
                </p>
              </div>
            )}

            {/* Health Data Visualizations */}
            <div className="mt-10 bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                📊 Health Trend Visualizations
              </h2>

              {/* Custom Glucose Input */}
              <div className="mt-10">
                <h3 className="text-md font-medium mb-2 text-blue-700">
                  📈 Custom Glucose Input
                </h3>
                <textarea
                  placeholder="Enter glucose values comma-separated (e.g., 110,120,130)"
                  value={glucoseData.join(",")}
                  onChange={(e) => setGlucoseData(e.target.value.split(","))}
                  className="w-full border p-2 rounded mb-2 text-sm"
                />
                <textarea
                  placeholder="Enter matching dates (e.g., 2025-06-20,2025-06-21)"
                  value={glucoseDates.join(",")}
                  onChange={(e) => setGlucoseDates(e.target.value.split(","))}
                  className="w-full border p-2 rounded mb-4 text-sm"
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        "http://localhost:8000/ml/visualize/glucose",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            glucose: glucoseData.map((v) => parseFloat(v)),
                            timestamps: glucoseDates,
                          }),
                        }
                      );
                      const data = await res.json();
                      setGlucoseChart(JSON.parse(data.chart));
                    } catch (err) {
                      console.error("Chart fetch error:", err);
                    }
                  }}
                >
                  Generate Chart
                </button>
              </div>

              {/* Glucose Chart */}
              <div className="mb-6">
                <h3 className="text-md font-medium text-blue-700 mb-2">
                  Glucose Trend (Interactive)
                </h3>
                {glucoseChart ? (
                  <Plot
                    data={glucoseChart.data}
                    layout={glucoseChart.layout}
                    style={{ width: "100%" }}
                  />
                ) : (
                  <p className="text-gray-500">Loading glucose chart...</p>
                )}
              </div>

              {/* Custom BMI Input */}
              <div className="mt-10">
                <h3 className="text-md font-medium mb-2 text-green-700">
                  📊 Custom BMI Trend
                </h3>
                <textarea
                  placeholder="Enter BMI values (e.g., 22.5,24.1,25.6)"
                  value={bmiData.join(",")}
                  onChange={(e) => setBmiData(e.target.value.split(","))}
                  className="w-full border p-2 rounded mb-2 text-sm"
                />
                <textarea
                  placeholder="Enter corresponding dates (e.g., 2025-06-01,2025-06-08)"
                  value={bmiDates.join(",")}
                  onChange={(e) => setBmiDates(e.target.value.split(","))}
                  className="w-full border p-2 rounded mb-4 text-sm"
                />
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(
                        "http://localhost:8000/ml/visualize/bmi",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            bmi: bmiData.map((v) => parseFloat(v)),
                            timestamps: bmiDates,
                          }),
                        }
                      );
                      const data = await res.json();
                      setBmiChart(JSON.parse(data.chart));
                    } catch (err) {
                      console.error("BMI chart fetch failed:", err);
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Generate BMI Chart
                </button>
                {bmiChart && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-green-700 mb-2">
                      BMI Chart:
                    </h4>
                    <Plot
                      data={bmiChart.data}
                      layout={bmiChart.layout}
                      style={{ width: "100%" }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              <strong>Medical Disclaimer:</strong> This tool is for
              informational purposes only and should not replace professional
              medical advice. Always consult with healthcare professionals for
              medical decisions.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
