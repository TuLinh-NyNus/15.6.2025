'use client';

/**
 * Utility kiểm tra và trích xuất dấu ngoặc nhọn trong LaTeX
 * Xử lý các trường hợp lồng nhau và escape characters
 */

/**
 * Kiểm tra tính cân bằng của dấu ngoặc nhọn trong chuỗi LaTeX
 * @param latexString Chuỗi LaTeX cần kiểm tra
 * @returns boolean - true nếu các dấu ngoặc cân bằng, false nếu không
 */
export function isBalancedBrackets(latexString: string): boolean {
  // Stack để theo dõi dấu ngoặc mở
  const stack: string[] = [];

  // Vị trí hiện tại
  let i = 0;

  // Kích thước chuỗi
  const n = latexString.length;

  while (i < n) {
    // Xử lý trường hợp ký tự được escape bằng backslash
    if (latexString[i] === '\\') {
      // Bỏ qua ký tự tiếp theo vì nó đã được escape
      i += 2;
      continue;
    }

    // Xử lý trường hợp comment %, bỏ qua mọi thứ đến hết dòng
    if (latexString[i] === '%') {
      while (i < n && latexString[i] !== '\n') {
        i++;
      }
      continue;
    }

    // Xử lý dấu ngoặc mở
    if (latexString[i] === '{') {
      stack.push('{');
    }

    // Xử lý dấu ngoặc đóng
    else if (latexString[i] === '}') {
      // Nếu stack rỗng hoặc dấu ngoặc đóng không khớp, cân bằng bị vi phạm
      if (stack.length === 0 || stack[stack.length - 1] !== '{') {
        return false;
      }

      // Pop dấu ngoặc mở tương ứng
      stack.pop();
    }

    // Di chuyển đến ký tự tiếp theo
    i++;
  }

  // Kiểm tra xem stack có rỗng không, nếu rỗng thì các dấu ngoặc cân bằng
  return stack.length === 0;
}

/**
 * Trích xuất nội dung bên trong cặp dấu ngoặc nhọn theo đúng level
 * @param latexString Chuỗi LaTeX cần trích xuất
 * @param command Lệnh LaTeX cần tìm, ví dụ "\\question", "\\begin{ex}"
 * @returns string[] - Mảng các chuỗi được trích xuất
 */
export function extractContentFromBrackets(latexString: string, command: string): string[] {
  const results: string[] = [];

  // Vị trí hiện tại
  let i = 0;

  // Kích thước chuỗi
  const n = latexString.length;

  while (i < n) {
    // Tìm kiếm lệnh
    const commandIndex = latexString.indexOf(command, i);
    if (commandIndex === -1) break;

    // Di chuyển vị trí hiện tại đến sau lệnh
    i = commandIndex + command.length;

    // Bỏ qua khoảng trắng
    while (i < n && /\s/.test(latexString[i])) {
      i++;
    }

    // Nếu không tìm thấy dấu ngoặc mở, bỏ qua
    if (i >= n || latexString[i] !== '{') continue;

    // Bắt đầu trích xuất nội dung
    let bracketLevel = 1; // Đã gặp dấu ngoặc mở đầu tiên
    // const startIndex = i + 1; // Bắt đầu sau dấu ngoặc mở - không sử dụng
    let content = '';

    i++; // Di chuyển vào trong ngoặc

    while (i < n && bracketLevel > 0) {
      // Xử lý trường hợp ký tự được escape
      if (latexString[i] === '\\' && i + 1 < n) {
        content += latexString.substring(i, i + 2);
        i += 2;
        continue;
      }

      // Xử lý trường hợp comment
      if (latexString[i] === '%') {
        const lineEndIndex = latexString.indexOf('\n', i);
        if (lineEndIndex === -1) {
          // Nếu không tìm thấy end of line, di chuyển đến cuối chuỗi
          content += latexString.substring(i);
          i = n;
        } else {
          content += latexString.substring(i, lineEndIndex + 1);
          i = lineEndIndex + 1;
        }
        continue;
      }

      // Theo dõi level của dấu ngoặc
      if (latexString[i] === '{') {
        bracketLevel++;
      } else if (latexString[i] === '}') {
        bracketLevel--;
      }

      // Nếu vẫn trong ngoặc, thêm ký tự vào nội dung
      if (bracketLevel > 0) {
        content += latexString[i];
      }

      i++;
    }

    // Thêm nội dung vào kết quả
    if (bracketLevel === 0) {
      results.push(content);
    }
  }

  return results;
}

