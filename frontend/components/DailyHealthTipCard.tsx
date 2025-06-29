import { useState, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function DailyHealthTipCard() {
  const [tip, setTip] = useState("")
  const [source, setSource] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/tips/daily")
        const data = await res.json()
        setTip(data.tip)
        setSource(data.source)
      } catch (err) {
        setTip("Stay hydrated and take regular breaks.")
        setSource("Fallback")
      } finally {
        setLoading(false)
      }
    }

    fetchTip()
  }, [])

  return (
    <Card className="shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
          <Sparkles className="w-5 h-5" />
          <span>Daily Health Tip</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-green-700 dark:text-green-300">Loading...</p>
        ) : (
          <>
            <p className="text-sm text-green-700 dark:text-green-300 mb-2">"{tip}"</p>
            <p className="text-xs text-green-500 dark:text-green-400 mb-4">— {source}</p>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => window.location.reload()}
            >
              More Tips
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}