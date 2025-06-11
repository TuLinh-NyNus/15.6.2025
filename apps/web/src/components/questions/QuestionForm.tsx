
import { QuestionFormData } from './QuestionFormTabs';

import { Button } from '@/components/ui/button';

interface QuestionFormProps {
  formData: QuestionFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuestionFormData>>;
  saveQuestionToDatabase: () => Promise<unknown>;
  isSaving: boolean;
  saveStatus: 'idle' | 'success' | 'error';
  saveMessage: string;
}

export function QuestionForm({
  formData: _formData, // Đổi tên để tránh cảnh báo unused
  setFormData: _setFormData, // Đổi tên để tránh cảnh báo unused
  saveQuestionToDatabase,
  isSaving,
  saveStatus,
  saveMessage
}: QuestionFormProps) {
  // ... giữ nguyên các state và hàm khác ...

  return (
    <div>
      {/* ... giữ nguyên các phần form khác ... */}

      {/* Thêm UI feedback khi lưu */}
      {saveStatus !== 'idle' && (
        <div className={`mt-4 p-3 rounded-lg ${
          saveStatus === 'success' ? 'bg-green-50 text-green-600 border border-green-200' :
          'bg-red-50 text-red-600 border border-red-200'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* Nút lưu với trạng thái loading */}
      <Button
        onClick={saveQuestionToDatabase}
        className="w-full mt-4"
        variant="default"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Đang lưu...
          </>
        ) : (
          'Lưu câu hỏi'
        )}
      </Button>
    </div>
  );
}