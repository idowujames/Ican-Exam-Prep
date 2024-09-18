"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Clock, FileText, User } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import Link from 'next/link';

interface DashboardData {
  totalQuestionsAttempted: number;
  averageScore?: number;
  studyTimeThisWeek: number;
  mockExamsCompleted: number;
  recentActivity?: Array<{
    type: string;
    subject: string;
    score: number | null;
  }>;
  name: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useKindeBrowserClient();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => setDashboardData(data))
        .catch(error => console.error('Error fetching dashboard data:', error));
    }
  }, [isAuthenticated]);

  if (isLoading || !dashboardData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img
              alt="ICAN Logo"
              className="h-8 w-auto mr-2"
              height="32"
              src="/placeholder.svg"
              style={{
                aspectRatio: "32/32",
                objectFit: "cover",
              }}
              width="32"
            />
            <h1 className="text-xl font-semibold text-gray-900">ICAN Exam Prep</h1>
          </div>
          <nav className="flex items-center space-x-4">
          <Link href="#" className="text-gray-500 hover:text-gray-700">
              Profile
          </Link>
            <a className="text-gray-500 hover:text-gray-700" href="#">
              Settings
            </a>
            <LogoutLink>
              <Button variant="outline">Log out</Button>
            </LogoutLink>
          </nav>
        </div>
      </header>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back, {user?.given_name || 'User'}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions Attempted</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalQuestionsAttempted || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.averageScore !== undefined 
                  ? `${dashboardData.averageScore.toFixed(2)}%` 
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time This Week</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.floor((dashboardData.studyTimeThisWeek || 0) / 60)}h {(dashboardData.studyTimeThisWeek || 0) % 60}m
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mock Exams Completed</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.mockExamsCompleted || 0}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <ul className="space-y-2">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{activity.type}: {activity.subject}</span>
                      <span className={`font-semibold ${
                        activity.score && activity.score >= 70 ? 'text-green-600' : 
                        activity.score && activity.score >= 50 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {activity.score !== null ? `${activity.score}%` : 'N/A'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No recent activity.</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <Link href="/practice" passHref legacyBehavior>
                <Button className="w-full" asChild>
                  <a>Start Practice Mode</a>
                </Button>
              </Link>
              <Link href="/mock-exam" passHref legacyBehavior>
                <Button className="w-full" variant="outline" asChild>
                  <a>Take Mock Exam</a>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}