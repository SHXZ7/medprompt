"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Activity,
  MessageSquare,
  FileText,
  BarChart3,
  Heart,
  TrendingUp,
  Shield,
  Calendar,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  Eye,
} from "lucide-react"
import { PageWrapper } from "@/components/page-wrapper"
import DailyHealthTipCard from "@/components/DailyHealthTipCard"

export default function Dashboard() {
  const quickStats = [
    {
      title: "Health Score",
      value: "85",
      unit: "/100",
      change: "+5%",
      trend: "up",
      icon: Heart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    {
      title: "Risk Level",
      value: "Low",
      unit: "Risk",
      change: "Stable",
      trend: "stable",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "BMI Status",
      value: "24.2",
      unit: "kg/m²",
      change: "Normal",
      trend: "stable",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
    },
    {
      title: "Next Check",
      value: "5",
      unit: "days",
      change: "Scheduled",
      trend: "scheduled",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
    },
  ]
  

  const navigationCards = [
    {
      title: "Health Assessment",
      description: "Complete comprehensive risk assessment with AI-powered insights and personalized recommendations",
      icon: Activity,
      href: "/assessment",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20",
      features: ["Risk Prediction", "Health Tips", "7-Day Plans"],
      badge: "Popular",
      badgeColor: "bg-blue-500",
    },
    {
      title: "AI Chat Assistant",
      description: "Get instant answers to health questions with advanced AI that remembers your conversation history",
      icon: MessageSquare,
      href: "/ai-chat",
      gradient: "from-purple-500 to-pink-500",
      bgGradient:
        "from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20",
      features: ["Voice Input", "Memory", "24/7 Available"],
      badge: "AI Powered",
      badgeColor: "bg-purple-500",
    },
    {
      title: "Document Parser",
      description: "Upload medical documents and images for intelligent analysis, OCR, and risk extraction",
      icon: FileText,
      href: "/documents",
      gradient: "from-green-500 to-emerald-500",
      bgGradient:
        "from-green-50 via-emerald-50 to-green-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-green-900/20",
      features: ["PDF Analysis", "OCR", "RAG Q&A"],
      badge: "Smart",
      badgeColor: "bg-green-500",
    },
    {
      title: "Health Visualizations",
      description: "Track and visualize your health metrics with interactive charts and trend analysis",
      icon: BarChart3,
      href: "/visualization",
      gradient: "from-orange-500 to-red-500",
      bgGradient:
        "from-orange-50 via-red-50 to-orange-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-orange-900/20",
      features: ["Interactive Charts", "Trend Analysis", "Export Data"],
      badge: "Visual",
      badgeColor: "bg-orange-500",
    },
  ]

  const recentActivities = [
    { action: "Health Assessment Completed", time: "2 hours ago", icon: Activity, color: "text-blue-600" },
    { action: "AI Chat Session", time: "1 day ago", icon: MessageSquare, color: "text-purple-600" },
    { action: "Document Uploaded", time: "3 days ago", icon: FileText, color: "text-green-600" },
    { action: "BMI Chart Generated", time: "1 week ago", icon: BarChart3, color: "text-orange-600" },
  ]

  return (
    <PageWrapper
      title="Health Dashboard"
      description="Welcome back! Here's your comprehensive health overview and quick access to all AI-powered features."
      gradient="from-blue-50 via-indigo-50 to-purple-50"
    > 
      {/* Enhanced Welcome Section */}
      <div className="mb-8">
        <Card className="relative overflow-hidden border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/90 to-teal-500/90" />
          <CardContent className="relative p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    AI-Powered Health Assistant
                  </Badge>
                </div>
                <h2 className="text-3xl font-bold mb-2">Welcome to MedPrompt+</h2>
                <p className="text-blue-100 mb-6 max-w-lg text-lg">
                  Your intelligent health companion is ready to provide personalized insights, risk assessments, and
                  medical guidance powered by advanced AI.
                </p>
                <div className="flex flex-wrap gap-3">
                <Link href="/assessment" passHref>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Assessment
                  </Button>
                </Link>
                <Link href="/ai-chat" passHref>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
                    <Brain className="w-4 h-4 mr-2" />
                    Ask AI
                  </Button>
                </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Heart className="w-20 h-20 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Sparkles className="w-4 h-4 text-yellow-800" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            className={`hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${stat.borderColor} ${stat.bgColor}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor} border ${stat.borderColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.unit}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Enhanced Navigation Cards */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {navigationCards.map((card, index) => (
              <Link key={index} href={card.href} className="group">
                <Card
                  className={`h-full hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br ${card.bgGradient} border-0 relative overflow-hidden`}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className={`${card.badgeColor} text-white border-0 shadow-lg`}>{card.badge}</Badge>
                  </div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`p-4 rounded-2xl bg-gradient-to-r ${card.gradient} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                      >
                        <card.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{card.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base leading-relaxed">{card.description}</CardDescription>
                    <div className="flex flex-wrap gap-2">
                      {card.features.map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="ghost"
                        className="p-0 h-auto font-medium text-primary group-hover:text-primary/80"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
        {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Health Tips */}
          <DailyHealthTipCard />

          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/assessment" passHref>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
              </Link>
              <Link href="/ai-chat" passHref>
              <Button className="w-full justify-start bg-transparent" variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask AI Question
              </Button>
              </Link>
              <Link href="/documents" passHref>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </Link> 
            </CardContent>
          </Card>         
        </div>
      </div>
    </PageWrapper>
  )
}
