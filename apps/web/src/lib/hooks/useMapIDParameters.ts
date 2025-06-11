import { useState, useEffect, useCallback } from 'react';
import logger from '../utils/logger';

/**
 * Interface cho một tham số MapID
 */
export interface MapIDParameter {
  value: string;
  label: string;
}

/**
 * Hook để lấy các tham số MapID từ API
 */
export function useMapIDParameters() {
  const [grades, setGrades] = useState<MapIDParameter[]>([]);
  const [difficulties, setDifficulties] = useState<MapIDParameter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách lớp và mức độ
  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await fetch('/api/map-id/parameters');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          setGrades(data.grades || []);
          setDifficulties(data.difficulties || []);
        } else {
          throw new Error(data.error || 'Không thể lấy tham số MapID');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
        logger.error('Error fetching MapID parameters:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchParameters();
  }, []);

  /**
   * Lấy danh sách môn học theo lớp
   */
  const getSubjects = useCallback(async (grade: string): Promise<MapIDParameter[]> => {
    if (!grade || grade === 'all') return [{ value: 'all', label: 'Tất cả' }];

    try {
      const response = await fetch(`/api/map-id/parameters?grade=${grade}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.subjects || [];
      } else {
        throw new Error(data.error || 'Không thể lấy danh sách môn học');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching subjects:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  /**
   * Lấy danh sách chương theo lớp và môn học
   */
  const getChapters = useCallback(async (grade: string, subject: string): Promise<MapIDParameter[]> => {
    if (!grade || !subject || grade === 'all' || subject === 'all') {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const response = await fetch(`/api/map-id/parameters?grade=${grade}&subject=${subject}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.chapters || [];
      } else {
        throw new Error(data.error || 'Không thể lấy danh sách chương');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching chapters:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  /**
   * Lấy danh sách bài theo lớp, môn học và chương
   */
  const getLessons = useCallback(async (grade: string, subject: string, chapter: string): Promise<MapIDParameter[]> => {
    if (!grade || !subject || !chapter || grade === 'all' || subject === 'all' || chapter === 'all') {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const response = await fetch(`/api/map-id/parameters?grade=${grade}&subject=${subject}&chapter=${chapter}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.lessons || [];
      } else {
        throw new Error(data.error || 'Không thể lấy danh sách bài');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching lessons:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  /**
   * Lấy danh sách dạng theo lớp, môn học, chương và bài
   */
  const getForms = useCallback(async (grade: string, subject: string, chapter: string, lesson: string): Promise<MapIDParameter[]> => {
    if (!grade || !subject || !chapter || !lesson ||
        grade === 'all' || subject === 'all' || chapter === 'all' || lesson === 'all') {
      return [{ value: 'all', label: 'Tất cả' }];
    }

    try {
      const response = await fetch(`/api/map-id/parameters?grade=${grade}&subject=${subject}&chapter=${chapter}&lesson=${lesson}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.forms || [];
      } else {
        throw new Error(data.error || 'Không thể lấy danh sách dạng');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      logger.error('Error fetching forms:', errorMessage);
      return [{ value: 'all', label: 'Tất cả' }];
    }
  }, []);

  return {
    grades,
    difficulties,
    getSubjects,
    getChapters,
    getLessons,
    getForms,
    loading,
    error
  };
}
