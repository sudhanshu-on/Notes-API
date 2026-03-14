import express from "express";
import { createNote, getNotes, updateNote, deleteNote } from "../controllers/notes.controller.js";
import protect from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/createNote", protect, createNote);
router.put("/updateNote/:id", protect, updateNote);
router.get("/getNotes", protect, getNotes);
router.delete("/deleteNote/:id", protect, deleteNote);

export default router;