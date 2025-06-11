import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

/**
 * Interface cho một tham số MapID
 */
export interface MapIDParameter {
  value: string;
  label: string;
}

/**
 * Service để đọc và phân tích file MapID.tex
 */
export class MapIDService {
  private static instance: MapIDService;
  private mapIDFilePath: string;
  private initialized = false;

  // Cấu trúc dữ liệu lưu trữ các tham số
  private grades: MapIDParameter[] = [];
  private subjectsByGrade: Record<string, MapIDParameter[]> = {};
  private chaptersByGradeSubject: Record<string, Record<string, MapIDParameter[]>> = {};
  private lessonsByGradeSubjectChapter: Record<string, Record<string, Record<string, MapIDParameter[]>>> = {};
  private formsByGradeSubjectChapterLesson: Record<string, Record<string, Record<string, Record<string, MapIDParameter[]>>>> = {};

  private constructor() {
    this.mapIDFilePath = path.join(process.cwd(), 'DATA', 'template', 'Map ID.tex');
  }

  /**
   * Lấy instance của MapIDService (singleton pattern)
   */
  public static getInstance(): MapIDService {
    if (!MapIDService.instance) {
      MapIDService.instance = new MapIDService();
    }
    return MapIDService.instance;
  }

  /**
   * Khởi tạo service bằng cách đọc và phân tích file MapID.tex
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      const content = await fs.promises.readFile(this.mapIDFilePath, 'utf-8');
      this.parseMapIDFile(content);
      this.initialized = true;
      logger.info('MapIDService initialized successfully');
    } catch (error) {
      logger.error('Error initializing MapIDService:', error);
      throw error;
    }
  }

  /**
   * Phân tích nội dung file MapID.tex
   */
  private parseMapIDFile(content: string): void {
    // Thêm tùy chọn "Tất cả" cho mỗi danh sách
    this.grades.push({ value: 'all', label: 'Tất cả' });

    // Tách nội dung thành từng dòng và lọc các dòng trống hoặc comment
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('%'));

    // Biến lưu trữ node hiện tại ở mỗi cấp
    let currentGrade: string | null = null;
    let currentSubject: string | null = null;
    let currentChapter: string | null = null;
    let currentLesson: string | null = null;

