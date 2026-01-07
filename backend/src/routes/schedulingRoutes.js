import express from "express";
import {
  getSchedulingData,
  createBox,
  deleteBox,
} from "../controllers/SchedulingController.js";

const router = express.Router();

router.get("/scheduling-data", getSchedulingData);
router.post("/boxes", createBox);
router.delete("/boxes/:id", deleteBox);

export default router;
