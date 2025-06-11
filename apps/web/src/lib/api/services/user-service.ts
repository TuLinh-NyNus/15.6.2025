import apiClient from '../api-client';

/**
 * Interface cho tham số tìm kiếm người dùng
 */
export interface IUserFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string[];
  status?: string[];
  [key: string]: unknown;
}

/**
 * Interface cho response danh sách người dùng
 */
export interface IUserListResponse {
  items: IUser[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interface cho người dùng
 */
export interface IUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho request tạo người dùng
 */
export interface ICreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Interface cho request cập nhật người dùng
 */
export interface IUpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Interface cho profile người dùng
 */
export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  enrolledCourses?: number;
  completedCourses?: number;
  createdCourses?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface cho request cập nhật profile
 */
export interface IUpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  [key: string]: unknown;
}

/**
 * Interface cho cài đặt thông báo
 */
export interface INotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  [key: string]: unknown;
}

/**
 * Interface cho response upload avatar
 */
export interface IUploadAvatarResponse {
  avatarUrl: string;
}

/**
 * Interface cho thông tin đăng ký
 */
export interface ISubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Service cho người dùng
 */
export const userService = {
  /**
   * Lấy danh sách người dùng
   * @param params Tham số tìm kiếm
   * @returns Danh sách người dùng
   */
  getUsers: async (params?: IUserFilterParams): Promise<IUserListResponse> => {
    return apiClient.get<IUserListResponse>('/users', { params });
  },

  /**
   * Lấy người dùng theo ID
   * @param id ID người dùng
   * @returns Người dùng
   */
  getUser: async (id: string): Promise<IUser> => {
    return apiClient.get<IUser>(`/users/${id}`);
  },

  /**
   * Tạo người dùng mới
   * @param data Dữ liệu người dùng
   * @returns Người dùng đã tạo
   */
  createUser: async (data: ICreateUserRequest): Promise<IUser> => {
    return apiClient.post<IUser>('/users', data);
  },

  /**
   * Cập nhật người dùng
   * @param id ID người dùng
   * @param data Dữ liệu cập nhật
   * @returns Người dùng đã cập nhật
   */
  updateUser: async (id: string, data: IUpdateUserRequest): Promise<IUser> => {
    return apiClient.put<IUser>(`/users/${id}`, data);
  },

  /**
   * Xóa người dùng
   * @param id ID người dùng
   * @returns Response rỗng
   */
  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}`);
  },

  /**
   * Lấy profile người dùng
   * @param id ID người dùng
   * @returns Profile người dùng
   */
  getUserProfile: async (id: string): Promise<IUserProfile> => {
    return apiClient.get<IUserProfile>(`/users/${id}/profile`);
  },

  /**
   * Cập nhật profile người dùng
   * @param id ID người dùng
   * @param data Dữ liệu cập nhật
   * @returns Profile người dùng đã cập nhật
   */
  updateUserProfile: async (id: string, data: IUpdateProfileRequest): Promise<IUserProfile> => {
    return apiClient.put<IUserProfile>(`/users/${id}/profile`, data);
  },

  /**
   * Lấy profile của người dùng hiện tại
   * @returns Profile người dùng
   */
  getCurrentUserProfile: async (): Promise<IUserProfile> => {
    return apiClient.get<IUserProfile>('/users/me/profile');
  },

  /**
   * Cập nhật profile của người dùng hiện tại
   * @param data Dữ liệu cập nhật
   * @returns Profile người dùng đã cập nhật
   */
  updateCurrentUserProfile: async (data: IUpdateProfileRequest): Promise<IUserProfile> => {
    return apiClient.put<IUserProfile>('/users/me/profile', data);
  },

  /**
   * Đổi mật khẩu
   * @param oldPassword Mật khẩu cũ
   * @param newPassword Mật khẩu mới
   * @returns Response rỗng
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    return apiClient.post<void>('/users/me/change-password', { oldPassword, newPassword });
  },

  /**
   * Cập nhật mật khẩu của người dùng
   * @param id ID người dùng
   * @param data Dữ liệu cập nhật
   * @returns Response rỗng
   */
  updatePassword: async (id: string, data: { password: string }): Promise<void> => {
    return apiClient.put<void>(`/users/${id}/password`, data);
  },

  /**
   * Lấy cài đặt thông báo
   * @param id ID người dùng
   * @returns Cài đặt thông báo
   */
  getNotificationSettings: async (id: string): Promise<INotificationSettings> => {
    return apiClient.get<INotificationSettings>(`/users/${id}/notifications`);
  },

  /**
   * Cập nhật cài đặt thông báo
   * @param id ID người dùng
   * @param data Dữ liệu cập nhật
   * @returns Cài đặt thông báo đã cập nhật
   */
  updateNotificationSettings: async (id: string, data: Partial<INotificationSettings>): Promise<INotificationSettings> => {
    return apiClient.put<INotificationSettings>(`/users/${id}/notifications`, data);
  },

  /**
   * Lấy thông tin đăng ký
   * @param id ID người dùng
   * @returns Thông tin đăng ký
   */
  getSubscription: async (id: string): Promise<ISubscription> => {
    return apiClient.get<ISubscription>(`/users/${id}/subscription`);
  },

  /**
   * Hủy đăng ký
   * @param id ID người dùng
   * @param subscriptionId ID đăng ký
   * @returns Response rỗng
   */
  cancelSubscription: async (id: string, subscriptionId: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}/subscription/${subscriptionId}`);
  },

  /**
   * Upload avatar
   * @param id ID người dùng
   * @param file File ảnh
   * @returns URL avatar mới
   */
  uploadAvatar: async (id: string, file: File): Promise<IUploadAvatarResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<IUploadAvatarResponse>(`/users/${id}/avatar`, formData as unknown as Record<string, unknown>, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default userService;
