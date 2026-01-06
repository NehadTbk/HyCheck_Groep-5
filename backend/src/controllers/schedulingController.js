import db from "../config/db.js";

const COMPANY_CONFIG = {
  openTime: "08:00",
  closeTime: "18:00",
  intervalMinutes: 30,
};

// Get de scheduling data
export const getSchedulingData = async (req, res) => {
  try {
    const [boxes] = await db.query(
      "SELECT box_id, name FROM box ORDER BY id ASC"
    );
  
    //hardcoded demo data
    const dentists = [
      "Dr. Smith",
      "Dr. Johnson",
      "Dr. Williams",
      "Dr. Brown",
      "Dr. Davis",
      "Dr. Martinez",
      "Dr. Garcia",
      "Dr. Lee",
    ];

    const assistants = [
      "Anna Martinez",
      "Sarah Wilson",
      "Emily Taylor",
      "Jessica Moore",
      "Lisa Anderson",
      "Maria Rodriguez",
    ];

    res.status(200).json({
      dentists,
      assistants,
      boxes,
      company: COMPANY_CONFIG,
    });
  } catch (error) {
    console.error("getSchedulingData:", error);
    res.status(500).json({
      message: "Kon scheduling data niet ophalen",
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
