-- Check the actual structure of shift and shift_assignments tables

DESCRIBE shift;
DESCRIBE shift_assignments;

-- Show foreign keys
SELECT
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'hycheck'
AND TABLE_NAME IN ('shift', 'shift_assignments');
