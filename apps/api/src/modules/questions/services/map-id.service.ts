import { Injectable, Logger } from '@nestjs/common';
import { IMapIDService } from '@project/interfaces';
import { getErrorMessage } from '../../../utils/error-handler';

/**
 * Constants cho Level
 */
const LEVEL_MAP = {
  'N': 'Nhận biết',
  'H': 'Thông Hiểu',
  'V': 'VD',
  'C': 'VD Cao',
  'T': 'VIP',
  'M': 'Note'
};

/**
 * Interface cho MapID Structure
 */
interface MapIdStructure {
  grade: Record<string, string>;
  subject: Record<string, string>;
  chapter: Record<string, string>;
  lesson: Record<string, string>;
  form: Record<string, string>;
}

/**
 * Interface cho QuestionID Description
 */
interface QuestionIdDescription {
  grade?: { value: string; description: string };
  subject?: { value: string; description: string };
  chapter?: { value: string; description: string };
  level?: { value: string; description: string };
  lesson?: { value: string; description: string };
  form?: { value: string; description: string };
  fullDescription: string;
}

/**
 * Service quản lý phân cấp ID của câu hỏi
 */
@Injectable()
export class MapIDService implements IMapIDService {
  private readonly logger = new Logger(MapIDService.name);

  // Cấu trúc MapID - Sẽ thay thế bằng dữ liệu từ database hoặc cấu hình
  private readonly mapIdStructure: MapIdStructure = {
    // Đây là cấu trúc mẫu, sẽ được thay thế bằng dữ liệu thực tế
    'grade': {
      '0': 'Lớp 10',
      '1': 'Lớp 11',
      '2': 'Lớp 12',
      // Thêm các lớp khác
    },
    'subject': {
      'P': '10-NGÂN HÀNG CHÍNH',
      // Thêm các môn khác
    },
    'chapter': {
      '1': 'Mệnh đề và tập hợp',
      // Thêm các chương khác
    },
    'lesson': {
      '1': 'Mệnh đề',
      // Thêm các bài khác
    },
    'form': {
      '1': 'Xác định mệnh đề, mệnh đề chứa biến',
      // Thêm các dạng khác
    }
  };

