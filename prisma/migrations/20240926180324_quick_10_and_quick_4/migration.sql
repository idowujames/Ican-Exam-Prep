-- AlterTable
ALTER TABLE "MockExam" ADD COLUMN     "questionIds" TEXT[];

-- CreateTable
CREATE TABLE "Quick10Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "questionIds" TEXT[],
    "answers" JSONB,

    CONSTRAINT "Quick10Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quick4Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "questionIds" TEXT[],

    CONSTRAINT "Quick4Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quick10Session_userId_courseId_startedAt_key" ON "Quick10Session"("userId", "courseId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Quick4Session_userId_courseId_startedAt_key" ON "Quick4Session"("userId", "courseId", "startedAt");

-- AddForeignKey
ALTER TABLE "Quick10Session" ADD CONSTRAINT "Quick10Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quick10Session" ADD CONSTRAINT "Quick10Session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quick4Session" ADD CONSTRAINT "Quick4Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quick4Session" ADD CONSTRAINT "Quick4Session_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
