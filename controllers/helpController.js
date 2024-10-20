export const handleHelp = async (bot, msg) => {
  const chatId = msg.chat.id;

  const helpMessage =
    `/start - Start the bot\n` +
    `/help - List available commands\n` +
    `/create_announcement - Create an announcement\n` +
    `/add_community - List your community on Younity\n` +
    `/my_announcements - Track your announcements\n` +
    `/my_community - Check your community profile` +
    `/list_communities - List all communities (admin only)\n`;

  await bot.sendMessage(chatId, helpMessage);
};