    for (const line of lines) {
      // Đếm số dấu gạch ngang ở đầu dòng để xác định cấp độ
      const dashCount = line.indexOf('[');
      if (dashCount < 0) continue;

      // Parse code và mô tả
      const codeMatch = line.match(/\[(.*?)\]/);
      if (!codeMatch) continue;

      const code = codeMatch[1];
      const description = line.substring(line.indexOf(']') + 1).trim();
      const label = `${code}- ${description}`;

      // Xác định level dựa vào số dấu gạch ngang
      if (dashCount === 1) {
        // Lớp
        currentGrade = code;
        currentSubject = null;
        currentChapter = null;
        currentLesson = null;

        this.grades.push({ value: code, label });
        this.subjectsByGrade[code] = [{ value: 'all', label: 'Tất cả' }];
      } else if (dashCount === 4 && currentGrade) {
        // Môn học
        currentSubject = code;
        currentChapter = null;
        currentLesson = null;

        if (!this.subjectsByGrade[currentGrade]) {
          this.subjectsByGrade[currentGrade] = [{ value: 'all', label: 'Tất cả' }];
        }
        this.subjectsByGrade[currentGrade].push({ value: code, label });

        if (!this.chaptersByGradeSubject[currentGrade]) {
          this.chaptersByGradeSubject[currentGrade] = {};
        }
        this.chaptersByGradeSubject[currentGrade][code] = [{ value: 'all', label: 'Tất cả' }];
      } else if (dashCount === 7 && currentGrade && currentSubject) {
        // Chương
        currentChapter = code;
        currentLesson = null;

        if (!this.chaptersByGradeSubject[currentGrade]) {
          this.chaptersByGradeSubject[currentGrade] = {};
        }
        if (!this.chaptersByGradeSubject[currentGrade][currentSubject]) {
          this.chaptersByGradeSubject[currentGrade][currentSubject] = [{ value: 'all', label: 'Tất cả' }];
        }
        this.chaptersByGradeSubject[currentGrade][currentSubject].push({ value: code, label });

        if (!this.lessonsByGradeSubjectChapter[currentGrade]) {
          this.lessonsByGradeSubjectChapter[currentGrade] = {};
        }
        if (!this.lessonsByGradeSubjectChapter[currentGrade][currentSubject]) {
          this.lessonsByGradeSubjectChapter[currentGrade][currentSubject] = {};
        }
        this.lessonsByGradeSubjectChapter[currentGrade][currentSubject][code] = [{ value: 'all', label: 'Tất cả' }];
      } else if (dashCount === 10 && currentGrade && currentSubject && currentChapter) {
        // Bài
        currentLesson = code;

        if (!this.lessonsByGradeSubjectChapter[currentGrade]) {
          this.lessonsByGradeSubjectChapter[currentGrade] = {};
        }
        if (!this.lessonsByGradeSubjectChapter[currentGrade][currentSubject]) {
          this.lessonsByGradeSubjectChapter[currentGrade][currentSubject] = {};
        }
        if (!this.lessonsByGradeSubjectChapter[currentGrade][currentSubject][currentChapter]) {
          this.lessonsByGradeSubjectChapter[currentGrade][currentSubject][currentChapter] = [{ value: 'all', label: 'Tất cả' }];
        }
        this.lessonsByGradeSubjectChapter[currentGrade][currentSubject][currentChapter].push({ value: code, label });

        if (!this.formsByGradeSubjectChapterLesson[currentGrade]) {
          this.formsByGradeSubjectChapterLesson[currentGrade] = {};
        }
        if (!this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject]) {
          this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject] = {};
        }
        if (!this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter]) {
          this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter] = {};
        }
        this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter][code] = [{ value: 'all', label: 'Tất cả' }];
      } else if (dashCount === 13 && currentGrade && currentSubject && currentChapter && currentLesson) {
        // Dạng
        if (!this.formsByGradeSubjectChapterLesson[currentGrade]) {
          this.formsByGradeSubjectChapterLesson[currentGrade] = {};
        }
        if (!this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject]) {
          this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject] = {};
        }
        if (!this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter]) {
          this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter] = {};
        }
        if (!this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter][currentLesson]) {
          this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter][currentLesson] = [{ value: 'all', label: 'Tất cả' }];
        }
        this.formsByGradeSubjectChapterLesson[currentGrade][currentSubject][currentChapter][currentLesson].push({ value: code, label });
      }
    }
  }

  /**
   * Lấy danh sách các lớp
   */
  public getGrades(): MapIDParameter[] {
    return this.grades;
  }

  /**
   * Lấy danh sách các môn học theo lớp
   */
  public getSubjectsByGrade(grade: string): MapIDParameter[] {
    return this.subjectsByGrade[grade] || [{ value: 'all', label: 'Tất cả' }];
  }

  /**
   * Lấy danh sách các chương theo lớp và môn học
   */
  public getChaptersByGradeSubject(grade: string, subject: string): MapIDParameter[] {
    return this.chaptersByGradeSubject[grade]?.[subject] || [{ value: 'all', label: 'Tất cả' }];
  }

  /**
   * Lấy danh sách các bài theo lớp, môn học và chương
   */
  public getLessonsByGradeSubjectChapter(grade: string, subject: string, chapter: string): MapIDParameter[] {
    return this.lessonsByGradeSubjectChapter[grade]?.[subject]?.[chapter] || [{ value: 'all', label: 'Tất cả' }];
  }

  /**
   * Lấy danh sách các dạng theo lớp, môn học, chương và bài
   */
  public getFormsByGradeSubjectChapterLesson(grade: string, subject: string, chapter: string, lesson: string): MapIDParameter[] {
    return this.formsByGradeSubjectChapterLesson[grade]?.[subject]?.[chapter]?.[lesson] || [{ value: 'all', label: 'Tất cả' }];
  }

  /**
   * Lấy danh sách các mức độ
   */
  public getDifficulties(): MapIDParameter[] {
    return [
      { value: 'all', label: 'Tất cả' },
      { value: 'N', label: 'N- Nhận biết' },
      { value: 'H', label: 'H- Thông Hiểu' },
      { value: 'V', label: 'V- Vận dụng' },
      { value: 'C', label: 'C- Vận dụng Cao' },
      { value: 'T', label: 'T- VIP' },
      { value: 'M', label: 'M- Note' }
    ];
  }
}

/**
 * Lấy instance của MapIDService (singleton pattern)
 */
export function getMapIDService(): MapIDService {
  return MapIDService.getInstance();
}
