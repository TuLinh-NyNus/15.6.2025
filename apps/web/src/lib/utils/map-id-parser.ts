'use client';

import { useState, useEffect } from 'react';

export type MapIDType = 'grade' | 'subject' | 'chapter' | 'level' | 'lesson' | 'type';

export interface MapIDEntry {
  level: number;
  value: string;
  description: string;
  type: MapIDType;
}

export interface MapIDMap {
  grade: Record<string, string>;
  subject: Record<string, string>;
  chapter: Record<string, string>;
  level: Record<string, string>;
  lesson: Record<string, string>;
  type: Record<string, string>;
}

// Hàm phân tích nội dung MapID
export function parseMapIDContent(content: string): MapIDEntry[] {
  const lines = content.split('\n');
  const entries: MapIDEntry[] = [];

  for (const line of lines) {
    if (line.trim() === '' || line.trim().startsWith('%')) continue;

    const dashMatch = line.match(/^(-+)\[(.+?)\]\s*(.*?)$/);
    if (!dashMatch) continue;

    const [, dashes, value, description] = dashMatch;
    const level = dashes.length;

    let type: MapIDType;
    switch (level) {
      case 1:
        type = 'grade';
        break;
      case 4:
        type = 'subject';
        break;
      case 7:
        type = 'chapter';
        break;
      case 10:
        type = 'lesson';
        break;
      case 13:
        type = 'type';
        break;
      default:
        continue; // Skip invalid levels
    }

    entries.push({
      level,
      value,
      description,
      type
    });
  }

  return entries;
}

// Chuyển đổi MapIDEntry[] thành map dễ sử dụng
export function createMapIDMap(entries: MapIDEntry[]): MapIDMap {
  const result: MapIDMap = {
    grade: {},
    subject: {},
    chapter: {},
    level: {},
    lesson: {},
    type: {}
  };

  for (const entry of entries) {
    result[entry.type][entry.value] = entry.description;
  }

  return result;
}

// Hook để lấy MapID từ server
export function useMapID() {
  const [data, setData] = useState<{
    content: string;
    exists: boolean;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapID = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/map-id');

        if (!response.ok) {
          throw new Error('Không thể tải MapID');
        }

        const result = await response.json();
        setData({
          content: result.content || '',
          exists: result.exists || false
        });
      } catch (err) {
        console.error('Error fetching MapID:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapID();
  }, []);

  const entries = data?.content ? parseMapIDContent(data.content) : [];
  const mapID = createMapIDMap(entries);

  return {
    mapID,
    entries,
    isLoading,
    error,
    rawContent: data?.content || ''
  };
}

// Hàm tiện ích để lấy mô tả từ MapID
export function getDescriptionFromMapID(
  mapID: MapIDMap | null,
  type: MapIDType,
  value: string
): string {
  if (!mapID || !value) return '';
  return mapID[type][value] || value;
}

// Hàm tiện ích để hiển thị QuestionID dưới dạng đầy đủ
export function formatQuestionID(
  mapID: MapIDMap | null,
  questionID: {
    grade?: { value: string };
    subject?: { value: string };
    chapter?: { value: string } | null;
    level?: { value: string };
    lesson?: { value: string } | null;
    type?: { value: string };
  }
): string {
  if (!mapID) return '';

  const parts = [];

  if (questionID.grade?.value) {
    parts.push(`Lớp: ${getDescriptionFromMapID(mapID, 'grade', questionID.grade.value)}`);
  }

  if (questionID.subject?.value) {
    parts.push(`Môn: ${getDescriptionFromMapID(mapID, 'subject', questionID.subject.value)}`);
  }

  if (questionID.chapter?.value) {
    parts.push(`Chương: ${getDescriptionFromMapID(mapID, 'chapter', questionID.chapter.value)}`);
  }

  if (questionID.level?.value) {
    parts.push(`Mức độ: ${getDescriptionFromMapID(mapID, 'level', questionID.level.value)}`);
  }

  if (questionID.lesson?.value) {
    parts.push(`Bài: ${getDescriptionFromMapID(mapID, 'lesson', questionID.lesson.value)}`);
  }

  if (questionID.type?.value) {
    parts.push(`Dạng: ${getDescriptionFromMapID(mapID, 'type', questionID.type.value)}`);
  }

  return parts.join(' | ');
}