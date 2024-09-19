// src/app/practice/summary/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface SummaryData {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unanswered: number;
  timeSpent: number;
}

export default function PracticeSummary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const practiceExamId = searchParams.get('practiceExamId');

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (practiceExamId) {
      fetchSummaryData(practiceExamId);
    }
  }, [practiceExamId]);

  const fetchSummaryData = async (practiceExamId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/practice/summary?practiceExamId=${practiceExamId}`);
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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Practice Session Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold">{summaryData.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Correct Answers</p>
              <p className="text-2xl font-bold text-green-600">{summaryData.correctAnswers}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Incorrect Answers</p>
              <p className="text-2xl font-bold text-red-600">{summaryData.incorrectAnswers}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Unanswered</p>
              <p className="text-2xl font-bold text-yellow-600">{summaryData.unanswered}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500">Time Spent</p>
            <p className="text-2xl font-bold">{formatTime(summaryData.timeSpent)}</p>
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={() => router.push('/practice')}>
              Start New Practice
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}