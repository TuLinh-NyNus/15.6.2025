/**
 * Utility class cho việc trích xuất nội dung trong các dấu ngoặc trong cú pháp LaTeX
 * Xử lý chính xác các cấu trúc lồng nhau phức tạp trong LaTeX
 */
export class BracketExtractor {
  /**
   * Trích xuất nội dung bên trong cặp ngoặc nhọn đầu tiên từ một chuỗi
   * @param content Chuỗi cần trích xuất
   * @param startIndex Vị trí bắt đầu tìm kiếm (mặc định là 0)
   * @returns Object chứa nội dung trích xuất và vị trí kết thúc, hoặc null nếu không tìm thấy
   */
  static extractFirstCurlyBrackets(
    content: string,
    startIndex = 0,
  ): { content: string; endIndex: number } | null {
    // Tìm vị trí mở ngoặc đầu tiên
    const openIndex = content.indexOf('{', startIndex);
    if (openIndex === -1) return null;
    
    let nestedLevel = 1;
    let currentIndex = openIndex + 1;
    
    // Duyệt qua chuỗi để tìm ngoặc đóng tương ứng
    while (currentIndex < content.length && nestedLevel > 0) {
      const char = content[currentIndex];
      
      if (char === '{') {
        nestedLevel++;
      } else if (char === '}') {
        nestedLevel--;
      }
      
      currentIndex++;
    }
    
    // Kiểm tra xem đã tìm thấy ngoặc đóng chưa
    if (nestedLevel !== 0) {
      console.warn('Không tìm thấy ngoặc đóng tương ứng');
      return null;
    }
    
    // Trích xuất nội dung (không bao gồm dấu ngoặc)
    const extractedContent = content.substring(openIndex + 1, currentIndex - 1);
    
    return {
      content: extractedContent,
      endIndex: currentIndex,
    };
  }
  
  /**
   * Trích xuất tất cả nội dung bên trong các cặp ngoặc nhọn từ một chuỗi
   * @param content Chuỗi cần trích xuất
   * @returns Mảng các chuỗi đã trích xuất
   */
  static extractAllCurlyBrackets(content: string): string[] {
    const results: string[] = [];
    let currentIndex = 0;
    let extraction = this.extractFirstCurlyBrackets(content, currentIndex);
    
    while (extraction !== null) {
      results.push(extraction.content);
      currentIndex = extraction.endIndex;
      extraction = this.extractFirstCurlyBrackets(content, currentIndex);
    }
    
    return results;
  }
  
  /**
   * Trích xuất nội dung bên trong cặp ngoặc vuông đầu tiên
   * @param content Chuỗi cần trích xuất
   * @param startIndex Vị trí bắt đầu tìm kiếm (mặc định là 0)
   * @returns Object chứa nội dung trích xuất và vị trí kết thúc, hoặc null nếu không tìm thấy
   */
  static extractFirstSquareBrackets(
    content: string,
    startIndex = 0,
  ): { content: string; endIndex: number } | null {
    const openIndex = content.indexOf('[', startIndex);
    if (openIndex === -1) return null;
    
    let nestedLevel = 1;
    let currentIndex = openIndex + 1;
    
    while (currentIndex < content.length && nestedLevel > 0) {
      const char = content[currentIndex];
      
      if (char === '[') {
        nestedLevel++;
      } else if (char === ']') {
        nestedLevel--;
      }
      
      currentIndex++;
    }
    
    if (nestedLevel !== 0) {
      console.warn('Không tìm thấy ngoặc vuông đóng tương ứng');
      return null;
    }
    
    const extractedContent = content.substring(openIndex + 1, currentIndex - 1);
    
    return {
      content: extractedContent,
      endIndex: currentIndex,
    };
  }
  
  /**
   * Trích xuất nội dung bên trong cặp dấu ngoặc tròn đầu tiên
   * @param content Chuỗi cần trích xuất
   * @param startIndex Vị trí bắt đầu tìm kiếm (mặc định là 0)
   * @returns Object chứa nội dung trích xuất và vị trí kết thúc, hoặc null nếu không tìm thấy
   */
  static extractFirstParentheses(
    content: string,
    startIndex = 0,
  ): { content: string; endIndex: number } | null {
    const openIndex = content.indexOf('(', startIndex);
    if (openIndex === -1) return null;
    
    let nestedLevel = 1;
    let currentIndex = openIndex + 1;
    
    while (currentIndex < content.length && nestedLevel > 0) {
      const char = content[currentIndex];
      
      if (char === '(') {
        nestedLevel++;
      } else if (char === ')') {
        nestedLevel--;
      }
      
      currentIndex++;
    }
    
    if (nestedLevel !== 0) {
      console.warn('Không tìm thấy ngoặc tròn đóng tương ứng');
      return null;
    }
    
    const extractedContent = content.substring(openIndex + 1, currentIndex - 1);
    
    return {
      content: extractedContent,
      endIndex: currentIndex,
    };
  }
  
  /**
   * Trích xuất nội dung bên trong cặp dấu ngoặc cho một môi trường LaTeX cụ thể
   * @param content Chuỗi cần trích xuất
   * @param environment Tên môi trường LaTeX
   * @returns Nội dung đã trích xuất hoặc null nếu không tìm thấy
   */
  static extractEnvironmentContent(content: string, environment: string): string | null {
    const startTag = `\\begin{${environment}}`;
    const endTag = `\\end{${environment}}`;
    
    const startPos = content.indexOf(startTag);
    if (startPos === -1) return null;
    
    const startContentPos = startPos + startTag.length;
    const endPos = content.indexOf(endTag, startContentPos);
    if (endPos === -1) return null;
    
    return content.substring(startContentPos, endPos).trim();
  }
} 