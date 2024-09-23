// components/ui/QuestionDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from '../../app/mock-exam/summary/columns';
import MarkdownRenderer from './MarkdownRenderer';
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionDialogProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuestionDialog({ question, isOpen, onClose }: QuestionDialogProps) {
  if (!question) return null;

  const isCorrect = question.userAnswer === question.correctAnswer;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] w-[90vw] bg-white">
        <DialogHeader>
          <DialogTitle>Question Review</DialogTitle>
          <DialogDescription>
            {question.type === 'MCQ' ? 'Multiple Choice Question' : 'Long Form Question'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            <MarkdownRenderer content={question.content} />
            {question.type === 'MCQ' && (
              <>
                {question.options ? (
                  <RadioGroup value={question.userAnswer}>
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem 
                          value={option} 
                          id={`option-${index}`}
                          className={
                            option === question.correctAnswer
                              ? "text-green-500 border-green-500"
                              : option === question.userAnswer && option !== question.correctAnswer
                              ? "text-red-500 border-red-500"
                              : ""
                          }
                        />
                        <Label 
                          htmlFor={`option-${index}`}
                          className={
                            option === question.correctAnswer
                              ? "text-green-500"
                              : option === question.userAnswer && option !== question.correctAnswer
                              ? "text-red-500"
                              : ""
                          }
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <p>Options not available for this question.</p>
                )}
                <div>
                  <h4 className="font-semibold">Your Answer:</h4>
                  <p>{question.userAnswer || 'No answer provided'}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Correct Answer:</h4>
                  <p>{question.correctAnswer}</p>
                </div>
              </>
            )}
            {question.type === 'LONG_FORM' && (
              <div>
                <h4 className="font-semibold">Model Answer:</h4>
                <p>{question.correctAnswer}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-start mt-4">
          <div className="w-full space-y-2">
            <h4 className="font-semibold">Explanations:</h4>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(question.explanation, '_blank')}
            >
              View Standard Explanation
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(question.simplifiedExplanation, '_blank')}
            >
              View Simplified Explanation
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}