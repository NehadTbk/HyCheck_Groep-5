import express from "express";
import { getAllUsers } from "../models/User.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

export default router;
