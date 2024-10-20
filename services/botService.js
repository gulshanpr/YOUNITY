import bot from "../bot.js";

const isBotInGroup = async (groupUrl) => {
  try {
    console.log(groupUrl);
    const chatId = extractChatIdFromUrl(groupUrl);
    const botInfo = await bot.getMe();

    console.log(groupUrl, chatId, botInfo, botInfo.id);
    const chatMember = await bot.getChatMember(`@+ ${chatId}`, botInfo.id);
    console.log(chatMember);
    return (
      chatMember.status === "administrator" || chatMember.status === "member"
    );
  } catch (error) {
    console.log(error);
    return false;
  }
};

// Utility function to extract chat ID from Telegram URL
const extractChatIdFromUrl = (url) => {
  let chatId;

  try {
    // Check if it's a private group or channel link (with "joinchat")
    if (url.includes("joinchat/")) {
      // Telegram doesn't expose chat_id directly for private invite links
      // You can use the joinchat hash as a reference and resolve it later (via the bot)
      chatId = url.split("joinchat/")[1];
      console.log(`Private chat invite hash extracted: ${chatId}`);
    }
    // Check if it's a public group or channel link (with @username or /c/)
    else if (url.includes("t.me/")) {
      let path = url.split("t.me/")[1];

      // Check if it contains a subpath like "/c/"
      if (path.startsWith("c/")) {
        // For "/c/" channels, there is a numeric ID followed by "/<message_id>"
        chatId = "-" + path.split("/")[1]; // Prefix it with "-"
      } else {
        // For public channels or groups, we use the group name or channel name directly
        chatId = path.split("/")[0]; // First part before any slash
        console.log(`Public group or channel ID extracted: ${chatId}`);
      }
    } else {
      throw new Error("Invalid Telegram URL");
    }
  } catch (error) {
    console.error(`Failed to extract chat ID: ${error.message}`);
    return null;
  }

  return chatId;
};

export { isBotInGroup, extractChatIdFromUrl };
