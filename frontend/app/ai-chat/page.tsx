"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Mic, Send, Bot, User, AlertCircle, RefreshCw, Copy, Check } from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"

export default function AIChat() {
  const [customPrompt, setCustomPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copiedStates, setCopiedStates] = useState({})

  const chatContainerRef = useRef(null)
  const recognitionRef = useRef(null)

  const predefinedQuestions = [
    "What are the symptoms of diabetes?",
    "How can I prevent heart disease?",
    "What foods help lower blood pressure?",
    "What are healthy BMI ranges by age?",
    "How often should I check my glucose levels?",
    "What are the benefits of regular exercise?",
    "How much water should I drink daily?",
    "What vitamins are essential for immune health?",
  ]

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      const scrollToBottom = () => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }

      // Use setTimeout to ensure DOM is updated
      setTimeout(scrollToBottom, 100)
    }
  }, [chatHistory])

  // Scroll to bottom when loading state changes
  useEffect(() => {
    if (chatContainerRef.current && chatHistory.length > 0) {
      const scrollToBottom = () => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
      setTimeout(scrollToBottom, 50)
    }
  }, [loading])

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const showError = (message) => {
    setError(message)
    setLoading(false)
  }

  const handleAskAI = async (prompt) => {
    const question = prompt?.trim() || customPrompt.trim()
    if (!question) {
      showError("Please enter a question")
      return
    }

    setLoading(true)
    setError("")

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const res = await fetch("http://localhost:8000/openrouter/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: question }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setAiResponse(data.response || "No response received")
      setCustomPrompt("")
    } catch (error) {
      if (error.name === "AbortError") {
        showError("Request timed out. Please try again.")
      } else if (error.message.includes("fetch")) {
        showError("Cannot connect to AI service. Please check if the server is running.")
      } else {
        showError(error.message || "Failed to get AI response")
      }
      console.error("Ask AI failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendChatMessage = async () => {
    if (!message.trim()) return

    const userMessage = message.trim()
    const historyFormatted = chatHistory.map((entry) => `User: ${entry.user}\nAssistant: ${entry.ai}`)

    // Add user message immediately for better UX
    const newUserEntry = { user: userMessage, ai: "..." }
    setChatHistory((prev) => [...prev, newUserEntry])
    setMessage("")
    setLoading(true)
    setError("")

    // Scroll to bottom after adding user message
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    }, 100)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      const res = await fetch("http://localhost:8000/openrouter/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: historyFormatted,
          user_message: userMessage,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Server error: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Update the last entry with the real AI response
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        { user: userMessage, ai: data.response || "No response received" },
      ])

      // Scroll to bottom after AI response
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      }, 100)
    } catch (error) {
      // Remove the temporary entry and show error
      setChatHistory((prev) => prev.slice(0, -1))
      setMessage(userMessage) // Restore the message

      if (error.name === "AbortError") {
        showError("Request timed out. Please try again.")
      } else if (error.message.includes("fetch")) {
        showError("Cannot connect to AI service. Please check if the server is running.")
      } else {
        showError(error.message || "Failed to send message")
      }
      console.error("Chat failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      showError("Speech recognition not supported in this browser.")
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setError("")
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)

      switch (event.error) {
        case "no-speech":
          showError("No speech detected. Please try again.")
          break
        case "audio-capture":
          showError("No microphone found. Please check your microphone.")
          break
        case "not-allowed":
          showError("Microphone access denied. Please allow microphone access.")
          break
        default:
          showError("Speech recognition error. Please try again.")
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setMessage((prev) => (prev + " " + transcript).trim())
    }

    try {
      recognition.start()
    } catch (error) {
      showError("Failed to start speech recognition.")
      setIsListening(false)
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (error) {
      showError("Failed to copy to clipboard")
    }
  }

  const clearChat = () => {
    setChatHistory([])
    setMessage("")
    setError("")
  }

  const retryLastMessage = () => {
    if (chatHistory.length > 0) {
      const lastUserMessage = chatHistory[chatHistory.length - 1].user
      setChatHistory((prev) => prev.slice(0, -1))
      setMessage(lastUserMessage)
    }
  }

  return (
    <PageWrapper
      title="AI Health Assistant"
      description="Get instant answers to your health questions with our AI-powered assistant."
    >
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError("")}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            ×
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Questions */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span>Quick Health Questions</span>
              </CardTitle>
              <CardDescription>Ask a custom question or choose from common health topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter your health question... (Press Ctrl+Enter to send)"
                  className="min-h-[100px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && customPrompt.trim()) {
                      e.preventDefault()
                      handleAskAI(customPrompt)
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  onClick={() => customPrompt.trim() && handleAskAI(customPrompt)}
                  disabled={loading || !customPrompt.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Thinking...
                    </>
                  ) : (
                    "Ask AI"
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Or choose a common question:</p>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                  {predefinedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => handleAskAI(question)}
                      disabled={loading}
                      className="text-left justify-start h-auto p-3 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 disabled:opacity-50"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {aiResponse && (
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    <span>AI Response</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(aiResponse, "ai-response")}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {copiedStates["ai-response"] ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line leading-relaxed">{aiResponse}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Continuous Chat */}
        <div>
          <Card className="shadow-lg overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    <span>Continuous Health Chat</span>
                  </CardTitle>
                  <CardDescription className="mt-1">Have a conversation with your AI health assistant</CardDescription>
                </div>
                {chatHistory.length > 0 && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={retryLastMessage}
                      disabled={loading}
                      className="text-gray-500 hover:text-gray-700 hover:bg-white/50"
                      title="Retry last message"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearChat}
                      disabled={loading}
                      className="text-gray-500 hover:text-gray-700 hover:bg-white/50"
                      title="Clear chat"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col h-[600px]">
              {/* Chat Messages Area */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-6 py-4 bg-gradient-to-b from-gray-50/50 via-white/80 to-gray-50/50 dark:from-gray-800/30 dark:via-gray-900/50 dark:to-gray-800/30"
                style={{
                  scrollBehavior: "smooth",
                  maxHeight: "100%",
                  minHeight: "0",
                }}
              >
                {chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Start Your Health Conversation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
                      Ask me anything about your health, symptoms, or wellness goals. I'm here to provide reliable
                      health information.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                        Health Tips
                      </span>
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        Symptoms
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
                        Wellness
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {chatHistory.map((msg, i) => (
                      <div key={`msg-${i}`} className="space-y-6">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="flex items-end space-x-3 max-w-[75%]">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-4 rounded-2xl rounded-br-md shadow-lg">
                              <p className="text-sm font-medium leading-relaxed break-words">{msg.user}</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </div>

                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="flex items-start space-x-3 max-w-[85%]">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                              <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-5 py-4 rounded-2xl rounded-bl-md shadow-lg relative group">
                              {msg.ai === "..." ? (
                                <div className="flex items-center space-x-3 text-gray-500 py-2">
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span className="text-sm">AI is thinking...</span>
                                </div>
                              ) : (
                                <>
                                  <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap break-words">
                                    {msg.ai}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(msg.ai, `chat-${i}`)}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 h-7 w-7"
                                    title="Copy message"
                                  >
                                    {copiedStates[`chat-${i}`] ? (
                                      <Check className="w-3 h-3" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                <div className="flex items-end space-x-4 max-w-4xl mx-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    className={`transition-all duration-200 flex-shrink-0 h-12 w-12 ${
                      isListening
                        ? "animate-pulse bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    title={isListening ? "Stop voice input" : "Start voice input"}
                    disabled={loading}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? "text-red-500" : "text-gray-500"}`} />
                  </Button>

                  <div className="flex-1 relative">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isListening ? "Listening..." : "Type your health question here..."}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !loading && message.trim()) {
                          sendChatMessage()
                        }
                      }}
                      className="h-12 pr-16 border-gray-200 dark:border-gray-700 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900/50 text-base"
                      disabled={loading || isListening}
                    />
                    {message.trim() && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={sendChatMessage}
                    disabled={loading || !message.trim() || isListening}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg flex-shrink-0 disabled:opacity-50 h-12 px-6"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>

                {/* Input Helper Text */}
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Press Enter to send • {isListening ? "Voice input active" : "Click mic for voice input"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
