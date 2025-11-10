import { useChat } from "@/hooks/use-chat";
import { useState } from "react";

const useNewChatPopover = () => {
  const { users, isUsersLoading, createChat, isCreatingChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleBack = () => resetState();

  const resetState = () => {
    setIsGroupMode(false);
    setGroupName("");
    setSelectedUsers([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    resetState();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers?.length === 0) return;
    await createChat({
      isGroup: true,
      participants: selectedUsers,
      groupName: groupName,
    });
    setIsOpen(false);
    resetState();
  };
  const handleCreateChat = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await createChat({
        isGroup: false,
        participantId: userId,
      });
      setIsOpen(false);
      resetState();
    } finally {
      setLoadingUserId(null);
      setIsOpen(false);
      resetState();
    }
  };
  return {
    toggleUserSelection,
    handleBack,
    handleOpenChange,
    handleCreateGroup,
    handleCreateChat,
    createChat,
    setIsOpen,
    setGroupName,
    setIsGroupMode,
    loadingUserId,
    users,
    isUsersLoading,
    isCreatingChat,
    isOpen,
    isGroupMode,
    groupName,
    selectedUsers,
  };
};

export default useNewChatPopover;
