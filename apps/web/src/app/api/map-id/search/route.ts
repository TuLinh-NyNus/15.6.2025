import * as fs from "fs";
import * as path from "path";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import logger from "@/lib/utils/logger";
import { MapIDDecoder, DIFFICULTY_MAP } from "@/lib/utils/map-id-decoder";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getMapIDDecoder } from "@/lib/utils/map-id-decoder";

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

// Schema validation cho query parameters
const querySchema = z.object({
  field: z.string().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: z.string().optional(),
  lesson: z.string().optional(),
});

// Class server-side decoder để đọc file từ hệ thống
class ServerMapIDDecoder extends MapIDDecoder {
  constructor(filePath: string) {
    super(filePath);
  }

  // Override phương thức loadMapFile để đọc trực tiếp từ file system
  protected async loadMapFile(): Promise<void> {
    try {
      const content = await fs.promises.readFile(this.filePath, 'utf-8');
      this.parseMapFile(content);
      logger.info('Map ID file loaded successfully from file system');
    } catch (error) {
      logger.error('Error loading Map ID file:', error);
      throw error;
    }
  }
}

/**
 * API route để tìm kiếm MapID
 * GET /api/map-id/search?field=grade - Lấy danh sách các lớp
 * GET /api/map-id/search?grade=0 - Lấy danh sách môn học của lớp 0
 * GET /api/map-id/search?grade=0&subject=H - Lấy danh sách chương trong môn Hình học lớp 0
 * GET /api/map-id/search?grade=0&subject=H&chapter=1 - Lấy danh sách bài học trong chương 1 của môn Hình học lớp 0
 */
export async function GET(request: NextRequest) {
  try {
    // Lấy tham số tìm kiếm từ query parameters
    const url = new URL(request.url);
    const field = url.searchParams.get('field');
    const queryParams: Record<string, string> = {};

    // Trích xuất các tham số khác - sử dụng Array.from để tránh lỗi iterator
    Array.from(url.searchParams.entries()).forEach(([key, value]) => {
      if (key !== 'field') {
        queryParams[key] = value;
      }
    });

    // Khởi tạo decoder server-side
    const mapIDFilePath = path.join(process.cwd(), 'DATA', 'template', 'Map ID.tex');
    const decoder = new ServerMapIDDecoder(mapIDFilePath);
    await decoder.initialize();

    // Nếu là truy vấn cho một trường cụ thể
    if (field) {
      // Lấy danh sách các giá trị duy nhất cho trường đó
      let results: { mapID: string; description: string }[] = [];
      const unique = new Set<string>();

      switch (field) {
        case 'grade':
          // Lấy danh sách các lớp
          results = decoder.search({});
          break;
        case 'subject':
          // Lấy danh sách các môn học
          if (queryParams.grade) {
            results = decoder.search({ grade: queryParams.grade });
          }
          break;
        case 'chapter':
          // Lấy danh sách các chương
          if (queryParams.grade && queryParams.subject) {
            results = decoder.search({
              grade: queryParams.grade,
              subject: queryParams.subject
            });
          }
          break;
        case 'difficulty':
          // Trả về danh sách độ khó đã định nghĩa
          return NextResponse.json({
            success: true,
            results: Object.entries(DIFFICULTY_MAP).map(([code, description]) => ({
              mapID: code,
              description
            }))
          });
        case 'lesson':
          // Lấy danh sách các bài học
          if (queryParams.grade && queryParams.subject && queryParams.chapter) {
            results = decoder.search({
              grade: queryParams.grade,
              subject: queryParams.subject,
              chapter: queryParams.chapter
            });
          }
          break;
        default:
          return NextResponse.json({
            success: false,
            error: `Trường '${field}' không được hỗ trợ`
          }, { status: 400 });
      }

      // Lọc kết quả trùng lặp dựa trên các pattern
      if (results.length > 0) {
        let filteredResults: { mapID: string; description: string }[] = [];

        if (field === 'grade') {
          // Lấy mã lớp từ MapID và loại bỏ trùng lặp
          results.forEach(item => {
            const match = item.mapID.match(/\[(\d)/);
            if (match && match[1]) {
              const code = match[1];
              if (!unique.has(code)) {
                unique.add(code);
                const description = `Lớp ${code === '0' ? '10' : code === '1' ? '11' : code === '2' ? '12' : code}`;
                logger.debug(`Adding grade: code=${code}, description=${description}`);
                filteredResults.push({
                  mapID: item.mapID,
                  description
                });
              }
            }
          });
        } else {
          // Sử dụng kết quả trực tiếp từ decoder.search()
          filteredResults = results;
        }

        return NextResponse.json({
          success: true,
          count: filteredResults.length,
          results: filteredResults
        });
      }

      return NextResponse.json({
        success: true,
        count: 0,
        results: []
      });
    }

    // Nếu không có field, thực hiện tìm kiếm thông thường
    try {
      // Validate query parameters
      const validatedQuery = querySchema.parse(queryParams);

      // Tìm kiếm theo criteria
      const results = decoder.search(validatedQuery);

      return NextResponse.json({
        success: true,
        count: results.length,
        results
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Dữ liệu không hợp lệ",
            details: error.errors
          },
          { status: 400 }
        );
      }
      throw error;
    }

  } catch (error) {
    logger.error("Error searching MapID:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi khi tìm kiếm MapID",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}