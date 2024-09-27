// app/practice/questions/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, X, Loader2, Copy, LogOut } from "lucide-react";
import { toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import clipboardCopy from 'clipboard-copy';
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
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

interface Question {
  id: string;
  type: 'MCQ' | 'LONG_FORM';
  content: string;
  options: string[];
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
  isFinished: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (courseId && dietId) {
      startPracticeSession(courseId, dietId);
    }
  }, [courseId, dietId]);

  const startPracticeSession = useCallback(
    debounce(async (courseId: string, dietId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/practice/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId, dietId }),
        });
        if (!response.ok) throw new Error('Failed to start practice session');
        const data = await response.json();

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
        console.error('Error starting practice session:', error);
        toast.error('Failed to start practice session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const copyQuestionToClipboard = () => {
    if (session && currentQuestion) {
      const questionText = `${currentQuestion.content}\n\nOptions:\n${currentQuestion.options.join('\n')}`;
      clipboardCopy(questionText)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy question:', err);
          toast.error('Failed to copy question');
        });
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
    // Here you can add the logic to submit the answer to the server if needed
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
    if (!session || session.isFinished || isSubmitting) return;
    setIsSubmitting(true);
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
      setSession(prev => ({ ...prev!, isFinished: true }));
      router.push(`/practice/summary?practiceExamId=${data.practiceExamId}`);
    } catch (error) {
      console.error('Error finishing practice session:', error);
      toast.error('Failed to finish practice session. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {
    router.push('/practice');
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
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-muted p-4">
          <span className="text-lg font-semibold text-foreground">Practice Session</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/90 rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
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
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">
              Question {session.currentQuestionIndex + 1} / {session.questions.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyQuestionToClipboard}
              title={copySuccess ? "Copied!" : "Copy question to clipboard"}
              className="transition-all duration-200 rounded-full"
            >
              {copySuccess ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <MarkdownRenderer content={currentQuestion.content} />
          <p className="mb-6"></p>
          
          {currentQuestion.type === 'MCQ' ? (
            <RadioGroup onValueChange={handleAnswerSelect} value={userAnswer}>
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <Label
                    key={index}
                    htmlFor={`option-${index}`}
                    className={`flex items-center p-4 border rounded-lg transition-colors duration-200 ${
                      isAnswerSubmitted && option === currentQuestion.correctAnswer
                        ? 'bg-green-50 border-green-500'
                        : isAnswerSubmitted && userAnswer === option
                        ? 'bg-red-50 border-red-500'
                        : userAnswer === option
                        ? 'bg-muted'
                        : 'hover:bg-muted/50'
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
          ) : (
            <Textarea
              placeholder="Enter your answer here..."
              value={userAnswer || ''}
              onChange={(e) => handleAnswerSelect(e.target.value)}
              rows={6}
              className="w-full p-2 border rounded"
            />
          )}
  
          <div className="mt-6 space-y-4">
            <div className="flex justify-center space-x-8">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion} 
                disabled={session.currentQuestionIndex === 0}
                className="px-4 py-2 rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {!isAnswerSubmitted ? (
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={!userAnswer}
                  className="px-4 py-2 rounded-full transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Submit Answer
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="px-4 py-2 rounded-full transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                >
                  {showExplanation ? 'Hide Explanation' : 'View Explanation'}
                </Button>
              )}
              <Button 
                onClick={session.currentQuestionIndex === session.questions.length - 1 ? finishPracticeSession : handleNextQuestion}
                disabled={session.currentQuestionIndex === session.questions.length - 1 && (session.isFinished || isSubmitting)}
                className={`px-4 py-2 rounded-full transition-all duration-200 
                  ${isAnswerSubmitted 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                    : 'bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                  }`}
              >
                {session.currentQuestionIndex === session.questions.length - 1 ? 'Finish Practice' : 'Next'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {showExplanation && (
              <div className="p-4 bg-muted rounded-lg mt-4">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}