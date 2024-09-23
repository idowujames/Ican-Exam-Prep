# ICAN Exam Prep Application MVP

## Overview

The ICAN Exam Prep Application is a web-based platform designed to help candidates prepare for the Institute of Chartered Accountants of Nigeria (ICAN) examinations. This MVP (Minimum Viable Product) version offers practice questions, mock exams, and progress tracking based on past ICAN examination papers.

## Features

1. **User Authentication**
   - Sign up and log in with email and password
   - Secure authentication using Kinde Auth

2. **Dashboard**
   - Personalized welcome message
   - Quick statistics (total questions attempted, average score, study time this week, mock exams completed)
   - Recent activity list
   - Quick access buttons for Practice and Mock exam modes

3. **Practice Mode**
   - Selection of exam type, course, and diet
   - Multiple-Choice Questions (MCQs) and Long-Form Questions
   - Immediate feedback on MCQs
   - Explanation display with standard and simplified options
   - Session summary upon completion

4. **Mock Exam Mode**
   - Timed exam simulation
   - Mix of MCQs and Long-Form Questions
   - Comprehensive results summary

5. **Progress Tracking**
   - Overall progress view
   - Performance summary by subject // TODO: Implement
   - Weak areas identification by subject // TODO: Implement

6. **Admin Interface** //TODO: Implement
   - User management
   - Exam and question management
   - Bulk question import via CSV

## Technologies Used

- Frontend: Next.js 14, TypeScript, Tailwind CSS
- UI Components: shadcn/ui
- Backend: Next.js API Routes
- Database: PostgreSQL (via Supabase)
- ORM: Prisma
- Authentication: Kinde Auth
- Deployment: Vercel

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- ICAN for providing the examination structure and content guidelines
- The Next.js and Prisma communities for their excellent documentation and support

## Contact

For any queries or support, please contact [idowu_james@rocketmail.com](mailto:idowu_james@rocketmail.com).