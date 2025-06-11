'use client';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastContainer,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  // Đảm bảo chỉ hiển thị tối đa 3 thông báo mới nhất
  const visibleToasts = toasts.slice(0, 3);

  return (
    <ToastContainer>
      {visibleToasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast
          key={id}
          variant={variant}
          className="mb-1 last:mb-0"
          onClose={() => {
            console.log('Đóng toast với ID:', id);
            dismiss(id!);
          }}
          {...props}
        >
          <div className="grid gap-0.5">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose
            onClick={() => {
              console.log('Nút X được nhấn, đóng toast với ID:', id);
              dismiss(id!);
            }}
          />
        </Toast>
      ))}
    </ToastContainer>
  );
}
