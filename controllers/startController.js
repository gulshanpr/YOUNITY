export const handleStart = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;

    await bot.sendMessage(
      chatId,
      `Hi there! 👋 Welcome to Younity—Your Community! I'm here to help you connect with Web3 communities effortlessly.\n\n/add_community - If you want to list your community on Younity!\n/create_announcement - If you’re looking to promote.\n/my_announcements - To track your announcements.\n/my_community - Anytime to check your profile.`
    );
  } catch (error) {
    console.log("Error in start command", error);
  }
};
