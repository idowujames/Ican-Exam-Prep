// /app/practice/page.tsx

"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import Link from 'next/link';

interface Diet {
  id: string;
  name: string;
}

interface Course {
  id: string;
  name: string;
  diets: Diet[];
}

interface ExamType {
  id: string;
  name: string;
  courses: Course[];
}

export default function PracticeSubjectSelection() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useKindeBrowserClient();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedDiets, setSelectedDiets] = useState<{[courseId: string]: string}>({});

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/practice/exams')
        .then(response => response.json())
        .then(data => setExamTypes(data))
        .catch(error => console.error('Error fetching exam types:', error));
    }
  }, [isAuthenticated]);

  const handleStartPractice = (courseId: string, dietId: string) => {
    if (courseId && dietId) {
      router.push(`/practice/questions?courseId=${courseId}&dietId=${dietId}`);
    } else {
      alert("Please select a course and diet before starting practice.");
    }
  };

  const handleDietChange = (courseId: string, dietId: string) => {
    setSelectedDiets(prev => ({ ...prev, [courseId]: dietId }));
  };

  if (isLoading || !examTypes.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-screen space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Practice Mode</h1>
        <Link href="/dashboard" passHref>
          <Button variant="outline" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <Tabs defaultValue={examTypes[0]?.id}>
        <TabsList className="grid w-full grid-cols-3 tabs-list">
          {examTypes.map(examType => (
            <TabsTrigger key={examType.id} value={examType.id} className="tab-trigger">{examType.name}</TabsTrigger>
          ))}
        </TabsList>
        {examTypes.map(examType => (
          <TabsContent key={examType.id} value={examType.id} className="mt-6 tab-content">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {examType.courses.map(course => (
                <Card key={course.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <BookOpen className="mr-2 h-5 w-5" />
                      {course.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Practice questions for {course.name}.
                    </p>
                    <Select onValueChange={(value) => handleDietChange(course.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exam diet" />
                      </SelectTrigger>
                      <SelectContent>
                        {course.diets.map(diet => (
                          <SelectItem key={diet.id} value={diet.id}>{diet.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartPractice(course.id, selectedDiets[course.id])}
                      disabled={!selectedDiets[course.id]}
                    >
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}