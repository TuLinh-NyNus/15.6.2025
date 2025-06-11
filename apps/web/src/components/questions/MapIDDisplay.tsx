'use client';

import React from 'react';
import { useMapID } from '@/lib/hooks/useMapID';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MapIDDisplayProps {
  mapID: string;
  showDetails?: boolean;
}

/**
 * Component hiển thị thông tin chi tiết của MapID
 */
export function MapIDDisplay({ mapID, showDetails = true }: MapIDDisplayProps) {
  const { result, loading, error } = useMapID(mapID);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>
          Không thể giải mã MapID: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Không tìm thấy</AlertTitle>
        <AlertDescription>
          Không thể giải mã MapID: {mapID}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          {mapID}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!showDetails ? (
          <p className="text-sm text-muted-foreground">{result.fullDescription}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">Lớp</Badge>
              <span className="text-sm">{result.grade.code} - {result.grade.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">Môn học</Badge>
              <span className="text-sm">{result.subject.code} - {result.subject.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-50">Chương</Badge>
              <span className="text-sm">{result.chapter.code} - {result.chapter.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50">Mức độ</Badge>
              <span className="text-sm">{result.difficulty.code} - {result.difficulty.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-50">Bài</Badge>
              <span className="text-sm">{result.lesson.code} - {result.lesson.description}</span>
            </div>
            {result.form && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-50">Dạng</Badge>
                <span className="text-sm">{result.form.code} - {result.form.description}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
