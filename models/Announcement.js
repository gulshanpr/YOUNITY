import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  cities: [
    {
      type: String,
    },
  ],
  category: [
    {
      type: String,
    },
  ],
  type: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  dateLocation: [
    {
      date: String,
      location: String,
    },
  ],
  link: {
    type: String,
  },
  alreadyHaveMessage: {
    type: String,
  },
  selectedCommunities: [
    {
      type: String,
      required: true,
    },
  ],
  totalCost: {
    type: Number,
    default: 0,
    required: true,
  },
  transactionHash: {
    type: String,
    required: true,
  },
  paymentConfirmation: {
    type: String,
    enum: ["failed", "success", "pending"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "validated", "approved", "circulated", "rejected"],
    default: "pending",
  },
  likes: [
    {
      userId: {
        type: String,
        required: true,
      },
      type: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  dislikes: [
    {
      userId: {
        type: String,
        required: true,
      },
      type: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

export const Announcment =
  mongoose.models.Announcment ||
  mongoose.model("Announcment", announcementSchema);
