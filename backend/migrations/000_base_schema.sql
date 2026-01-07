-- Migration: 000_base_schema.sql
-- Description: Create base tables for shift assignments system
-- Date: 2026-01-07

-- ==============================================
-- 1. Create box table (if not exists)
-- ==============================================
CREATE TABLE IF NOT EXISTS box (
  box_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  color_code VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- 2. Create users table (if not exists)
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('assistent', 'verantwoordelijke', 'afdelingshoofd') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- 3. Create shift_assignments table (if not exists)
-- ==============================================
CREATE TABLE IF NOT EXISTS shift_assignments (
  assignment_id INT AUTO_INCREMENT PRIMARY KEY,
  box_id INT NOT NULL,
  user_id INT,
  dentist_name VARCHAR(255),
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,

  FOREIGN KEY (box_id) REFERENCES box(box_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL,

  INDEX idx_shift_date (shift_date),
  INDEX idx_user_id (user_id),
  INDEX idx_box_id (box_id),
  INDEX idx_user_date (user_id, shift_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- 4. Create shift_task_groups table (if not exists)
-- ==============================================
CREATE TABLE IF NOT EXISTS shift_task_groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  group_type ENUM('ochtend', 'avond', 'wekelijks', 'maandelijks') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (assignment_id) REFERENCES shift_assignments(assignment_id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment_group (assignment_id, group_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
