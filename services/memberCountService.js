export const memberCount = async (bot) => {
  try {
    const groupId = "-1002387804281";
    const memberCount = await bot.getChatMemberCount(groupId);
    console.log(`Number of members in chat: ${memberCount}`);
    return memberCount;
  } catch (error) {
    console.error("Error fetching chat members count:", error);
    throw error;
  }
};
