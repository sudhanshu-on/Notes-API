import Note from "../models/notes.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.utils.js";
import ApiResponse from "../utils/apiResponse.utils.js";

const createNote = asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  const note = await Note.create({
    title,
    content,
    user: req.user,
  });

  res.status(201).json(new ApiResponse(true, note, "Note created successfully"));
});

const getNotes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const total = await Note.countDocuments({ user: req.user });

  const notes = await Note.find({ user: req.user })
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(true, { notes, total, page, limit }, "Notes retrieved successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const updatedNote = await Note.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user,
    },
    {
      $set: { title, content },
    },
    {
      returnDocument: "after",
    },
  );

  if (!updatedNote) {
    return res.status(404).json({
      message: "Note not found or not authorized",
    });
  }

  return res.json(new ApiResponse(true, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    throw new ApiError("Note not found", 404);
  }
  if (note.user.toString() !== req.user) {
    throw new ApiError("Not authorized", 401);
  }
  await Note.findByIdAndDelete(req.params.id);
  res.json(new ApiResponse(true, null, "Note deleted successfully"));
});

export { createNote, getNotes, updateNote, deleteNote };
