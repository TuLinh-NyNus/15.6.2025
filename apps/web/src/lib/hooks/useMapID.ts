'use client';

import { useState, useEffect } from 'react';
import { MapIDResult } from '@/lib/types/latex-parser';
import logger from '@/lib/utils/logger';

/**
 * Hook để giải mã QuestionID
 * @param questionId QuestionID cần giải mã
 * @returns Kết quả giải mã, trạng thái loading và lỗi (nếu có)
 */
export function useMapID(questionId: string | null) {
  const [result, setResult] = useState<MapIDResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) {
      setResult(null);
      return;
    }

    const fetchMapID = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/map-id/decode?mapID=${encodeURIComponent(questionId)}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.result) {
          setResult(data.result);
        } else {
          throw new Error(data.error || 'Không thể giải mã MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error decoding MapID:', errorMessage);
        setError(errorMessage);
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMapID();
  }, [questionId]);

  return { result, loading, error };
}

/**
 * Hook để tìm kiếm MapID
 * @param criteria Tiêu chí tìm kiếm
 * @returns Kết quả tìm kiếm, trạng thái loading và lỗi (nếu có)
 */
export function useMapIDSearch(criteria: {
  grade?: string;
  subject?: string;
  chapter?: string;
  difficulty?: string;
  lesson?: string;
  form?: string;
}) {
  const [results, setResults] = useState<{ mapID: string; description: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchMapID = async () => {
      setLoading(true);
      setError(null);

      try {
        // Gửi request POST đến API endpoint
        const response = await fetch('/api/map-id/decode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(criteria),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.results) {
          setResults(data.results);
        } else {
          throw new Error(data.error || 'Không thể tìm kiếm MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error searching MapID:', errorMessage);
        setError(errorMessage);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ tìm kiếm khi có ít nhất một tiêu chí
    if (Object.values(criteria).some(value => value !== undefined)) {
      searchMapID();
    } else {
      setResults([]);
    }
  }, [criteria]);

  return { results, loading, error };
}
