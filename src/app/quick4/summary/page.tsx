// app/quick4/summary/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SummaryData {
  timeSpent: number;
  courseId: string;
  courseName: string;
}

export default function Quick4Summary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quick4SessionId = searchParams.get('quick4SessionId');

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (quick4SessionId) {
      fetchSummaryData(quick4SessionId);
    }
  }, [quick4SessionId]);

  const fetchSummaryData = async (quick4SessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quick4/summary?quick4SessionId=${quick4SessionId}`);
      if (!response.ok) throw new Error('Failed to fetch summary data');
      const data = await response.json();
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewQuick4 = async () => {
    if (!summaryData) return;
    router.push(`/quick4/questions?courseId=${summaryData.courseId}`);
  };

  const handleBackToCourseSelection = () => {
    router.push('/quick4');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Quick 4 Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="text-2xl font-semibold text-center mb-2">Job well done!</p>
            <p className="text-center">You've completed 4 long-form questions for {summaryData?.courseName}.</p>
          </div>
          <div className="text-center mb-6">
            <p className="text-sm font-medium text-gray-500">Time Spent</p>
            <p className="text-2xl font-bold">{summaryData ? formatTime(summaryData.timeSpent) : 'N/A'}</p>
          </div>
          <div className="mt-8 flex flex-col space-y-4">
            <Button onClick={handleStartNewQuick4}>
              Start New Quick 4
            </Button>
            <Button variant="outline" onClick={handleBackToCourseSelection}>
              Back to Course Selection
            </Button>
            <Button variant="secondary" onClick={handleBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}