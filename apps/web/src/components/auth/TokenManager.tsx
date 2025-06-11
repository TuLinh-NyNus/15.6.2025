'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import Cookies from 'js-cookie';
import logger from '@/lib/utils/logger';
import { useApiToken } from '@/contexts/api-token-context';

/**
 * Component để quản lý token trong client-side
 * - Lấy token từ cookie và lưu vào localStorage
 * - Tự động làm mới token khi cần
 */
export function TokenManager() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { apiToken, refreshApiToken } = useApiToken();

  useEffect(() => {
    // Đồng bộ token từ ApiTokenContext vào localStorage
    const syncTokenToLocalStorage = () => {
      if (!apiToken) return;

      if (typeof window !== 'undefined') {
        // Lưu vào localStorage để tương thích với code cũ
        localStorage.setItem('authToken', apiToken);
        localStorage.setItem('token', apiToken);

        logger.debug('TokenManager: Token đã được đồng bộ vào localStorage', {
          tokenLength: apiToken.length,
          tokenPreview: apiToken.substring(0, 20) + '...'
        });
      }
    };

    // Đồng bộ token khi apiToken thay đổi
    syncTokenToLocalStorage();

    // Hiển thị thông báo khi có token
    if (apiToken) {
      logger.info('TokenManager: Token API đã sẵn sàng');
    }
  }, [apiToken]);

  // Component này không render gì cả
  return null;
}

export default TokenManager;
