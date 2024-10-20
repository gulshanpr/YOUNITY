import { Announcment } from "../models/Announcement.js";
import { Community } from "../models/Community.js";
import * as paymentService from "../services/paymentService.js";
import { convertPrice } from "../services/priceConvertService.js";

export const DoesNotHaveMessage = async (cities, categories, bot, msg) => {
  try {
    const chatId = msg.chat.id;
    const selectedCities = cities;
    const selectedCategories = categories;

    const replyMarkup = {
      keyboard: [
        [{ text: "Event" }, { text: "Bounty" }],
        [{ text: "Hackathon" }, { text: "Ambassador Program" }],
        [{ text: "Other (Type your own)" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    };

    await bot.sendMessage(
      chatId,
      "Now, what type of announcement would you like to make?",
      { reply_markup: replyMarkup }
    );

    const typeMsg = await waitForMessage(bot, chatId);
    let announcementType = typeMsg.text;

    if (announcementType === "Other (Type your own)") {
      await bot.sendMessage(
        chatId,
        "Please type the announcement type you would like to make:"
      );
      const customTypeMsg = await waitForMessage(bot, chatId);
      announcementType = customTypeMsg.text;
    }

    console.log("Selected announcement type:", announcementType);

    await bot.sendMessage(
      chatId,
      "Great! Please provide a title for your announcement."
    );

    const titleMsg = await waitForMessage(bot, chatId);
    const title = titleMsg.text;

    await bot.sendMessage(
      chatId,
      "Awesome! Now, please give a brief description of your announcement."
    );
    const descriptionMsg = await waitForMessage(bot, chatId);
    const description = descriptionMsg.text;

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

    await bot.sendMessage(chatId, "Do you have any link for the announcement?");

    const linkMsg = await waitForMessage(bot, chatId);
    const link = linkMsg.text;

    const communities = await Community.find({
      cities: { $in: selectedCities },
    });

    let filterCities = communities.filter((community) =>
      community.cities.some((city) => selectedCities.includes(city))
    );

    console.log(filterCities);

    let communityList = filterCities
      .map(
        (community, index) =>
          `${index + 1}. ${community.communityName} (Price: ${
            community.charges
          } USDT)`
      )
      .join("\n");

    await bot.sendMessage(
      chatId,
      `Select the communities by number (comma separated):\n\n${communityList}`
    );

    const communityMsg = await waitForMessage(bot, chatId);
    const selectedIndexes = communityMsg.text.split(",").map(Number);

    const selectedCommunities = selectedIndexes.map(
      (index) => filterCities[index - 1]
    );

    const selectedCommunityNames = selectedCommunities.map(
      (community) => community.communityName
    );

    console.log(selectedCommunityNames);

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
      category: selectedCategories,
      type: announcementType,
      title: title,
      description: description,
      dateLocation: dateLocationArray,
      link: link,
      selectedCommunities: selectedCommunityNames,
      totalCost: totalPrice,
    });

    const totalPriceInETH = await convertPrice(totalPrice);

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
