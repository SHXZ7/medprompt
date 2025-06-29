"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Upload, ImageIcon, Search } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"

export default function Documents() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfResponse, setPdfResponse] = useState(null)
  const [reportImage, setReportImage] = useState(null)
  const [imageResult, setImageResult] = useState(null)
  const [ragPrompt, setRagPrompt] = useState("")
  const [ragAnswer, setRagAnswer] = useState("")
  const [ragContext, setRagContext] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePdfUpload = async () => {
    if (!pdfFile) return

    setLoading(true)
    const formData = new FormData()
    formData.append("file", pdfFile)

    try {
      const res = await fetch("http://localhost:8000/openrouter/parse-pdf", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      setPdfResponse(data)
    } catch (err) {
      alert("Failed to process PDF. Please try again.")
      setPdfResponse(null)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async () => {
    if (!reportImage) return alert("Please upload an image")

    setLoading(true)
    const formData = new FormData()
    formData.append("file", reportImage)

    try {
      const res = await fetch("http://localhost:8000/openrouter/parse-image", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setImageResult(data)
    } catch (error) {
      alert("Failed to process image")
    } finally {
      setLoading(false)
    }
  }

  const handleRagQuery = async () => {
    if (!ragPrompt.trim()) return

    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/openrouter/ask-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: ragPrompt }),
      })
      const data = await res.json()
      setRagAnswer(data.response)
      setRagContext(data.context_used)
    } catch (error) {
      alert("Failed to query documents")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper
      title="Document Parser"
      description="Upload and analyze medical documents with AI-powered extraction and insights."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PDF Upload */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span>PDF Document Analysis</span>
            </CardTitle>
            <CardDescription>Upload medical PDFs for AI-powered summary and risk extraction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file && file.type === "application/pdf") {
                  setPdfFile(file)
                } else {
                  alert("Only PDF files are supported.")
                }
              }}
              className="border-2 border-dashed border-green-300 dark:border-green-700 p-8 rounded-lg text-center cursor-pointer bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <p className="text-gray-700 dark:text-gray-300 mb-2">Drag and drop your medical PDF here</p>
              <p className="text-sm text-gray-500">or click to browse</p>
              <Input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                className="mt-4"
              />
            </div>

            {pdfFile && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">Selected: {pdfFile.name}</p>
              </div>
            )}

            <Button
              onClick={handlePdfUpload}
              disabled={!pdfFile || loading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {loading ? "Processing..." : "Upload & Analyze PDF"}
            </Button>

            {pdfResponse && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">🧠 AI Summary:</h4>
                    <p className="text-sm">{pdfResponse.summary}</p>
                  </div>
                  {pdfResponse.risk_score && (
                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">📊 Risk Assessment:</h4>
                      <p className="text-sm">
                        Score: {pdfResponse.risk_score.risk_score?.toFixed(3)} <br />
                        Level: {pdfResponse.risk_score.risk_level}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Image Upload */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>Image Lab Report (OCR)</span>
            </CardTitle>
            <CardDescription>Upload lab report images for text extraction and analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 p-8 rounded-lg text-center bg-blue-50 dark:bg-blue-900/10">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <p className="text-gray-700 dark:text-gray-300 mb-2">Upload lab report image</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setReportImage(e.target.files?.[0] || null)}
                className="mt-4"
              />
            </div>

            {reportImage && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">Selected: {reportImage.name}</p>
              </div>
            )}

            <Button
              onClick={handleImageUpload}
              disabled={!reportImage || loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Processing..." : "Analyze Image Report"}
            </Button>

            {imageResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">OCR Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">📄 Extracted Text:</h4>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-32">
                      {imageResult.raw_text}
                    </pre>
                  </div>
                  {imageResult?.risk_score && (
                    <div>
                      <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">🧮 Risk Assessment:</h4>
                      <p className="text-sm">
                        Score: {imageResult.risk_score.risk_score.toFixed(3)} <br />
                        Level: {imageResult.risk_score.risk_level}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-2">🧠 AI Explanation:</h4>
                    <p className="text-sm whitespace-pre-line">{imageResult.ai_explanation}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RAG Q&A Section */}
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-indigo-600" />
            <span>Document-Based Q&A (RAG)</span>
          </CardTitle>
          <CardDescription>Ask questions based on your uploaded medical documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={ragPrompt}
            onChange={(e) => setRagPrompt(e.target.value)}
            placeholder="Ask a health question based on uploaded records..."
            className="min-h-[100px]"
          />
          <Button
            onClick={handleRagQuery}
            disabled={!ragPrompt.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? "Searching..." : "Ask AI"}
          </Button>

          {ragAnswer && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🧠 AI Answer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{ragAnswer}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📚 Context Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-48">
                    {ragContext}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
