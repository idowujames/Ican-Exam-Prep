/*
  Warnings:

  - You are about to drop the column `examId` on the `MockExam` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `PracticeExam` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `StudySession` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Exam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Key` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courseId` to the `MockExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `PracticeExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dietId` to the `PracticeExam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dietId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `StudySession` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Key" DROP CONSTRAINT "Key_user_id_fkey";

-- DropForeignKey
ALTER TABLE "MockExam" DROP CONSTRAINT "MockExam_examId_fkey";

-- DropForeignKey
ALTER TABLE "PracticeExam" DROP CONSTRAINT "PracticeExam_examId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_examId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_user_id_fkey";

-- DropForeignKey
ALTER TABLE "StudySession" DROP CONSTRAINT "StudySession_subjectId_fkey";

-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "MockExam" DROP COLUMN "examId",
ADD COLUMN     "courseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PracticeExam" DROP COLUMN "examId",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "dietId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "examId",
DROP COLUMN "subjectId",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "dietId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StudySession" DROP COLUMN "subjectId",
ADD COLUMN     "courseId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verified";

-- DropTable
DROP TABLE "Exam";

-- DropTable
DROP TABLE "Key";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "Subject";

-- CreateTable
CREATE TABLE "ExamType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examTypeId" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Diet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamType_name_key" ON "ExamType"("name");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "ExamType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diet" ADD CONSTRAINT "Diet_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_dietId_fkey" FOREIGN KEY ("dietId") REFERENCES "Diet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeExam" ADD CONSTRAINT "PracticeExam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeExam" ADD CONSTRAINT "PracticeExam_dietId_fkey" FOREIGN KEY ("dietId") REFERENCES "Diet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExam" ADD CONSTRAINT "MockExam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
