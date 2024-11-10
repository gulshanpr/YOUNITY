import express from "express";
import TelegramBot from "node-telegram-bot-api";
import config from "./config/config.js";
import * as announcementController from "./controllers/announcementController.js";
import * as communityController from "./controllers/communityController.js";
import * as startController from "./controllers/startController.js";
import { isBotAdminInGroup } from "./services/adminService.js";
import { handleOnBoardCommunity } from "./controllers/onBoardCommunityController.js";
import { handlePreviewAnnouncement } from "./controllers/previewController.js";
import { myAnnouncements } from "./controllers/myAnnouncmentController.js";
import { myCommunity } from "./controllers/myCommunityController.js";
import { handleHelp } from "./controllers/helpController.js";
import { setupReactionHandler } from "./controllers/privateGroupController.js";

const app = express();

// Initialize the bot with webhook configuration
const bot = new TelegramBot(config.BOT_TOKEN, {
  webHook: true,
});

// Set the webhook URL to listen for updates from Telegram
bot.setWebHook(`${config.WEBHOOK_URL}/webhook`);

// Middleware to parse JSON for webhook updates
app.use(express.json());

// Define the webhook endpoint where Telegram will send updates
app.post("/webhook", (req, res) => {
  bot.processUpdate(req.body); // Process the update sent from Telegram
  res.sendStatus(200); // Respond with OK status to Telegram
});

// Fetch bot info (Bot's username and ID)
let botInfo = null;
try {
  const info = await bot.getMe();
  botInfo = info;
  console.log(`Bot Username: ${botInfo.username}, Bot ID: ${botInfo.id}`);
} catch (error) {
  console.error(`Error getting bot info: ${error.message}`);
}

let groupId = "";

// Set the commands available to users
const commands = [
  { command: "start", description: "Start the bot" },
  { command: "help", description: "List available commands" },
  { command: "create_announcement", description: "Create an announcement" },
  { command: "add_community", description: "Add a community" },
  { command: "my_announcements", description: "View my announcements" },
  { command: "my_community", description: "View my community" },
  {
    command: "list_communities",
    description: "List all communities",
    adminOnly: true,
  },
];

// Set the commands for the bot
bot.setMyCommands(commands).then(() => {
  console.log("Commands set successfully");
});

// Handle the /start command
bot.onText(/\/start/, async (msg) => {
  startController.handleStart(bot, msg);
});

// Handle messages where the bot is added to a group
bot.on("message", async (msg) => {
  try {
    if (msg.new_chat_members) {
      const newMembers = msg.new_chat_members;
      const botInfo = await bot.getMe();

      // Check if the bot has been added to the group
      const botAdded = newMembers.some((member) => member.id === botInfo.id);

      if (botAdded) {
        console.log("Bot has been added to a group:", msg.chat.id);
        groupId = msg.chat.id;
        const isBotAdmin = await isBotAdminInGroup(bot, msg.chat.id);

        if (isBotAdmin) {
          console.log("Bot is already an admin in the group.");
          await bot.sendMessage(
            msg.chat.id,
            "Hello! I'm fully functional as I have admin permissions. Thanks for inviting me!"
          );
        } else {
          console.log("Bot is not an admin in this group.");

          // Prompt user to make the bot an admin
          await bot.sendMessage(
            msg.chat.id,
            `To make me fully functional, please promote me to an admin in this group.`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error processing message:", error.message);
  }
});

// Setup reaction handler
setupReactionHandler(bot);

// Handle callback queries (e.g., button clicks in messages)
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;

  if (!msg) {
    console.error("Message is not defined in callbackQuery");
    return;
  }

  const chatId = groupId;
  const data = callbackQuery.data;

  console.log("Callback data:", data);
  if (data === "check_admin") {
    try {
      const isAdmin = await isBotAdminInGroup(bot, chatId);

      if (isAdmin) {
        await bot.sendMessage(
          msg.chat.id,
          `Awesome! 🎉 I’m all set up in your group and the verification is complete. Now let’s get your community listed on Younity so more people can find and engage with you. Please fill out this quick form so we can learn more about your community.`
        );

        handleOnBoardCommunity(bot, msg);
      } else {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: "The bot is not an admin in this group. Please promote the bot to an admin.",
        });
      }
    } catch (error) {
      console.error("Error checking admin status:", error.message);
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "An error occurred while checking admin status.",
      });
    }
  }
});

// Handle any polling errors (though not needed for webhook)
bot.on("polling_error", (error) =>
  console.error(`Polling error: ${error.message}`)
);

// Additional message handlers for specific commands
bot.onText(/\/create_announcement/, (msg) => {
  announcementController.handleAnnouncementCreation(bot, msg);
});

bot.onText(/\/add_community/, (msg) => {
  communityController.handleBotInvite(bot, msg);
});

bot.onText(/\/preview/, (msg) => {
  handlePreviewAnnouncement(bot, msg);
});

bot.onText(/\/my_announcements/, (msg) => {
  myAnnouncements(bot, msg);
});

bot.onText(/\/my_community/, (msg) => {
  myCommunity(bot, msg);
});

bot.onText(/\/help/, (msg) => {
  handleHelp(bot, msg);
});

// Handle the /membercount command (returns the number of members in a group)
bot.onText(/\/membercount/, async (msg) => {
  const groupId = "-1002387804281"; // Replace with the actual group ID
  const memberCount = await bot.getChatMemberCount(groupId);
  console.log(`Number of members in chat: ${memberCount}`);
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default bot;
