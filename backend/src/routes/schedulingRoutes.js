import express from "express";
import {
  getSchedulingData,
  createBox,
  deleteBox,
} from "../controllers/schedulingController.js";

const router = express.Router();

router.get("/scheduling-data", getSchedulingData);
router.post("/boxes", createBox);
router.delete("/boxes/:id", deleteBox);

export default router;
