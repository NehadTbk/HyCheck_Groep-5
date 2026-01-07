-- Migration: 001_shift_assignments_schema.sql
-- Description: Add shift assignment fields and create shift_task_groups table
-- Date: 2026-01-07

-- ==============================================
-- 1. Extend shift_assignments table
-- ==============================================

-- Add user_id column (foreign key to users)
ALTER TABLE shift_assignments
ADD COLUMN user_id INT AFTER assignment_id,
ADD FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

-- Add dentist_name column
ALTER TABLE shift_assignments
ADD COLUMN dentist_name VARCHAR(255);

-- Add shift_date column
ALTER TABLE shift_assignments
ADD COLUMN shift_date DATE NOT NULL;

-- Add start_time column
ALTER TABLE shift_assignments
ADD COLUMN start_time TIME NOT NULL;

-- Add end_time column
ALTER TABLE shift_assignments
ADD COLUMN end_time TIME NOT NULL;

-- Add created_at timestamp
ALTER TABLE shift_assignments
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add created_by column (foreign key to users)
ALTER TABLE shift_assignments
ADD COLUMN created_by INT,
ADD FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- ==============================================
-- 2. Create shift_task_groups table
-- ==============================================

CREATE TABLE IF NOT EXISTS shift_task_groups (
  group_id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  group_type ENUM('ochtend', 'avond', 'wekelijks', 'maandelijks') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key constraint
  FOREIGN KEY (assignment_id) REFERENCES shift_assignments(assignment_id) ON DELETE CASCADE,

  -- Unique constraint: one assignment cannot have duplicate group types
  UNIQUE KEY unique_assignment_group (assignment_id, group_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- 3. Add indexes for performance
-- ==============================================

-- Index on shift_date for date-based queries
ALTER TABLE shift_assignments
ADD INDEX idx_shift_date (shift_date);

-- Index on user_id for filtering by assistant
ALTER TABLE shift_assignments
ADD INDEX idx_user_id (user_id);

-- Composite index for common query patterns (user + date)
ALTER TABLE shift_assignments
ADD INDEX idx_user_date (user_id, shift_date);

-- ==============================================
-- ROLLBACK SCRIPT (if needed)
-- ==============================================

/*
-- Drop indexes
ALTER TABLE shift_assignments DROP INDEX idx_user_date;
ALTER TABLE shift_assignments DROP INDEX idx_user_id;
ALTER TABLE shift_assignments DROP INDEX idx_shift_date;

-- Drop shift_task_groups table
DROP TABLE IF EXISTS shift_task_groups;

-- Remove columns from shift_assignments (execute one by one)
ALTER TABLE shift_assignments DROP FOREIGN KEY shift_assignments_ibfk_2; -- created_by FK
ALTER TABLE shift_assignments DROP FOREIGN KEY shift_assignments_ibfk_3; -- user_id FK
ALTER TABLE shift_assignments DROP COLUMN created_by;
ALTER TABLE shift_assignments DROP COLUMN created_at;
ALTER TABLE shift_assignments DROP COLUMN end_time;
ALTER TABLE shift_assignments DROP COLUMN start_time;
ALTER TABLE shift_assignments DROP COLUMN shift_date;
ALTER TABLE shift_assignments DROP COLUMN dentist_name;
ALTER TABLE shift_assignments DROP COLUMN user_id;
*/
