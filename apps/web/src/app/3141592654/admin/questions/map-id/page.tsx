import React from 'react';
import { Metadata } from 'next';
import { MapIDSearch } from '@/components/questions/MapIDSearch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIDDisplay } from '@/components/questions/MapIDDisplay';

export const metadata: Metadata = {
  title: 'Tra cứu MapID - NyNus Admin',
  description: 'Tra cứu và giải mã MapID trong hệ thống NyNus',
};

/**
 * Trang tra cứu và giải mã MapID
 */
export default function MapIDPage() {
  // Các MapID mẫu để hiển thị
  const sampleMapIDs = [
    '[0H5V4]',
    '[1D2N3]',
    '[2P1H2-1]',
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors duration-300">Tra cứu MapID</h1>
        <p className="text-slate-600 dark:text-slate-400 transition-colors duration-300">
          Tra cứu và giải mã MapID trong hệ thống NyNus
        </p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Tìm kiếm MapID</TabsTrigger>
          <TabsTrigger value="examples">Ví dụ MapID</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          <MapIDSearch />
        </TabsContent>

        <TabsContent value="examples" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ví dụ MapID</CardTitle>
              <CardDescription>
                Dưới đây là một số ví dụ về MapID và ý nghĩa của chúng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sampleMapIDs.map((mapID) => (
                  <MapIDDisplay key={mapID} mapID={mapID} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Cấu trúc MapID</CardTitle>
          <CardDescription>
            MapID có cấu trúc [Lớp Môn Chương Mức_độ Bài-Dạng]
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Định dạng</h3>
              <p className="text-sm text-muted-foreground">
                MapID có 2 định dạng:
              </p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li><code>[Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5]</code> - ID5</li>
                <li><code>[Tham số 1 Tham số 2 Tham số 3 Tham số 4 Tham số 5-Tham số 6]</code> - ID6</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-medium">Ý nghĩa các tham số</h3>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li><strong>Tham số 1</strong>: Lớp (0: Lớp 10, 1: Lớp 11, 2: Lớp 12)</li>
                <li><strong>Tham số 2</strong>: Môn học (D: Đại số và giải tích, H: Hình học và đo lường, P: NGÂN HÀNG CHÍNH)</li>
                <li><strong>Tham số 3</strong>: Chương (1, 2, 3, ...)</li>
                <li><strong>Tham số 4</strong>: Mức độ (N: Nhận biết, H: Thông Hiểu, V: Vận dụng, C: Vận dụng Cao, T: VIP, M: Note)</li>
                <li><strong>Tham số 5</strong>: Bài (1, 2, 3, ...)</li>
                <li><strong>Tham số 6</strong>: Dạng (1, 2, 3, ...) - Chỉ có trong ID6</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
