import logger from './logger';

/**
 * Interface định nghĩa một node trong cây MapID
 */
export interface MapNode {
  code: string;
  description: string;
  level: 'grade' | 'subject' | 'chapter' | 'difficulty' | 'lesson' | 'form';
  children: Record<string, MapNode>;
}

/**
 * Interface kết quả decode
 */
export interface MapIDResult {
  mapID: string;
  grade: {
    code: string;
    description: string;
  };
  subject: {
    code: string;
    description: string;
  };
  chapter: {
    code: string;
    description: string;
  };
  difficulty: {
    code: string;
    description: string;
  };
  lesson: {
    code: string;
    description: string;
  };
  form: {
    code: string;
    description: string;
  };
  fullDescription: string;
}

/**
 * Ánh xạ mức độ
 */
export const DIFFICULTY_MAP: Record<string, string> = {
  'N': 'Nhận biết',
  'H': 'Thông Hiểu',
  'V': 'Vận dụng',
  'C': 'Vận dụng Cao',
  'T': 'VIP',
  'M': 'Note'
};

// Kiểm tra xem đang ở môi trường server hay client - không sử dụng trong file này
// const isServer = typeof window === 'undefined';

/**
 * Class xử lý và decode MapID dựa trên file Map ID.tex
 */
export class MapIDDecoder {
  protected mapTree: Record<string, MapNode> = {};
  protected filePath: string;
  private isInitialized = false;

  /**
   * Khởi tạo decoder với đường dẫn tới file Map ID.tex
   */
  constructor(filePath?: string) {
    this.filePath = filePath || '';
  }

  /**
   * Khởi tạo decoder bằng cách load và parse file Map ID.tex
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.loadMapFile();
    this.isInitialized = true;
  }

  /**
   * Đọc nội dung file Map ID.tex
   */
  protected async loadMapFile(): Promise<void> {
    try {
      // Trong môi trường browser, luôn gọi API để lấy nội dung
      const response = await fetch('/api/map-id');
      if (!response.ok) {
        throw new Error('Không thể tải MapID từ API');
      }
      const data = await response.json();
      const content = data.content || '';

      this.parseMapFile(content);
      logger.info('Map ID file loaded successfully from API');
    } catch (error) {
      logger.error('Error loading Map ID file:', error);
      throw error;
    }
  }

  /**
   * Parse cấu trúc phân cấp từ nội dung file
   */
  protected parseMapFile(content: string): void {
    // Tách nội dung thành từng dòng và lọc các dòng trống hoặc comment
    const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('%'));

    // Biến lưu trữ node hiện tại ở mỗi cấp
    const currentNodes: Partial<Record<'grade' | 'subject' | 'chapter' | 'difficulty' | 'lesson' | 'form', MapNode>> = {};

