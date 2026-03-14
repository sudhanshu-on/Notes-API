import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      notEmpty: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      notEmpty: true,
    },
    username: {
      type: String,
      unique: true,
      notEmpty: true,
    },
    password: {
      type: String,
      required: true,
      notEmpty: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
