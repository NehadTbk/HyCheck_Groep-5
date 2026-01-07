# Database Migrations

This directory contains SQL migration scripts for the HyCheck database schema.

## Migration Files

- `001_shift_assignments_schema.sql` - Extends shift_assignments table and creates shift_task_groups table

## How to Run Migrations

### Option 1: Using MySQL Command Line

```bash
# Navigate to the migrations directory
cd backend/migrations

# Run the migration (replace with your database credentials)
mysql -u your_username -p your_database_name < 001_shift_assignments_schema.sql
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Open the migration file: `File > Open SQL Script`
4. Execute the script: Click the lightning bolt icon or press Ctrl+Shift+Enter

### Option 3: Using phpMyAdmin

1. Log in to phpMyAdmin
2. Select your database from the left sidebar
3. Click on the "SQL" tab
4. Copy and paste the contents of the migration file
5. Click "Go" to execute

### Option 4: Programmatically (Node.js)

```javascript
import fs from 'fs';
import { pool } from './src/config/db.js';

const migrationSQL = fs.readFileSync('./migrations/001_shift_assignments_schema.sql', 'utf8');

async function runMigration() {
  const connection = await pool.getConnection();
  try {
    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .filter(stmt => stmt.trim() && !stmt.trim().startsWith('/*'));

    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    connection.release();
  }
}

runMigration();
```

## Rollback

If you need to rollback a migration, use the commented rollback script at the bottom of each migration file.

**Warning:** Rollback will delete data. Make sure to backup your database before rolling back.

## Verification

After running the migration, verify the changes:

```sql
-- Check shift_assignments structure
DESCRIBE shift_assignments;

-- Check shift_task_groups table exists
DESCRIBE shift_task_groups;

-- Check indexes
SHOW INDEX FROM shift_assignments;
```

## Expected Schema After Migration

### shift_assignments table
- `assignment_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `box_id` (INT, FOREIGN KEY)
- `user_id` (INT, FOREIGN KEY to users) - NEW
- `dentist_name` (VARCHAR(255)) - NEW
- `shift_date` (DATE, NOT NULL) - NEW
- `start_time` (TIME, NOT NULL) - NEW
- `end_time` (TIME, NOT NULL) - NEW
- `created_at` (TIMESTAMP) - NEW
- `created_by` (INT, FOREIGN KEY to users) - NEW

### shift_task_groups table (NEW)
- `group_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `assignment_id` (INT, FOREIGN KEY to shift_assignments)
- `group_type` (ENUM: 'ochtend', 'avond', 'wekelijks', 'maandelijks')
- `created_at` (TIMESTAMP)

## Next Steps

After running this migration, proceed with Phase 2: Backend Implementation to create the API endpoints that use these tables.
