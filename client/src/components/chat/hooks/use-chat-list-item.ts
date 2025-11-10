import { getOtherUserAndGroup } from "@/lib/helper";
import type { ChatType } from "@/types/chat.type";

const useChatListItem = (chat: ChatType, currentUserId: string | null) => {
  const { lastMessage, createdAt } = chat;
  const { name, avatar, isGroup, isOnline } = getOtherUserAndGroup(
    chat,
    currentUserId
  );

  const getLastMessageText = () => {
    if (!lastMessage) {
      return isGroup
        ? chat.createdBy === currentUserId
          ? "Group created"
          : "You were added"
        : "Send a message";
    }
    if (lastMessage.image) return "📷 Photo";
    if (isGroup && lastMessage.sender) {
      return `${
        lastMessage.sender._id === currentUserId
          ? "You"
          : lastMessage.sender.name
      } : ${lastMessage.content}`;
    }
    return lastMessage.content;
  };
  return {
    getLastMessageText,
    name,
    avatar,
    isGroup,
    isOnline,
    createdAt,
    lastMessage,
  };
};

export default useChatListItem;
