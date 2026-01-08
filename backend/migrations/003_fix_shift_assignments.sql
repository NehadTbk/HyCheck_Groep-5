-- Migration: 003_fix_shift_assignments.sql
-- Description: Remove the shift_id foreign key constraint to match our code
-- Date: 2026-01-07

-- Option 1: Drop the foreign key constraint that requires shift_id
ALTER TABLE shift_assignments DROP FOREIGN KEY shift_assignments_ibfk_1;

-- Option 2: If shift_id column exists and is not needed, drop it
-- ALTER TABLE shift_assignments DROP COLUMN shift_id;

-- Note: Run this migration to remove the constraint that's causing the error
