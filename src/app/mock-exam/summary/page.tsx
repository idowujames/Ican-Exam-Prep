// src/app/mock-exam/summary/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from 'next/link';

interface SummaryData {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  questions: {
    id: string;
    type: 'MCQ' | 'LONG_FORM';
    content: string;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
    simplifiedExplanation: string;
  }[];
}

export default function MockExamSummary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mockExamId = searchParams.get('mockExamId');

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (mockExamId) {
      fetchSummaryData(mockExamId);
    }
  }, [mockExamId]);

  const fetchSummaryData = async (mockExamId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/mock-exam/summary?mockExamId=${mockExamId}`);
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
          <CardTitle>Mock Exam Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Questions</p>
              <p className="text-2xl font-bold">{summaryData.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Correct Answers (MCQs)</p>
              <p className="text-2xl font-bold text-green-600">{summaryData.correctAnswers}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Incorrect Answers (MCQs)</p>
              <p className="text-2xl font-bold text-red-600">{summaryData.incorrectAnswers}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Score (MCQs)</p>
              <p className="text-2xl font-bold">{summaryData.score.toFixed(2)}%</p>
            </div>
          </div>
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500">Time Spent</p>
            <p className="text-2xl font-bold">{formatTime(summaryData.timeSpent)}</p>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Question Review</h3>
            {summaryData.questions.map((question, index) => (
              <div key={question.id} className="mb-6 p-4 border rounded-lg">
                <p className="font-medium mb-2">Question {index + 1}: {question.content}</p>
                {question.type === 'MCQ' && (
                  <>
                    <p className="text-sm">Your Answer: <span className={question.userAnswer === question.correctAnswer ? 'text-green-600' : 'text-red-600'}>{question.userAnswer}</span></p>
                    <p className="text-sm">Correct Answer: <span className="text-green-600">{question.correctAnswer}</span></p>
                  </>
                )}
                {question.type === 'LONG_FORM' && (
                  <p className="text-sm">Your Answer: {question.userAnswer}</p>
                )}
                <div className="mt-2">
                  <p className="text-sm font-medium">Explanation:</p>
                  <p className="text-sm">{question.explanation}</p>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Simplified Explanation:</p>
                  <p className="text-sm">{question.simplifiedExplanation}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Link href="/mock-exam" passHref>
              <Button variant="outline">
                Start New Mock Exam
              </Button>
            </Link>
            <Link href="/dashboard" passHref>
              <Button>
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}