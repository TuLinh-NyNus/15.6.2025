-- AlterTable
ALTER TABLE "_LessonExams" ADD CONSTRAINT "_LessonExams_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_LessonExams_AB_unique";

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "resourceUrl" TEXT;
