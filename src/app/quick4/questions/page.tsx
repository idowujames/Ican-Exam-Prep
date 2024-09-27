// app/quick4/questions/page.tsx

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Loader2, Copy } from "lucide-react";
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
  content: string;
}

interface Quick4Session {
  id: string;
  questions: Question[];
  currentQuestionIndex: number;
  startTime: number;
  isFinished: boolean;
}

export default function Quick4Questions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');

  const [session, setSession] = useState<Quick4Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (courseId) {
      startQuick4Session(courseId);
    }
  }, [courseId]);

  const startQuick4Session = useCallback(
    debounce(async (courseId: string) => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/quick4/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId }),
        });
        if (!response.ok) throw new Error('Failed to start Quick 4 session');
        const data = await response.json();
        
        setSession({
          id: data.id,
          questions: data.questions,
          currentQuestionIndex: 0,
          startTime: Date.now(),
          isFinished: false,
        });
      } catch (error) {
        console.error('Error starting Quick 4 session:', error);
        toast.error('Failed to start Quick 4 session. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const copyQuestionToClipboard = () => {
    if (session && currentQuestion) {
      clipboardCopy(currentQuestion.content)
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

  const handleNextQuestion = () => {
    if (!session) return;
    if (session.currentQuestionIndex < session.questions.length - 1) {
      setSession(prev => ({
        ...prev!,
        currentQuestionIndex: prev!.currentQuestionIndex + 1
      }));
    } else {
      finishQuick4Session();
    }
  };

  const handlePreviousQuestion = () => {
    if (!session || session.currentQuestionIndex === 0) return;
    setSession(prev => ({
      ...prev!,
      currentQuestionIndex: prev!.currentQuestionIndex - 1
    }));
  };

  const finishQuick4Session = async () => {
    if (!session || session.isFinished || isSubmitting) return;
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const response = await fetch('/api/quick4/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quick4SessionId: session.id,
          timeSpent: Math.floor((Date.now() - session.startTime) / 1000)
        }),
      });
      if (!response.ok) throw new Error('Failed to finish Quick 4 session');
      const data = await response.json();
      setSession(prev => ({ ...prev!, isFinished: true }));
      router.push(`/quick4/summary?quick4SessionId=${data.quick4SessionId}`);
    } catch (error) {
      console.error('Error finishing Quick 4 session:', error);
      toast.error('Failed to finish Quick 4 session. Please try again.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleQuit = () => {
    router.push('/quick4');
  };

  if (isLoading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentQuestion = session.questions[session.currentQuestionIndex];

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-gray-500">
              Question {session.currentQuestionIndex + 1} / {session.questions.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={copyQuestionToClipboard}
              title={copySuccess ? "Copied!" : "Copy question to clipboard"}
              className="transition-all duration-200"
            >
              {copySuccess ? "Copied!" : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <MarkdownRenderer content={currentQuestion.content} />
          <p className="mb-6"></p>
          
          <Textarea
            placeholder="You can use this space for notes (optional)"
            rows={10}
            className="w-full p-2 border rounded"
          />
  
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
            {session.currentQuestionIndex === session.questions.length - 1 ? (
              <Button 
                onClick={finishQuick4Session}
                disabled={session.isFinished || isSubmitting}
              >
                Finish Quick 4
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