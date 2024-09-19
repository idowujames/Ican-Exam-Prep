/*
  Warnings:

  - You are about to drop the `MockExamQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PracticeExamQuestion` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `correctAnswers` to the `MockExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSpent` to the `MockExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `MockExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correctAnswers` to the `PracticeExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeSpent` to the `PracticeExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalQuestions` to the `PracticeExam` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MockExamQuestion" DROP CONSTRAINT "MockExamQuestion_mockExamId_fkey";

-- DropForeignKey
ALTER TABLE "MockExamQuestion" DROP CONSTRAINT "MockExamQuestion_questionId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeExamQuestion" DROP CONSTRAINT "PracticeExamQuestion_practiceExamId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeExamQuestion" DROP CONSTRAINT "PracticeExamQuestion_questionId_fkey";

-- AlterTable
ALTER TABLE "MockExam" ADD COLUMN     "correctAnswers" INTEGER NOT NULL,
ADD COLUMN     "timeSpent" INTEGER NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PracticeExam" ADD COLUMN     "correctAnswers" INTEGER NOT NULL,
ADD COLUMN     "timeSpent" INTEGER NOT NULL,
ADD COLUMN     "totalQuestions" INTEGER NOT NULL,
ALTER COLUMN "score" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "MockExamQuestion";

-- DropTable
DROP TABLE "PracticeExamQuestion";

-- CreateTable
CREATE TABLE "UserProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "totalAttempts" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "totalCorrect" INTEGER NOT NULL,
    "averageScore" DOUBLE PRECISION NOT NULL,
    "totalTimeSpent" INTEGER NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "completedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProgress_userId_courseId_key" ON "UserProgress"("userId", "courseId");

-- CreateIndex
CREATE INDEX "RecentActivity_userId_completedAt_idx" ON "RecentActivity"("userId", "completedAt");

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProgress" ADD CONSTRAINT "UserProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentActivity" ADD CONSTRAINT "RecentActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecentActivity" ADD CONSTRAINT "RecentActivity_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
