import TelegramBot from "node-telegram-bot-api";
import config from "../config/config.js";
import * as announcementController from "../controllers/announcementController.js";
import * as communityController from "../controllers/communityController.js";
import * as startController from "../controllers/startController.js";
import { isBotAdminInGroup } from "../services/adminService.js";
import { handleOnBoardCommunity } from "../controllers/onBoardCommunityController.js";
import { handlePreviewAnnouncement } from "../controllers/previewController.js";
import { myAnnouncements } from "../controllers/myAnnouncmentController.js";
import { myCommunity } from "../controllers/myCommunityController.js";
import { handleHelp } from "../controllers/helpController.js";
import { setupReactionHandler } from "../controllers/privateGroupController.js";

// Initialize the bot in webhook mode
const bot = new TelegramBot(config.BOT_TOKEN, { webHook: true });

// Set the webhook URL
bot.setWebHook(`${config.WEBHOOK_URL}/api/telegram-webhook`);

// Export the handler for Vercel to process incoming webhook requests
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Process the update sent from Telegram
    bot.processUpdate(req.body);
    res.status(200).json({ status: 'Webhook processed' });
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Set the bot commands
const commands = [
  { command: "start", description: "Start the bot" },
  { command: "help", description: "List available commands" },
  { command: "create_announcement", description: "Create an announcement" },
  { command: "add_community", description: "Add a community" },
  { command: "my_announcements", description: "View my announcements" },
  { command: "my_community", description: "View my community" },
  { command: "list_communities", description: "List all communities", adminOnly: true },
];

bot.setMyCommands(commands).then(() => console.log("Commands set successfully"));

// Example event handlers for different bot commands and messages
bot.onText(/\/start/, (msg) => startController.handleStart(bot, msg));
bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
bot.onText(/\/create_announcement/, (msg) => announcementController.handleAnnouncementCreation(bot, msg));
bot.onText(/\/add_community/, (msg) => communityController.handleBotInvite(bot, msg));
bot.onText(/\/preview/, (msg) => handlePreviewAnnouncement(bot, msg));
bot.onText(/\/my_announcements/, (msg) => myAnnouncements(bot, msg));
bot.onText(/\/my_community/, (msg) => myCommunity(bot, msg));

// Handle general messages, such as when the bot is added to a group
bot.on("message", async (msg) => {
  if (msg.new_chat_members) {
    const newMembers = msg.new_chat_members;
    const botInfo = await bot.getMe();

    // Check if the bot has been added to a group
    const botAdded = newMembers.some((member) => member.id === botInfo.id);

    if (botAdded) {
      const isBotAdmin = await isBotAdminInGroup(bot, msg.chat.id);

      if (isBotAdmin) {
        await bot.sendMessage(msg.chat.id, "Hello! I'm fully functional as I have admin permissions. Thanks for inviting me!");
      } else {
        await bot.sendMessage(msg.chat.id, `Please promote me to an admin in this group to function fully.`);
      }
    }
  }
});

// Set up callback query handlers (e.g., button interactions)
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data;

  if (data === "check_admin") {
    const isAdmin = await isBotAdminInGroup(bot, msg.chat.id);
    if (isAdmin) {
      await bot.sendMessage(msg.chat.id, "I’m all set up as an admin in your group!");
      handleOnBoardCommunity(bot, msg);
    } else {
      await bot.answerCallbackQuery(callbackQuery.id, { text: "Please make me an admin to fully set up." });
    }
  }
});

// Add any additional event listeners as needed
setupReactionHandler(bot);
