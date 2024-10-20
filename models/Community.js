import mongoose from "mongoose";

const CommunitySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  communityId: { type: String, required: true },
  communityName: { type: String, required: true },
  focusAreas: { type: String, required: true },
  totalMembers: { type: String, required: true },
  charges: { type: String, required: true, default: "0" },
  walletAddress: { type: String, required: true },
  telegramUrl: { type: String, required: true },
  groupUsername: { type: String, required: true },
  region: {
    type: String,
    required: true,
  },
  cities: [
    {
      type: String,
      required: true,
    },
  ],
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "not_added", enum: ["not_added", "added"] },
});

export const Community = mongoose.model("Community", CommunitySchema);
