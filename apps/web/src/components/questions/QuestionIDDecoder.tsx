import React, { useEffect, useState } from 'react';
import { MapIDResult } from '@/lib/types/latex-parser';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info } from 'lucide-react';
import { QuestionID } from '@/lib/types/question';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import logger from '@/lib/utils/logger';

interface QuestionIDDecoderProps {
  questionID: QuestionID;
}

/**
 * Component hiển thị thông tin chi tiết của QuestionID trong form nhập câu hỏi
 */
export function QuestionIDDecoder({ questionID }: QuestionIDDecoderProps) {
  const [mapIDResult, setMapIDResult] = useState<MapIDResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Tạo MapID từ QuestionID
  const mapID = React.useMemo(() => {
    if (!questionID.grade?.value || !questionID.subject?.value ||
        !questionID.chapter?.value || !questionID.level?.value ||
        !questionID.lesson?.value) {
      return null;
    }

    let id = `[${questionID.grade.value}${questionID.subject.value}${questionID.chapter.value}${questionID.level.value}${questionID.lesson.value}`;

    if (questionID.form?.value) {
      id += `-${questionID.form.value}]`;
    } else {
      id += ']';
    }

    return id;
  }, [
    questionID.grade?.value,
    questionID.subject?.value,
    questionID.chapter?.value,
    questionID.level?.value,
    questionID.lesson?.value,
    questionID.form?.value
  ]);

  // Fetch thông tin chi tiết của MapID
  useEffect(() => {
    if (!mapID) {
      setMapIDResult(null);
      return;
    }

    const fetchMapIDInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(mapID)}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result) {
          setMapIDResult(data.result);
        } else {
          throw new Error(data.error || 'Không thể giải mã MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error decoding MapID:', errorMessage);
        setError(errorMessage);
        setMapIDResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMapIDInfo();
  }, [mapID]);

  if (!mapID) {
    // Tạo một bảng hướng dẫn với các trường cần điền
    return (
      <div className="w-full">
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-slate-600">
              Điền đầy đủ các trường để xem chi tiết MapID
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !mapIDResult) {
    return (
      <div className="w-full">
        <div className="p-3 border border-red-100 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">
              Không thể giải mã MapID
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-3 border border-slate-200 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-slate-100 text-slate-800 font-semibold">
            {mapID}
          </Badge>
          <span className="text-sm text-muted-foreground">→</span>
          <Badge className="bg-primary text-primary-foreground">
            {mapIDResult.fullDescription}
          </Badge>
        </div>
      </div>
    </div>
  );
}
