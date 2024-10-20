import { Announcment } from "../models/Announcement.js";

export const myAnnouncements = async (bot, msg) => {
  const chatId = msg.chat.id;

  const allAnnouncements = await Announcment.find({ userId: chatId }).sort({
    _id: -1,
  });

  if (allAnnouncements.length === 0) {
    await bot.sendMessage(chatId, `You have no announcements.`);
    return;
  }

  let totalAnnouncements = allAnnouncements.length;
  let approvedAnnouncements = 0;
  let pendingAnnouncements = 0;
  let rejectedAnnouncements = 0;
  let pendingRefunds = 0;
  let lastTwoApproved = [];
  let lastTwoPending = [];

  allAnnouncements.forEach((announcement) => {
    const { status, paymentConfirmation } = announcement;

    switch (status) {
      case "circulated":
        // Approved announcements are those that are circulated
        approvedAnnouncements++;
        if (lastTwoApproved.length < 2) {
          lastTwoApproved.push(announcement);
        }
        break;
      case "validated":
      case "pending":
        // Validated and pending announcements are considered pending
        pendingAnnouncements++;
        if (lastTwoPending.length < 2) {
          lastTwoPending.push(announcement);
        }
        break;
      case "rejected":
        // Rejected announcements, mark for pending refunds
        rejectedAnnouncements++;
        pendingRefunds++; // Assuming rejected announcements might need refunds
        break;
    }
  });

  // Build stats message
  let announcementStats =
    `📊 *Announcement Stats:*\n\n` +
    `- Total Announcements: ${totalAnnouncements}\n` +
    `- Approved Announcements: ${approvedAnnouncements}\n` +
    `- Pending Announcements: ${pendingAnnouncements}\n` +
    `- Rejected Announcements: ${rejectedAnnouncements}\n` +
    `- Pending refunds: ${pendingRefunds}\n`;

  // Add the last two approved announcements
  if (approvedAnnouncements > 0) {
    announcementStats += `\n*Last two approved announcements:*\n`;

    lastTwoApproved.forEach((announcement, index) => {
      const communities = announcement.selectedCommunities.join(", ");
      announcementStats += `\n${index + 1}. ${
        announcement.alreadyHaveMessage
          ? announcement.alreadyHaveMessage
          : announcement.title
      }\n`;
      announcementStats += `- In ${communities}\n`;
    });
  } else if (lastTwoPending.length > 0) {
    // If no approved announcements, show last two pending announcements
    announcementStats += `\n*Last two pending announcements:*\n`;

    lastTwoPending.forEach((announcement, index) => {
      const communities = announcement.selectedCommunities.join(", ");
      announcementStats += `\n${index + 1}. ${
        announcement.alreadyHaveMessage
          ? announcement.alreadyHaveMessage
          : announcement.title
      }\n`;
      announcementStats += `- In ${communities}\n`;
    });
  } else {
    announcementStats += `\nNo pending or approved announcements available.\n`;
  }

  await bot.sendMessage(chatId, announcementStats);
};
