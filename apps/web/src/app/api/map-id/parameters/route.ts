import { NextRequest, NextResponse } from "next/server";
import { MapIDService, getMapIDService } from "@/lib/services/mapid-service";
import logger from "@/lib/utils/logger";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

/**
 * API route để lấy các tham số MapID
 * GET /api/map-id/parameters
 * GET /api/map-id/parameters?grade=0
 * GET /api/map-id/parameters?grade=0&subject=D
 * GET /api/map-id/parameters?grade=0&subject=D&chapter=1
 * GET /api/map-id/parameters?grade=0&subject=D&chapter=1&lesson=1
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const grade = url.searchParams.get('grade');
    const subject = url.searchParams.get('subject');
    const chapter = url.searchParams.get('chapter');
    const lesson = url.searchParams.get('lesson');

    // Khởi tạo service
    const mapIDService = getMapIDService();
    await mapIDService.initialize();

    // Lấy dữ liệu tương ứng với các tham số
    if (grade && subject && chapter && lesson) {
      // Lấy danh sách dạng
      const forms = mapIDService.getFormsByGradeSubjectChapterLesson(grade, subject, chapter, lesson);
      return NextResponse.json({ success: true, forms });
    } else if (grade && subject && chapter) {
      // Lấy danh sách bài
      const lessons = mapIDService.getLessonsByGradeSubjectChapter(grade, subject, chapter);
      return NextResponse.json({ success: true, lessons });
    } else if (grade && subject) {
      // Lấy danh sách chương
      const chapters = mapIDService.getChaptersByGradeSubject(grade, subject);
      return NextResponse.json({ success: true, chapters });
    } else if (grade) {
      // Lấy danh sách môn học
      const subjects = mapIDService.getSubjectsByGrade(grade);
      return NextResponse.json({ success: true, subjects });
    } else {
      // Lấy tất cả các tham số
      const grades = mapIDService.getGrades();
      const difficulties = mapIDService.getDifficulties();
      return NextResponse.json({ success: true, grades, difficulties });
    }
  } catch (error) {
    logger.error("Error getting MapID parameters:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi khi lấy tham số MapID",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
