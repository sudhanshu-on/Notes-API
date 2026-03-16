import { z } from "zod";

const createNoteSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  content: z
    .string()
    .min(5, "Content must be at least 5 characters")
});

export { createNoteSchema };