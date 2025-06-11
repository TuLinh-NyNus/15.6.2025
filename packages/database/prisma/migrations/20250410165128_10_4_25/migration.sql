/*
  Warnings:

  - The primary key for the `_LessonExams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_QuestionToTags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_LessonExams` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_QuestionToTags` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "_LessonExams" DROP CONSTRAINT "_LessonExams_AB_pkey";

-- AlterTable
ALTER TABLE "_QuestionToTags" DROP CONSTRAINT "_QuestionToTags_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_LessonExams_AB_unique" ON "_LessonExams"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_QuestionToTags_AB_unique" ON "_QuestionToTags"("A", "B");
