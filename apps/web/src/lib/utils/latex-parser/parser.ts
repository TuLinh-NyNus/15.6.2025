'use client';

/**
 * Utility phân tích câu hỏi LaTeX
 * Dựa trên tài liệu parser từ project Database
 */

import {
  QUESTION_START_PATTERN,
  QUESTION_END_PATTERN,
  SOURCE_PATTERN,
  ID_PATTERN,
  SUBCOUNT_PATTERNS,
  CHOICE_PATTERNS,
  CHOICE_TF_PATTERNS,
  SHORT_ANS_PATTERNS,
  MATCHING_PATTERNS,
  TRUE_PATTERN,
  SOLUTION_PATTERN,
  QUESTION_TYPE_MAP,
  IMAGE_ENVIRONMENTS
  // TIKZ_COMMANDS - không sử dụng
} from './constants';
import { Question, QuestionID, Answer, ExtractedQuestion, QuestionIdDetails, SubcountDetails } from './models';
// Import các hàm từ latex-parser-brackets
import { extractContentFromBrackets } from '../latex-parser-brackets';
import logger from '../logger';

/**
 * Class LaTeXParser - Xử lý trích xuất thông tin từ nội dung LaTeX
 */
export class LaTeXParser {
  /**
   * Trích xuất các câu hỏi từ nội dung LaTeX
   */
  static extractQuestions(content: string): string[] {
    const pattern = new RegExp(`(${QUESTION_START_PATTERN}[\\s\\S]*?${QUESTION_END_PATTERN})`)
    const matches = []
    let match

    let pos = 0
    while ((match = pattern.exec(content.slice(pos))) !== null) {
      matches.push(match[1])
      pos += match.index + match[0].length
    }

    return matches
  }

  /**
   * Phân tích ID câu hỏi từ nội dung
   */
  static parseQuestionId(content: string): [QuestionID | null, string | null] {
    // Xử lý Subcount
    let subcount = null;

    // Tìm tất cả các chuỗi khớp với pattern subcount
    for (const pattern of SUBCOUNT_PATTERNS) {
      const subcountRegex = new RegExp(pattern, 'g');
      let match;

      while ((match = subcountRegex.exec(content)) !== null) {
        const prefix = match[1];
        const number = match[2];

        // Kiểm tra xem đây có phải là subcount thực sự hay không
        // (không phải là một phần của nguồn hoặc ID)
        const beforeMatch = content.substring(0, match.index).trim();
        const afterMatch = content.substring(match.index + match[0].length).trim();

        // Nếu là subcount độc lập (không nằm trong nguồn)
        if (!beforeMatch.endsWith('Nguồn:') && !beforeMatch.endsWith('Nguồn: ')) {
          subcount = `${prefix}.${number}`;
          break;
        }
      }

      if (subcount) break;
    }

    // Tìm ID thông thường (ID5 hoặc ID6)
    let questionId = null;

    // Tìm tất cả các chuỗi khớp với pattern ID
    const idRegex = new RegExp(ID_PATTERN, 'g');
    let idMatch;

    while ((idMatch = idRegex.exec(content)) !== null) {
      const fullId = idMatch[1];

      // Kiểm tra xem đây có phải là ID thực sự hay không
      // (không phải là một phần của nguồn hoặc subcount)
      const beforeMatch = content.substring(0, idMatch.index).trim();
      const afterMatch = content.substring(idMatch.index + idMatch[0].length).trim();

      // Nếu là ID độc lập (không nằm trong nguồn)
      if (!beforeMatch.endsWith('Nguồn:') && !beforeMatch.endsWith('Nguồn: ')) {
        // Xác định là ID5 hay ID6
        if (fullId.includes("-")) {
          // ID6 dạng: XXXXX-Y
          const [baseId, typeId] = fullId.split("-");
          if (baseId.length === 5 && typeId.length === 1) {
            questionId = {
              format: "ID6" as const,
              fullId,
              lop: baseId[0],
              mon: baseId[1],
              chuong: baseId[2],
              muc_do: baseId[3],
              bai: baseId[4],
              dang: typeId
            };
            break;
          }
        } else {
          // ID5 dạng: XXXXX
          if (fullId.length === 5) {
            questionId = {
              format: "ID5" as const,
              fullId,
              lop: fullId[0],
              mon: fullId[1],
              chuong: fullId[2],
              muc_do: fullId[3],
              bai: fullId[4]
            };
            break;
          }
        }
      }
    }

    return [questionId, subcount];
  }

