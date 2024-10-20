export const handlePreviewAnnouncement = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, ``);
  } catch (error) {
    console.error("Error in previewing announement:", error.message);
  }
};
