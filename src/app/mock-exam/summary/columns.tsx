// app/mock-exam/summary/columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      return <div className="text-center">{row.index + 1}</div>
    },
  },
  {
    accessorKey: "content",
    header: "Question",
    cell: ({ row }) => {
      const content = row.getValue("content") as string
      return <div className="max-w-[300px] truncate">{content}</div>
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
            className="bg-transparent text-gray-500 border-gray-300"
          >
            N/A
          </Badge>
        )
      }
      const isCorrect = question.userAnswer === question.correctAnswer
      return (
        <Badge 
          variant={isCorrect ? "default" : "destructive"}
          className={cn(
            isCorrect ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600",
            "text-white"
          )}
        >
          {isCorrect ? "Correct" : "Incorrect"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "viewQuestion",
    header: "View Question",
    cell: ({ row }) => {
      const question = row.original
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewQuestion(question)}
        >
          View Question
        </Button>
      )
    },
  },
]