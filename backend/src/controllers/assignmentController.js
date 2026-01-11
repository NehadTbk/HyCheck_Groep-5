import db from "../config/db.js";
import {
  findBoxByName,
  findAssistantByUsername,
  findDentistByUsername,
  createShift,
  createShiftAssignment,
  createTaskGroups,
  getAllBoxes,
  getShiftAssignmentsByDateRange,
  deleteShiftAssignment,
} from "../models/Assignment.js";

/**
 * Create shift assignments
 * POST /api/assignments
 * Body: { shifts: [{ date, box, dentist, assistant, start, end, groups: [] }] }
 */
export const createAssignments = async (req, res) => {
  try {
    const { shifts } = req.body;

    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return res.status(400).json({ message: "Shifts array is required" });
    }

    // Validate each shift
    for (const shift of shifts) {
      if (!shift.date || !shift.box || !shift.assistant || !shift.start || !shift.end || !shift.groups || !Array.isArray(shift.groups)) {
        return res.status(400).json({
          message: "Each shift must have: date, box, assistant, start, end, and groups array"
        });
      }
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const createdAssignments = [];

      for (const shift of shifts) {
        // 1. Get box by name
        const box = await findBoxByName(shift.box);
        if (!box) {
          throw new Error(`Box not found: ${shift.box}`);
        }

        // 2. Get assistant by username
        const assistant = await findAssistantByUsername(shift.assistant);
        if (!assistant) {
          throw new Error(`Assistant not found: ${shift.assistant}`);
        }

        // 3. Validate dentist if provided and get dentist_user_id
        let dentistUserId = null;
        if (shift.dentist) {
          const dentist = await findDentistByUsername(shift.dentist);
          if (!dentist) {
            throw new Error(`Dentist not found: ${shift.dentist}`);
          }
          dentistUserId = dentist.user_id;
        }

        const shiftUserId = req.user?.user_id || assistant.user_id;

        console.log(`[DEBUG CREATE] Received date from frontend: ${shift.date}`);

        const shiftId = await createShift({
          userId: shiftUserId,
          shiftDate: shift.date,
          startTime: shift.start,
          endTime: shift.end
        }, connection);

        // 4. Create shift assignment
        const assignmentId = await createShiftAssignment({
          shiftId,
          boxId: box.box_id,
          userId: assistant.user_id,
          dentistUserId,
          assignmentStart: shift.start,
          assignmentEnd: shift.end,
          createdBy: req.user?.user_id || null
        }, connection);


        // 5. Create task groups for this assignment
        await createTaskGroups(assignmentId, shift.groups, connection);

        createdAssignments.push({
          assignment_id: assignmentId,
          box: shift.box,
          assistant: shift.assistant,
          dentist: shift.dentist,
          date: shift.date,
          start: shift.start,
          end: shift.end,
          groups: shift.groups,
        });
      }

      await connection.commit();

      res.status(201).json({
        message: `Successfully created ${createdAssignments.length} assignment(s)`,
        assignments: createdAssignments,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("createAssignments error:", error);
    res.status(500).json({
      message: "Failed to create assignments",
      error: error.message
    });
  }
};

/**con
 * Get calendar data for a specific week
 * GET /api/calendar?weekStart=YYYY-MM-DD
 */
export const getCalendarData = async (req, res) => {
  try {
    const { weekStart } = req.query;

    if (!weekStart) {
      return res.status(400).json({ message: "weekStart parameter is required (YYYY-MM-DD)" });
    }

    // Calculate week end (Friday)
    const startDate = new Date(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 4); // Monday to Friday

    // Format end date without timezone issues
    const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

    // 1. Get all boxes using model
    const boxes = await getAllBoxes();

    // 2. Get all shift assignments for this week using model
    const assignments = await getShiftAssignmentsByDateRange(
      weekStart,
      endDateStr
    );

    // Debug: log what we fetched
    console.log(`[getCalendarData] weekStart=${weekStart} start=${weekStart} end=${endDateStr} assignments=${assignments.length}`);

    // 3. Structure the planning data: planning[date][box_id]
    const planning = {};

    assignments.forEach((assignment) => {
      // Format date as YYYY-MM-DD string
      const shiftDate = assignment.shift_date;
      let dateKey;

      if (shiftDate instanceof Date) {
        // MySQL returns Date object - extract year, month, day in local time
        const year = shiftDate.getFullYear();
        const month = String(shiftDate.getMonth() + 1).padStart(2, '0');
        const day = String(shiftDate.getDate()).padStart(2, '0');
        dateKey = `${year}-${month}-${day}`;
      } else {
        // Already a string
        dateKey = String(shiftDate).slice(0, 10);
      }

      console.log(`[DEBUG] shift_date type: ${typeof shiftDate}, value: ${shiftDate}, dateKey: ${dateKey}`);

      if (!planning[dateKey]) {
        planning[dateKey] = {};
      }

      // Create label from task groups and times
      const groups = assignment.task_groups ? assignment.task_groups.split(',') : [];
      const groupLabels = groups.map(g => {
        switch (g) {
          case 'ochtend': return 'O';
          case 'avond': return 'A';
          case 'wekelijks': return 'W';
          case 'maandelijks': return 'M';
          default: return g.charAt(0).toUpperCase();
        }
      }).join('+');

      planning[dateKey][assignment.box_id] = {
        assignment_id: assignment.assignment_id,
        label: groupLabels || 'Task',
        color_code: assignment.box_color || '#9e9e9e',
        dentist: assignment.dentist_name,
        assistant: assignment.assistant_name,
        start_time: assignment.start_time,
        end_time: assignment.end_time,
        task_groups: groups,
        box_name: assignment.box_name,
        // keep original fields to help frontend debugging
        shift_date: assignment.shift_date,
        box_id: assignment.box_id,
      };
    });

    // Debug: log planning summary
    console.log("[getCalendarData] planning keys:", Object.keys(planning).map(k => `${k}:${Object.keys(planning[k]).length}`).join(", "));

    res.status(200).json({
      boxen: boxes,
      planning: planning,
    });
  } catch (error) {
    console.error("getCalendarData error:", error);
    res.status(500).json({
      message: "Failed to fetch calendar data",
      error: error.message
    });
  }
};

/**
 * Delete a shift assignment
 * DELETE /api/assignments/:id
 */
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Assignment ID is required" });
    }

    const deleted = await deleteShiftAssignment(id);

    if (!deleted) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("deleteAssignment error:", error);
    res.status(500).json({
      message: "Failed to delete assignment",
      error: error.message
    });
  }
};
