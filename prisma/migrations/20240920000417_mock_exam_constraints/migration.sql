/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId,startedAt]` on the table `MockExam` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MockExam" ADD COLUMN     "answers" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "MockExam_userId_courseId_startedAt_key" ON "MockExam"("userId", "courseId", "startedAt");
