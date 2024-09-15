'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


// Define types
interface UserProgress {
  overallProgress: number;
}

interface Activity {
  id: string;
  type: string;
  exam: string;
  subject: string;
  score: number;
  date: string;
}

interface Exam {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome</h1>
      
    </div>
  );
}