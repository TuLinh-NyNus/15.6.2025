import apiClient from '../api-client';

/**
 * Interfaz para la solicitud de inicio de sesión
 */
export interface ISignInRequest {
  email: string;
  password: string;
  [key: string]: unknown;
}

/**
 * Interfaz para la solicitud de registro
 */
export interface ISignUpRequest {
  email: string;
  password: string;
  name: string;
  role?: 'student' | 'instructor';
  [key: string]: unknown;
}

/**
 * Interfaz para la respuesta de autenticación
 */
export interface IAuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param data Datos de inicio de sesión
   * @returns Respuesta de autenticación
   */
  signIn: async (data: ISignInRequest): Promise<IAuthResponse> => {
    return apiClient.post<IAuthResponse>('/auth/login', data);
  },

  /**
   * Registrarse
   * @param data Datos de registro
   * @returns Respuesta de autenticación
   */
  signUp: async (data: ISignUpRequest): Promise<IAuthResponse> => {
    return apiClient.post<IAuthResponse>('/auth/register', data);
  },

  /**
   * Cerrar sesión
   * @returns Respuesta vacía
   */
  signOut: async (): Promise<void> => {
    return apiClient.post<void>('/auth/logout', {});
  },

  /**
   * Obtener el usuario actual
   * @returns Usuario actual
   */
  getCurrentUser: async (): Promise<IAuthResponse['user']> => {
    return apiClient.get<IAuthResponse['user']>('/auth/me');
  },

  /**
   * Actualizar el token de acceso
   * @param refreshToken Token de actualización
   * @returns Nuevo token de acceso
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },
};
