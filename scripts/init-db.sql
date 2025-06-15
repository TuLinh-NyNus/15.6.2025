-- Database Initialization Script for NyNus
-- This script runs when PostgreSQL container starts for the first time

-- Create database if not exists (already handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS nynus_db;

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default encoding
SET client_encoding = 'UTF8';

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just placeholders, actual indexes will be created by Prisma

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'NyNus database initialized successfully';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'User: %', current_user;
    RAISE NOTICE 'Timestamp: %', now();
END $$;
