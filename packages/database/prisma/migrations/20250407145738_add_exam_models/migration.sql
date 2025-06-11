/*
  Warnings:

  - You are about to drop the column `shortDescription` on the `courses` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LessonDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('VIEW_COURSE', 'VIEW_LESSON', 'START_LESSON', 'COMPLETE_LESSON', 'SEARCH', 'ENROLLMENT', 'RATING', 'LOGIN', 'LOGOUT', 'DOWNLOAD_RESOURCE', 'COMMENT', 'QUIZ_ATTEMPT');

-- CreateEnum
CREATE TYPE "PathStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "ExamForm" AS ENUM ('TRAC_NGHIEM', 'TU_LUAN', 'KET_HOP', 'FORM_2018', 'FORM_2025');

-- CreateEnum
CREATE TYPE "ExamCategory" AS ENUM ('THUONG_XUYEN_MIENG', 'GIUA_KI_I', 'CUOI_KI_I', 'GIUA_KI_II', 'CUOI_KI_II', 'KHAO_SAT', 'DE_CUONG', 'HOC_SINH_GIOI', 'TUYEN_SINH', 'KHAO_SAT_THI_THU');

-- CreateEnum
CREATE TYPE "ExamType" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "courses" DROP COLUMN "shortDescription";

-- AlterTable
ALTER TABLE "progress" ADD COLUMN     "attentionScore" DOUBLE PRECISION,
ADD COLUMN     "difficulty" "LessonDifficulty",
ADD COLUMN     "interactionCount" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "timeSpent" INTEGER;

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "languagePreference" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "learningGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notificationPreferences" JSONB,
ADD COLUMN     "preferredLearningTime" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "weeklyLearningTarget" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "user_activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "metadata" JSONB,
    "deviceInfo" TEXT,
    "ipAddress" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_learning_styles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visualScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "auditoryScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "readingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kinestheticScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_learning_styles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "interestLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reason" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isViewed" BOOLEAN NOT NULL DEFAULT false,
    "isEnrolled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "content_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_paths" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimatedCompletionTime" INTEGER NOT NULL DEFAULT 0,
    "status" "PathStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_path_steps" (
    "id" TEXT NOT NULL,
    "pathId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "status" "PathStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_path_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" JSONB,
    "questions" INTEGER[],
    "duration" INTEGER NOT NULL,
    "difficulty" "Difficulty" NOT NULL,
    "subject" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "form" "ExamForm" NOT NULL DEFAULT 'TRAC_NGHIEM',
    "createdBy" TEXT NOT NULL,
    "averageScore" DOUBLE PRECISION,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "examCategory" "ExamCategory" NOT NULL,
    "type" "ExamType" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "answers" JSONB,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LessonExams" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "user_activity_logs_userId_activityType_idx" ON "user_activity_logs"("userId", "activityType");

-- CreateIndex
CREATE INDEX "user_activity_logs_entityType_entityId_idx" ON "user_activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "user_learning_styles_userId_key" ON "user_learning_styles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_userId_categoryId_key" ON "user_interests"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "content_recommendations_userId_contentType_idx" ON "content_recommendations"("userId", "contentType");

-- CreateIndex
CREATE INDEX "learning_path_steps_pathId_order_idx" ON "learning_path_steps"("pathId", "order");

-- CreateIndex
CREATE INDEX "exams_subject_grade_difficulty_examCategory_idx" ON "exams"("subject", "grade", "difficulty", "examCategory");

-- CreateIndex
CREATE INDEX "exams_createdBy_idx" ON "exams"("createdBy");

-- CreateIndex
CREATE INDEX "exam_results_userId_idx" ON "exam_results"("userId");

-- CreateIndex
CREATE INDEX "exam_results_examId_idx" ON "exam_results"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "_LessonExams_AB_unique" ON "_LessonExams"("A", "B");

-- CreateIndex
CREATE INDEX "_LessonExams_B_index" ON "_LessonExams"("B");

-- AddForeignKey
ALTER TABLE "user_activity_logs" ADD CONSTRAINT "user_activity_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_learning_styles" ADD CONSTRAINT "user_learning_styles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_recommendations" ADD CONSTRAINT "content_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_paths" ADD CONSTRAINT "learning_paths_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_path_steps" ADD CONSTRAINT "learning_path_steps_pathId_fkey" FOREIGN KEY ("pathId") REFERENCES "learning_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_examId_fkey" FOREIGN KEY ("examId") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonExams" ADD CONSTRAINT "_LessonExams_A_fkey" FOREIGN KEY ("A") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LessonExams" ADD CONSTRAINT "_LessonExams_B_fkey" FOREIGN KEY ("B") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
