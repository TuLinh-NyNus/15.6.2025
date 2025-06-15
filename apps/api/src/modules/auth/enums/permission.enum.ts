export enum Permission {
  // User permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  
  // Course permissions
  CREATE_COURSE = 'create:course',
  READ_COURSE = 'read:course',
  UPDATE_COURSE = 'update:course',
  DELETE_COURSE = 'delete:course',
  
  // Lesson permissions
  CREATE_LESSON = 'create:lesson',
  READ_LESSON = 'read:lesson',
  UPDATE_LESSON = 'update:lesson',
  DELETE_LESSON = 'delete:lesson',
  
  // Category permissions
  CREATE_CATEGORY = 'create:category',
  READ_CATEGORY = 'read:category',
  UPDATE_CATEGORY = 'update:category',
  DELETE_CATEGORY = 'delete:category',
  
  // Admin permissions
  ADMIN_ACCESS = 'admin:access',
} 
