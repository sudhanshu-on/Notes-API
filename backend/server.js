import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.config.js";
import authRoutes from "./routes/auth.route.js";
import notesRoutes from "./routes/notes.route.js";
import errorHandler from "./middlewares/error.middleware.js";
import { apiLimiter } from "./middlewares/ratelimiter.middleware.js";
import cors from "cors";

dotenv.config();

connectDB();

const app = express();


app.use(express.json());
app.use(cors({
  origin: "https://notes-api-iota-nine.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(apiLimiter);

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

app.use(errorHandler); //always after routes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
