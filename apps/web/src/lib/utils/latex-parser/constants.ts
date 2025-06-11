'use client';

/**
 * Các pattern regex cho việc trích xuất nội dung từ LaTeX
 */

// Pattern cho môi trường câu hỏi
export const QUESTION_START_PATTERN = '\\\\begin\\{ex\\}'
export const QUESTION_END_PATTERN = '\\\\end\\{ex\\}'

// Pattern cho nguồn và ID
export const SOURCE_PATTERN = '%\\s*\\[\\s*Nguồn:?\\s*([^\\]]+)\\s*\\]\\s*%?'
export const ID_PATTERN = '%?\\s*\\[\\s*([0-9A-Z]{5,6}(?:-[0-9A-Z])?)\\s*\\]\\s*%?'

// Pattern cho Subcount (hỗ trợ nhiều định dạng)
export const SUBCOUNT_PATTERNS = [
  '%\\s*\\[\\s*([A-Z]{2})\\.(\\d+)\\s*\\]\\s*%?',
  '\\[\\s*([A-Z]{2})\\.(\\d+)\\s*\\]',
  '\\{Subcount:\\s*([A-Z]{2})\\.(\\d+)\\s*\\}',
  'Subcnt:\\s*([A-Z]{2})\\.(\\d+)',
  '\\[\\s*(TL)\\.(\\d+)\\s*\\]'
]

// Pattern cho các loại câu hỏi
export const CHOICE_PATTERNS = [
  '\\\\choice(?:\\[[0-9]\\])?',
  '\\\\choice(?:\\s|$)'
]
export const CHOICE_TF_PATTERNS = [
  '\\\\choiceTF(?:\\[[t12]\\])?',
  '\\\\choiceTFt',
  '\\\\choiceTF(?:\\s|$)'
]
export const SHORT_ANS_PATTERNS = [
  '\\\\shortans(?:\\[[a-z0-9]+\\])?(?:\\{.*?\\})?',
  '\\\\shortans(?:\\s|$)'
]
export const MATCHING_PATTERNS = [
  '\\\\matching(?:\\s|$)',
  '\\\\matching(?:\\{.*?\\})?'
]
export const TRUE_PATTERN = '\\\\True'
export const SOLUTION_PATTERN = '\\\\loigiai\\s*\\{([\\s\\S]*?)\\}'

// Pattern để nhận diện môi trường hình ảnh
export const IMAGE_ENVIRONMENTS = [
  '\\\\begin\\{center\\}[\\s\\S]*?\\\\end\\{center\\}',
  '\\\\begin\\{tikzpicture\\}[\\s\\S]*?\\\\end\\{tikzpicture\\}',
  '\\\\includegraphics(?:\\[[^\\]]*\\])?\\{[^}]*\\}',
  '\\\\begin\\{figure\\}[\\s\\S]*?\\\\end\\{figure\\}'
]

// Pattern để loại bỏ các lệnh LaTeX trong môi trường tikzpicture
export const TIKZ_COMMANDS = [
  '\\\\def\\\\[a-zA-Z]+\\{[^}]*\\}',
  '\\\\path[^;]*;',
  '\\\\draw(?:\\[[^\\]]*\\])?[^;]*;',
  '\\\\pic(?:\\[[^\\]]*\\])?[^;]*;',
  '\\\\foreach[^}]*\\}[^;]*;',
  'coordinate \\([a-zA-Z0-9]+\\)'
]

// Bản đồ loại câu hỏi
export const QUESTION_TYPE_MAP = {
  'choice': 'MC',
  'choiceTF': 'TF',
  'shortans': 'SA',
  'match': 'MA',
  'essay': 'ES',
  'unknown': 'MC'
}

// Mô tả loại câu hỏi
export const QUESTION_TYPE_DESCRIPTION = {
  'MC': 'Trắc nghiệm',
  'TF': 'Đúng/Sai',
  'SA': 'Trả lời ngắn',
  'MA': 'Ghép đôi',
  'ES': 'Tự luận',
  'unknown': 'Không xác định'
}
