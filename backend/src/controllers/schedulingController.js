import db from "../config/db.js";
import { getAllBoxes, getAllAssistants, getAllDentists } from "../models/Assignment.js";

const COMPANY_CONFIG = {
  openTime: "08:00",
  closeTime: "18:00",
  intervalMinutes: 30,
};

// Get de scheduling data
export const getSchedulingData = async (req, res) => {
  try {
    // Get boxes from database
    const boxes = await getAllBoxes();

    // Get dentists from database
    const dentistRows = await getAllDentists();
    const dentists = dentistRows.map(d => d.username);

    // Get assistants from database
    const assistantRows = await getAllAssistants();
    const assistants = assistantRows.map(a => a.username);

    res.status(200).json({
      dentists: dentists || [],
      assistants: assistants || [],
      boxes: boxes || [],
      company: COMPANY_CONFIG,
    });
  } catch (error) {
    console.error("getSchedulingData ERROR:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      message: "Kon scheduling data niet ophalen",
      error: error.message,
    });
  }
};

// Create de box
export const createBox = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Naam is verplicht" });
    }

    const [result] = await db.query(
      "INSERT INTO boxes (name) VALUES (?)",
      [name.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      name: name.trim(),
    });
  } catch (error) {
    console.error("createBox:", error);
    res.status(500).json({ message: "Kon box niet aanmaken" });
  }
};

// Delete de box
export const deleteBox = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM boxes WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Box niet gevonden" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("deleteBox:", error);
    res.status(500).json({ message: "Kon box niet verwijderen" });
  }
};
