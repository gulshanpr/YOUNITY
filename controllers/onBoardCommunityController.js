import { Community } from "../models/Community.js";

export const handleOnBoardCommunity = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;

    // await bot.sendMessage(chatId, "Please enter your community name.");
    // const communityNameMsg = await waitForMessage(bot, chatId);
    // const communityName = communityNameMsg.text;

    // // Ask for focus areas
    // await bot.sendMessage(
    //   chatId,
    //   "Please provide the focus areas (e.g., NFTs, DeFi, etc.)"
    // );
    // const focusAreasMsg = await waitForMessage(bot, chatId);
    // const focusAreas = focusAreasMsg.text;

    // // Ask for total members count
    // await bot.sendMessage(
    //   chatId,
    //   "Please enter the number of total members in your community."
    // );
    // const membersMsg = await waitForMessage(bot, chatId);
    // const totalMembers = membersMsg.text;

    // // Ask for pricing
    // await bot.sendMessage(
    //   chatId,
    //   "Please provide your announcement pricing range."
    // );
    // const pricingMsg = await waitForMessage(bot, chatId);
    // const pricing = pricingMsg.text;

    // // Ask for the group link
    // await bot.sendMessage(
    //   chatId,
    //   "Please share your community's Telegram group link."
    // );
    // const groupLinkMsg = await waitForMessage(bot, chatId);
    // const telegramUrl = groupLinkMsg.text;

    // // Extract group username from the link
    // const groupUsername = botService.extractChatIdFromUrl(telegramUrl);

    // // Save the community data in the DB with status 'not_added'
    // const community = new Community({
    //   communityName,
    //   focusAreas,
    //   totalMembers,
    //   charges: pricing,
    //   telegramUrl,
    //   status: "not_added", // Initial status
    //   groupUsername: groupUsername,
    // });

    // await community.save();
    // await bot.sendMessage(
    //   chatId,
    //   "Your community has been saved. We'll notify you once the bot is added."
    // );

    await bot.sendMessage(
      chatId,
      `https://airtable.com/appupJgSl1Spi7t6A/pagQXADOL1oOlzTMO/form\nClick here to add details of your community. Once the form is submitted, we will get back to you shortly.`
    );
  } catch (error) {
    console.error("Error during community onboarding:", error.message);
    await bot.sendMessage(
      chatId,
      "Something went wrong during onboarding. Please try again."
    );
  }
};

// Helper function to wait for a message
const waitForMessage = (bot, chatId) => {
  return new Promise((resolve) => {
    bot.once("message", (msg) => {
      if (msg.chat.id === chatId) {
        resolve(msg);
      }
    });
  });
};

// Function to list communities
export const listCommunities = async () => {
  return await Community.find();
};
