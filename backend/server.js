import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import usersRoutes from "./src/routes/usersRoutes.js";
import schedulingRoutes from "./src/routes/schedulingRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/api", usersRoutes);
app.use("/api", schedulingRoutes);

app.get("/", (req, res) => {
  res.send("HyCheck Backend werkt!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Er is iets misgegaan!" });
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
