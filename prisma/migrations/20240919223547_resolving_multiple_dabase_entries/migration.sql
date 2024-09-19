/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId,dietId,startedAt]` on the table `PracticeExam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PracticeExam_userId_courseId_dietId_startedAt_key" ON "PracticeExam"("userId", "courseId", "dietId", "startedAt");