  /**
   * Phân giải QuestionID thành các thành phần
   * @param questionId QuestionID cần phân giải (định dạng [XXXXX-X] hoặc [XXXXX])
   * @returns Object chứa các thành phần của QuestionID
   */
  async parseQuestionId(questionId: string): Promise<{
    grade?: string;           // Lớp (tham số 1)
    subject?: string;         // Môn (tham số 2)
    chapter?: string;         // Chương (tham số 3)
    level?: string;           // Mức độ (tham số 4)
    lesson?: string;          // Bài (tham số 5)
    form?: string;            // Dạng (tham số 6, chỉ có trong ID6)
    isID6: boolean;           // Có phải là ID6 không
    original: string;         // QuestionID gốc
  }> {
    try {
      // Chuẩn hóa QuestionID bằng cách loại bỏ khoảng trắng và ký tự đặc biệt
      const normalizedId = questionId.trim().replace(/[[\]%]/g, '');
      
      // Kiểm tra định dạng ID6 (có dấu gạch ngang)
      const isID6 = normalizedId.includes('-');
      
      if (isID6) {
        // Nếu là ID6, tách thành 6 tham số
        const [mainPart, form] = normalizedId.split('-');
        
        // Kiểm tra độ dài của phần chính
        if (mainPart.length !== 5) {
          throw new Error(`ID không hợp lệ: Phần chính phải có 5 ký tự, nhận được ${mainPart.length}`);
        }
        
        return {
          grade: mainPart.charAt(0),
          subject: mainPart.charAt(1),
          chapter: mainPart.charAt(2),
          level: mainPart.charAt(3),
          lesson: mainPart.charAt(4),
          form,
          isID6: true,
          original: questionId
        };
      } else {
        // Nếu là ID5, chỉ có 5 tham số
        if (normalizedId.length !== 5) {
          throw new Error(`ID không hợp lệ: ID5 phải có 5 ký tự, nhận được ${normalizedId.length}`);
        }
        
        return {
          grade: normalizedId.charAt(0),
          subject: normalizedId.charAt(1),
          chapter: normalizedId.charAt(2),
          level: normalizedId.charAt(3),
          lesson: normalizedId.charAt(4),
          isID6: false,
          original: questionId
        };
      }
    } catch (error) {
      this.logger.error(`Lỗi khi phân giải QuestionID ${questionId}: ${getErrorMessage(error)}`);
      throw new Error(`Không thể phân giải QuestionID: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Tạo QuestionID từ các thành phần
   * @param components Các thành phần của QuestionID
   * @returns QuestionID được tạo
   */
  async generateQuestionId(components: {
    grade?: string;           // Lớp (tham số 1)
    subject?: string;         // Môn (tham số 2)
    chapter?: string;         // Chương (tham số 3)
    level?: string;           // Mức độ (tham số 4)
    lesson?: string;          // Bài (tham số 5)
    form?: string;            // Dạng (tham số 6, chỉ có trong ID6)
  }): Promise<string> {
    try {
      // Kiểm tra các tham số bắt buộc
      const { grade, subject, chapter, level, lesson, form } = components;
      
      if (!grade || !subject || !chapter || !level || !lesson) {
        throw new Error('Thiếu tham số bắt buộc để tạo QuestionID');
      }
      
      // Kiểm tra độ dài của các tham số
      if (grade.length !== 1 || subject.length !== 1 || chapter.length !== 1 || 
          level.length !== 1 || lesson.length !== 1) {
        throw new Error('Các tham số phải có độ dài 1 ký tự');
      }
      
      // Kiểm tra các ký tự hợp lệ (chữ số hoặc chữ cái in hoa)
      const paramPattern = /^[0-9A-Z]$/;
      const params = [grade, subject, chapter, level, lesson];
      
      for (let i = 0; i < params.length; i++) {
        if (!paramPattern.test(params[i])) {
          throw new Error(`Tham số thứ ${i + 1} không hợp lệ: Phải là số hoặc chữ cái in hoa`);
        }
      }
      
      // Tạo ID cơ bản
      let questionId = grade + subject + chapter + level + lesson;
      
      // Nếu có tham số form, đây là ID6
      if (form) {
        // Kiểm tra form
        if (!paramPattern.test(form)) {
          throw new Error('Tham số Form không hợp lệ: Phải là số hoặc chữ cái in hoa');
        }
        
        questionId += '-' + form;
      }
      
      return questionId;
    } catch (error) {
      this.logger.error(`Lỗi khi tạo QuestionID: ${getErrorMessage(error)}`);
      throw new Error(`Không thể tạo QuestionID: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Validate QuestionID
   * @param questionId QuestionID cần kiểm tra
   * @returns Kết quả validation và danh sách lỗi
   */
  async validateQuestionId(questionId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    try {
      // Chuẩn hóa QuestionID
      const normalizedId = questionId.trim().replace(/[[\]%]/g, '');
      
      // Kiểm tra định dạng ID5 hoặc ID6
      const isID6 = normalizedId.includes('-');
      
      if (isID6) {
        // Nếu là ID6, kiểm tra định dạng XXXXX-X
        const parts = normalizedId.split('-');
        
        if (parts.length !== 2) {
          errors.push('ID6 phải có đúng một dấu gạch ngang');
        }
        
        const [mainPart, form] = parts;
        
        if (mainPart.length !== 5) {
          errors.push(`Phần chính của ID6 phải có 5 ký tự, nhận được ${mainPart.length}`);
        }
        
        if (form.length !== 1) {
          errors.push(`Phần Form của ID6 phải có 1 ký tự, nhận được ${form.length}`);
        }
        
        // Kiểm tra ký tự hợp lệ cho phần chính và form
        this.validateCharacters(mainPart, errors, 'Phần chính');
        this.validateCharacters(form, errors, 'Phần Form');
        
      } else {
        // Nếu là ID5, kiểm tra định dạng XXXXX
        if (normalizedId.length !== 5) {
          errors.push(`ID5 phải có đúng 5 ký tự, nhận được ${normalizedId.length}`);
        }
        
        // Kiểm tra ký tự hợp lệ
        this.validateCharacters(normalizedId, errors, 'ID5');
      }
      
      // Kiểm tra Level là một trong các giá trị hợp lệ
      if (normalizedId.length >= 4) {
        const level = normalizedId.charAt(3);
        if (!Object.keys(LEVEL_MAP).includes(level)) {
          errors.push(`Level '${level}' không hợp lệ. Các giá trị hợp lệ: ${Object.keys(LEVEL_MAP).join(', ')}`);
        }
      }
      
      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      this.logger.error(`Lỗi khi validate QuestionID ${questionId}: ${getErrorMessage(error)}`);
      return {
        isValid: false,
        errors: [`Lỗi khi validate: ${getErrorMessage(error)}`]
      };
    }
  }

  /**
   * Lấy mô tả đầy đủ của QuestionID
   * @param questionId QuestionID cần lấy mô tả
   * @returns Object chứa mô tả đầy đủ của QuestionID
   */
  async getQuestionIdDescription(questionId: string): Promise<QuestionIdDescription> {
    try {
      // Phân giải QuestionID
      const parsedId = await this.parseQuestionId(questionId);
      
      // Lấy mô tả cho từng thành phần
      const result: QuestionIdDescription = { fullDescription: '' };
      const descriptions: string[] = [];
      
      // Grade (Lớp)
      if (parsedId.grade && this.mapIdStructure.grade[parsedId.grade]) {
        result.grade = {
          value: parsedId.grade,
          description: this.mapIdStructure.grade[parsedId.grade]
        };
        descriptions.push(`Lớp: ${this.mapIdStructure.grade[parsedId.grade]}`);
      }
      
      // Subject (Môn)
      if (parsedId.subject && this.mapIdStructure.subject[parsedId.subject]) {
        result.subject = {
          value: parsedId.subject,
          description: this.mapIdStructure.subject[parsedId.subject]
        };
        descriptions.push(`Môn: ${this.mapIdStructure.subject[parsedId.subject]}`);
      }
      
      // Chapter (Chương)
      if (parsedId.chapter && this.mapIdStructure.chapter[parsedId.chapter]) {
        result.chapter = {
          value: parsedId.chapter,
          description: this.mapIdStructure.chapter[parsedId.chapter]
        };
        descriptions.push(`Chương: ${this.mapIdStructure.chapter[parsedId.chapter]}`);
      }
      
      // Level (Mức độ)
      if (parsedId.level && LEVEL_MAP[parsedId.level]) {
        result.level = {
          value: parsedId.level,
          description: LEVEL_MAP[parsedId.level]
        };
        descriptions.push(`Mức độ: ${LEVEL_MAP[parsedId.level]}`);
      }
      
      // Lesson (Bài)
      if (parsedId.lesson && this.mapIdStructure.lesson[parsedId.lesson]) {
        result.lesson = {
          value: parsedId.lesson,
          description: this.mapIdStructure.lesson[parsedId.lesson]
        };
        descriptions.push(`Bài: ${this.mapIdStructure.lesson[parsedId.lesson]}`);
      }
      
      // Form (Dạng) - chỉ có trong ID6
      if (parsedId.isID6 && parsedId.form && this.mapIdStructure.form[parsedId.form]) {
        result.form = {
          value: parsedId.form,
          description: this.mapIdStructure.form[parsedId.form]
        };
        descriptions.push(`Dạng: ${this.mapIdStructure.form[parsedId.form]}`);
      }
      
      // Tạo mô tả đầy đủ
      result.fullDescription = descriptions.join(' | ');
      
      return result;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy mô tả QuestionID ${questionId}: ${getErrorMessage(error)}`);
      throw new Error(`Không thể lấy mô tả QuestionID: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Lấy cấu trúc MapID
   * @returns Cấu trúc phân cấp MapID
   */
  async getMapIdStructure(): Promise<MapIdStructure & { level: Record<string, string> }> {
    // Trả về cấu trúc MapID hiện tại
    return {
      grade: this.mapIdStructure.grade,
      subject: this.mapIdStructure.subject,
      chapter: this.mapIdStructure.chapter,
      lesson: this.mapIdStructure.lesson,
      form: this.mapIdStructure.form,
      level: LEVEL_MAP
    };
  }

  /**
   * Helper method để validate các ký tự trong ID
   * @param value Chuỗi cần kiểm tra
   * @param errors Mảng lỗi
   * @param partName Tên phần đang kiểm tra
   */
  private validateCharacters(value: string, errors: string[], partName: string): void {
    const pattern = /^[0-9A-Z]+$/;
    
    if (!pattern.test(value)) {
      errors.push(`${partName} chỉ được chứa chữ số và chữ cái in hoa`);
    }
  }
} 
