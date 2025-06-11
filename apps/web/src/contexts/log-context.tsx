'use client';

import React, { createContext, useContext, useState } from 'react';
import { logCache } from '@/lib/utils/log-cache';
import logger from '@/lib/utils/logger';

// Tạo context cho LogCache
const LogContext = createContext<typeof logCache | null>(null);

/**
 * Provider cho LogCache
 * Đảm bảo chỉ có một instance của LogCache được sử dụng trong toàn bộ ứng dụng
 */
export function LogProvider({ children }: { children: React.ReactNode }) {
  // Sử dụng useState với callback để đảm bảo chỉ khởi tạo một lần
  const [instance] = useState(() => {
    logger.debug('LogProvider: Khởi tạo LogContext');
    return logCache;
  });
  
  return (
    <LogContext.Provider value={instance}>
      {children}
    </LogContext.Provider>
  );
}

/**
 * Hook để sử dụng LogCache
 * @returns LogCache instance
 */
export function useLogger() {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogger must be used within a LogProvider');
  }
  return context;
}
