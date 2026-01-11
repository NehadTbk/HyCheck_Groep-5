import pool from "../config/db.js";

/**
 * Find box by name
 */
export const findBoxByName = async (boxName) => {
  try {
    const [rows] = await pool.query(
      "SELECT box_id, name, color_code FROM box WHERE name = ?",
      [boxName]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error finding box by name:", error.message);
    throw error;
  }
};

/**
 * Find assistant (user) by full name
 */
export const findAssistantByUsername = async (fullName) => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, CONCAT(first_name, ' ', last_name) AS username
       FROM users
       WHERE CONCAT(first_name, ' ', last_name) = ? AND role = 'assistant'`,
      [fullName]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error finding assistant by name:", error.message);
    throw error;
  }
};

/**
 * Get all assistants from the database
 */
export const getAllAssistants = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, CONCAT(first_name, ' ', last_name) AS username, first_name, last_name
       FROM users
       WHERE role = 'assistant'
       ORDER BY first_name, last_name ASC`
    );
    return rows || [];
  } catch (error) {
    console.error("Error getting all assistants:", error.message);
    console.error("SQL Error details:", error);
    throw error;
  }
};

/**
 * Get all dentists from the database
 */
export const getAllDentists = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, CONCAT(first_name, ' ', last_name) AS username, first_name, last_name
       FROM users
       WHERE role = 'dentist'
       ORDER BY first_name, last_name ASC`
    );
    return rows || [];
  } catch (error) {
    console.error("Error getting all dentists:", error.message);
    console.error("SQL Error details:", error);
    throw error;
  }
};

/**
 * Find dentist by full name (optional, returns null if not found)
 */
export const findDentistByUsername = async (fullName) => {
  try {
    if (!fullName) return null;

    const [rows] = await pool.query(
      `SELECT user_id, CONCAT(first_name, ' ', last_name) AS username
       FROM users
       WHERE CONCAT(first_name, ' ', last_name) = ? AND role = 'dentist'`,
      [fullName]
    );
    return rows[0] || null;
  } catch (error) {
    console.error("Error finding dentist by name:", error.message);
    throw error;
  }
};

export const createShift = async (
  { userId, shiftDate, startTime, endTime },
  connection = null
) => {
  const db = connection || pool;

  const [result] = await db.query(
    `INSERT INTO shift
     (user_id, shift_date, start_time, end_time)
     VALUES (?, ?, ?, ?)`,
    [userId, shiftDate, startTime, endTime]
  );

  return result.insertId;
};

/**
 * Create a single shift assignment
 */
export const createShiftAssignment = async (assignmentData, connection = null) => {
  const {
    shiftId,
    boxId,
    userId,
    dentistUserId,
    assignmentStart,
    assignmentEnd,
    createdBy
  } = assignmentData;

  const db = connection || pool;

  try {
    const [result] = await db.query(
      `INSERT INTO shift_assignments
      (shift_id, box_id, user_id, dentist_user_id, assignment_start, assignment_end, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [shiftId, boxId, userId, dentistUserId, assignmentStart, assignmentEnd, createdBy]
    );

    return result.insertId;
  } catch (error) {
    console.error("Error creating shift assignment:", error.message);
    throw error;
  }
};

/**
 * Create task groups for an assignment
 */
export const createTaskGroups = async (assignmentId, groups, connection = null) => {
  const db = connection || pool;

  try {
    const insertPromises = groups.map((groupType) =>
      db.query(
        `INSERT INTO shift_task_groups (assignment_id, group_type)
         VALUES (?, ?)`,
        [assignmentId, groupType]
      )
    );

    await Promise.all(insertPromises);
    return true;
  } catch (error) {
    console.error("Error creating task groups:", error.message);
    throw error;
  }
};

/**
 * Get all boxes
 */
export const getAllBoxes = async () => {
  try {
    const [rows] = await pool.query(
      "SELECT box_id, name, color_code FROM box ORDER BY box_id ASC"
    );
    return rows || [];
  } catch (error) {
    console.error("Error getting all boxes:", error.message);
    console.error("SQL Error details:", error);
    throw error;
  }
};

/**
 * Get shift assignments for a date range
 */
export const getShiftAssignmentsByDateRange = async (startDate, endDate) => {
  try {
    const [rows] = await pool.query(
      `SELECT
      sa.assignment_id,
      sa.box_id,
      s.shift_date,
      sa.assignment_start AS start_time,
      sa.assignment_end AS end_time,
      b.name AS box_name,
      b.color_code AS box_color,
      CONCAT(a.first_name, ' ', a.last_name) AS assistant_name,
      CONCAT(d.first_name, ' ', d.last_name) AS dentist_name,
      GROUP_CONCAT(DISTINCT stg.group_type) AS task_groups,
      cs.session_id,
      cs.status AS session_status,
      COALESCE(task_stats.total_tasks, 0) AS total_tasks,
      COALESCE(task_stats.done_tasks, 0) AS done_tasks
    FROM shift_assignments sa
    JOIN shift s ON sa.shift_id = s.shift_id
    JOIN box b ON sa.box_id = b.box_id
    LEFT JOIN users a ON sa.user_id = a.user_id
    LEFT JOIN users d ON sa.dentist_user_id = d.user_id
    LEFT JOIN shift_task_groups stg ON sa.assignment_id = stg.assignment_id
    LEFT JOIN cleaning_session cs ON cs.assignment_id = sa.assignment_id
    LEFT JOIN (
      SELECT
        cts.session_id,
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN cts.completed = 1 THEN 1 ELSE 0 END) AS done_tasks
      FROM cleaning_task_status cts
      GROUP BY cts.session_id
    ) task_stats ON task_stats.session_id = cs.session_id
    WHERE s.shift_date BETWEEN ? AND ?
    GROUP BY sa.assignment_id, cs.session_id, cs.status, task_stats.total_tasks, task_stats.done_tasks
    ORDER BY s.shift_date, sa.assignment_start`,
      [startDate, endDate]
    );
    return rows;
  } catch (error) {
    console.error("Error getting shift assignments by date range:", error.message);
    throw error;
  }
};

/**
 * Delete shift assignment by ID
 */
export const deleteShiftAssignment = async (assignmentId) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM shift_assignments WHERE assignment_id = ?",
      [assignmentId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting shift assignment:", error.message);
    throw error;
  }
};
