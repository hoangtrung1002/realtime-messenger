import { id } from "zod/v4/locales";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import UserModel from "../models/User.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { createChatSchemaType } from "../validators/chat.validator";
import { emitNewChatToParticipants } from "../lib/socket";

export const createChatService = async (
  userId: string,
  body: createChatSchemaType
) => {
  const { groupName, isGroup, participantId, participants } = body;
  let chat;
  let allParticipantIds: string[] = [];

  //   Room chat
  if (isGroup && participants?.length && groupName) {
    allParticipantIds = [userId, ...participants];
    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: true,
      groupName,
      createdBy: userId,
    });
    // private chat
  } else if (participantId) {
    const otherUser = await UserModel.findById(participantId);
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantIds = [userId, participantId];
    const existingChat = await ChatModel.findOne({
      participants: { $all: allParticipantIds, $size: 2 }, // query exactly 2 members based on id
    }).populate("participants", "name avatar");
    if (existingChat) return existingChat;

    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: false,
      createdBy: userId,
    });
  }
  const populatedChat = await chat?.populate("participants", "name avatar");
  const participantIdStrings = populatedChat?.participants?.map((p) =>
    p._id.toString()
  );

  emitNewChatToParticipants(participantIdStrings, populatedChat);

  return chat;
};

export const getUserChatsService = async (userId: string) => {
  const chats = await ChatModel.find({
    participants: { $in: [userId] },
  })
    .populate("participants", "name avatar")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name avatar" },
    })
    .sort({ updatedAt: -1 });
  return chats;
};

export const getSingleChatService = async (chatId: string, userId: string) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: { $in: userId },
  });
  if (!chat)
    throw new BadRequestException(
      "Chat not found or you are not authorized to view this chat"
    );

  const messages = await MessageModel.find({ chatId })
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ createdAt: 1 });

  return { chat, messages };
};

export const validateChatParticipants = async (
  chatId: string,
  userId: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: { $in: [userId] },
  });
  if (!chat) throw new BadRequestException("User not a participants in chat");
  return chat;
};
