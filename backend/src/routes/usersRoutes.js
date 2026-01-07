import express from "express";
import { deleteUserById, getAllUsers } from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.delete("/users/:id", authMiddleware, async (req, res) => {
  if (!req.user.permissions || !req.user.permissions.includes("USER_DELETE")) {
    return res.status(403).json({
      message: "Geen toestemming om gebruiker te verwijderen"
    });
  }
  try {
    const result = await deleteUserById(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});


export default router;
