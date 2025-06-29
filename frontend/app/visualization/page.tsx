"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { BarChart3, TrendingUp, Activity } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"
import dynamic from "next/dynamic"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

export default function Visualization() {
  const [glucoseChart, setGlucoseChart] = useState(null)
  const [bmiChart, setBmiChart] = useState(null)
  const [glucoseData, setGlucoseData] = useState(["110", "120", "135"])
  const [glucoseDates, setGlucoseDates] = useState(["2025-06-20", "2025-06-21", "2025-06-22"])
  const [bmiData, setBmiData] = useState(["22.5", "24.0", "25.2"])
  const [bmiDates, setBmiDates] = useState(["2025-06-01", "2025-06-08", "2025-06-15"])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load initial glucose chart
    fetch("http://localhost:8000/ml/visualize/glucose")
      .then((res) => res.json())
      .then((data) => setGlucoseChart(JSON.parse(data.chart)))
      .catch((err) => console.error("Glucose chart fetch failed:", err))
  }, [])

  const generateGlucoseChart = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/ml/visualize/glucose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          glucose: glucoseData.map((v) => Number.parseFloat(v)),
          timestamps: glucoseDates,
        }),
      })
      const data = await res.json()
      setGlucoseChart(JSON.parse(data.chart))
    } catch (err) {
      console.error("Chart fetch error:", err)
      alert("Failed to generate glucose chart")
    } finally {
      setLoading(false)
    }
  }

  const generateBmiChart = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/ml/visualize/bmi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bmi: bmiData.map((v) => Number.parseFloat(v)),
          timestamps: bmiDates,
        }),
      })
      const data = await res.json()
      setBmiChart(JSON.parse(data.chart))
    } catch (err) {
      console.error("BMI chart fetch failed:", err)
      alert("Failed to generate BMI chart")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper
      title="Health Visualizations"
      description="Track your health metrics with interactive charts and trend analysis."
    >
      <div className="space-y-8">
        {/* Glucose Visualization */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span>Glucose Trend Analysis</span>
            </CardTitle>
            <CardDescription>Monitor your glucose levels over time with interactive charts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Glucose Values (mg/dL)</label>
                  <Textarea
                    placeholder="Enter glucose values comma-separated (e.g., 110,120,130)"
                    value={glucoseData.join(",")}
                    onChange={(e) => setGlucoseData(e.target.value.split(","))}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Measurement Dates</label>
                  <Textarea
                    placeholder="Enter matching dates (e.g., 2025-06-20,2025-06-21)"
                    value={glucoseDates.join(",")}
                    onChange={(e) => setGlucoseDates(e.target.value.split(","))}
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={generateGlucoseChart}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Generating..." : "Generate Glucose Chart"}
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                {glucoseChart ? (
                  <Plot
                    data={glucoseChart.data}
                    layout={{
                      ...glucoseChart.layout,
                      autosize: true,
                      margin: { l: 50, r: 50, t: 50, b: 50 },
                    }}
                    style={{ width: "100%", height: "300px" }}
                    useResizeHandler={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Loading glucose chart...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMI Visualization */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>BMI Trend Analysis</span>
            </CardTitle>
            <CardDescription>Track your Body Mass Index changes over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">BMI Values (kg/m²)</label>
                  <Textarea
                    placeholder="Enter BMI values (e.g., 22.5,24.1,25.6)"
                    value={bmiData.join(",")}
                    onChange={(e) => setBmiData(e.target.value.split(","))}
                    className="min-h-[80px]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Measurement Dates</label>
                  <Textarea
                    placeholder="Enter corresponding dates (e.g., 2025-06-01,2025-06-08)"
                    value={bmiDates.join(",")}
                    onChange={(e) => setBmiDates(e.target.value.split(","))}
                    className="min-h-[80px]"
                  />
                </div>
                <Button
                  onClick={generateBmiChart}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? "Generating..." : "Generate BMI Chart"}
                </Button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-4">
                {bmiChart ? (
                  <Plot
                    data={bmiChart.data}
                    layout={{
                      ...bmiChart.layout,
                      autosize: true,
                      margin: { l: 50, r: 50, t: 50, b: 50 },
                    }}
                    style={{ width: "100%", height: "300px" }}
                    useResizeHandler={true}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Generate your BMI chart above</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Glucose Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Normal:</span>
                  <span className="text-sm font-medium">70-100 mg/dL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Pre-diabetes:</span>
                  <span className="text-sm font-medium">100-125 mg/dL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Diabetes:</span>
                  <span className="text-sm font-medium">≥126 mg/dL</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">BMI Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Underweight:</span>
                  <span className="text-sm font-medium">&lt;18.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Normal:</span>
                  <span className="text-sm font-medium">18.5-24.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Overweight:</span>
                  <span className="text-sm font-medium">25-29.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Obese:</span>
                  <span className="text-sm font-medium">≥30</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tracking Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>• Measure at consistent times</p>
                <p>• Keep a regular schedule</p>
                <p>• Note any symptoms</p>
                <p>• Track medication timing</p>
                <p>• Consult your doctor regularly</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
