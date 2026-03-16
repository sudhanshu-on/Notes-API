import express from "express";
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
} from "../controllers/notes.controller.js";
import protect from "../middlewares/auth.middleware.js";
import validateObjectId from "../middlewares/validateObjectId.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createNoteSchema } from "../validators/notes.validator.js";

const router = express.Router();

router.get("/getNotes", protect, getNotes);
router.post("/createNote", protect, validate(createNoteSchema), createNote);
router.put("/updateNote/:id", protect, validateObjectId, updateNote);
router.delete("/deleteNote/:id", protect, validateObjectId, deleteNote);

export default router;
