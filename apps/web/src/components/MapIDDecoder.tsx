"use client";

import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapIDResult, getMapIDDecoder } from "@/lib/utils/map-id-decoder";

export default function MapIDDecoderComponent() {
  const [mapID, setMapID] = useState<string>("");
  const [result, setResult] = useState<MapIDResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  // Khởi tạo decoder khi component mount
  useEffect(() => {
    const initializeDecoder = async () => {
      try {
        setLoading(true);
        const decoder = getMapIDDecoder();
        await decoder.initialize();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError("Không thể khởi tạo MapID Decoder. Hãy thử tải lại trang.");
        console.error("Error initializing decoder:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeDecoder();
  }, []);

  // Xử lý decode MapID
  const handleDecode = async () => {
    if (!mapID) {
      setError("Vui lòng nhập MapID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sử dụng API để decode thay vì client-side
      const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(mapID)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Lỗi không xác định");
      }

      if (!data.success || !data.result) {
        throw new Error("Không thể giải mã MapID");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Giải mã MapID</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Nhập MapID (ví dụ: [0H5V4-1])"
                value={mapID}
                onChange={(e) => setMapID(e.target.value)}
                disabled={loading || !initialized}
              />
              <Button
                onClick={handleDecode}
                disabled={loading || !initialized || !mapID}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Giải mã
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!initialized && !error && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang khởi tạo decoder...
              </div>
            )}

            {result && (
              <div className="bg-white border rounded-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b font-medium">
                  Kết quả giải mã MapID: {result.mapID}
                </div>
                <div className="p-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Lớp:</span>
                    </div>
                    <div>
                      {result.grade.code} - {result.grade.description}
                    </div>

                    <div>
                      <span className="font-medium">Môn học:</span>
                    </div>
                    <div>
                      {result.subject.code} - {result.subject.description}
                    </div>

                    <div>
                      <span className="font-medium">Chương:</span>
                    </div>
                    <div>
                      {result.chapter.code} - {result.chapter.description}
                    </div>

                    <div>
                      <span className="font-medium">Mức độ:</span>
                    </div>
                    <div>
                      {result.difficulty.code} - {result.difficulty.description}
                    </div>

                    <div>
                      <span className="font-medium">Bài:</span>
                    </div>
                    <div>
                      {result.lesson.code} - {result.lesson.description}
                    </div>

                    {result.form && result.form.code !== '0' && (
                      <>
                        <div>
                          <span className="font-medium">Dạng:</span>
                        </div>
                        <div>
                          {result.form.code} - {result.form.description}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t mt-2">
                    <span className="font-medium">Mô tả đầy đủ:</span>
                    <div className="mt-1 text-gray-700">
                      {result.fullDescription}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}