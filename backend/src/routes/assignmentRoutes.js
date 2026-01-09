import express from "express";
import {
  createAssignments,
  getCalendarData,
  deleteAssignment,
} from "../controllers/assignmentController.js";

const router = express.Router();

// Create shift assignments
router.post("/assignments", createAssignments);

// Get calendar data for a specific week
router.get("/calendar", getCalendarData);

// Delete a shift assignment
router.delete("/assignments/:id", deleteAssignment);

export default router;
