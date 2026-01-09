import express from "express";
import {
  getSchedulingData,
  createBox,
  deleteBox,
} from "../controllers/SchedulingController.js";
import { createAssignments, getCalendarData } from "../controllers/assignmentController.js";

const router = express.Router();

router.get("/scheduling-data", getSchedulingData);
router.get("/calendar", getCalendarData);
router.post("/assignments", createAssignments);
router.post("/boxes", createBox);
router.delete("/boxes/:id", deleteBox);

export default router;
