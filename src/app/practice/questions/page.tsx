// app/practice/questions/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, X, Loader2 } from "lucide-react";

interface Question {
    id: string;
    type: 'MCQ' | 'LONG_FORM';
    content: string;
    options: string[] | null;
    correctAnswer: string;
    explanation: string;
    simplifiedExplanation: string;
}

interface PracticeSession {
    id: string;
    questions: Question[];
    currentQuestionIndex: number;
    answers: { [questionId: string]: string };
    startTime: number;
}

export default function PracticeQuestions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const dietId = searchParams.get('dietId');

  const [session, setSession] = useState<PracticeSession | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId && dietId) {
      startPracticeSession(courseId, dietId);
    }
  }, [courseId, dietId]);

  const startPracticeSession = async (courseId: string, dietId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/practice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, dietId }),
      });
      if (!response.ok) throw new Error('Failed to start practice session');
      const data = await response.json();
      setSession({
        id: data.id,
        questions: data.questions,
        currentQuestionIndex: 0,
        answers: {},
        startTime: Date.now(),
      });
    } catch (error) {
      console.error('Error starting practice session:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmitAnswer = async () => {
    if (!session) return;
    setIsAnswerSubmitted(true);
    // In the new structure, we don't need to submit each answer to the backend
    // We'll only submit the final results at the end of the session
  };

  const handleNextQuestion = () => {
    if (!session) return;
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => ({
        ...prev!,
        currentQuestionIndex: prev!.currentQuestionIndex + 1
      }));
      resetQuestionState();
    } else {
      finishPracticeSession();
    }
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentQuestionIndex === 0) return;
    setSession(prev => ({
      ...prev!,
      currentQuestionIndex: prev!.currentQuestionIndex - 1
    }));
    resetQuestionState();
  };

  const resetQuestionState = () => {
    setShowExplanation(false);
    setIsAnswerSubmitted(false);
  };

  const finishPracticeSession = async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/practice/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceExamId: session.id,
          answers: session.answers,
          timeSpent: Math.floor((Date.now() - session.startTime) / 1000)
        }),
      });
      if (!response.ok) throw new Error('Failed to finish practice session');
      const data = await response.json();
      router.push(`/practice/summary?practiceExamId=${data.practiceExamId}`);
    } catch (error) {
      console.error('Error finishing practice session:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-gray-500">
              Question {session.currentQuestionIndex + 1} / {session.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-500">{currentQuestion.type}</span>
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
                      isAnswerSubmitted && option === currentQuestion.correctAnswer
                        ? 'bg-green-50 border-green-500'
                        : isAnswerSubmitted && userAnswer === option
                        ? 'bg-red-50 border-red-500'
                        : userAnswer === option
                        ? 'bg-muted'
                        : ''
                    }`}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} className="mr-3" />
                    {option}
                    {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                      <Check className="ml-auto h-5 w-5 text-green-500" />
                    )}
                    {isAnswerSubmitted && userAnswer === option && option !== currentQuestion.correctAnswer && (
                      <X className="ml-auto h-5 w-5 text-red-500" />
                    )}
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

          <div className="mt-6">
            {!isAnswerSubmitted ? (
              <Button onClick={handleSubmitAnswer} disabled={!userAnswer}>
                Submit Answer
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? 'Hide Explanation' : 'View Explanation'}
              </Button>
            )}
          </div>

          {showExplanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Explanations:</h4>
              <div className="space-y-2">
                <a 
                  href={currentQuestion.explanation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  Standard Explanation
                </a>
                <a 
                  href={currentQuestion.simplifiedExplanation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block"
                >
                  Simplified Explanation
                </a>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handlePreviousQuestion} disabled={session.currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNextQuestion}>
              {session.currentQuestionIndex === session.questions.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}