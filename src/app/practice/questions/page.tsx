// src/app/practice/questions/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";

interface Question {
    id: string;
    type: 'MCQ' | 'LONG_FORM';
    content: string;
    options: string[] | null;
    correctAnswer: string;
    explanation: string;
    simplifiedExplanation: string;
}

export default function PracticeQuestions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const dietId = searchParams.get('dietId');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [longFormAnswer, setLongFormAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [practiceExamId, setPracticeExamId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && dietId) {
      startPracticeExam(courseId, dietId);
    }
  }, [courseId, dietId]);

  const startPracticeExam = async (courseId: string, dietId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/practice/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, dietId }),
      });
      if (!response.ok) throw new Error('Failed to start practice exam');
      const data = await response.json();
      setPracticeExamId(data.id);
      // Sort questions to have MCQs first
      const sortedQuestions = data.questions.sort((a: Question, b: Question) => 
        a.type === 'MCQ' ? -1 : b.type === 'MCQ' ? 1 : 0
      );
      setQuestions(sortedQuestions);
    } catch (error) {
      console.error('Error starting practice exam:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(value);
  };

  const handleLongFormAnswerChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLongFormAnswer(event.target.value);
  };

  const handleSubmitAnswer = async () => {
    if (!practiceExamId) return;

    setIsAnswerSubmitted(true);
    try {
      await fetch('/api/practice/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceExamId,
          questionId: currentQuestion.id,
          answer: currentQuestion.type === 'MCQ' ? selectedAnswer : longFormAnswer,
        }),
      });
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetQuestionState();
    } else {
      // Handle end of practice session
      router.push(`/practice/summary?practiceExamId=${practiceExamId}`);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetQuestionState();
    }
  };

  const resetQuestionState = () => {
    setSelectedAnswer(null);
    setLongFormAnswer('');
    setShowExplanation(false);
    setIsAnswerSubmitted(false);
  };

  const renderExplanationLinks = () => (
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
  );

  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div>No questions available.</div>;
  }

  return (
    <div className="container mx-auto min-h-screen p-4 md:p-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-500">{currentQuestion.type}</span>
          </div>
          <p className="text-lg mb-6">{currentQuestion.content}</p>
          
          {currentQuestion.type === 'MCQ' && (
            <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswer || undefined}>
              <div className="space-y-4">
                {Array.isArray(currentQuestion.options) ? (
                  currentQuestion.options.map((option, index) => (
                    <Label
                      key={index}
                      htmlFor={`option-${index}`}
                      className={`flex items-center p-4 border rounded-lg ${
                        isAnswerSubmitted && option === currentQuestion.correctAnswer
                          ? 'bg-green-50 border-green-500'
                          : isAnswerSubmitted && selectedAnswer === option
                          ? 'bg-red-50 border-red-500'
                          : selectedAnswer === option
                          ? 'bg-muted'
                          : ''
                      }`}
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} className="mr-3" />
                      {option}
                      {isAnswerSubmitted && option === currentQuestion.correctAnswer && (
                        <Check className="ml-auto h-5 w-5 text-green-500" />
                      )}
                      {isAnswerSubmitted && selectedAnswer === option && option !== currentQuestion.correctAnswer && (
                        <X className="ml-auto h-5 w-5 text-red-500" />
                      )}
                    </Label>
                  ))
                ) : (
                  <p>No options available for this question.</p>
                )}
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === 'LONG_FORM' && (
            <Textarea
              placeholder="Enter your answer here..."
              value={longFormAnswer}
              onChange={handleLongFormAnswerChange}
              rows={6}
              className="w-full p-2 border rounded"
            />
          )}

          <div className="mt-6">
            {!isAnswerSubmitted ? (
              <Button onClick={handleSubmitAnswer} disabled={!selectedAnswer && !longFormAnswer}>
                Submit Answer
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? 'Hide Explanation' : 'View Explanation'}
              </Button>
            )}
          </div>

          {showExplanation && renderExplanationLinks()}

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}