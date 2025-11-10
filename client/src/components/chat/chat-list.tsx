import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../ui/spinner";
import ChatListHeader from "./chat-list-header";
import ChatListItem from "./chat-list-item";

const ChatList = () => {
  const navigate = useNavigate();
  const { fetchChats, chats, isChatsLoading } = useChat();
  const { user } = useAuth();
  const currentUserId = user?._id || null;
  const [searchQuery, setSearchQuery] = useState("");
  const filteredChats = chats?.filter(
    (chat) =>
      chat.groupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.participants?.some(
        (p) =>
          p._id !== currentUserId &&
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);
  const onRoute = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="fixed inset-y-0 px-2 lg:pb-2 lg:max-w-[379px] lg:block border-r border-border bg-sidebar max-w-[calc(100%-40px)] w-full left-10 z-98">
      <div className="flex-col">
        <ChatListHeader onSearch={setSearchQuery} />
        <div className="flex-1 h-[calc(100vh-100px)] overflow-y-auto">
          <div className="px-2 pb-10 pt-1 space-y-1">
            {isChatsLoading ? (
              <div className="flex items-center justify-center">
                <Spinner className="w-7 h-7" />
              </div>
            ) : filteredChats?.length === 0 ? (
              <div className="flex items-center justify-center">
                {searchQuery ? "No chats found" : "No chats created"}
              </div>
            ) : (
              filteredChats?.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  currentUserId={currentUserId}
                  chat={chat}
                  onClick={() => onRoute(chat._id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