    for (const line of lines) {
      // Đếm số dấu gạch ngang ở đầu dòng để xác định cấp độ
      const dashCount = line.indexOf('[');
      if (dashCount < 0) continue;

      // Xác định level dựa vào số dấu gạch ngang
      let level: 'grade' | 'subject' | 'chapter' | 'difficulty' | 'lesson' | 'form';
      if (dashCount === 1) level = 'grade';
      else if (dashCount === 4) level = 'subject';
      else if (dashCount === 7) level = 'chapter';
      else if (dashCount === 10) level = 'lesson';
      else if (dashCount === 13) level = 'form';
      else continue;

      // Parse code và mô tả
      const codeMatch = line.match(/\[(.*?)\]/);
      if (!codeMatch) continue;

      const code = codeMatch[1];
      const description = line.substring(line.indexOf(']') + 1).trim();

      // Tạo node mới
      const newNode: MapNode = {
        code,
        description,
        level,
        children: {}
      };

      // Thêm node vào cây phân cấp
      if (level === 'grade') {
        this.mapTree[code] = newNode;
        currentNodes.grade = newNode;
        // Reset các cấp dưới
        currentNodes.subject = undefined;
        currentNodes.chapter = undefined;
        currentNodes.difficulty = undefined;
        currentNodes.lesson = undefined;
        currentNodes.form = undefined;
      } else if (level === 'subject' && currentNodes.grade) {
        currentNodes.grade.children[code] = newNode;
        currentNodes.subject = newNode;
        // Reset các cấp dưới
        currentNodes.chapter = undefined;
        currentNodes.difficulty = undefined;
        currentNodes.lesson = undefined;
        currentNodes.form = undefined;
      } else if (level === 'chapter' && currentNodes.subject) {
        currentNodes.subject.children[code] = newNode;
        currentNodes.chapter = newNode;
        // Reset các cấp dưới
        currentNodes.difficulty = undefined;
        currentNodes.lesson = undefined;
        currentNodes.form = undefined;
      } else if (level === 'lesson' && currentNodes.chapter) {
        currentNodes.chapter.children[code] = newNode;
        currentNodes.lesson = newNode;
        // Reset cấp dưới
        currentNodes.form = undefined;
      } else if (level === 'form' && currentNodes.lesson) {
        currentNodes.lesson.children[code] = newNode;
        currentNodes.form = newNode;
      }
    }
  }

  /**
   * Decode MapID và trả về thông tin đầy đủ
   * Format: [0H5V4-1]
   * - 0: Grade (Lớp)
   * - H: Subject (Môn học)
   * - 5: Chapter (Chương)
   * - V: Difficulty (Mức độ: N, H, V, C, T, M)
   * - 4: Lesson (Bài)
   * - -1: Question index (optional)
   */
  public decodeMapID(mapID: string): MapIDResult | null {
    if (!this.isInitialized) {
      throw new Error('Decoder chưa được khởi tạo. Hãy gọi initialize() trước.');
    }

    // Regex để parse MapID format: [0H5V4-1]
    const pattern = /\[(\d)([A-Z])(\d+)([NHVCTM])(\d+)(?:-(\d+))?\]/;
    const match = mapID.match(pattern);

    if (!match) {
      logger.warn(`MapID không khớp với pattern: "${mapID}"`);
      return null;
    }

    const [, gradeCode, subjectCode, chapterCode, difficultyCode, lessonCode, formCode] = match;

    try {
      // Tìm các node tương ứng trong cây phân cấp
      const gradeNode = this.mapTree[gradeCode];
      if (!gradeNode) {
        logger.warn(`Không tìm thấy mã Lớp: "${gradeCode}"`);
        return null;
      }

      const subjectNode = gradeNode.children[subjectCode];
      if (!subjectNode) {
        logger.warn(`Không tìm thấy mã Môn học: "${subjectCode}" trong Lớp: "${gradeCode}"`);
        return null;
      }

      const chapterNode = subjectNode.children[chapterCode];
      if (!chapterNode) {
        logger.warn(`Không tìm thấy mã Chương: "${chapterCode}" trong Môn học: "${subjectCode}"`);
        return null;
      }

      const lessonNode = chapterNode.children[lessonCode];
      if (!lessonNode) {
        logger.warn(`Không tìm thấy mã Bài: "${lessonCode}" trong Chương: "${chapterCode}"`);
        return null;
      }

      // Lấy tên mức độ từ danh sách đã định nghĩa
      const difficultyDescription = DIFFICULTY_MAP[difficultyCode] || 'Không xác định';

      // Xử lý form (tham số thứ 6) nếu có
      let formDescription = 'Không xác định';
      let formCodeValue = formCode || '0';

      // Nếu có form trong lessonNode.children, sử dụng nó
      if (formCode && lessonNode.children[formCode]) {
        formDescription = lessonNode.children[formCode].description;
      } else {
        // Nếu không có trong cây, sử dụng một bảng tra cứu cố định
        const formDescriptions: Record<string, string> = {
          '1': 'Xác định mệnh đề, mệnh đề chứa biến',
          '2': 'Phủ định của mệnh đề',
          '3': 'Kết hợp các phép toán logic',
          '4': 'Tương đương logic',
          '5': 'Chứng minh mệnh đề',
          '6': 'Xác định tập hợp',
          '7': 'Các phép toán trên tập hợp',
          '8': 'Tập hợp số',
          '9': 'Bài toán tổng hợp'
        };

        if (formCode && formDescriptions[formCode]) {
          formDescription = formDescriptions[formCode];
        }
      }

      // Tạo kết quả đầy đủ
      const result: MapIDResult = {
        mapID,
        grade: {
          code: gradeCode,
          description: gradeNode.description
        },
        subject: {
          code: subjectCode,
          description: subjectNode.description
        },
        chapter: {
          code: chapterCode,
          description: chapterNode.description
        },
        difficulty: {
          code: difficultyCode,
          description: difficultyDescription
        },
        lesson: {
          code: lessonCode,
          description: lessonNode.description
        },
        form: {
          code: formCodeValue,
          description: formDescription
        },
        fullDescription: `${gradeNode.description} - ${subjectNode.description} - ${chapterNode.description} - ${difficultyDescription} - ${lessonNode.description}${formDescription !== 'Không xác định' ? ` - ${formDescription}` : ''}`
      };

      return result;
    } catch (error) {
      logger.error('Error decoding MapID:', error);
      return null;
    }
  }

  /**
   * Tìm kiếm các mục phù hợp với các tiêu chí
   */
  public search(criteria: {
    grade?: string;
    subject?: string;
    chapter?: string;
    difficulty?: string;
    lesson?: string;
    form?: string;
  }): { mapID: string; description: string }[] {
    if (!this.isInitialized) {
      throw new Error('Decoder chưa được khởi tạo. Hãy gọi initialize() trước.');
    }

    const results: { mapID: string; description: string }[] = [];

    // Lọc theo các tiêu chí
    const matchingGrades = criteria.grade
      ? (this.mapTree[criteria.grade] ? [this.mapTree[criteria.grade]] : [])
      : Object.values(this.mapTree);

    for (const grade of matchingGrades) {
      const matchingSubjects = criteria.subject
        ? (grade.children[criteria.subject] ? [grade.children[criteria.subject]] : [])
        : Object.values(grade.children);

      for (const subject of matchingSubjects) {
        const matchingChapters = criteria.chapter
          ? (subject.children[criteria.chapter] ? [subject.children[criteria.chapter]] : [])
          : Object.values(subject.children);

        for (const chapter of matchingChapters) {
          const matchingLessons = criteria.lesson
            ? (chapter.children[criteria.lesson] ? [chapter.children[criteria.lesson]] : [])
            : Object.values(chapter.children);

          for (const lesson of matchingLessons) {
            // Đối với mỗi mức độ
            Object.entries(DIFFICULTY_MAP).forEach(([diffCode, diffDescription]) => {
              if (!criteria.difficulty || criteria.difficulty === diffCode) {
                // Nếu có form, thêm vào MapID
                const formPart = criteria.form ? `-${criteria.form}` : '';
                const mapID = `[${grade.code}${subject.code}${chapter.code}${diffCode}${lesson.code}${formPart}]`;

                // Tìm mô tả form nếu có
                let formDescription = '';
                if (criteria.form && lesson.children[criteria.form]) {
                  formDescription = ` - ${lesson.children[criteria.form].description}`;
                }

                const description = `${grade.description} - ${subject.description} - ${chapter.description} - ${diffDescription} - ${lesson.description}${formDescription}`;

                results.push({ mapID, description });
              }
            });
          }
        }
      }
    }

    return results;
  }
}

// Export singleton instance cho client-side
let decoderInstance: MapIDDecoder | null = null;

/**
 * Lấy instance của MapIDDecoder (singleton pattern)
 */
export function getMapIDDecoder(filePath?: string): MapIDDecoder {
  if (!decoderInstance) {
    decoderInstance = new MapIDDecoder(filePath);
  }
  return decoderInstance;
}