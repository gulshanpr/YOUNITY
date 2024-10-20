import Validator from "../models/Validator.js";
import Announcement from "../models/Announcement.js";

export async function initiateValidationProcess(announcementId, bot) {
  const validators = await Validator.find();
  const announcement = await Announcement.findById(announcementId).populate(
    "communities"
  );

  let approvalCount = 0;
  const approvalThreshold = Math.ceil(validators.length / 2);

  for (const validator of validators) {
    bot
      .sendMessage(
        validator.telegramId,
        `Review the announcement: Type - ${announcement.type}, Description - ${announcement.description}`
      )
      .then(() => {
        bot.once("message", (msg) => {
          if (msg.text.toLowerCase() === "approve") {
            approvalCount++;
          }

          if (approvalCount >= approvalThreshold) {
            announcement.status = "approved";
            announcement.save();
            postAnnouncementToCommunities(announcement, bot);
          }
        });
      });
  }
}

const postAnnouncementToCommunities = async (announcement, bot) => {
  for (const community of announcement.communities) {
    bot.sendMessage(
      community.telegramUrl,
      `New Announcement: ${announcement.description}`
    );
  }

  await paymentService.distributePayments(announcement);
};
