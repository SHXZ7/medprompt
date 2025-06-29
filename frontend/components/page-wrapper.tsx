import type { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  title: string
  description?: string
  gradient?: string
}

export function PageWrapper({
  children,
  title,
  description,
  gradient = "from-blue-50 via-white to-teal-50",
}: PageWrapperProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${gradient} dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-green-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main content container with proper centering and overflow handling */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header section - always visible */}
        <div className="flex-shrink-0 w-full px-4 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-teal-700 dark:from-white dark:via-blue-200 dark:to-teal-200 bg-clip-text text-transparent mb-2 sm:mb-3 animate-fade-in">
              {title}
            </h1>
            {description && (
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in-delay px-4">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Content section with proper centering and overflow */}
        <div className="flex-1 flex items-center justify-center px-4 pb-6">
          <div className="w-full max-w-7xl mx-auto">
            <div className="animate-slide-up">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
