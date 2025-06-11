import * as fs from "fs";
import * as path from "path";

import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

// Schema validation cho request body
const postBodySchema = z.object({
  content: z.string().min(1, "Nội dung không được để trống")
});

// Đường dẫn tới file MapID.tex
const getMapIDFilePath = () => {
  // Đường dẫn mặc định
  const defaultPath = path.join(process.cwd(), "DATA", "template", "Map ID.tex");

  // Đường dẫn tùy chỉnh (nếu cần)
  if (process.env.MAP_ID_PATH) {
    return process.env.MAP_ID_PATH;
  }

  return defaultPath;
};

// Hàm kiểm tra và tạo thư mục nếu chưa tồn tại
const ensureDirectoryExists = (filePath: string) => {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Hàm xử lý POST request để lưu nội dung MapID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate body
    const validatedBody = postBodySchema.parse(body);

    const filePath = getMapIDFilePath();
    ensureDirectoryExists(filePath);

    // Ghi nội dung vào file
    fs.writeFileSync(filePath, validatedBody.content, "utf-8");

    return NextResponse.json({
      success: true,
      message: "Đã lưu MapID thành công"
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu không hợp lệ",
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error("Error saving MapID:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi khi lưu MapID",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * API route để lấy nội dung file Map ID.tex
 * GET /api/map-id
 */
export async function GET() {
  try {
    // Đường dẫn tới file Map ID.tex
    // Sử dụng đường dẫn chính xác với khoảng trắng trong tên file
    const filePath = path.join(process.cwd(), 'DATA', 'template', 'Map ID.tex');
    console.log('Trying to access MapID file at:', filePath);

    // Kiểm tra xem file có tồn tại không
    if (!fs.existsSync(filePath)) {
      console.log("Map ID file not found, returning sample data");

      // Trả về dữ liệu mẫu nếu file không tồn tại
      const sampleContent = `-[0] Lớp 10
----[H] Hình học
-------[5] Chương 5
----------[4] Bài 4
-------------[V] Vận dụng
-[1] Lớp 11
----[D] Đại số
-------[2] Chương 2
----------[3] Bài 3
-------------[N] Nhận biết
-[2] Lớp 12
----[P] Phân tích
-------[1] Chương 1
----------[2] Bài 2
-------------[H] Hiểu
-------------[1] Dạng 1`;

      // Tạo thư mục nếu chưa tồn tại
      ensureDirectoryExists(filePath);

      // Lưu dữ liệu mẫu vào file
      try {
        fs.writeFileSync(filePath, sampleContent, 'utf-8');
        console.log("Created sample Map ID file");
      } catch (writeError) {
        console.error("Error creating sample Map ID file:", writeError);
      }

      return NextResponse.json({
        success: true,
        content: sampleContent,
        exists: false
      });
    }

    // Đọc nội dung file nếu tồn tại
    let content;
    try {
      content = await fs.promises.readFile(filePath, 'utf-8');
      console.log('Successfully read MapID file, content length:', content.length);
    } catch (readError) {
      console.error('Error reading existing MapID file:', readError);

      // Trả về dữ liệu mẫu trong trường hợp lỗi đọc file
      const sampleContent = `-[0] Lớp 10
----[H] Hình học
-------[5] Chương 5
----------[4] Bài 4
-------------[V] Vận dụng
-[1] Lớp 11
----[D] Đại số
-------[2] Chương 2
----------[3] Bài 3
-------------[N] Nhận biết
-[2] Lớp 12
----[P] Phân tích
-------[1] Chương 1
----------[2] Bài 2
-------------[H] Hiểu
-------------[1] Dạng 1`;

      return NextResponse.json({
        success: true,
        content: sampleContent,
        exists: true,
        error: "Lỗi khi đọc file Map ID.tex, trả về dữ liệu mẫu",
        details: readError instanceof Error ? readError.message : String(readError)
      });
    }

    return NextResponse.json({
      success: true,
      content,
      exists: true
    });
  } catch (error) {
    console.error("Error reading Map ID file:", error);

    // Trả về dữ liệu mẫu trong trường hợp lỗi
    const sampleContent = `-[0] Lớp 10
----[H] Hình học
-------[5] Chương 5
----------[4] Bài 4
-------------[V] Vận dụng
-[1] Lớp 11
----[D] Đại số
-------[2] Chương 2
----------[3] Bài 3
-------------[N] Nhận biết
-[2] Lớp 12
----[P] Phân tích
-------[1] Chương 1
----------[2] Bài 2
-------------[H] Hiểu
-------------[1] Dạng 1`;

    return NextResponse.json({
      success: true,
      content: sampleContent,
      exists: false,
      error: "Lỗi khi đọc file Map ID.tex, trả về dữ liệu mẫu",
      details: error instanceof Error ? error.message : String(error)
    });
  }
}