import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { generalLimiter } from "./src/middleware/loginLimiter.js";

import authRoutes from "./src/routes/authRoutes.js";
import usersRoutes from "./src/routes/usersRoutes.js";
import schedulingRoutes from "./src/routes/schedulingRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import afdelingshoofdRoutes from "./src/routes/afdelingshoofdRoutes.js";
import notificationsRoutes from "./src/routes/notificationsRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import assistantRoutes from "./src/routes/assistantRoutes.js";
import allboxesRoutes from "./src/routes/allboxesRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));
app.use(generalLimiter);
app.use(express.json({ limit: '10kb' }));

// ✅ ALWAYS start with a leading slash
app.use("/auth", authRoutes);
app.use("/api", usersRoutes);
app.use("/api", schedulingRoutes);
app.use("/api", assignmentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/assistant", allboxesRoutes);


// ✅ ADD THIS (and make sure it's BEFORE listen)
app.use("/api/afdelingshoofd", afdelingshoofdRoutes);

app.get("/", (req, res) => {
  res.send("HyCheck Backend werkt!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Er is iets misgelopen" });
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
