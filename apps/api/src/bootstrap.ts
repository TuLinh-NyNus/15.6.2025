/**
 * Load environment variables with default values
 * This should be called before any other imports
 */
let envLoaded = false;

export function loadEnv(): void {
  // Tránh tải lại nhiều lần
  if (envLoaded) {
    return;
  }

  // Mặc định thiết lập các biến môi trường quan trọng
  const defaultEnv = {
    JWT_ACCESS_SECRET: 'nynus_access_secret_key_2025',
    JWT_REFRESH_SECRET: 'nynus_refresh_secret_key_2025',
    JWT_ACCESS_EXPIRES_IN: '15m',
    JWT_REFRESH_EXPIRES_IN: '7d'
  };

  // Thiết lập biến môi trường trực tiếp nếu chưa tồn tại
  for (const [key, value] of Object.entries(defaultEnv)) {
    if (!process.env[key]) {
      console.log(`Setting default environment variable: ${key}`);
      process.env[key] = value;
    }
  }

  // Đánh dấu đã tải
  envLoaded = true;
  
  // Chỉ in một log ngắn gọn
  console.log('=== BOOTSTRAP: Environment variables loaded successfully ===');
} 