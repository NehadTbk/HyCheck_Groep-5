-- Query to check what roles exist in the users table
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- Show all users with their roles
SELECT user_id, first_name, last_name, email, role
FROM users
ORDER BY role, first_name;
