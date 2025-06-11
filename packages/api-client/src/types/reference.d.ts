// Reference type declarations
declare module '@project/dto' {
  // Exam DTOs
  export class CreateExamDto {}
  export class UpdateExamDto {}
  export class ExamResponseDto {}
  export class ExamFilterDto {}
  
  // Question DTOs
  export class CreateExamQuestionDto {}
  export class UpdateExamQuestionDto {}
  export class ExamQuestionResponseDto {}
  
  // Result DTOs
  export class ExamResultResponseDto {}
  
  // Stats DTOs
  export class ExamStatsDto {}
  export class DetailedExamStatsDto {
    questionStats: QuestionStatsDto[];
  }
  export class QuestionStatsDto {}
  export class ExamStatsParamsDto {
    examId: string;
    includeQuestionStats?: boolean;
  }
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    baseURL?: string;
    url?: string;
    method?: string;
    headers?: Record<string, unknown>;
    params?: Record<string, unknown>;
    data?: unknown;
    timeout?: number;
    withCredentials?: boolean;
    responseType?: string;
    onUploadProgress?: (progressEvent: ProgressEvent) => void;
    onDownloadProgress?: (progressEvent: ProgressEvent) => void;
    validateStatus?: (status: number) => boolean;
  }

  export interface AxiosResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, unknown>;
    config: AxiosRequestConfig;
    request?: XMLHttpRequest;
  }

  export interface AxiosError<T = unknown> {
    config: AxiosRequestConfig;
    code?: string;
    request?: XMLHttpRequest;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
    toJSON: () => Record<string, unknown>;
  }

  export interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    defaults: AxiosRequestConfig;
    interceptors: {
      request: {
        use: (
          onFulfilled?: (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>,
          onRejected?: (error: unknown) => unknown
        ) => number;
        eject: (id: number) => void;
      };
      response: {
        use: (
          onFulfilled?: (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
          onRejected?: (error: unknown) => unknown
        ) => number;
        eject: (id: number) => void;
      };
    };
    request<T = unknown>(config: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    head<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  export interface AxiosStatic extends AxiosInstance {
    create: (config?: AxiosRequestConfig) => AxiosInstance;
    Cancel: { new (message?: string): { message: string } };
    CancelToken: {
      new (executor: (cancel: (message?: string) => void) => void): { promise: Promise<{ message: string }>; reason?: { message: string }; throwIfRequested: () => void };
      source: () => { token: { promise: Promise<{ message: string }>; reason?: { message: string }; throwIfRequested: () => void }; cancel: (message?: string) => void };
    };
    isCancel: (value: unknown) => boolean;
    all: <T>(values: Array<T | Promise<T>>) => Promise<T[]>;
    spread: <T, R>(callback: (...args: T[]) => R) => (array: T[]) => R;
  }

  const axios: AxiosStatic;
  export default axios;
} 