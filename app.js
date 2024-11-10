import mongoose from "mongoose";
import config from "./config/config.js";
import * as communityController from "./controllers/communityController.js";
import bot from "./bot.js";

mongoose
  .connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const isAdmin = (userId) => {
  return config.BOT_ADMIN_ID === userId;
};

// bot.onText(/\/add_community/, (msg) => {
//   const userId = msg.from.id;

//   if (!isAdmin(userId)) {
//     return bot.sendMessage(
//       msg.chat.id,
//       "Unauthorized. You are not allowed to use this command."
//     );
//   }
// });

bot.onText(/\/list_communities/, async (msg) => {
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    return bot.sendMessage(
      msg.chat.id,
      "Unauthorized. You are not allowed to use this command."
    );
  }

  const communities = await communityController.listCommunities();
  let message = "Here are the onboarded communities:\n\n";

  communities.forEach((community, index) => {
    message += `${index + 1}. ${community.communityName}\n`;
    message += `  Focus: ${community.focusAreas}\n`;
    message += `  Members: ${community.totalMembers}\n`;
    message += `  Price: ${community.charges} USDT\n`;
    message += `  Wallet: ${community.walletAddress}\n`;

    if (community.cities && community.cities.length > 0) {
      message += `  Cities: ${community.cities.join(", ")}\n`;
    } else {
      message += `  Cities: N/A\n`;
    }

    message += `\n`;
  });

  bot.sendMessage(msg.chat.id, message || "No communities available.");
});

export default bot;
