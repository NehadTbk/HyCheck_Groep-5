import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from ".routes/authRoutes.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => res.send("HyCheck Backend werkt!"));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({message: "Er is iets misgegaan!"});
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT}`);
});