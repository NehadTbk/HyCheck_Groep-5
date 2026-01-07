import express from "express";
import {
  createAssignments,
  getCalendarData,
} from "../controllers/assignmentController.js";

const router = express.Router();

// Create shift assignments
router.post("/assignments", createAssignments);

// Get calendar data for a specific week
router.get("/calendar", getCalendarData);

export default router;
