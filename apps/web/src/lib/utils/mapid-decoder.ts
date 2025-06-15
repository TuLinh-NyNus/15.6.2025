import axios from 'axios';

// Định nghĩa kiểu dữ liệu cho kết quả giải mã MapID
export interface MapIDResult {
  fullId?: string;
  format?: 'ID5' | 'ID6';  // Định dạng ID5 hoặc ID6
  grade?: { code: string; description: string };      // Tham số 1: Lớp
  subject?: { code: string; description: string };    // Tham số 2: Môn
  chapter?: { code: string; description: string };    // Tham số 3: Chương
  difficulty?: { code: string; description: string }; // Tham số 4: Mức độ
  lesson?: { code: string; description: string };     // Tham số 5: Bài
  form?: { code: string; description: string };       // Tham số 6: Dạng (chỉ có trong ID6)
}

// Dữ liệu mẫu cho MapID (được trích xuất từ file Map ID.tex)
const sampleMapIDData = {
  // Tham số 4: Mức độ - Cấu hình mức độ dùng chung
  difficultyLevels: {
    'N': 'Nhận biết',
    'H': 'Thông Hiểu',
    'V': 'Vận dụng',
    'C': 'Vận dụng Cao',
    'T': 'VIP',
    'M': 'Note'
  },

  // Tham số 1: Lớp - Cấu hình Lớp
  grades: {
    '0': { name: 'Lớp 10', chapters: {} },
    '1': { name: 'Lớp 11', chapters: {} },
    '2': { name: 'Lớp 12', chapters: {} },
    '3': { name: 'Đại học', chapters: {} }
  },

  // Tham số 2: Môn - Cấu hình Môn
  subjects: {
    'P': 'NGÂN HÀNG CHÍNH',
    'D': 'Đại số và giải tích',
    'H': 'Hình học và đo lường',
    'T': 'Toán học',
    'A': 'Tiếng Anh',
    'V': 'Ngữ văn',
    'L': 'Lịch sử',
    'S': 'Sinh học',
    'C': 'Công nghệ',
    'I': 'Tin học'
  },

  // Tên các tham số theo Map ID.tex
  paramNames: {
    '1': 'Lớp (Grade)',
    '2': 'Môn (Subject)',
    '3': 'Chương (Chapter)',
    '4': 'Mức độ (Level)',
    '5': 'Bài (Lesson)',
    '6': 'Dạng (Form)'
  },

  // Cấu trúc ID theo Map ID.tex
  idFormats: {
    'ID5': 'Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5',
    'ID6': 'Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5 - Tham số 6'
  }
};

/**
 * Giải mã MapID từ dữ liệu mẫu
 * @param mapId MapID cần giải mã
 * @returns Kết quả giải mã
 */
/**
 * Giải mã MapID từ dữ liệu mẫu
 * @param mapId MapID cần giải mã (định dạng ID5: XXXXX hoặc ID6: XXXXX-Y)
 * @returns Kết quả giải mã với đầy đủ thông tin về ý nghĩa của từng tham số
 */
