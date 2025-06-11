# API Client

Thư viện client cho việc tương tác với API backend của hệ thống với khả năng caching tự động.

## Cài đặt

```bash
pnpm add @project/api-client
```

## Tính năng

- Tích hợp đầy đủ TypeScript
- Quản lý request và response tự động
- Xử lý lỗi tập trung
- Hỗ trợ token authentication và refresh
- **Caching tự động cho GET requests**
- API được phân nhóm theo tính năng

## Cách sử dụng

### Sử dụng API Client mặc định

```typescript
import { apiClient } from '@project/api-client';

// Gọi API
const data = await apiClient.get('/api/users');
```

### Tạo instance API Client riêng

```typescript
import { ApiClient } from '@project/api-client';

const customClient = new ApiClient({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  withCredentials: true,
  enableCache: true,
  cacheTTL: 10 * 60 * 1000 // 10 phút
});

// Gọi API với client tùy chỉnh
const data = await customClient.get('/api/users');
```

### Sử dụng các API có sẵn

```typescript
import { 
  fetchExams, 
  fetchExamById, 
  getExamStats,
  getDetailedExamStats 
} from '@project/api-client';

// Lấy danh sách bài thi
const exams = await fetchExams({
  page: 1,
  limit: 10,
  subject: 'math'
});

// Lấy chi tiết bài thi
const exam = await fetchExamById('123');

// Lấy thống kê bài thi (được cache tự động)
const stats = await getExamStats('123');
```

## Quản lý Cache

API Client cung cấp các phương thức để quản lý cache:

```typescript
import { apiClient } from '@project/api-client';

// Xóa toàn bộ cache
apiClient.clearCache();

// Xóa cache cho một API cụ thể
apiClient.clearCacheItem('/api/exams/123', 'GET');
```

### Cấu hình Cache

Mặc định, cache được bật cho các GET requests với thời gian lưu trữ là 5 phút. Bạn có thể tùy chỉnh thông số này khi tạo API Client:

```typescript
import { ApiClient } from '@project/api-client';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  enableCache: true,    // Bật/tắt cache
  cacheTTL: 60 * 1000   // Thời gian lưu cache (ms)
});
```

## API

### Phương thức chung

| Phương thức | Mô tả |
|-------------|-------|
| `get<T>(url, config?)` | Thực hiện GET request |
| `post<T>(url, data?, config?)` | Thực hiện POST request |
| `put<T>(url, data?, config?)` | Thực hiện PUT request |
| `patch<T>(url, data?, config?)` | Thực hiện PATCH request |
| `delete<T>(url, config?)` | Thực hiện DELETE request |
| `request<T>(config)` | Thực hiện request tùy chỉnh |

### Quản lý Cache

| Phương thức | Mô tả |
|-------------|-------|
| `clearCache()` | Xóa toàn bộ cache |
| `clearCacheItem(url, method, params?)` | Xóa cache cho một API cụ thể |

## Xử lý lỗi

Tất cả các lỗi từ API được chuẩn hóa và có định dạng:

```typescript
try {
  const data = await apiClient.get('/api/users');
} catch (error) {
  console.error(error.message); // "API Error (404): User not found"
}
``` 