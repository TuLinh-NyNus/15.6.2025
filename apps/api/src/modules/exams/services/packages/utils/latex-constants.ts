/**
 * Constants cho việc phân tích cú pháp LaTeX
 */

/**
 * Regular expression để trích xuất QuestionID từ nội dung LaTeX
 * Format: [XXXXX-X] (trong đó X là kí tự số [0-9] hoặc chữ cái in hoa [A-Z])
 */
export const ID_PATTERN = /%\[([\w\d-]+)\]/;

/**
 * Regular expression để trích xuất nguồn câu hỏi từ nội dung LaTeX
 * Format: Nguồn: "Tên nguồn"
 */
export const SOURCE_PATTERN = /%\[Nguồn:\s*["'](.+?)["']|Nguồn:\s*["'](.+?)["']\]/g;

/**
 * Các patterns để trích xuất Subcount từ nội dung LaTeX
 * Format: [XX.N] (trong đó XX là 2 kí tự in hoa [A-Z] và N là số có thể có nhiều chữ số)
 */
export const SUBCOUNT_PATTERNS = [
  /\[(([A-Z]{2})\.(\d+))\]/,
  /\[(([A-Z]{2})[-.](\d+))\]/
];

/**
 * Pattern để trích xuất lời giải từ nội dung LaTeX
 * Format: \loigiai{nội dung lời giải}
 */
export const SOLUTION_PATTERN = /\\loigiai\s*\{([^}]*)\}/g;

/**
 * Các patterns cho các môi trường hình ảnh cần loại bỏ khi trích xuất nội dung
 */
export const IMAGE_ENVIRONMENTS = [
  /\\begin\{center\}[\s\S]*?\\end\{center\}/g,
  /\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g,
  /\\includegraphics(?:\[.*?\])?\{.*?\}/g,
  /\\immini(?:\[.*?\])?\{.*?\}\{.*?\}/g
];

/**
 * Các patterns cho việc xác định loại câu hỏi
 */
export const CHOICE_PATTERN = /\\choice(?:\[[0-9]\])?/;
export const CHOICE_TF_PATTERN = /\\choiceTF(?:\[[t12]\])?|\\choiceTFt/;
export const SHORT_ANS_PATTERN = /\\shortans(?:\[.*?\])?(?:\{.*?\}|\{.*?\})/;

/**
 * Map các loại câu hỏi từ pattern tìm thấy sang QuestionType
 */
export const QUESTION_TYPE_MAP = {
  'CHOICE': 'MC',   // Multiple Choice - Trắc nghiệm một đáp án
  'CHOICE_TF': 'TF', // True/False - Trắc nghiệm nhiều đáp án
  'SHORT_ANS': 'SA', // Short Answer - Trả lời ngắn
  'ESSAY': 'ES'     // Essay - Tự luận
};

/**
 * Patterns để trích xuất đáp án đúng
 */
export const TRUE_ANSWER_PATTERN = /\\True\s*([^}]*)/g; 