export function decodeMapIDFromSample(mapId: string): MapIDResult | null {
  try {
    // Nếu MapID không hợp lệ
    if (!mapId || (mapId.length !== 5 && !mapId.includes('-'))) {
      console.warn('MapID không đúng định dạng ID5 (XXXXX) hoặc ID6 (XXXXX-Y):', mapId);
      return null;
    }

    // Xác định định dạng ID5 hoặc ID6
    const isID6 = mapId.includes('-');
    let processedMapId = mapId;
    let formParam = '';

    // Nếu là ID6 (có dấu gạch ngang), xử lý đặc biệt
    if (isID6) {
      // Tách phần trước và sau dấu gạch ngang
      const [baseId, typeId] = mapId.split('-');

      // Nếu đúng định dạng ID6 (XXXXX-Y)
      if (baseId.length === 5 && typeId.length === 1) {
        // Lưu lại tham số 6 (Dạng)
        formParam = typeId;
        // Sử dụng phần baseId để xử lý các tham số 1-5
        processedMapId = baseId;
      } else {
        console.warn('ID6 không đúng định dạng XXXXX-Y:', mapId);
        return null;
      }
    }

    // Tách các tham số từ MapID
    const params = processedMapId.split('');

    // Đảm bảo đủ 5 tham số cho ID5
    if (params.length !== 5) {
      console.warn('ID5 phải có đúng 5 ký tự:', processedMapId);
      return null;
    }

    // Kết quả giải mã
    const result: MapIDResult = {
      fullId: mapId, // Giữ nguyên định dạng gốc
      format: isID6 ? 'ID6' : 'ID5' // Xác định định dạng ID5 hoặc ID6
    };

    // Giải mã từng tham số
    if (params[0]) {
      const gradeCode = params[0];
      const grade = (sampleMapIDData.grades as any)[gradeCode];
      if (grade) {
        result.grade = {
          code: gradeCode,
          description: grade.name
        };
      }
    }

    if (params[1]) {
      const subjectCode = params[1];
      const subject = (sampleMapIDData.subjects as any)[subjectCode];
      if (subject) {
        result.subject = {
          code: subjectCode,
          description: subject
        };
      }
    }

    if (params[3]) {
      const difficultyCode = params[3];
      const difficulty = (sampleMapIDData.difficultyLevels as any)[difficultyCode];
      if (difficulty) {
        result.difficulty = {
          code: difficultyCode,
          description: difficulty
        };
      }
    }

    // Thêm mô tả cho các tham số
    if (params[0]) {
      // Tham số 1: Lớp
      const gradeCode = params[0];
      const gradeDesc = (sampleMapIDData.grades as any)[gradeCode]?.name ||
                        `Lớp ${gradeCode === '0' ? '10' : gradeCode === '1' ? '11' : gradeCode === '2' ? '12' : gradeCode === '3' ? 'Đại học' : gradeCode}`;
      result.grade = result.grade || { code: gradeCode, description: gradeDesc };
    }

    if (params[1]) {
      // Tham số 2: Môn
      const subjectCode = params[1];
      const subjectDesc = (sampleMapIDData.subjects as any)[subjectCode] || `Môn ${subjectCode}`;
      result.subject = result.subject || { code: subjectCode, description: subjectDesc };
    }

    if (params[2]) {
      // Tham số 3: Chương
      const chapterCode = params[2];

      // Tìm thông tin chương từ Map ID.tex
      let chapterDescription = `Chương ${chapterCode}`;

      // Dựa vào grade và subject để tìm chương tương ứng
      if (params[0] === '0' && params[1] === 'P') {
        // Lớp 10 - NGÂN HÀNG CHÍNH
        const chapters = {
          '1': 'Mệnh đề và tập hợp',
          '2': 'BPT và hệ BPT bậc nhất hai ẩn',
          '3': 'HS bậc hai và ĐT',
          '4': 'Hệ thức lượng trong tam giác',
          '5': 'Véctơ (chưa xét tọa độ)',
          '6': 'Thống kê',
          '7': 'Bất phương trình bậc 2 một ẩn',
          '8': 'Đại số tổ hợp',
          '9': 'Véctơ (trong hệ tọa độ)'
        };
        chapterDescription = (chapters as any)[chapterCode] || chapterDescription;
      } else if (params[0] === '1' && params[1] === 'P') {
        // Lớp 11 - NGÂN HÀNG CHÍNH
        const chapters = {
          '1': 'HS lượng giác và phương trình lượng giác',
          '2': 'Dãy số. Cấp số cộng. Cấp số nhân',
          '3': 'Giới hạn. HS liên tục',
          '4': 'ĐT, MP. Quan hệ song song trong không gian',
          '5': 'Các số đặc trưng đo xu thế trung tâm cho mẫu số liệu ghép nhóm',
          '6': 'HS mũ và HS lôgarít',
          '7': 'Đạo hàm',
          '8': 'Quan hệ vuông góc trong không gian'
        };
        chapterDescription = (chapters as any)[chapterCode] || chapterDescription;
      }

      result.chapter = { code: chapterCode, description: chapterDescription };
    }

    if (params[3]) {
      // Tham số 4: Mức độ
      const difficultyCode = params[3];
      const difficultyDesc = (sampleMapIDData.difficultyLevels as any)[difficultyCode] || `Mức độ ${difficultyCode}`;
      result.difficulty = result.difficulty || { code: difficultyCode, description: difficultyDesc };
    }

    if (params[4]) {
      // Tham số 5: Bài
      const lessonCode = params[4];

      // Tìm thông tin bài từ Map ID.tex
      let lessonDescription = `Bài ${lessonCode}`;

      // Dựa vào grade, subject và chapter để tìm bài tương ứng
      if (params[0] === '0' && params[1] === 'P' && params[2] === '9') {
        // Lớp 10 - NGÂN HÀNG CHÍNH - Chương 9: Véctơ (trong hệ tọa độ)
        const lessons = {
          '1': 'Toạ độ của véctơ',
          '2': 'Tích vô hướng (theo tọa độ)',
          '3': 'ĐT trong MP toạ độ',
          '4': 'Đường tròn trong MP toạ độ',
          '5': 'Elip và các vấn đề liên quan',
          '6': 'Hypebol và các vấn đề liên quan',
          '7': 'Parabol và các vấn đề liên quan',
          '8': 'Bài tổng hợp'
        };
        lessonDescription = (lessons as any)[lessonCode] || lessonDescription;
      } else if (params[0] === '1' && params[1] === 'P' && params[2] === '1') {
        // Lớp 11 - NGÂN HÀNG CHÍNH - Chương 1: HS lượng giác và phương trình lượng giác
        const lessons = {
          '1': 'Góc lượng giác',
          '2': 'Giá trị lượng giác của một góc lượng giác',
          '3': 'Các công thức lượng giác',
          '4': 'HS lượng giác và ĐT',
          '5': 'PT lượng giác cơ bản',
          '6': 'PT lượng giác thường gặp'
        };
        lessonDescription = (lessons as any)[lessonCode] || lessonDescription;
      }

      result.lesson = { code: lessonCode, description: lessonDescription };
    }

    // Tham số 6: Dạng (chỉ có trong ID6)
    if (isID6 && formParam) {
      // Sử dụng formParam đã lưu từ trước
      let formDescription = `Dạng ${formParam}`;

      // Dựa vào grade, subject, chapter và lesson để tìm dạng tương ứng
      if (params[0] === '0' && params[1] === 'P' && params[2] === '9' && params[4] === '3') {
        // Lớp 10 - NGÂN HÀNG CHÍNH - Chương 9: Véctơ (trong hệ tọa độ) - Bài 3: ĐT trong MP toạ độ
        const forms = {
          '1': 'Điểm, véctơ, hệ số góc của ĐT',
          '2': 'PT đường thẳng có VTCP',
          '3': 'PT đường thẳng có VTPT',
          '4': 'Vị trí tương đối giữa hai ĐT',
          '5': 'Bài toán về góc giữa hai ĐT',
          '6': 'Bài toán về khoảng cách',
          '7': 'Bài toán tìm điểm',
          '8': 'Bài toán dùng cho tam giác, tứ giác',
          '9': 'Bài toán thực tế, PP tọa độ hóa'
        };
        formDescription = (forms as any)[formParam] || formDescription;
      } else if (params[0] === '0' && params[1] === 'P' && params[2] === '9' && params[4] === '1') {
        // Lớp 10 - NGÂN HÀNG CHÍNH - Chương 9: Véctơ (trong hệ tọa độ) - Bài 1: Toạ độ của véctơ
        const forms = {
          '1': 'Tọa độ điểm, độ dài đại số của véctơ trên 1 trục',
          '2': 'Phép toán véctơ (tổng, hiệu, tích với số) trong Oxy',
          '3': 'Tọa độ điểm',
          '4': 'Tọa độ véc-tơ',
          '5': 'Sự cùng phương của 2 véctơ và ứng dụng',
          '6': 'Phân tích một véctơ theo 2 véctơ không cùng phương',
          '7': 'Toán thực tế dùng hệ toạ độ',
          '8': 'Độ dài vecto và ứng dụng'
        };
        formDescription = (forms as any)[formParam] || formDescription;
      }

      result.form = {
        code: formParam,
        description: formDescription
      };
    }

    return result;
  } catch (error) {
    console.error('Lỗi khi giải mã MapID từ dữ liệu mẫu:', error);
    return null;
  }
}

