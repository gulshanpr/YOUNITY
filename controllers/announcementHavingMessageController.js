import { Announcment } from "../models/Announcement.js";
import { Community } from "../models/Community.js";
import * as paymentService from "../services/paymentService.js";
import { convertPrice } from "../services/priceConvertService.js";

export const HaveMessage = async (cities, category, bot, msg) => {
  try {
    const selectedCities = cities;
    const chatId = msg.chat.id;
    console.log("Selected categories:", category);

    await bot.sendMessage(
      chatId,
      `Please provide the pre contructed message you would like to send to the communities.`
    );
    const message = await waitForMessage(bot, chatId);
    const messageText = message.text;

    let dateLocationArray = [];

    while (true) {
      await bot.sendMessage(
        chatId,
        "Please enter the date and location in the following format: 'DDth Month, YYYY - Location'. If you are done, type 'no'."
      );
      const dateMsg = await waitForMessage(bot, chatId);
      const dateInput = dateMsg.text;

      if (["n", "no", "N", "NO"].includes(dateInput.trim())) {
        break;
      }

      const dateLocationParts = dateInput.split(" - ");
      if (dateLocationParts.length === 2) {
        const [date, location] = dateLocationParts;
        dateLocationArray.push({
          date: date.trim(),
          location: location.trim(),
        });
        await bot.sendMessage(
          chatId,
          `You entered: Date - ${date.trim()}, Location - ${location.trim()}`
        );
      } else {
        await bot.sendMessage(
          chatId,
          "Invalid format. Please use the format 'DDth Month, YYYY - Location'."
        );
      }
    }

    let locationArray = dateLocationArray.map((loc) => loc.location);

    console.log(dateLocationArray);

    const communities = await Community.find({
      cities: { $in: selectedCities },
    });

    let filterCities = communities.filter((community) =>
      community.cities.some((city) => selectedCities.includes(city))
    );

    console.log(filterCities);

    let communityList = communities
      .map(
        (community, index) =>
          `${index + 1}. ${community.communityName} (Price: ${
            community.charges
          } USD)`
      )
      .join("\n");

    await bot.sendMessage(
      chatId,
      `Select the communities by number (comma separated):\n\n${communityList}`
    );

    // Capture the user input
    const communityMsg = await waitForMessage(bot, chatId);
    const selectedIndexes = communityMsg.text.split(",").map(Number);

    // Map the selected indexes to the actual community objects
    const selectedCommunities = selectedIndexes.map(
      (index) => communities[index - 1]
    );

    const selectedCommunityNames = selectedCommunities.map(
      (community) => community.communityName
    );

    console.log(selectedCommunityNames); //

    const totalPrice = selectedCommunities.reduce(
      (acc, community) => acc + Number(community.charges),
      0
    );

    await bot.sendMessage(
      chatId,
      `The total cost for your announcement is: ${totalPrice} USD in ETH`
    );

    const announcement = new Announcment({
      userId: msg.from.id,
      cities: selectedCities,
      category: category,
      dateLocation: dateLocationArray,
      alreadyHaveMessage: messageText,
      selectedCommunities: selectedCommunityNames,
      totalCost: totalPrice,
    });

    const totalPriceInETH = await convertPrice(totalPrice);
    console.log("Total price in ETH:", totalPriceInETH, totalPrice);

    await paymentService.requestPayment(
      announcement,
      totalPriceInETH,
      chatId,
      bot,
      msg.from
    );
  } catch (error) {
    console.error("Error handling announcement creation:", error);
    await bot.sendMessage(
      chatId,
      "An error occurred while creating the announcement. Please try again."
    );
  }
};

/**
 * Helper function to wait for a user's response to a message.
 *
 * @param {object} bot - Telegram bot instance.
 * @param {number} chatId - Telegram chat ID.
 * @returns {Promise<object>} - Resolves with the next message from the user.
 */
const waitForMessage = (bot, chatId) => {
  return new Promise((resolve) => {
    bot.once("message", (msg) => {
      if (msg.chat.id === chatId) {
        resolve(msg);
      }
    });
  });
};
