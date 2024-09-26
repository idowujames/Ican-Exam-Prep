"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from 'next/link';
import { DataTable } from "@/components/ui/data-table";
import { createColumns, Question } from "./columns";
import { QuestionDialog } from "@/components/ui/QuestionDialog";

interface SummaryData {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  questions: Question[];
}

export default function MockExamSummary() {
  const searchParams = useSearchParams();
  const mockExamId = searchParams.get('mockExamId');

  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);

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
      
      // Sort questions: MCQs first, then Long Form
      data.questions.sort((a: Question, b: Question) => {
        if (a.type === 'MCQ' && b.type !== 'MCQ') return -1;
        if (a.type !== 'MCQ' && b.type === 'MCQ') return 1;
        return 0;
      });
      
      setSummaryData(data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewQuestion = (question: Question) => {
    setSelectedQuestion(question);
    setIsQuestionDialogOpen(true);
  };

  const columns = createColumns(handleViewQuestion);

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

  const mcqQuestions = summaryData.questions.filter(q => q.type === 'MCQ');

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Mock Exam Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Total MCQs</p>
              <p className="text-2xl font-bold">{mcqQuestions.length}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Correct Answers (MCQs)</p>
              <p className="text-2xl font-bold text-green-600">{summaryData.correctAnswers}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Incorrect Answers (MCQs)</p>
              <p className="text-2xl font-bold text-red-600">{mcqQuestions.length - summaryData.correctAnswers}</p>
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
            <DataTable 
              columns={columns} 
              data={summaryData.questions}
            />
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
      <QuestionDialog
        question={selectedQuestion}
        isOpen={isQuestionDialogOpen}
        onClose={() => setIsQuestionDialogOpen(false)}
      />
    </div>
  );
}