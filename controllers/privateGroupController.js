import { Announcment } from "../models/Announcement.js";
import { memberCount } from "../services/memberCountService.js";
import { likeLength } from "../services/votesService.js";
import { messageTracker } from "./../services/messageTrackingService.js";

export const sendAnnouncmentInCommunityGroup = async (bot, hash) => {
  try {
    const groupId = "-1002387804281";

    const msg = await Announcment.findOne({ transactionHash: hash });
    console.log("Announcement to send:", msg);

    if (!msg) {
      console.error("No announcement found with hash:", hash);
      return;
    }

    let messageToSend = "";
    if (!msg.alreadyHaveMessage) {
      if (msg.dateLocation.length > 0) {
        if (msg.dateLocation.length > 1) {
          const dataLocationMapping = msg.dateLocation
            .map((item) => `${item.date} - ${item.location}`)
            .join("\n");
          messageToSend = `${msg.title}\n${msg.description}\n${msg.link}`;
        } else {
          messageToSend = `${msg.title}\n${msg.description}\n${msg.link}`;
        }
      } else {
        messageToSend = `${msg.title}\n${msg.description}\n${msg.link}`;
      }
    } else {
      if (msg.dateLocation.length > 0) {
        if (msg.dateLocation.length > 1) {
          const dataLocationMapping = msg.dateLocation
            .map((item) => `${item.date} - ${item.location}`)
            .join("\n");
          messageToSend = `${msg.alreadyHaveMessage}`;
        } else {
          messageToSend = `${msg.alreadyHaveMessage}`;
        }
      } else {
        messageToSend = `${msg.alreadyHaveMessage}`;
      }
    }

    messageTracker.storeMessage(hash.substring(0, 8), messageToSend);

    const likeCallback = `l_${hash.substring(0, 8)}`;
    const dislikeCallback = `d_${hash.substring(0, 8)}`;

    const sentMessage = await bot.sendMessage(groupId, messageToSend, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "👍", callback_data: likeCallback },
            { text: "👎", callback_data: dislikeCallback },
          ],
        ],
      },
    });

    console.log("Message sent successfully:", sentMessage.message_id);

    msg.messageId = sentMessage.message_id;
    await msg.save();

    return sentMessage;
  } catch (error) {
    console.error("Error sending announcement:", error);
    throw error;
  }
};

export const setupReactionHandler = (bot) => {
  bot.on("callback_query", async (query) => {
    try {
      const chatId = query.message.chat.id;
      const messageId = query.message.message_id;
      const [action, shortHash] = query.data.split("_");
      const userId = query.from.id.toString();

      const announcement = await Announcment.findOne({
        transactionHash: { $regex: new RegExp(`^${shortHash}`) },
      });

      const originalMessage = messageTracker.getMessage(shortHash);

      if (!announcement) {
        // await bot.answerCallbackQuery(query.id, {
        //   text: "Announcement not found",
        //   show_alert: true,
        // });
        return;
      }

      if (announcement.status === "circulated") {
        await bot.answerCallbackQuery(query.id, {
          text: "This announcement has already been approved and circulated",
          show_alert: true,
        });
        return;
      }

      const hasLiked = announcement.likes.some(
        (like) => like.userId === userId
      );
      const hasDisliked = announcement.dislikes.some(
        (dislike) => dislike.userId === userId
      );

      if (hasLiked || hasDisliked) {
        // If user tries to like when they've already liked
        if (action === "l" && hasLiked) {
          await bot.answerCallbackQuery(query.id, {
            text: "You have already liked this announcement",
            show_alert: true,
          });
          return;
        }

        // If user tries to dislike when they've already disliked
        if (action === "d" && hasDisliked) {
          await bot.answerCallbackQuery(query.id, {
            text: "You have already disliked this announcement",
            show_alert: true,
          });
          return;
        }

        // If user tries to like when they've already disliked, or vice versa
        if ((action === "l" && hasDisliked) || (action === "d" && hasLiked)) {
          await bot.answerCallbackQuery(query.id, {
            text: "You have already reacted to this announcement with a different reaction",
            show_alert: true,
          });
          return;
        }
      }

      if (action === "l") {
        await Announcment.updateOne(
          { _id: announcement._id },
          {
            $pull: { dislikes: { userId: userId } },
            $addToSet: {
              likes: {
                userId: userId,
                type: 1,
              },
            },
          }
        );

        const updatedAnnouncement = await Announcment.findById(
          announcement._id
        );
        await bot.answerCallbackQuery(query.id, {
          text: `👍 Liked! Total likes: ${updatedAnnouncement.likes.length}`,
        });

        const members = await memberCount(bot);
        const likes = await likeLength(shortHash);
        const percentage = (likes / members) * 100;
        const percentageRoundOff = Math.round(percentage);

        if (
          percentageRoundOff >= 50 &&
          updatedAnnouncement.status !== "circulated"
        ) {
          console.log("Announcement has been approved");

          const chatIds = ["-4530450065", "-4524819557"];

          for (const chatId of chatIds) {
            await bot.sendMessage(chatId, originalMessage);
            console.log(`Message sent to chat: ${chatId}`);
          }

          await Announcment.updateOne(
            { _id: announcement._id },
            { $set: { status: "circulated" } }
          );
        }
      } else if (action === "d") {
        await Announcment.updateOne(
          { _id: announcement._id },
          {
            $pull: { likes: { userId: userId } },
            $addToSet: {
              dislikes: {
                userId: userId,
                type: 1,
              },
            },
          }
        );

        const updatedAnnouncement = await Announcment.findById(
          announcement._id
        );
        await bot.answerCallbackQuery(query.id, {
          text: `👎 Disliked! Total dislikes: ${updatedAnnouncement.dislikes.length}`,
        });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      await bot.answerCallbackQuery(query.id, {
        text: "An error occurred while processing your reaction",
        show_alert: true,
      });
    }
  });
};