  /**
   * Phân tích nguồn câu hỏi
   */
  static parseSource(content: string): string | null {
    // Tìm tất cả các chuỗi khớp với pattern nguồn
    const sourceRegex = new RegExp(SOURCE_PATTERN, 'g');
    let match;

    while ((match = sourceRegex.exec(content)) !== null) {
      if (match[1]) {
        // Lấy nội dung nguồn và loại bỏ các phần không cần thiết
        let source = match[1].trim();

        // Nếu nguồn chứa dấu %, loại bỏ phần sau dấu %
        const percentIndex = source.indexOf('%');
        if (percentIndex !== -1) {
          source = source.substring(0, percentIndex).trim();
        }

        // Nếu nguồn chứa dấu [, loại bỏ phần từ dấu [ trở đi
        const bracketIndex = source.indexOf('[');
        if (bracketIndex !== -1) {
          source = source.substring(0, bracketIndex).trim();
        }

        return source;
      }
    }

    return null;
  }

  /**
   * Trích xuất lời giải
   */
  static extractSolution(content: string): string | null {
    const pattern = new RegExp(SOLUTION_PATTERN.replace('([\\s\\S]*?)', '(.*)'), 'g')
    const match = pattern.exec(content)
    if (match) {
      const solution = match[1];

      // Xử lý và làm sạch nội dung lời giải
      return this.cleanSolutionContent(solution);
    }

    // Nếu cách đơn giản không thành công, thử phương pháp phức tạp hơn
    // với balanced braces parser
    try {
      const solutionMatch = /\\loigiai\s*\{/.exec(content)
      if (solutionMatch) {
        const startPos = solutionMatch.index + solutionMatch[0].length - 1
        const solution = this.extractBalancedBraces(content, startPos);

        // Xử lý và làm sạch nội dung lời giải
        return this.cleanSolutionContent(solution);
      }
    } catch {
      // Ignore errors
    }

    return null
  }

  /**
   * Làm sạch nội dung lời giải, thay thế các môi trường hình ảnh
   */
  static cleanSolutionContent(solution: string): string {
    // Thay thế các môi trường hình ảnh
    return solution
      // Thay thế môi trường center có chứa tikzpicture, includegraphics
      .replace(/\\begin\{center\}[\s\S]*?\\end\{center\}/g, 'HÌNH ẢNH MINH HỌA')
      // Thay thế môi trường tikzpicture
      .replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, 'HÌNH ẢNH MINH HỌA')
      // Thay thế lệnh includegraphics
      .replace(/\\includegraphics(?:\[[^\]]*\])?\{[^}]*\}/g, 'HÌNH ẢNH MINH HỌA')
      // Thay thế môi trường figure
      .replace(/\\begin\{figure\}[\s\S]*?\\end\{figure\}/g, 'HÌNH ẢNH MINH HỌA')
      // Thay thế môi trường itemchoice
      .replace(/\\begin\{itemchoice\}[\s\S]*?\\end\{itemchoice\}/g, content => {
        // Giữ lại nội dung itemchoice nhưng làm sạch
        return content
          .replace(/\\begin\{itemchoice\}/, '')
          .replace(/\\end\{itemchoice\}/, '')
          .replace(/\\itemch/g, '\n- ');
      })
      .trim();
  }

  /**
   * Trích xuất nhiều lời giải từ nội dung
   */
  static extractAllSolutions(content: string): string[] {
    const results: string[] = [];
    let pos = 0;
    let solutionMatch;

    while ((solutionMatch = /\\loigiai\s*\{/.exec(content.slice(pos))) !== null) {
      try {
        const startPos = pos + solutionMatch.index + solutionMatch[0].length - 1;
        const solution = this.extractBalancedBraces(content, startPos);
        if (solution) {
          results.push(solution);
        }
        pos += solutionMatch.index + solutionMatch[0].length;
      } catch {
        pos += solutionMatch.index + solutionMatch[0].length;
      }
    }

    return results;
  }

  /**
   * Trích xuất nội dung trong một cặp dấu ngoặc nhọn cân bằng.
   * Trả về nội dung giữa dấu { và } (không bao gồm dấu ngoặc)
   */
  static extractBalancedBraces(text: string, startPos: number = 0): string {
    let pos = startPos
    while (pos < text.length && /\s/.test(text[pos])) {
      pos++
    }

    if (pos >= text.length || text[pos] !== '{') {
      throw new Error(`Expected '{' at position ${pos}`)
    }

    const contentStart = pos + 1 // Bắt đầu sau dấu {
    let balance = 1
    pos++

    let inComment = false
    let escaped = false

    while (pos < text.length && balance > 0) {
      const char = text[pos]

      // Xử lý comment LaTeX
      if (char === '%' && !escaped) {
        inComment = true
      } else if (char === '\n' && inComment) {
        inComment = false
      }

      // Bỏ qua xử lý khi trong comment
      if (!inComment) {
        if (char === '\\' && !escaped) {
          escaped = true
        } else {
          if (!escaped) {
            if (char === '{') {
              balance++
            } else if (char === '}') {
              balance--
            }
          }
          escaped = false
        }
      }

      pos++
    }

    if (balance !== 0) {
      throw new Error("Unbalanced braces")
    }

    // Trả về nội dung giữa dấu { và } (không bao gồm dấu ngoặc)
    return text.substring(contentStart, pos - 1)
  }

  /**
   * Xác định loại câu hỏi và trích xuất đáp án
   */
  static identifyQuestionType(content: string): [string, Answer[], string | string[]] {
    // Tách phần lời giải ra khỏi nội dung xử lý đáp án
    const solutionMatch = new RegExp(SOLUTION_PATTERN).exec(content);
    let contentWithoutSolution = content;

    if (solutionMatch) {
      // Loại bỏ phần lời giải trước khi xử lý đáp án
      contentWithoutSolution = content.substring(0, solutionMatch.index);
    }

    // Kiểm tra từng loại câu hỏi theo thứ tự ưu tiên

    // Kiểm tra xem nội dung có chứa các lệnh đặc trưng cho từng loại câu hỏi không
    const hasChoiceTF = CHOICE_TF_PATTERNS.some(pattern =>
      new RegExp(pattern).test(contentWithoutSolution)
    );

    const hasShortAns = SHORT_ANS_PATTERNS.some(pattern =>
      new RegExp(pattern).test(contentWithoutSolution)
    );

    const hasMatching = MATCHING_PATTERNS.some(pattern =>
      new RegExp(pattern).test(contentWithoutSolution)
    );

    const hasChoice = CHOICE_PATTERNS.some(pattern =>
      new RegExp(pattern).test(contentWithoutSolution)
    ) && !contentWithoutSolution.includes("\\choiceTF") && !contentWithoutSolution.includes("\\shortans");

    // Log để debug
    logger.debug("Nhận diện loại câu hỏi:", {
      hasChoiceTF,
      hasShortAns,
      hasMatching,
      hasChoice,
      contentSample: contentWithoutSolution.substring(0, 100) + "..."
    });

    // 1. Kiểm tra loại choiceTF - Đúng/Sai (phải kiểm tra trước choice vì có tiền tố giống nhau)
    let choiceTfMatch = null;
    if (hasChoiceTF) {
      for (const pattern of CHOICE_TF_PATTERNS) {
        const match = new RegExp(pattern).exec(contentWithoutSolution);
        if (match) {
          choiceTfMatch = match;
          break;
        }
      }
    }
    if (choiceTfMatch) {
      // Tương tự MC nhưng có thể có nhiều đáp án đúng
      const answers: Answer[] = []
      const correctContents: string[] = []

      // Tìm tất cả các nội dung trong ngoặc nhọn sau \choiceTF
      const choicePos = choiceTfMatch.index + choiceTfMatch[0].length
      let currentPos = choicePos
      let index = 0

      while (currentPos < contentWithoutSolution.length) {
        // Tìm dấu { tiếp theo
        const bracePos = contentWithoutSolution.indexOf('{', currentPos)
        if (bracePos === -1) break

        try {
          // Trích xuất nội dung trong ngoặc nhọn
          const answerContent = this.extractBalancedBraces(contentWithoutSolution, bracePos)

          // Kiểm tra xem đáp án này có phải là đúng không
          const isCorrect = new RegExp(TRUE_PATTERN).test(answerContent)
          let cleanContent = answerContent.replace(/\\True/, '').trim();

          // Kiểm tra và loại bỏ dấu { ở đầu nếu có
          if (cleanContent.startsWith('{')) {
            cleanContent = cleanContent.substring(1);
          }

          // Thêm vào danh sách đáp án với ID bắt đầu từ 1
          answers.push({
            id: index + 1, // Đánh số từ 1 thay vì từ 0
            content: cleanContent,
            isCorrect
          })

          if (isCorrect) {
            correctContents.push(cleanContent)
          }

          // Cập nhật vị trí và index
          currentPos = bracePos + answerContent.length + 2
          index++
        } catch {
          break
        }
      }

      // Trả về loại "choiceTF" cho câu hỏi Đúng/Sai
      return ["choiceTF", answers, correctContents.length > 0 ? correctContents : []]
    }

    // 2. Kiểm tra loại shortans - Trả lời ngắn (ưu tiên kiểm tra trước choice)
    let shortansMatch = null;
    if (hasShortAns) {
      for (const pattern of SHORT_ANS_PATTERNS) {
        const match = new RegExp(pattern).exec(contentWithoutSolution);
        if (match) {
          shortansMatch = match;
          break;
        }
      }
    }
    if (shortansMatch) {
      try {
        let correctAnswer = "";
        const startPos = contentWithoutSolution.indexOf('{', shortansMatch.index)
        if (startPos !== -1) {
          correctAnswer = this.extractBalancedBraces(contentWithoutSolution, startPos)
        } else if (shortansMatch[1]) {
          correctAnswer = shortansMatch[1]
        }
        return ["shortans", [], correctAnswer]
      } catch {
        return ["shortans", [], ""]
      }
    }

    // 3. Kiểm tra loại choice - Multiple Choice
    let choiceMatch = null
    if (hasChoice) {
      for (const pattern of CHOICE_PATTERNS) {
        const match = new RegExp(pattern).exec(contentWithoutSolution)
        if (match && !match[0].includes("choiceTF") && !match[0].includes("shortans")) {
          choiceMatch = match
          break
        }
      }
    }

    if (choiceMatch) {
      // Trích xuất đáp án trắc nghiệm
      const answers: Answer[] = []
      const correctContents: string[] = []

      // Tìm tất cả các nội dung trong ngoặc nhọn sau \choice
      const choicePos = choiceMatch.index + choiceMatch[0].length
      let currentPos = choicePos
      let index = 0

      while (currentPos < contentWithoutSolution.length) {
        // Tìm dấu { tiếp theo
        const bracePos = contentWithoutSolution.indexOf('{', currentPos)
        if (bracePos === -1) break

        try {
          // Sử dụng hàm từ latex-parser-brackets.ts để trích xuất nội dung chính xác

          // Trích xuất nội dung trong ngoặc nhọn với cách đếm dấu ngoặc cân bằng
          let answerContent = '';

          // Tạo một đoạn văn bản nhỏ hơn để tìm kiếm (đủ lớn để chứa toàn bộ đáp án)
          const subText = contentWithoutSolution.substring(bracePos, contentWithoutSolution.length);

          // Đếm dấu ngoặc cân bằng
          let bracketLevel = 0;
          let startPos = -1;
          let endPos = -1;
          let inEscape = false;
          let inComment = false;

          // Tìm vị trí của dấu { đầu tiên
          for (let i = 0; i < subText.length; i++) {
            if (subText[i] === '{') {
              startPos = i;
              break;
            }
          }

          // Nếu tìm thấy dấu {, bắt đầu đếm dấu ngoặc
          if (startPos !== -1) {
            bracketLevel = 1; // Đã tìm thấy dấu { đầu tiên

            // Tìm dấu } tương ứng
            for (let i = startPos + 1; i < subText.length; i++) {
              const char = subText[i];

              // Xử lý escape character
              if (char === '\\' && !inEscape && !inComment) {
                inEscape = true;
                continue;
              }

              // Xử lý comment
              if (char === '%' && !inEscape && !inComment) {
                inComment = true;
                continue;
              }

              // Kết thúc comment khi gặp xuống dòng
              if (char === '\n' && inComment) {
                inComment = false;
              }

              // Bỏ qua xử lý khi đang trong comment
              if (inComment) {
                continue;
              }

              // Xử lý dấu ngoặc khi không trong escape
              if (!inEscape) {
                if (char === '{') {
                  bracketLevel++;
                } else if (char === '}') {
                  bracketLevel--;
                  if (bracketLevel === 0) {
                    endPos = i;
                    break; // Đã tìm thấy cặp ngoặc cân bằng
                  }
                }
              }

              // Reset trạng thái escape sau khi xử lý ký tự tiếp theo
              inEscape = false;
            }

            // Lấy nội dung giữa dấu { và }
            if (endPos !== -1) {
              answerContent = subText.substring(startPos + 1, endPos);
            }
          }

          // Nếu tìm thấy cặp ngoặc cân bằng
          if (startPos !== -1 && endPos !== -1) {
            // Lấy nội dung giữa dấu { và } (không bao gồm dấu ngoặc)
            answerContent = subText.substring(startPos + 1, endPos);
            logger.debug(`Trích xuất đáp án ${index + 1} thành công với phương pháp đếm ngoặc`);
          } else {
            // Thử phương pháp khác nếu không tìm thấy
            try {
              // Sử dụng hàm cũ để tương thích ngược
              answerContent = this.extractBalancedBraces(contentWithoutSolution, bracePos);
              logger.debug(`Trích xuất đáp án ${index + 1} thành công với extractBalancedBraces: ${answerContent}`);
            } catch (error) {
              // Nếu hàm cũ thất bại, sử dụng hàm từ latex-parser-brackets
              logger.debug("Hàm extractBalancedBraces thất bại, thử dùng extractContentFromBrackets");

              // Tìm dấu { gần nhất
              if (bracePos >= 0) {
                // Tạo một lệnh giả để sử dụng với extractContentFromBrackets
                const fakeCommand = contentWithoutSolution.substring(bracePos - 10 > 0 ? bracePos - 10 : 0, bracePos);
                const extractedContents = extractContentFromBrackets(contentWithoutSolution.substring(bracePos - 10 > 0 ? bracePos - 10 : 0), fakeCommand);
                if (extractedContents.length > 0) {
                  answerContent = extractedContents[0];
                  logger.debug(`Trích xuất đáp án ${index + 1} thành công với extractContentFromBrackets`);
                } else {
                  // Nếu không thể trích xuất, sử dụng giá trị mặc định
                  answerContent = `Đáp án ${index + 1}`;
                  logger.warn(`Không thể trích xuất đáp án ${index + 1}, sử dụng giá trị mặc định`);
                }
              }
            }
          }

          // Log để debug
          logger.debug(`Trích xuất đáp án ${index + 1} với phương pháp đếm ngoặc:`, {
            startPos,
            endPos,
            content: answerContent
          });

          // Kiểm tra xem đáp án này có phải là đúng không
          const isCorrect = new RegExp(TRUE_PATTERN).test(answerContent);

          // Làm sạch nội dung đáp án, giữ nguyên cú pháp LaTeX
          let cleanContent = answerContent.replace(/\\True/, '').trim();

          // Kiểm tra và loại bỏ dấu { ở đầu nếu có
          if (cleanContent.startsWith('{')) {
            cleanContent = cleanContent.substring(1);
          }

          // Kiểm tra nếu nội dung là phân số bị cắt (ví dụ: "$\\dfrac{2")
          if (cleanContent.includes('\\dfrac{') && !cleanContent.includes('}{')) {
            // Tìm vị trí của phân số trong nội dung
            const fractionPos = cleanContent.indexOf('\\dfrac{');
            // Tìm vị trí của dấu { sau \dfrac
            const openBracePos = fractionPos + 7; // 7 là độ dài của '\dfrac{'

            // Lấy phần tử số (numerator)
            const numerator = cleanContent.substring(openBracePos);

            // Tìm đáp án tiếp theo trong danh sách đáp án
            const nextChoicePos = contentWithoutSolution.indexOf('\\choice', bracePos + answerContent.length + 2);
            if (nextChoicePos !== -1) {
              // Tìm dấu { đầu tiên sau \choice
              const nextBracePos = contentWithoutSolution.indexOf('{', nextChoicePos);
              if (nextBracePos !== -1) {
                try {
                  // Trích xuất nội dung đáp án tiếp theo
                  const nextAnswerContent = this.extractBalancedBraces(contentWithoutSolution, nextBracePos);

                  // Tạo phân số hoàn chỉnh
                  const beforeFraction = cleanContent.substring(0, fractionPos);
                  cleanContent = beforeFraction + '\\dfrac{' + numerator + '}{' + nextAnswerContent.trim() + '}$';
                  logger.debug(`Fixed fraction for answer ${index + 1}:`, cleanContent);

                  // Cập nhật vị trí để bỏ qua đáp án tiếp theo (đã được sử dụng làm mẫu số)
                  currentPos = nextBracePos + nextAnswerContent.length + 2;
                  // Bỏ qua đáp án tiếp theo
                  index++;
                } catch (error) {
                  logger.error(`Error extracting next answer for fraction completion:`, error);
                }
              }
            }
          }

          // Đảm bảo nội dung không bị trống
          if (!cleanContent) {
            cleanContent = `Đáp án ${index + 1}`;
          }

          // Log để debug
          logger.debug(`Extracted answer ${index + 1}:`, {
            original: answerContent,
            cleaned: cleanContent,
            isCorrect
          });

          // Thêm vào danh sách đáp án với ID bắt đầu từ 1
          answers.push({
            id: index + 1, // Đánh số từ 1 thay vì từ 0
            content: cleanContent,
            isCorrect
          })

          if (isCorrect) {
            correctContents.push(cleanContent);
          }

          // Cập nhật vị trí và index
          currentPos = bracePos + answerContent.length + 2 // +2 cho { và }
          index++
        } catch {
          break
        }
      }

      // Trả về "choice" cho câu hỏi trắc nghiệm
      return ["choice", answers, correctContents.length === 1 ? correctContents[0] : (correctContents.length > 1 ? correctContents : "")]
    }

    // Phần này đã được xử lý ở trên (đã di chuyển lên trước phần choice)

    // 4. Kiểm tra loại matching - Ghép đôi
    let matchPattern = null;
    for (const pattern of MATCHING_PATTERNS) {
      const match = new RegExp(pattern).exec(contentWithoutSolution);
      if (match) {
        matchPattern = match;
        break;
      }
    }
    if (matchPattern) {
      // Xử lý câu hỏi ghép đôi
      const answers: Answer[] = []
      const matchPairs: string[] = []

      // Tìm tất cả các cặp ghép đôi trong nội dung
      // (Cần tìm các cặp ngoặc nhọn {item1}{item2} sau \match)
      const matchPos = matchPattern.index + matchPattern[0].length
      let currentPos = matchPos
      let index = 0

      // Tìm các cặp ghép đôi
      while (currentPos < contentWithoutSolution.length) {
        // Tìm dấu { cho item đầu tiên
        const firstBracePos = contentWithoutSolution.indexOf('{', currentPos)
        if (firstBracePos === -1) break

        try {
          // Trích xuất item1
          const item1 = this.extractBalancedBraces(contentWithoutSolution, firstBracePos)

          // Tìm vị trí bắt đầu của item2
          let secondBracePos = firstBracePos + item1.length + 2 // +2 cho { và }
          secondBracePos = contentWithoutSolution.indexOf('{', secondBracePos)

          if (secondBracePos === -1) break

          // Trích xuất item2
          const item2 = this.extractBalancedBraces(contentWithoutSolution, secondBracePos)

          // Thêm vào danh sách đáp án
          const pairStr = `${item1.trim()} ⟷ ${item2.trim()}`
          matchPairs.push(pairStr)

          answers.push({
            id: index + 1,
            content: pairStr,
            isCorrect: true // Tất cả các cặp đều đúng trong câu hỏi ghép đôi
          })

          // Cập nhật vị trí và index
          currentPos = secondBracePos + item2.length + 2
          index++
        } catch {
          break
        }
      }

      return ["match", answers, matchPairs]
    }

    // 5. Mặc định là tự luận (essay) nếu không xác định được loại khác
    return ["essay", [], ""]
  }

  /**
   * Phân tích câu hỏi từ nội dung LaTeX thô
   */
  static parseQuestion(raw_content: string): Question | null {
    try {
      // Bước 1: Tách nội dung trong \begin{ex}...\end{ex}
      const innerMatch = new RegExp('\\\\begin\\{ex\\}([\\s\\S]*?)\\\\end\\{ex\\}').exec(raw_content)
      if (!innerMatch) return null

      let innerContent = innerMatch[1]

      // Trích xuất các thông tin cần thiết
      const [questionId, subcount] = this.parseQuestionId(raw_content)
      const source = this.parseSource(raw_content)

      // Bước 2: Loại bỏ các thông tin metadata từ nội dung
      // Loại bỏ nguồn
      if (source) {
        const sourcePattern = new RegExp(`%\\s*\\[\\s*Nguồn:?\\s*(?:"${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"|${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*\\]\\s*%?`, 'g');
        innerContent = innerContent.replace(sourcePattern, '');
      }

      // Loại bỏ ID
      if (questionId) {
        const idPattern = new RegExp(`%?\\s*\\[\\s*${questionId.fullId}\\s*\\]\\s*%?`, 'g');
        innerContent = innerContent.replace(idPattern, '');
      }

      // Loại bỏ Subcount
      if (subcount) {
        const subcountPattern = new RegExp(`\\[\\s*${subcount}\\s*\\]`, 'g');
        innerContent = innerContent.replace(subcountPattern, '');
      }

      // Bước 3: Xử lý môi trường hình ảnh và lời giải

      // Tìm và thay thế tất cả các môi trường hình ảnh trước
      let contentWithoutImages = innerContent;

      // Thay thế môi trường center có chứa tikzpicture, includegraphics
      for (const pattern of IMAGE_ENVIRONMENTS) {
        contentWithoutImages = contentWithoutImages.replace(new RegExp(pattern, 'g'), 'HÌNH ẢNH MINH HỌA');
      }

      // Loại bỏ môi trường \loigiai
      const solutionPos = contentWithoutImages.search(/\\loigiai\s*\{/);
      let contentWithoutSolution = contentWithoutImages;
      let solution = null;

      if (solutionPos !== -1) {
        // Trích xuất lời giải (để lưu lại)
        solution = this.extractSolution(innerContent);

        // Loại bỏ lời giải khỏi nội dung
        contentWithoutSolution = contentWithoutImages.substring(0, solutionPos);
      }

      // Bước 4: Trích xuất đáp án từ nội dung đã xử lý

      // Tìm vị trí của lệnh \choice hoặc \choiceTF
      const choiceMatch = contentWithoutSolution.match(/\\choice(?:\[[0-9]\])?|\\choiceTF(?:\[[t]\])?|\\shortans(?:\[[a-z]+\])?/);
      const choicePos = choiceMatch && choiceMatch.index !== undefined ? choiceMatch.index : -1;

      // Tách nội dung câu hỏi và phần đáp án
      let questionContent = contentWithoutSolution;
      // Biến answerContent không được sử dụng sau này

      if (choicePos !== -1) {
        questionContent = contentWithoutSolution.substring(0, choicePos).trim();
        // answerContent không được sử dụng nên đã bỏ dòng này
        // contentWithoutSolution.substring(choicePos);
      }

      // Phân loại câu hỏi và trích xuất đáp án
      const [questionType, answers, correctAnswers] = this.identifyQuestionType(contentWithoutSolution);

      // Log để debug đáp án
      logger.debug("Extracted answers:", answers);
      logger.debug("Extracted correctAnswers:", correctAnswers);
      logger.debug("Question type:", questionType);

      // Làm sạch nội dung câu hỏi
      const finalContent = questionContent
        // Loại bỏ khoảng trắng thừa và chuẩn hóa xuống dòng
        .replace(/\s+/g, ' ')
        .trim();

      // Xác định loại câu hỏi theo quy tắc mới
      let questionType2: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching' | 'essay' | 'unknown';

      // Chuyển đổi từ loại câu hỏi nội bộ sang loại câu hỏi cho Question
      if (questionType === 'choiceTF') {
        questionType2 = 'true-false'; // True/False - Đúng/Sai
      } else if (questionType === 'choice') {
        questionType2 = 'multiple-choice'; // Multiple Choice - Trắc nghiệm một đáp án
      } else if (questionType === 'shortans') {
        questionType2 = 'short-answer'; // Short Answer - Trả lời ngắn
      } else if (questionType === 'match') {
        questionType2 = 'matching'; // Matching - Ghép đôi
      } else {
        questionType2 = 'essay'; // Essay - Tự luận (mặc định)
      }

      // Log để debug
      logger.debug("Loại câu hỏi đã chuyển đổi:", {
        original: questionType,
        converted: questionType2
      });

      const question: Question = {
        rawContent: raw_content,
        type: questionType2,
        content: finalContent,
        correctAnswer: correctAnswers,
        solution: solution || undefined
      }

      if (questionId) {
        question.questionId = questionId
      }

      if (subcount) {
        question.subcount = subcount
      }

      if (source) {
        question.source = source
      }

      if (answers && answers.length > 0) {
        question.answers = answers
      }

      return question

    } catch (error) {
      console.error("Error parsing question:", error)
      return null
    }
  }

  /**
   * Chuyển đổi từ Question sang ExtractedQuestion
   */
  static convertToExtractedQuestion(question: Question): ExtractedQuestion {
    // Thêm log để debug
    logger.debug("Converting question to extracted question:", question);
    logger.debug("Correct answer before conversion:", question.correctAnswer);

    // Chuyển đổi subcount
    let subcountDetails: SubcountDetails | null = null;
    if (question.subcount) {
      const parts = question.subcount.split('.');
      if (parts.length === 2) {
        subcountDetails = {
          fullId: question.subcount,
          prefix: parts[0],
          number: parts[1]
        };
      }
    }

    // Chuyển đổi questionID
    let questionIdDetails: QuestionIdDetails | null = null;
    let questionId: string | null = null;
    if (question.questionId) {
      questionId = question.questionId.fullId;
      questionIdDetails = {
        fullId: question.questionId.fullId,
        grade: question.questionId.lop,
        subject: question.questionId.mon,
        chapter: question.questionId.chuong,
        level: question.questionId.muc_do,
        lesson: question.questionId.bai,
        type: question.questionId.dang || ''
      };
    }

    // Chuyển đổi answers
    const answers = question.answers ? question.answers.map(answer => {
      // Đảm bảo nội dung không bị trống và không có dấu { ở đầu
      let content = answer.content || `Đáp án ${answer.id}`;

      // Kiểm tra và loại bỏ dấu { ở đầu nếu có
      if (content.startsWith('{')) {
        content = content.substring(1);
      }

      return {
        id: String(answer.id),
        content: content,
        isCorrect: answer.isCorrect
      };
    }) : [];

    // Thêm log để debug các answer
    logger.debug("Processed answers:", answers);
    logger.debug("Answers with isCorrect=true:", answers.filter(a => a.isCorrect));

    // Trích xuất tất cả các lời giải
    const allSolutions = question.solution
      ? [question.solution]
      : [];

    const correctAnswer = question.correctAnswer;
    logger.debug("Final correctAnswer:", correctAnswer);

    return {
      rawContent: question.rawContent,
      content: question.content,
      type: question.type,
      questionId,
      questionIdDetails,
      subcount: subcountDetails,
      source: question.source || null,
      solution: question.solution || null,
      solutions: allSolutions,
      answers,
      correctAnswer: correctAnswer
    };
  }

  /**
   * Phương thức chính để trích xuất thông tin từ chuỗi LaTeX
   */
  static extract(content: string): ExtractedQuestion | null {
    try {
      const question = this.parseQuestion(content);
      if (!question) return null;

      return this.convertToExtractedQuestion(question);
    } catch (error) {
      logger.error("Error extracting question:", error);
      return null;
    }
  }
}