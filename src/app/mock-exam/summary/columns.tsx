// columns.tsx
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import MarkdownRenderer from '@/components/ui/MarkdownRenderer';

export type Question = {
  id: string
  type: 'MCQ' | 'LONG_FORM'
  content: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  simplifiedExplanation: string
}

export const columns: ColumnDef<Question>[] = [
  {
    accessorKey: "id",
    header: "No.",
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>
    },
  },
  // {
  //   accessorKey: "type",
  //   header: "Type",
  //   cell: ({ row }) => {
  //     const type = row.getValue("type") as string
  //     return <div>{type}</div>
  //   },
  // },
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
    accessorKey: "explanation",
    header: "Explanation",
    cell: ({ row }) => {
      const explanation = row.getValue("explanation") as string
      return <a href={explanation} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Explanation</a>
    },
  },
  {
    accessorKey: "simplifiedExplanation",
    header: "Simplified Explanation",
    cell: ({ row }) => {
      const simplifiedExplanation = row.getValue("simplifiedExplanation") as string
      return <a href={simplifiedExplanation} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Simplified Explanation</a>
    },
  },
]