/**
 * Trích xuất nội dung bên trong một môi trường LaTeX
 * @param latexString Chuỗi LaTeX cần trích xuất
 * @param environment Tên môi trường, ví dụ "ex", "choice"
 * @returns string[] - Mảng các chuỗi được trích xuất
 */
export function extractEnvironmentContent(latexString: string, environment: string): string[] {
  const results: string[] = [];

  // Biểu thức chính quy để tìm môi trường
  const startPattern = new RegExp(`\\\\begin\\{${environment}\\}`, 'g');
  const endPattern = new RegExp(`\\\\end\\{${environment}\\}`, 'g');

  let match;
  let searchIndex = 0;

  while ((match = startPattern.exec(latexString.substring(searchIndex))) !== null) {
    const startIndex = searchIndex + match.index + match[0].length;

    // Reset endPattern để tìm từ vị trí mới
    endPattern.lastIndex = 0;

    // Tìm end tương ứng
    // let endMatch; // Không sử dụng
    let nestedLevel = 1;
    let endIndex = startIndex;

    const tempSearchString = latexString.substring(startIndex);
    let tempSearchIndex = 0;

    while (nestedLevel > 0 && tempSearchIndex < tempSearchString.length) {
      // Tìm begin tiếp theo
      startPattern.lastIndex = 0;
      const nextBegin = startPattern.exec(tempSearchString.substring(tempSearchIndex));
      const beginIndex = nextBegin ? tempSearchIndex + nextBegin.index : tempSearchString.length;

      // Tìm end tiếp theo
      endPattern.lastIndex = 0;
      const nextEnd = endPattern.exec(tempSearchString.substring(tempSearchIndex));
      const endMatchIndex = nextEnd ? tempSearchIndex + nextEnd.index : tempSearchString.length;

      // Nếu tìm thấy begin trước end và begin đó thuộc cùng môi trường
      if (beginIndex < endMatchIndex && nextBegin) {
        nestedLevel++;
        tempSearchIndex = beginIndex + nextBegin[0].length;
      }
      // Nếu tìm thấy end
      else if (nextEnd) {
        nestedLevel--;
        if (nestedLevel === 0) {
          endIndex = startIndex + endMatchIndex;
        }
        tempSearchIndex = endMatchIndex + nextEnd[0].length;
      }
      // Nếu không tìm thấy cả begin và end, thoát vòng lặp
      else {
        break;
      }
    }

    // Nếu tìm thấy cặp begin-end hoàn chỉnh
    if (nestedLevel === 0) {
      results.push(latexString.substring(startIndex, endIndex));
    }

    // Cập nhật vị trí tìm kiếm tiếp theo
    searchIndex = endIndex + `\\end{${environment}}`.length;

    // Reset startPattern để tìm từ vị trí mới
    startPattern.lastIndex = 0;
  }

  return results;
}

/**
 * Trích xuất các tham số tùy chọn trong lệnh LaTeX
 * @param latexString Chuỗi LaTeX cần trích xuất
 * @param command Lệnh LaTeX cần tìm, ví dụ "\\question"
 * @returns string[] - Mảng các tham số tùy chọn
 */
