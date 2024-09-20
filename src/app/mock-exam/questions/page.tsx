// src/app/mock-exam/questions/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  type: 'MCQ' | 'LONG_FORM';
  content: string;
  options: string[] | null;
}

interface MockExamSession {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  startTime: number;
  isFinished: boolean;
}

export default function MockExamQuestions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [session, setSession] = useState<MockExamSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(3 * 60 * 60 + 30 * 60); // 3h30m in seconds
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (courseId) {
      startMockExam(courseId);
    }
  }, [courseId]);

  useEffect(() => {
    if (session && !session.isFinished) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            finishMockExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [session]);

  const startMockExam = useCallback(
    debounce(async (courseId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/mock-exam/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });
        if (!response.ok) throw new Error('Failed to start mock exam');
        const data = await response.json();

        // Sort questions to put MCQs first
        const sortedQuestions = data.questions.sort((a: Question, b: Question) => 
          a.type === 'MCQ' ? -1 : b.type === 'MCQ' ? 1 : 0
        );
        
        setSession({
          id: data.id,
          questions: sortedQuestions,
          currentQuestionIndex: 0,
          answers: {},
          startTime: Date.now(),
          isFinished: false,
        });
      } catch (error) {
        console.error('Error starting mock exam:', error);
        toast.error('Failed to start mock exam. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleAnswerSelect = (answer: string) => {
    if (!session) return;
    setSession(prev => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [currentQuestion.id]: answer
      }
    }));
  };

  const handleNextQuestion = () => {
    if (!session) return;
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => ({
        ...prev!,
        currentQuestionIndex: prev!.currentQuestionIndex + 1
      }));
    }
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentQuestionIndex === 0) return;
    setSession(prev => ({
      ...prev!,
      currentQuestionIndex: prev!.currentQuestionIndex - 1
    }));
  };

  const finishMockExam = async () => {
    if (!session || session.isFinished || isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const response = await fetch('/api/mock-exam/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockExamId: session.id,
          answers: session.answers,
          timeSpent: Math.floor((Date.now() - session.startTime) / 1000)
        }),
      });
      if (!response.ok) throw new Error('Failed to finish mock exam');
      const data = await response.json();
      setSession(prev => ({ ...prev!, isFinished: true }));
      router.push(`/mock-exam/summary?mockExamId=${data.mockExamId}`);
    } catch (error) {
      console.error('Error finishing mock exam:', error);
      toast.error('Failed to finish mock exam. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {
    router.push('/mock-exam');
  };

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const userAnswer = session.answers[currentQuestion.id];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-gray-500">
              Question {session.currentQuestionIndex + 1} / {session.questions.length}
            </span>
            <span className={`text-sm font-medium ${timeRemaining <= 300 ? 'text-red-500' : 'text-gray-500'}`}>
              Time Remaining: {formatTime(timeRemaining)}
            </span>
          </div>
          <p className="text-lg mb-6">{currentQuestion.content}</p>
          
          {currentQuestion.type === 'MCQ' && (
            <RadioGroup onValueChange={handleAnswerSelect} value={userAnswer}>
              <div className="space-y-4">
                {currentQuestion.options?.map((option, index) => (
                  <Label
                    key={index}
                    htmlFor={`option-${index}`}
                    className={`flex items-center p-4 border rounded-lg ${
                      userAnswer === option ? 'bg-muted' : ''
                    }`}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} className="mr-3" />
                    {option}
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'LONG_FORM' && (
            <Textarea
              placeholder="Enter your answer here..."
              value={userAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              rows={6}
              className="w-full p-2 border rounded"
            />
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handlePreviousQuestion} disabled={session.currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="bg-red-100 hover:bg-red-200">
                  Quit
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress will not be saved if you quit now.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleQuit}>Quit</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {session.currentQuestionIndex === session.questions.length - 1 ? (
              <Button 
                onClick={finishMockExam} 
                disabled={session.isFinished || isSubmitting}
              >
                Finish Exam
              </Button>
            ) : (
              <Button onClick={handleNextQuestion}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}