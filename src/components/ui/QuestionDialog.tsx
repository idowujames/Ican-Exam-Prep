// components/ui/QuestionDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Question } from '../../app/mock-exam/summary/columns';
import MarkdownRenderer from './MarkdownRenderer';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from 'lucide-react'
interface QuestionDialogProps {
  question: Question | null
  isOpen: boolean
  onClose: () => void
}

export function QuestionDialog({ question, isOpen, onClose }: QuestionDialogProps) {
  if (!question) return null

//   const isCorrect = question.userAnswer === question.correctAnswer

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Question Review</DialogTitle>
          <DialogDescription>
            {question.type === 'MCQ' ? 'Multiple Choice Question' : 'Long Form Question'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[40vh] pr-4">
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Question:</h3>
              <MarkdownRenderer content={question.content} />
            </div>
            {question.type === 'MCQ' && (
              <div className="space-y-4">
                <h3 className="font-semibold">Options:</h3>
                <RadioGroup value={question.userAnswer}>
                  {question.options?.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded-md transition-colors">
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
                            ? "text-green-500 font-medium"
                            : option === question.userAnswer && option !== question.correctAnswer
                            ? "text-red-500 font-medium"
                            : ""
                        }
                      >
                        {option}
                      </Label>
                      {option === question.correctAnswer && (
                        <Check className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {option === question.userAnswer && option !== question.correctAnswer && (
                        <X className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Your Answer:</h4>
                <p>{question.userAnswer || 'No answer provided'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Correct Answer:</h4>
                <p>{question.correctAnswer}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="sm:justify-start mt-6">
          <div className="w-full space-y-2">
            <h4 className="font-semibold text-lg mb-2">Explanations:</h4>
            <div className="grid grid-cols-2 gap-4">
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
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}