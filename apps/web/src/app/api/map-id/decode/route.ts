import * as fs from "fs";
import * as path from "path";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import logger from "@/lib/utils/logger";
import { MapIDDecoder, DIFFICULTY_MAP } from "@/lib/utils/map-id-decoder";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getMapIDDecoder } from "@/lib/utils/map-id-decoder";

// Schema validation cho request
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const requestSchema = z.object({
  mapID: z.string().min(1, "MapID không được để trống")
});

// Schema validation cho query parameters
const querySchema = z.object({
  grade: z.string().optional(),
  subject: z.string().optional(),
  chapter: z.string().optional(),
  difficulty: z.string().optional(),
  lesson: z.string().optional(),
  form: z.string().optional(),
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
 * API route để decode MapID
 * GET /api/map-id/decode?mapID=[0H5V4-1]
 */
export async function GET(request: NextRequest) {
  try {
    // Lấy MapID từ query parameter
    const url = new URL(request.url);
    const mapID = url.searchParams.get('mapID') || url.searchParams.get('id');
    const detailed = url.searchParams.get('detailed') === 'true';

    // Validate MapID
    if (!mapID) {
      return NextResponse.json(
        {
          success: false,
          error: "MapID không được để trống"
        },
        { status: 400 }
      );
    }

    // Khởi tạo decoder server-side
    const mapIDFilePath = path.join(process.cwd(), 'DATA', 'template', 'Map ID.tex');
    const decoder = new ServerMapIDDecoder(mapIDFilePath);
    await decoder.initialize();

    // Decode MapID
    const result = decoder.decodeMapID(mapID);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Không thể decode MapID",
          mapID,
          difficultyMap: DIFFICULTY_MAP // Trả về danh sách mức độ để hỗ trợ debugging
        },
        { status: 404 }
      );
    }

    // Nếu yêu cầu thông tin chi tiết từ Map ID.tex
    if (detailed) {
      try {
        // Đọc file Map ID.tex để bổ sung thông tin chi tiết
        const mapIDFilePath = path.join(process.cwd(), 'DATA', 'template', 'Map ID.tex');
        if (fs.existsSync(mapIDFilePath)) {
          const mapIDContent = fs.readFileSync(mapIDFilePath, 'utf-8');

          // Bổ sung thông tin chi tiết từ Map ID.tex
          result.detailedInfo = {
            grade: result.grade,
            subject: result.subject,
            chapter: result.chapter,
            difficulty: result.difficulty,
            lesson: result.lesson,
            form: result.form
          };
        }
      } catch (error) {
        logger.error('Lỗi khi đọc file Map ID.tex:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error("Error decoding MapID:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi khi decode MapID",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * API route để tìm kiếm MapID
 * POST /api/map-id/decode
 * Body: { grade: "0", subject: "H", chapter: "5", difficulty: "V", ... }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate body
    const validatedBody = querySchema.parse(body);

    // Khởi tạo decoder server-side
    const mapIDFilePath = path.join(process.cwd(), 'DATA', 'template', 'Map ID.tex');
    const decoder = new ServerMapIDDecoder(mapIDFilePath);
    await decoder.initialize();

    // Tìm kiếm theo criteria
    const results = decoder.search(validatedBody);

    return NextResponse.json({
      success: true,
      count: results.length,
      difficultyMap: DIFFICULTY_MAP,
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