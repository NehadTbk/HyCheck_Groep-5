import express from "express";
import db from "../config/db.js";

const router = express.Router();

// Temporary endpoint to fix the shift_assignments constraint
router.post("/fix-shift-constraint", async (req, res) => {
  try {
    const results = [];

    // Step 1: Drop the foreign key constraint
    try {
      console.log("Step 1: Attempting to drop shift_assignments_ibfk_1 constraint...");
      await db.query("ALTER TABLE shift_assignments DROP FOREIGN KEY shift_assignments_ibfk_1");
      console.log("✅ Successfully dropped shift_assignments_ibfk_1 constraint");
      results.push("Dropped foreign key constraint");
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log("⚠️ Constraint doesn't exist");
        results.push("Constraint doesn't exist (already removed)");
      } else {
        throw error;
      }
    }

    // Step 2: Check if shift_id column exists and drop it
    try {
      console.log("Step 2: Checking if shift_id column exists...");
      const [columns] = await db.query("SHOW COLUMNS FROM shift_assignments LIKE 'shift_id'");

      if (columns.length > 0) {
        console.log("Step 3: Dropping shift_id column...");
        await db.query("ALTER TABLE shift_assignments DROP COLUMN shift_id");
        console.log("✅ Successfully dropped shift_id column");
        results.push("Dropped shift_id column");
      } else {
        console.log("⚠️ shift_id column doesn't exist");
        results.push("shift_id column doesn't exist");
      }
    } catch (error) {
      console.error("❌ Error dropping column:", error.message);
      results.push("Error dropping column: " + error.message);
    }

    res.status(200).json({
      success: true,
      message: "Migration completed",
      results: results
    });
  } catch (error) {
    console.error("❌ Migration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to run migration",
      error: error.message
    });
  }
});

export default router;
