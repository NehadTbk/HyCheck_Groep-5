-- Migration: 002_test_data.sql
-- Description: Insert test data for assistants, dentists, and boxes
-- Date: 2026-01-07
-- NOTE: This is optional test data. You can skip this if you already have data in your database.

-- ==============================================
-- 1. Insert test assistants
-- ==============================================
-- NOTE: Password is 'password123' hashed with bcrypt
-- You should update these passwords in production!

INSERT INTO users (first_name, last_name, email, password_hash, role, is_active) VALUES
  ('Anna', 'Martinez', 'anna.martinez@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'assistant', 1),
  ('Sarah', 'Wilson', 'sarah.wilson@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'assistant', 1),
  ('Emily', 'Taylor', 'emily.taylor@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'assistant', 1),
  ('Jessica', 'Moore', 'jessica.moore@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'assistant', 1),
  ('Lisa', 'Anderson', 'lisa.anderson@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'assistant', 1),
  ('Maria', 'Rodriguez', 'maria.rodriguez@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'assistant', 1)
ON DUPLICATE KEY UPDATE first_name=first_name;

-- ==============================================
-- 2. Insert test dentists
-- ==============================================

INSERT INTO users (first_name, last_name, email, password_hash, role, is_active) VALUES
  ('John', 'Smith', 'dr.smith@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('Emily', 'Johnson', 'dr.johnson@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('Michael', 'Williams', 'dr.williams@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('Sarah', 'Brown', 'dr.brown@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('David', 'Davis', 'dr.davis@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('Carlos', 'Martinez', 'dr.martinez@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('Ana', 'Garcia', 'dr.garcia@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1),
  ('James', 'Lee', 'dr.lee@hycheck.com', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'dentist', 1)
ON DUPLICATE KEY UPDATE first_name=first_name;

-- ==============================================
-- 3. Insert test boxes (if not already exist)
-- ==============================================

INSERT INTO box (name, color_code) VALUES
  ('Box 1', '#FF6B6B'),
  ('Box 2', '#4ECDC4'),
  ('Box 3', '#45B7D1'),
  ('Box 4', '#FFA07A'),
  ('Box 5', '#98D8C8'),
  ('Box 6', '#F7DC6F'),
  ('Box 7', '#BB8FCE'),
  ('Box 8', '#85C1E2'),
  ('Box 9', '#F8B739'),
  ('Box 10', '#52BE80'),
  ('Box 11', '#5DADE2'),
  ('Box A', '#EC7063'),
  ('Box B', '#AF7AC5'),
  ('Box C', '#5499C7')
ON DUPLICATE KEY UPDATE name=name;

-- ==============================================
-- Verification queries (run these to check)
-- ==============================================

/*
-- Check assistants
SELECT user_id, CONCAT(first_name, ' ', last_name) AS name, email, role FROM users WHERE role = 'assistant';

-- Check dentists
SELECT user_id, CONCAT(first_name, ' ', last_name) AS name, email, role FROM users WHERE role = 'dentist';

-- Check boxes
SELECT box_id, name, color_code FROM box;
*/
