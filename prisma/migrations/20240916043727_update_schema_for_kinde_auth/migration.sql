/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kindeAuthId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `timeLimit` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subjectId` to the `StudySession` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kindeAuthId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "description" TEXT,
ADD COLUMN     "timeLimit" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "StudySession" ADD COLUMN     "subjectId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "kindeAuthId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_kindeAuthId_key" ON "User"("kindeAuthId");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
