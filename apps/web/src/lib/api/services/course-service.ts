import apiClient from '../api-client';

/**
 * Interfaz para los parámetros de lista de cursos
 */
export interface ICourseListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  instructor?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Interfaz para la respuesta de lista de cursos
 */
export interface ICourseListResponse {
  courses: ICourse[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Interfaz para un curso
 */
export interface ICourse {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  duration: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
  };
  rating: number;
  enrollmentsCount: number;
  createdAt: string;
  updatedAt: string;
  level?: string;
  students?: number;
  image?: string;
  color?: string;
}

/**
 * Interfaz para la solicitud de creación de curso
 */
export interface ICreateCourseRequest {
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  price: number;
  isFree: boolean;
  duration: number;
  categoryId: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  [key: string]: unknown;
}

/**
 * Interfaz para la solicitud de actualización de curso
 */
export interface IUpdateCourseRequest {
  title?: string;
  description?: string;
  shortDescription?: string;
  thumbnail?: string;
  price?: number;
  isFree?: boolean;
  duration?: number;
  categoryId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  [key: string]: unknown;
}

/**
 * Servicio de cursos
 */
export const courseService = {
  /**
   * Obtener lista de cursos
   * @param params Parámetros de la consulta
   * @returns Lista de cursos
   */
  getCourses: async (params?: ICourseListParams): Promise<ICourseListResponse> => {
    return apiClient.get<ICourseListResponse>('/courses', { params });
  },

  /**
   * Obtener un curso por su ID
   * @param id ID del curso
   * @returns Curso
   */
  getCourse: async (id: string): Promise<ICourse> => {
    return apiClient.get<ICourse>(`/courses/${id}`);
  },

  /**
   * Crear un nuevo curso
   * @param data Datos del curso
   * @returns Curso creado
   */
  createCourse: async (data: ICreateCourseRequest): Promise<ICourse> => {
    return apiClient.post<ICourse>('/courses', data);
  },

  /**
   * Actualizar un curso
   * @param id ID del curso
   * @param data Datos a actualizar
   * @returns Curso actualizado
   */
  updateCourse: async (id: string, data: IUpdateCourseRequest): Promise<ICourse> => {
    return apiClient.put<ICourse>(`/courses/${id}`, data);
  },

  /**
   * Eliminar un curso
   * @param id ID del curso
   * @returns Respuesta vacía
   */
  deleteCourse: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/courses/${id}`);
  },

  /**
   * Obtener cursos destacados
   * @param limit Límite de resultados
   * @returns Lista de cursos destacados
   */
  getFeaturedCourses: async (limit: number = 6): Promise<ICourse[]> => {
    return apiClient.get<ICourse[]>('/courses/featured', { params: { limit } });
  },

  /**
   * Obtener cursos populares
   * @param limit Límite de resultados
   * @returns Lista de cursos populares
   */
  getPopularCourses: async (limit: number = 6): Promise<ICourse[]> => {
    return apiClient.get<ICourse[]>('/courses/popular', { params: { limit } });
  },

  /**
   * Obtener cursos por instructor
   * @param instructorId ID del instructor
   * @returns Lista de cursos
   */
  getCoursesByInstructor: async (instructorId: string): Promise<ICourse[]> => {
    return apiClient.get<ICourse[]>(`/courses/instructor/${instructorId}`);
  },

  /**
   * Obtener cursos de un usuario
   * @param userId ID del usuario
   * @param params Parámetros adicionales
   * @returns Lista de cursos del usuario
   */
  getUserCourses: async (userId: string, params?: ICourseListParams): Promise<ICourseListResponse> => {
    return apiClient.get<ICourseListResponse>(`/users/${userId}/courses`, { params });
  },

  /**
   * Obtener cursos por categoría
   * @param categoryId ID de la categoría
   * @returns Lista de cursos
   */
  getCoursesByCategory: async (categoryId: string): Promise<ICourse[]> => {
    return apiClient.get<ICourse[]>(`/courses/category/${categoryId}`);
  },

  /**
   * Publicar un curso
   * @param id ID del curso
   * @returns Curso publicado
   */
  publishCourse: async (id: string): Promise<ICourse> => {
    return apiClient.post<ICourse>(`/courses/${id}/publish`, {});
  },

  /**
   * Archivar un curso
   * @param id ID del curso
   * @returns Curso archivado
   */
  archiveCourse: async (id: string): Promise<ICourse> => {
    return apiClient.post<ICourse>(`/courses/${id}/archive`, {});
  },
};
