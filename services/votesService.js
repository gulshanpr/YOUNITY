import { Announcment } from "../models/Announcement.js";

export const likeLength = async (shortHash) => {
  try {
    const announcement = await Announcment.findOne({
      transactionHash: { $regex: new RegExp(`^${shortHash}`) },
    });

    if (announcement) {
      const likesCount = announcement.likes.length;
      const dislikesCount = announcement.dislikes.length;

      console.log(`Likes: ${likesCount}, Dislikes: ${dislikesCount}`);

      return likesCount;
    } else {
      console.log("Announcement not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching announcement stats:", error);
    throw error;
  }
};
