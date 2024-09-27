// app/quick10/summary/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SummaryData {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeSpent: number;
  courseId: string;
}

export default function Quick10Summary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quick10SessionId = searchParams.get('quick10SessionId');

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (quick10SessionId) {
      fetchSummaryData(quick10SessionId);
    }
  }, [quick10SessionId]);

  const fetchSummaryData = async (quick10SessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quick10/summary?quick10SessionId=${quick10SessionId}`);
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

  const handleStartNewQuick10 = async () => {
    if (!summaryData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/quick10/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: summaryData.courseId }),
      });
      if (!response.ok) throw new Error('Failed to start new Quick 10 session');
      // const data = await response.json();
      router.push(`/quick10/questions?courseId=${summaryData.courseId}`);
    } catch (error) {
      console.error('Error starting new Quick 10 session:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCourseSelection = () => {
    router.push('/quick10');
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

  if (!summaryData) {
    return <div>No summary data available.</div>;
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
          <CardTitle>Quick 10 Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold">{summaryData.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Correct Answers</p>
              <p className="text-2xl font-bold text-green-600">{summaryData.correctAnswers}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Score</p>
              <p className="text-2xl font-bold">{summaryData.score.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time Spent</p>
              <p className="text-2xl font-bold">{formatTime(summaryData.timeSpent)}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col space-y-4">
            <Button onClick={handleStartNewQuick10}>
              Start New Quick 10
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