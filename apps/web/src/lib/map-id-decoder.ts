import fs from 'fs';
import path from 'path';
import { MapIDResult } from './types/latex-parser';
import logger from './utils/logger';

/**
 * Lớp MapIDDecoder dùng để giải mã và tìm kiếm MapID
 * Sử dụng file Map ID.tex để xây dựng cơ sở dữ liệu
 */
export class MapIDDecoder {
  private grades: Map<string, string> = new Map();
  private subjects: Map<string, Map<string, string>> = new Map();
  private chapters: Map<string, Map<string, Map<string, string>>> = new Map();
  private difficulties: Map<string, string> = new Map();
  private lessons: Map<string, Map<string, Map<string, Map<string, string>>>> = new Map();
  private forms: Map<string, Map<string, Map<string, Map<string, Map<string, string>>>>> = new Map();
  
  /**
   * Khởi tạo MapIDDecoder từ nội dung file Map ID.tex
   * @param mapIDContent Nội dung file Map ID.tex
   */
  constructor(mapIDContent: string) {
    this.parseMapIDFile(mapIDContent);
  }
  
  /**
   * Khởi tạo MapIDDecoder từ file Map ID.tex
   * @param filePath Đường dẫn đến file Map ID.tex
   * @returns Instance của MapIDDecoder
   */
  public static fromFile(filePath: string): MapIDDecoder {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      logger.info('Map ID file loaded successfully from file system');
      return new MapIDDecoder(content);
    } catch (error) {
      logger.error('Error loading Map ID file:', error);
      throw new Error('Failed to load Map ID file');
    }
  }
  
  /**
   * Phân tích nội dung file Map ID.tex để xây dựng cơ sở dữ liệu
   * @param content Nội dung file Map ID.tex
   */
  private parseMapIDFile(content: string): void {
    // Phân tích các mức độ
    const levelRegex = /\[([A-Z])\] ([^\n]+)/g;
    let match;
    
    while ((match = levelRegex.exec(content)) !== null) {
      const code = match[1];
      const description = match[2].trim();
      
      // Chỉ lấy các mức độ được định nghĩa ở phần đầu file
      if (content.indexOf(match[0]) < content.indexOf('-[0] Lớp 10')) {
        this.difficulties.set(code, description);
      }
    }
    
    // Phân tích các lớp
    const gradeRegex = /-\[([0-9])\] (Lớp [0-9]+)/g;
    while ((match = gradeRegex.exec(content)) !== null) {
      const code = match[1];
      const description = match[2].trim();
      this.grades.set(code, description);
      logger.debug(`Adding grade: code=${code}, description=${description}`);
      
      // Khởi tạo các Map con
      if (!this.subjects.has(code)) {
        this.subjects.set(code, new Map());
      }
      if (!this.chapters.has(code)) {
        this.chapters.set(code, new Map());
      }
      if (!this.lessons.has(code)) {
        this.lessons.set(code, new Map());
      }
      if (!this.forms.has(code)) {
        this.forms.set(code, new Map());
      }
    }
    
    // Phân tích các môn học
    const subjectRegex = /----\[([A-Z])\] ([^\n]+)/g;
    while ((match = subjectRegex.exec(content)) !== null) {
      const subjectCode = match[1];
      const subjectDesc = match[2].trim();
      
      // Tìm lớp mà môn học này thuộc về
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(match[0]));
      
      // Tìm lớp gần nhất phía trước
      let gradeCode = '';
      for (let i = lineIndex; i >= 0; i--) {
        const gradeLine = lines[i].match(/-\[([0-9])\] (Lớp [0-9]+)/);
        if (gradeLine) {
          gradeCode = gradeLine[1];
          break;
        }
      }
      
      if (gradeCode && this.subjects.has(gradeCode)) {
        this.subjects.get(gradeCode)!.set(subjectCode, subjectDesc);
        
        // Khởi tạo các Map con
        if (!this.chapters.get(gradeCode)!.has(subjectCode)) {
          this.chapters.get(gradeCode)!.set(subjectCode, new Map());
        }
        if (!this.lessons.get(gradeCode)!.has(subjectCode)) {
          this.lessons.get(gradeCode)!.set(subjectCode, new Map());
        }
        if (!this.forms.get(gradeCode)!.has(subjectCode)) {
          this.forms.get(gradeCode)!.set(subjectCode, new Map());
        }
      }
    }
    
    // Phân tích các chương
    const chapterRegex = /-------\[([0-9A-Z])\] ([^\n]+)/g;
    while ((match = chapterRegex.exec(content)) !== null) {
      const chapterCode = match[1];
      const chapterDesc = match[2].trim();
      
      // Tìm lớp và môn học mà chương này thuộc về
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(match[0]));
      
      // Tìm môn học gần nhất phía trước
      let subjectCode = '';
      let gradeCode = '';
      for (let i = lineIndex; i >= 0; i--) {
        const subjectLine = lines[i].match(/----\[([A-Z])\] ([^\n]+)/);
        if (subjectLine) {
          subjectCode = subjectLine[1];
          
          // Tìm lớp gần nhất phía trước môn học
          for (let j = i; j >= 0; j--) {
            const gradeLine = lines[j].match(/-\[([0-9])\] (Lớp [0-9]+)/);
            if (gradeLine) {
              gradeCode = gradeLine[1];
              break;
            }
          }
          
          break;
        }
      }
      
      if (gradeCode && subjectCode && 
          this.chapters.has(gradeCode) && 
          this.chapters.get(gradeCode)!.has(subjectCode)) {
        this.chapters.get(gradeCode)!.get(subjectCode)!.set(chapterCode, chapterDesc);
        
        // Khởi tạo các Map con
        if (!this.lessons.get(gradeCode)!.get(subjectCode)!.has(chapterCode)) {
          this.lessons.get(gradeCode)!.get(subjectCode)!.set(chapterCode, new Map());
        }
        if (!this.forms.get(gradeCode)!.get(subjectCode)!.has(chapterCode)) {
          this.forms.get(gradeCode)!.get(subjectCode)!.set(chapterCode, new Map());
        }
      }
    }
    
    // Phân tích các bài học
    const lessonRegex = /----------\[([0-9A-Z])\] ([^\n]+)/g;
    while ((match = lessonRegex.exec(content)) !== null) {
      const lessonCode = match[1];
      const lessonDesc = match[2].trim();
      
      // Tìm lớp, môn học và chương mà bài học này thuộc về
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(match[0]));
      
      // Tìm chương gần nhất phía trước
      let chapterCode = '';
      let subjectCode = '';
      let gradeCode = '';
      for (let i = lineIndex; i >= 0; i--) {
        const chapterLine = lines[i].match(/-------\[([0-9A-Z])\] ([^\n]+)/);
        if (chapterLine) {
          chapterCode = chapterLine[1];
          
          // Tìm môn học gần nhất phía trước chương
          for (let j = i; j >= 0; j--) {
            const subjectLine = lines[j].match(/----\[([A-Z])\] ([^\n]+)/);
            if (subjectLine) {
              subjectCode = subjectLine[1];
              
              // Tìm lớp gần nhất phía trước môn học
              for (let k = j; k >= 0; k--) {
                const gradeLine = lines[k].match(/-\[([0-9])\] (Lớp [0-9]+)/);
                if (gradeLine) {
                  gradeCode = gradeLine[1];
                  break;
                }
              }
              
              break;
            }
          }
          
          break;
        }
      }
      
      if (gradeCode && subjectCode && chapterCode && 
          this.lessons.has(gradeCode) && 
          this.lessons.get(gradeCode)!.has(subjectCode) &&
          this.lessons.get(gradeCode)!.get(subjectCode)!.has(chapterCode)) {
        this.lessons.get(gradeCode)!.get(subjectCode)!.get(chapterCode)!.set(lessonCode, lessonDesc);
        
        // Khởi tạo Map con
        if (!this.forms.get(gradeCode)!.get(subjectCode)!.get(chapterCode)!.has(lessonCode)) {
          this.forms.get(gradeCode)!.get(subjectCode)!.get(chapterCode)!.set(lessonCode, new Map());
        }
      }
    }
    
    // Phân tích các dạng
    const formRegex = /-------------\[([0-9A-Z])\] ([^\n]+)/g;
    while ((match = formRegex.exec(content)) !== null) {
      const formCode = match[1];
      const formDesc = match[2].trim();
      
      // Tìm lớp, môn học, chương và bài học mà dạng này thuộc về
      const lines = content.split('\n');
      const lineIndex = lines.findIndex(line => line.includes(match[0]));
      
      // Tìm bài học gần nhất phía trước
      let lessonCode = '';
      let chapterCode = '';
      let subjectCode = '';
      let gradeCode = '';
      for (let i = lineIndex; i >= 0; i--) {
        const lessonLine = lines[i].match(/----------\[([0-9A-Z])\] ([^\n]+)/);
        if (lessonLine) {
          lessonCode = lessonLine[1];
          
          // Tìm chương gần nhất phía trước bài học
          for (let j = i; j >= 0; j--) {
            const chapterLine = lines[j].match(/-------\[([0-9A-Z])\] ([^\n]+)/);
            if (chapterLine) {
              chapterCode = chapterLine[1];
              
              // Tìm môn học gần nhất phía trước chương
              for (let k = j; k >= 0; k--) {
                const subjectLine = lines[k].match(/----\[([A-Z])\] ([^\n]+)/);
                if (subjectLine) {
                  subjectCode = subjectLine[1];
                  
                  // Tìm lớp gần nhất phía trước môn học
                  for (let l = k; l >= 0; l--) {
                    const gradeLine = lines[l].match(/-\[([0-9])\] (Lớp [0-9]+)/);
                    if (gradeLine) {
                      gradeCode = gradeLine[1];
                      break;
                    }
                  }
                  
                  break;
                }
              }
              
              break;
            }
          }
          
          break;
        }
      }
      
      if (gradeCode && subjectCode && chapterCode && lessonCode && 
          this.forms.has(gradeCode) && 
          this.forms.get(gradeCode)!.has(subjectCode) &&
          this.forms.get(gradeCode)!.get(subjectCode)!.has(chapterCode) &&
          this.forms.get(gradeCode)!.get(subjectCode)!.get(chapterCode)!.has(lessonCode)) {
        this.forms.get(gradeCode)!.get(subjectCode)!.get(chapterCode)!.get(lessonCode)!.set(formCode, formDesc);
      }
    }
  }
  
  /**
   * Giải mã QuestionID để lấy thông tin chi tiết
   * @param questionId QuestionID cần giải mã
   * @returns Thông tin chi tiết của QuestionID hoặc null nếu không hợp lệ
   */
  public decode(questionId: string): MapIDResult | null {
    // Kiểm tra định dạng QuestionID
    const id5Regex = /\[([0-9A-Z])([0-9A-Z])([0-9A-Z])([0-9A-Z])([0-9A-Z])\]/;
    const id6Regex = /\[([0-9A-Z])([0-9A-Z])([0-9A-Z])([0-9A-Z])([0-9A-Z])-([0-9A-Z])\]/;
    
    let match = questionId.match(id5Regex) || questionId.match(id6Regex);
    
    if (!match) {
      return null;
    }
    
    const gradeCode = match[1];
    const subjectCode = match[2];
    const chapterCode = match[3];
    const difficultyCode = match[4];
    const lessonCode = match[5];
    const formCode = match[6] || undefined;
    
    // Tìm thông tin chi tiết từ cơ sở dữ liệu
    const gradeDesc = this.grades.get(gradeCode) || '';
    const subjectDesc = this.subjects.get(gradeCode)?.get(subjectCode) || '';
    const chapterDesc = this.chapters.get(gradeCode)?.get(subjectCode)?.get(chapterCode) || '';
    const difficultyDesc = this.difficulties.get(difficultyCode) || '';
    const lessonDesc = this.lessons.get(gradeCode)?.get(subjectCode)?.get(chapterCode)?.get(lessonCode) || '';
    const formDesc = formCode ? this.forms.get(gradeCode)?.get(subjectCode)?.get(chapterCode)?.get(lessonCode)?.get(formCode) || '' : undefined;
    
    // Tạo mô tả đầy đủ
    const fullDescription = `${gradeDesc} - ${subjectDesc} - ${chapterDesc} - ${difficultyDesc} - ${lessonDesc}${formDesc ? ' - ' + formDesc : ''}`;
    
    return {
      mapID: questionId,
      grade: {
        code: gradeCode,
        description: gradeDesc
      },
      subject: {
        code: subjectCode,
        description: subjectDesc
      },
      chapter: {
        code: chapterCode,
        description: chapterDesc
      },
      difficulty: {
        code: difficultyCode,
        description: difficultyDesc
      },
      lesson: {
        code: lessonCode,
        description: lessonDesc
      },
      ...(formCode && {
        form: {
          code: formCode,
          description: formDesc || ''
        }
      }),
      fullDescription
    };
  }
  
  /**
   * Tìm kiếm các QuestionID phù hợp với truy vấn
   * @param query Truy vấn tìm kiếm
   * @returns Danh sách các QuestionID phù hợp
   */
  public search(query: string): MapIDResult[] {
    const results: MapIDResult[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Tìm kiếm trong tất cả các tham số
    for (const [gradeCode, gradeDesc] of this.grades.entries()) {
      if (gradeDesc.toLowerCase().includes(lowerQuery)) {
        // Tạo các QuestionID mẫu cho lớp này
        for (const [subjectCode] of this.subjects.get(gradeCode)?.entries() || []) {
          for (const [chapterCode] of this.chapters.get(gradeCode)?.get(subjectCode)?.entries() || []) {
            for (const [lessonCode] of this.lessons.get(gradeCode)?.get(subjectCode)?.get(chapterCode)?.entries() || []) {
              // Sử dụng mức độ mặc định là 'N' (Nhận biết)
              const sampleId = `[${gradeCode}${subjectCode}${chapterCode}N${lessonCode}]`;
              const result = this.decode(sampleId);
              if (result) {
                results.push(result);
              }
            }
          }
        }
      }
    }
    
    // Tìm kiếm trong các môn học
    for (const [gradeCode] of this.grades.entries()) {
      for (const [subjectCode, subjectDesc] of this.subjects.get(gradeCode)?.entries() || []) {
        if (subjectDesc.toLowerCase().includes(lowerQuery)) {
          // Tạo các QuestionID mẫu cho môn học này
          for (const [chapterCode] of this.chapters.get(gradeCode)?.get(subjectCode)?.entries() || []) {
            for (const [lessonCode] of this.lessons.get(gradeCode)?.get(subjectCode)?.get(chapterCode)?.entries() || []) {
              // Sử dụng mức độ mặc định là 'N' (Nhận biết)
              const sampleId = `[${gradeCode}${subjectCode}${chapterCode}N${lessonCode}]`;
              const result = this.decode(sampleId);
              if (result) {
                results.push(result);
              }
            }
          }
        }
      }
    }
    
    // Tìm kiếm trong các chương
    for (const [gradeCode] of this.grades.entries()) {
      for (const [subjectCode] of this.subjects.get(gradeCode)?.entries() || []) {
        for (const [chapterCode, chapterDesc] of this.chapters.get(gradeCode)?.get(subjectCode)?.entries() || []) {
          if (chapterDesc.toLowerCase().includes(lowerQuery)) {
            // Tạo các QuestionID mẫu cho chương này
            for (const [lessonCode] of this.lessons.get(gradeCode)?.get(subjectCode)?.get(chapterCode)?.entries() || []) {
              // Sử dụng mức độ mặc định là 'N' (Nhận biết)
              const sampleId = `[${gradeCode}${subjectCode}${chapterCode}N${lessonCode}]`;
              const result = this.decode(sampleId);
              if (result) {
                results.push(result);
              }
            }
          }
        }
      }
    }
    
    // Giới hạn số lượng kết quả trả về
    return results.slice(0, 50);
  }
}
