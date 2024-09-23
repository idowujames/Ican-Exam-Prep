import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Eye } from "lucide-react"
import { Binoculars } from 'lucide-react';

export type Question = {
  id: string
  type: 'MCQ' | 'LONG_FORM'
  content: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  simplifiedExplanation: string
  options: string[] | null
}

export const createColumns = (viewQuestion: (question: Question) => void): ColumnDef<Question>[] => [
  {
    accessorKey: "id",
    header: "No.",
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "content",
    header: "Question",
    cell: ({ row }) => {
      const content = row.getValue("content") as string
      return <div className="max-w-[300px] truncate font-medium">{content}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const question = row.original
      if (question.type === 'LONG_FORM') {
        return (
          <Badge 
            variant="outline"
            className="bg-gray-100 text-gray-800 border-gray-300"
          >
            Long Form
          </Badge>
        )
      }
      const isCorrect = question.userAnswer === question.correctAnswer
      return (
        <Badge 
          variant={isCorrect ? "default" : "destructive"}
          className={cn(
            isCorrect ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300",
            "font-semibold"
          )}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "viewQuestion",
    header: "View",
    cell: ({ row }) => {
      const question = row.original
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => viewQuestion(question)}
          className="hover:bg-gray-100"
        >
          <Binoculars className="h-4 w-4 mr-2" />
          View
        </Button>
      )
    },
  },
]