import { Location } from "../models/location.models.js";
import { DoesNotHaveMessage } from "./announcementNotHavingMessageController.js";
DoesNotHaveMessage;
import { HaveMessage } from "./announcementHavingMessageController.js";

/**
 * Handle the creation of an announcement.
 *
 * @param {object} bot - Telegram bot instance.
 * @param {object} msg - Telegram message object from the user.
 */
export const handleAnnouncementCreation = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;

    function isValidCommaSeparatedNumbers(input) {
      return /^[0-9]+(,[0-9]+)*$/.test(input);
    }

    function hasValidSelections(selectedNumbers, validMap) {
      return selectedNumbers.some((num) => validMap[num]);
    }

    await bot.sendMessage(
      chatId,
      `Great! 🎉 Let’s share your message with the right audiences!`
    );

    await bot.sendMessage(
      chatId,
      `First, let’s choose the tags that describe whom you’re trying to reach. This helps us find the most relevant communities.`
    );

    const regionMap = {
      1: "North India",
      2: "West India",
      3: "South India",
      4: "East India",
      5: "Central India",
      6: "South-East India",
      7: "North-West India",
    };

    // Update the validation function to ignore spaces and validate properly
    function isValidCommaSeparatedNumbersForRegions(input) {
      return /^[0-9]+(,[0-9]+)*$/.test(input);
    }

    // Processing the input
    await bot.sendMessage(
      chatId,
      `Please select the region you want to reach by entering the corresponding numbers (comma separated): \n\n1 - North India\n2 - West India\n3 - South India\n4 - East India\n5 - Central India\n6 - South-East India\n7 - North-West India`
    );

    let response = await waitForMessage(bot, chatId);

    // Keep asking for valid input if necessary
    while (!isValidCommaSeparatedNumbersForRegions(response.text)) {
      await bot.sendMessage(
        chatId,
        "Invalid input. Please enter the corresponding numbers as comma-separated values (e.g., 1,2,3)."
      );
      response = await waitForMessage(bot, chatId);
    }

    // Process the valid input
    const selectedNumbers = response.text
      .split(",")
      .map((num) => parseInt(num.trim(), 10)); // Trim any extra spaces around the numbers

    console.log(selectedNumbers);

    // Validate selections against regionMap
    if (!hasValidSelections(selectedNumbers, regionMap)) {
      await bot.sendMessage(
        chatId,
        "Invalid selection. Please select at least one valid region."
      );
      return;
    }

    // Map selected numbers to corresponding regions
    const selectedRegions = selectedNumbers
      .map((number) => regionMap[number])
      .filter(Boolean);

    // Fetch categories based on selected regions
    const categories = await Location.find({
      region: { $in: selectedRegions },
    });
    console.log(categories);

    let citiesMessage = `Please select the cities you want to target by entering the corresponding numbers (comma separated):\n`;
    let cityMap = {};
    let cityCounter = 1;

    categories.forEach((category) => {
      citiesMessage += `\nRegion: ${category.region}\n`;
      category.cities.forEach((city) => {
        citiesMessage += `${cityCounter} - ${city}\n`;
        cityMap[cityCounter] = city;
        cityCounter++;
      });
    });

    await bot.sendMessage(chatId, citiesMessage);
    console.log(cityMap, citiesMessage);

    let cityResponse = await waitForMessage(bot, chatId);

    while (!isValidCommaSeparatedNumbers(cityResponse.text)) {
      await bot.sendMessage(
        chatId,
        "Invalid input. Please enter the corresponding numbers as comma-separated values (e.g., 1,3,5)."
      );
      cityResponse = await waitForMessage(bot, chatId);
    }

    const selectedCityNumbers = cityResponse.text
      .split(",")
      .map((num) => parseInt(num.trim(), 10));

    if (!hasValidSelections(selectedCityNumbers, cityMap)) {
      await bot.sendMessage(
        chatId,
        "Invalid selection. Please select at least one valid city."
      );
      return;
    }

    const selectedCities = selectedCityNumbers
      .map((number) => cityMap[number])
      .filter(Boolean);

    console.log("Selected cities:", selectedCities);

    function isValidNumberList(input, validNumbers) {
      const numbers = input.split(",").map((num) => parseInt(num.trim(), 10));
      const hasValid = numbers.some((num) => validNumbers.includes(num));
      return hasValid;
    }

    const audienceCategoryMap = {
      1: "Developers",
      2: "Traders",
      3: "Investors",
      4: "Gamers",
      5: "Artists/Creators",
      6: "Non-Tech Enthusiasts",
      7: "Students/Learners",
      8: "Entrepreneurs",
      9: "Content Creators/Influencers",
      10: "Legal & Compliance",
      11: "Financial Professionals",
      12: "Tech Enthusiasts",
      13: "DAO Members",
      14: "Community Builders",
      15: "Privacy Advocates",
      16: "Researchers",
      17: "NFT Collectors",
      18: "Metaverse Enthusiasts",
    };

    const validCategoryNumbers = Object.keys(audienceCategoryMap).map(Number);

    await bot.sendMessage(
      chatId,
      `Please select the categories you want to target by entering the corresponding numbers (comma separated):\n\n  1 - Developers\n  2 - Traders\n  3 - Investors\n  4 - Gamers\n  5 - Artists/Creators\n  6 - Non-Tech Enthusiasts\n  7 - Students/Learners\n  8 - Entrepreneurs\n  9 - Content Creators/Influencers\n10 - Legal & Compliance\n11 - Financial Professionals\n12 - Tech Enthusiasts\n13 - DAO Members\n14 - Community Builders\n15 - Privacy Advocates\n16 - Researchers\n17 - NFT Collectors\n18 - Metaverse Enthusiasts`
    );

    let categoryResponse = await waitForMessage(bot, chatId);

    while (!isValidNumberList(categoryResponse.text, validCategoryNumbers)) {
      await bot.sendMessage(
        chatId,
        "Invalid input. Please enter at least one valid number (e.g., 1,2,3)."
      );
      categoryResponse = await waitForMessage(bot, chatId);
    }

    const selectedCategoryNumbers = categoryResponse.text
      .split(",")
      .map((num) => parseInt(num.trim(), 10));

    const selectedCategories = selectedCategoryNumbers
      .filter((number) => validCategoryNumbers.includes(number))
      .map((number) => audienceCategoryMap[number]);

    if (!selectedCategories || selectedCategories.length === 0) {
      await bot.sendMessage(
        chatId,
        "No valid categories were selected. Please try again."
      );
      return;
    }

    console.log("User selected categories:", selectedCategories);

    await bot.sendMessage(
      chatId,
      `You want to make announcment in ${selectedCities.join(
        ", "
      )} for ${selectedCategories.join(", ")}.`
    );

    await bot.sendMessage(
      chatId,
      `How would you like to proceed? Please reply with:\n\n` +
        `1 - I have my own strutured message with link (without image).\n` +
        `2 - I would like to construct announcement message here by proceeding.`
    );

    let choiceResponse = await waitForMessage(bot, chatId);

    if (choiceResponse.text.trim() === "1") {
      HaveMessage(selectedCities, selectedCategories, bot, msg);
    } else if (choiceResponse.text.trim() === "2") {
      await bot.sendMessage(
        chatId,
        `Let's construct a announcement message for you...`
      );
      DoesNotHaveMessage(selectedCities, selectedCategories, bot, msg);
    } else {
      await bot.sendMessage(
        chatId,
        `Invalid choice. Please reply with 1 to preview or 2 to proceed.`
      );
    }
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