export function extractOptionalParameters(latexString: string, command: string): string[] {
  const results: string[] = [];

  // Vị trí hiện tại
  let i = 0;

  // Kích thước chuỗi
  const n = latexString.length;

  while (i < n) {
    // Tìm kiếm lệnh
    const commandIndex = latexString.indexOf(command, i);
    if (commandIndex === -1) break;

    // Di chuyển vị trí hiện tại đến sau lệnh
    i = commandIndex + command.length;

    // Bỏ qua khoảng trắng
    while (i < n && /\s/.test(latexString[i])) {
      i++;
    }

    // Tìm các tham số tùy chọn [...]
    while (i < n && latexString[i] === '[') {
      let bracketLevel = 1; // Đã gặp dấu ngoặc vuông mở
      // const startIndex = i + 1; // Bắt đầu sau dấu ngoặc vuông mở - không sử dụng
      let content = '';

      i++; // Di chuyển vào trong ngoặc vuông

      while (i < n && bracketLevel > 0) {
        // Xử lý escape characters
        if (latexString[i] === '\\' && i + 1 < n) {
          content += latexString.substring(i, i + 2);
          i += 2;
          continue;
        }

        // Theo dõi level của dấu ngoặc vuông
        if (latexString[i] === '[') {
          bracketLevel++;
        } else if (latexString[i] === ']') {
          bracketLevel--;
        }

        // Nếu vẫn trong ngoặc vuông, thêm ký tự vào nội dung
        if (bracketLevel > 0) {
          content += latexString[i];
        }

        i++;
      }

      // Thêm tham số vào kết quả
      if (bracketLevel === 0) {
        results.push(content);
      }

      // Bỏ qua khoảng trắng sau tham số
      while (i < n && /\s/.test(latexString[i])) {
        i++;
      }
    }

    // Nếu không còn tham số tùy chọn, thoát khỏi vòng lặp này
    break;
  }

  return results;
}

/**
 * Kiểm tra phần tử LaTeX có được định nghĩa đúng không
 * @param latexString Chuỗi LaTeX cần kiểm tra
 * @param elementName Tên phần tử cần kiểm tra, ví dụ "choice", "ex"
 * @returns boolean - true nếu phần tử được định nghĩa đúng, false nếu không
 */
export function isValidLatexElement(latexString: string, elementName: string): boolean {
  // Kiểm tra xem số lượng \begin và \end có bằng nhau không
  const beginCount = (latexString.match(new RegExp(`\\\\begin\\{${elementName}\\}`, 'g')) || []).length;
  const endCount = (latexString.match(new RegExp(`\\\\end\\{${elementName}\\}`, 'g')) || []).length;

  if (beginCount !== endCount) {
    return false;
  }

  // Nếu không có begin hoặc end, return true (phần tử không tồn tại)
  if (beginCount === 0) {
    return true;
  }

  // Stack để theo dõi các begin/end lồng nhau
  const stack: string[] = [];

  // Tìm tất cả các begin và end
  const beginPattern = new RegExp(`\\\\begin\\{(${elementName})\\}`, 'g');
  const endPattern = new RegExp(`\\\\end\\{(${elementName})\\}`, 'g');

  let beginMatch;
  let endMatch;

  // Vị trí tiếp theo để tìm kiếm
  let beginSearchPos = 0;
  let endSearchPos = 0;

  // Tìm begin và end theo thứ tự xuất hiện
  while (beginSearchPos < latexString.length || endSearchPos < latexString.length) {
    // Reset lastIndex để tìm từ vị trí mới
    beginPattern.lastIndex = beginSearchPos;
    endPattern.lastIndex = endSearchPos;

    beginMatch = beginPattern.exec(latexString);
    endMatch = endPattern.exec(latexString);

    // Vị trí của begin và end tiếp theo
    const beginPos = beginMatch ? beginMatch.index : Infinity;
    const endPos = endMatch ? endMatch.index : Infinity;

    // Nếu không còn begin và end nào nữa, thoát vòng lặp
    if (beginPos === Infinity && endPos === Infinity) {
      break;
    }

    // Nếu begin xuất hiện trước end
    if (beginPos < endPos) {
      stack.push(beginMatch![1]);
      beginSearchPos = beginPos + beginMatch![0].length;
    }
    // Nếu end xuất hiện trước begin
    else {
      // Nếu stack rỗng hoặc end không khớp với begin gần nhất, cân bằng bị vi phạm
      if (stack.length === 0 || stack[stack.length - 1] !== endMatch![1]) {
        return false;
      }

      // Pop begin tương ứng
      stack.pop();
      endSearchPos = endPos + endMatch![0].length;
    }
  }

  // Kiểm tra xem stack có rỗng không, nếu rỗng thì các phần tử cân bằng
  return stack.length === 0;
}