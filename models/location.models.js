import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
      unique: true,
    },
    cities: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Location = mongoose.model("Location", locationSchema);
