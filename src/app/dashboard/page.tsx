"use client"

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Clock, FileText, User, FastForward } from "lucide-react"
import { useEffect, useState } from "react"
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Loader2 } from "lucide-react"
import Link from 'next/link'
import { Separator } from "@/components/ui/separator"

interface DashboardData {
  totalQuestionsAttempted: number
  totalCorrectAnswers: number
  averageScore: number
  studyTimeThisWeek: number
  mockExamsCompleted: number
  recentActivity: Array<{
    type: string
    subject: string
    score: number | null
    completedAt: string
  }>
  name: string
}

export default function Dashboard() {
  const router = useRouter()
  const { isLoading, isAuthenticated } = useKindeBrowserClient()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => setDashboardData(data))
        .catch(error => console.error('Error fetching dashboard data:', error))
    }
  }, [isAuthenticated])

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">ICAN Exam Prep</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Profile
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-700 hover:text-gray-900">
              Settings
            </Link>
            <LogoutLink>
              <Button variant="outline" size="sm">Log out</Button>
            </LogoutLink>
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome back, {dashboardData.name || 'User'}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Questions Attempted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalQuestionsAttempted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.averageScore !== undefined && dashboardData.averageScore !== null
                  ? `${dashboardData.averageScore.toFixed(2)}%`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Study Time This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(dashboardData.studyTimeThisWeek)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mock Exams Completed</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.mockExamsCompleted}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <ul className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <li key={index} className="flex flex-col py-2 border-b border-gray-200 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">{activity.type}: {activity.subject}</span>
                        {activity.score !== null ? (
                          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            activity.score >= 70 ? 'bg-green-100 text-green-800 border border-green-300' : 
                            activity.score >= 50 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                            'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {activity.score.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-sm font-semibold text-blue-600 px-2 py-1 bg-blue-100 rounded-full border border-blue-300">Completed</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{formatDate(activity.completedAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No recent activity.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/practice" passHref legacyBehavior>
                  <Button className="w-full" size="lg" asChild>
                    <a><FileText className="mr-2 h-5 w-5" /> Practice</a>
                  </Button>
                </Link>
                <Link href="/mock-exam" passHref legacyBehavior>
                  <Button 
                    className="w-full hover:bg-primary hover:text-primary-foreground" 
                    size="lg" 
                    variant="outline" 
                    asChild
                  >
                    <a><FileText className="mr-2 h-5 w-5" /> Mock Exam</a>
                  </Button>
                </Link>
              </div>
              <Separator className="my-6" />
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/quick10" passHref legacyBehavior>
                    <Button className="w-full" variant="secondary" asChild>
                      <a><FastForward className="mr-2 h-4 w-4" /> Quick 10</a>
                    </Button>
                  </Link>
                  <Link href="/quick4" passHref legacyBehavior>
                    <Button className="w-full" variant="secondary" asChild>
                      <a><FastForward className="mr-2 h-4 w-4" /> Quick 4</a>
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}