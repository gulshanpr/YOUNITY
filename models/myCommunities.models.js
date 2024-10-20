import mongoose from "mongoose";

const myCommunitiesSchema = new mongoose.Schema(
  {
    usersID: {
      type: String,
      required: true,
    },
    communities: [
      {
        communityID: {
          type: String,
          required: true,
        },
        communityName: {
          type: String,
          required: true,
        },
        isBotAdmin: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

export const MyCommunities = mongoose.model(
  "MyCommunities",
  myCommunitiesSchema
);