/**
 * Giải mã MapID từ API
 * @param mapId MapID cần giải mã
 * @returns Kết quả giải mã
 */
/**
 * Giải mã MapID từ API hoặc dữ liệu mẫu
 * @param mapId MapID cần giải mã (định dạng ID5: XXXXX hoặc ID6: XXXXX-Y)
 * @returns Kết quả giải mã với đầy đủ thông tin về ý nghĩa của từng tham số
 */
export async function decodeMapID(mapId: string): Promise<MapIDResult | null> {
  try {
    // Kiểm tra định dạng MapID
    if (!mapId || (mapId.length !== 5 && !mapId.includes('-'))) {
      console.warn('MapID không đúng định dạng ID5 (XXXXX) hoặc ID6 (XXXXX-Y):', mapId);
    }

    // Xác định định dạng ID5 hoặc ID6
    const isID6 = mapId.includes('-');
    let processedMapId = mapId;

    // Nếu là ID6 (có dấu gạch ngang), xử lý đặc biệt
    if (isID6) {
      // Tách phần trước và sau dấu gạch ngang
      const [baseId, typeId] = mapId.split('-');

      // Nếu đúng định dạng ID6 (XXXXX-Y)
      if (baseId.length === 5 && typeId.length === 1) {
        // Chuyển đổi thành dạng không có dấu gạch ngang để xử lý
        processedMapId = baseId + typeId;
      } else {
        console.warn('ID6 không đúng định dạng XXXXX-Y:', mapId);
      }
    }

    // Thử giải mã từ dữ liệu mẫu trước
    const sampleResult = decodeMapIDFromSample(mapId);
    if (sampleResult && Object.keys(sampleResult).length > 1) {
      // Log thông tin giải mã
      console.log('Giải mã MapID từ dữ liệu mẫu:', {
        mapId,
        format: sampleResult.format,
        grade: sampleResult.grade?.description,
        subject: sampleResult.subject?.description,
        chapter: sampleResult.chapter?.description,
        difficulty: sampleResult.difficulty?.description,
        lesson: sampleResult.lesson?.description,
        form: sampleResult.form?.description
      });

      return sampleResult;
    }

    // Nếu không thành công, gọi API
    console.log('Gọi API để giải mã MapID:', mapId);
    const response = await axios.get(`/api/admin/mapid/decode?id=${encodeURIComponent(mapId)}&detailed=true`);

    if (response.status === 200 && response.data.success) {
      const apiResult = response.data.data;

      // Đảm bảo có định dạng
      if (!apiResult.format) {
        apiResult.format = isID6 ? 'ID6' : 'ID5';
      }

      return apiResult;
    }

    // Nếu không thể giải mã, trả về kết quả cơ bản
    return {
      fullId: mapId,
      format: isID6 ? 'ID6' : 'ID5'
    };
  } catch (error) {
    console.error('Lỗi khi giải mã MapID:', error);
    return null;
  }
}
