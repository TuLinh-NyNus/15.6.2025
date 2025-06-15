export enum Permission {
  // Course permissions
  CREATE_COURSE = 'create:course',
  READ_COURSE = 'read:course',
  UPDATE_COURSE = 'update:course',
  DELETE_COURSE = 'delete:course',
  PUBLISH_COURSE = 'publish:course',

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

  // User permissions
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',
  MANAGE_ROLES = 'manage:roles',

  // Enrollment permissions
  CREATE_ENROLLMENT = 'create:enrollment',
  READ_ENROLLMENT = 'read:enrollment',
  UPDATE_ENROLLMENT = 'update:enrollment',
  DELETE_ENROLLMENT = 'delete:enrollment',
  
  // Exam permissions
  CREATE_EXAM = 'create:exam',
  READ_EXAM = 'read:exam',
  UPDATE_EXAM = 'update:exam',
  DELETE_EXAM = 'delete:exam',
  
  // Exam Question permissions
  CREATE_EXAM_QUESTION = 'create:exam_question',
  READ_EXAM_QUESTION = 'read:exam_question',
  UPDATE_EXAM_QUESTION = 'update:exam_question',
  DELETE_EXAM_QUESTION = 'delete:exam_question',
  
  // Exam Result permissions
  CREATE_EXAM_RESULT = 'create:exam_result',
  READ_EXAM_RESULT = 'read:exam_result',
  UPDATE_EXAM_RESULT = 'update:exam_result',
  DELETE_EXAM_RESULT = 'delete:exam_result',
} 
