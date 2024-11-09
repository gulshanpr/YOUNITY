import { Community } from "../models/Community.js";

export const handleBotInvite = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Invite me to your group",
              url: `https://t.me/communitytest123_bot?startgroup`,
            },
            {
              text: "Check if bot is an admin",
              callback_data: "check_admin",
            },
          ],
        ],
      },
    };

    await bot.sendMessage(
      chatId,
      `Hi there! 🎉 To list your community on Younity, I need to verify it first. Please add me as an admin in your Telegram group by clicking below and make sure to give me admin access.\n\nOnce done, click the "Check if Bot is Admin" button to proceed.`,
      options
    );
  } catch (error) {
    console.error("Error during adding bot to the community:", error.message);
    await bot.sendMessage(
      chatId,
      "Something went wrong during onboarding. Please try again."
    );
  }
};

export const listCommunities = async () => {
  return await Community.find();
};
