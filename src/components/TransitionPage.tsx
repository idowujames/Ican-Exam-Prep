import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, BookOpen } from "lucide-react"

interface TransitionPageProps {
  onContinue: () => void
}

export function TransitionPage({ onContinue }: TransitionPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-md">
        <CardHeader className="bg-primary text-primary-foreground py-4 px-6">
          <CardTitle className="text-xl font-bold text-center">
            SECTION B: OPEN-ENDED QUESTIONS
          </CardTitle>
          <p className="text-center mt-1 text-primary-foreground/80 text-sm">80 MARKS</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">            
            <p className="text-base text-gray-700">
              You are done with the multiple choice questions and now transitioning to the Open-Ended Questions section.
            </p>

            <Separator className="my-2" />

            <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded-r-md">
              <p className="text-blue-800 text-sm">
                These questions are provided as they appear in the exam papers. While not marked by the application, they offer valuable practice for the actual exam.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="font-semibold text-base mb-2 text-gray-800 flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Instructions:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Read each question carefully and answer as you would in the actual exam</li>
                <li>Write out your answers on a sheet of paper or in a separate booklet</li>
                <li>Cross-check your answers with those provided online or in the PDF files</li>
                <li>Use the provided text area for any additional notes or thoughts</li>
              </ul>
            </div>

            <Button 
              onClick={onContinue} 
              className="w-full py-2 text-sm font-semibold mt-4 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 ease-in-out"
            >
              Continue to Open-Ended Questions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}