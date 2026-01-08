import express from "express";
import {
  deleteUserById,
  getUserById,
  getUsersForRequester,
} from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Role-aware listing:
// - admin: all users
// - responsible: only assistants + dentists (no other responsibles/admins)
// - others: only self (safe fallback)
router.get("/users", authMiddleware, async (req, res) => {
  if (!req.user.permissions || !req.user.permissions.includes("USER_VIEW")) {
    return res
      .status(403)
      .json({ message: "Geen toestemming om gebruikers te bekijken" });
  }

  try {
    const users = await getUsersForRequester({
      role: req.user.role,
      id: req.user.id,
    });
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.delete("/users/:id", authMiddleware, async (req, res) => {
  if (!req.user.permissions || !req.user.permissions.includes("USER_DELETE")) {
    return res.status(403).json({
      message: "Geen toestemming om gebruiker te verwijderen",
    });
  }

  // ✅ Verantwoordelijke mag GEEN andere verantwoordelijken (of admins) verwijderen
  // (en ook niet zichzelf)
  const targetId = Number(req.params.id);
  if (Number.isNaN(targetId)) {
    return res.status(400).json({ message: "Ongeldig user id" });
  }

  if (req.user.role === "responsible" && targetId === req.user.id) {
    return res.status(403).json({ message: "Je kan jezelf niet verwijderen" });
  }

  try {
    const targetUser = await getUserById(targetId);
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (
      req.user.role === "responsible" &&
      (targetUser.role === "responsible" || targetUser.role === "admin")
    ) {
      return res.status(403).json({
        message:
          "Verantwoordelijken mogen geen andere verantwoordelijken verwijderen",
      });
    }

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
