"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Activity, Heart, Sparkles, CheckCircle } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { Badge } from "@/components/ui/badge"

export default function Assessment() {
  const [formData, setFormData] = useState({
    Pregnancies: "",
    Glucose: "",
    BloodPressure: "",
    SkinThickness: "",
    Insulin: "",
    BMI: "",
    DiabetesPedigreeFunction: "",
    Age: "",
  })

  const [riskScore, setRiskScore] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [riskLevel, setRiskLevel] = useState("")
  const [healthTips, setHealthTips] = useState(null)
  const [loadingTips, setLoadingTips] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [calendarPlan, setCalendarPlan] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (formData.Age < 1 || formData.Age > 120) newErrors.Age = "Age must be between 1 and 120"
    if (formData.BMI < 10 || formData.BMI > 60) newErrors.BMI = "BMI must be between 10 and 60"
    if (formData.Glucose < 50 || formData.Glucose > 500) newErrors.Glucose = "Glucose must be between 50 and 500"
    if (formData.BloodPressure < 40 || formData.BloodPressure > 250)
      newErrors.BloodPressure = "Blood pressure must be between 40 and 250"
    if (formData.SkinThickness < 0) newErrors.SkinThickness = "Skin thickness must be a positive number"
    if (formData.Insulin < 0) newErrors.Insulin = "Insulin must be a positive number"
    if (formData.Pregnancies < 0) newErrors.Pregnancies = "Pregnancies cannot be negative"
    if (formData.DiabetesPedigreeFunction < 0) newErrors.DiabetesPedigreeFunction = "DPF must be positive"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getRiskLevel = (score) => {
    if (score < 0.3) return { level: "Low", color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" }
    if (score < 0.7)
      return {
        level: "Moderate",
        color: "text-yellow-600",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
      }
    return { level: "High", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" })
    }
  }

  const handlePredict = async () => {
    if (!validateForm()) return

    setLoading(true)
    setRiskScore(null)
    setRiskLevel("")

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
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(err)
      }

      const data = await res.json()
      setRiskScore(data.risk_score)
      setRiskLevel(getRiskLevel(data.risk_score))
    } catch (error) {
      console.error("Prediction failed:", error)
      setErrors({
        api: "Failed to get prediction. Please check your input and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const getHealthTips = async () => {
    setLoadingTips(true)
    try {
      const res = await fetch("http://localhost:8000/openrouter/generate-health-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(formData.Age),
          bmi: Number(formData.BMI),
          glucose: Number(formData.Glucose),
          blood_pressure: Number(formData.BloodPressure),
          risk_score: riskScore,
        }),
      })
      const data = await res.json()
      setHealthTips(data.tips)
    } catch (err) {
      alert("Error generating tips")
    } finally {
      setLoadingTips(false)
    }
  }

  const generatePlan = async () => {
    setLoadingPlan(true)
    try {
      const res = await fetch("http://localhost:8000/openrouter/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: Number(formData.Age),
          bmi: Number(formData.BMI),
          glucose: Number(formData.Glucose),
          blood_pressure: Number(formData.BloodPressure),
        }),
      })

      const data = await res.json()
      const raw = data.plan
      const dayBlocks = raw.split(/(?=Day \d+:?)/g).filter(Boolean)

      const today = new Date()
      const planMap = {}

      dayBlocks.forEach((block, index) => {
        const date = new Date(today)
        date.setDate(date.getDate() + index)
        planMap[date.toDateString()] = block.trim()
      })

      setCalendarPlan(planMap)
    } catch (err) {
      alert("Failed to generate plan")
    } finally {
      setLoadingPlan(false)
    }
  }

  const clearForm = () => {
    setFormData({
      Pregnancies: "",
      Glucose: "",
      BloodPressure: "",
      SkinThickness: "",
      Insulin: "",
      BMI: "",
      DiabetesPedigreeFunction: "",
      Age: "",
    })
    setRiskScore(null)
    setRiskLevel("")
    setErrors({})
  }

  const formFields = [
    { label: "Pregnancies", name: "Pregnancies", type: "number" },
    { label: "Glucose (mg/dL)", name: "Glucose", type: "number" },
    { label: "Blood Pressure (mmHg)", name: "BloodPressure", type: "number" },
    { label: "Skin Thickness (mm)", name: "SkinThickness", type: "number" },
    { label: "Insulin (μU/mL)", name: "Insulin", type: "number" },
    { label: "BMI (kg/m²)", name: "BMI", type: "number", step: "0.1" },
    { label: "Diabetes Pedigree Function", name: "DiabetesPedigreeFunction", type: "number", step: "0.01" },
    { label: "Age (years)", name: "Age", type: "number" },
  ]

  return (
    <PageWrapper
      title="Health Risk Assessment"
      description="Complete your health assessment to get personalized risk predictions and recommendations."
    >
      {/* Main content with improved centering */}
      <div className="w-full max-w-6xl mx-auto space-y-6 lg:space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Assessment Form - takes up more space on larger screens */}
          <div className="xl:col-span-2">
            <Card className="shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Health Data Input</span>
                </CardTitle>
                <CardDescription>Enter your health metrics for accurate risk assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Form grid with better responsive behavior */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                  {formFields.map(({ label, name, type, step }, index) => (
                    <div key={name} className="space-y-3 group">
                      <Label
                        htmlFor={name}
                        className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2"
                      >
                        <span>{label}</span>
                        {name === "Glucose" && (
                          <Badge variant="secondary" className="text-xs">
                            mg/dL
                          </Badge>
                        )}
                        {name === "BMI" && (
                          <Badge variant="secondary" className="text-xs">
                            kg/m²
                          </Badge>
                        )}
                      </Label>
                      <div className="relative">
                        <Input
                          id={name}
                          type={type}
                          step={step || "1"}
                          name={name}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          value={formData[name]}
                          onChange={handleChange}
                          className={`transition-all duration-200 ${
                            errors[name]
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
                              : "border-gray-200 dark:border-gray-700 focus:ring-blue-500 group-hover:border-gray-300 dark:group-hover:border-gray-600"
                          }`}
                        />
                        {formData[name] && !errors[name] && (
                          <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                      </div>
                      {errors[name] && (
                        <p className="text-red-500 text-xs flex items-center space-x-1 animate-shake">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{errors[name]}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action buttons with better responsive layout */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    onClick={handlePredict}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 lg:px-8 flex-1 sm:flex-none"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Predict Risk Score
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearForm}
                    size="lg"
                    className="px-6 lg:px-8 bg-transparent flex-1 sm:flex-none"
                  >
                    Clear Form
                  </Button>
                </div>

                {errors.api && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-400 flex items-start">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{errors.api}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel - better responsive behavior */}
          <div className="xl:col-span-1">
            <div className="space-y-6 sticky top-6">
              {riskScore !== null && riskLevel && (
                <Card className={`${riskLevel.bg} border-0 shadow-lg`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      <span>Risk Assessment</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xl lg:text-2xl font-bold mb-1">
                        Risk Score: <span className={riskLevel.color}>{riskScore.toFixed(3)}</span>
                      </p>
                      <p className={`text-base lg:text-lg font-medium ${riskLevel.color}`}>
                        Risk Level: {riskLevel.level}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Score Range: 0.000 - 1.000</p>
                      <p>Lower scores indicate better health</p>
                    </div>
                    <div className="space-y-2">
                      <Button
                        onClick={getHealthTips}
                        disabled={loadingTips}
                        className="w-full bg-transparent"
                        variant="outline"
                      >
                        {loadingTips ? "Generating..." : "Get Health Tips"}
                      </Button>
                      <Button
                        onClick={generatePlan}
                        disabled={loadingPlan}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {loadingPlan ? "Generating..." : "🗓️ Generate 7-Day Plan"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {healthTips && (
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">AI Health Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-64 overflow-y-auto pr-2">
                      <p className="text-sm whitespace-pre-line leading-relaxed">{healthTips}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Section with improved responsive layout */}
        {Object.keys(calendarPlan).length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">📅 7-Day Health Calendar</CardTitle>
              <CardDescription>Your personalized health plan for the next week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="flex justify-center">
                  <div className="w-full max-w-md">
                    <Calendar
                      value={selectedDate}
                      onChange={setSelectedDate}
                      tileContent={({ date }) => {
                        const text = calendarPlan[date.toDateString()]
                        return text ? (
                          <div className="text-xs text-green-700 dark:text-green-400 mt-1 font-medium">Plan</div>
                        ) : null
                      }}
                      tileClassName={({ date }) => {
                        if (calendarPlan[date.toDateString()]) {
                          return "bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded"
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                </div>
                {calendarPlan[selectedDate.toDateString()] && (
                  <Card className="h-fit">
                    <CardHeader>
                      <CardTitle className="text-base lg:text-lg">{selectedDate.toDateString()} Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-64 overflow-y-auto pr-2">
                        <p className="whitespace-pre-line text-sm leading-relaxed">
                          {calendarPlan[selectedDate.toDateString()]}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
}
