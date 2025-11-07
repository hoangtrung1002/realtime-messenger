import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.config";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { sendMessageSchemaType } from "../validators/message.validator";
import {
  emitLastMessageToParticipants,
  emitNewMessageToChatRoom,
} from "../lib/socket";

export const sendMessageService = async (
  userId: string,
  body: sendMessageSchemaType
) => {
  const { chatId, content, image, replyToId } = body;
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: { $in: [userId] },
  });
  if (!chat) throw new BadRequestException("Chat not found or unauthorized");

  if (replyToId) {
    const replyMessage = await MessageModel.findOne({ _id: replyToId, chatId });
    if (!replyMessage) throw new NotFoundException("Reply message not found");
  }

  let imageUrl;
  if (image) {
    const uploadRes = await cloudinary.uploader.upload(image);
    imageUrl = uploadRes.secure_url;
  }
  const newMessage = await MessageModel.create({
    chatId,
    sender: userId,
    content,
    image: imageUrl,
    replyTo: replyToId || null,
  });
  await newMessage.populate([
    { path: "sender", select: "name avatar" },
    {
      path: "replyTo",
      select: "content image sender",
      populate: { path: "sender", select: "name avatar" },
    },
  ]);

  chat.lastMessage = newMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  // websocket emit the new message to the chat room
  emitNewMessageToChatRoom(userId, chatId, newMessage);

  // websocket emit last message to members (personal room user)
  const allParticipantIds = chat.participants.map((id) => id.toString());
  emitLastMessageToParticipants(allParticipantIds, chatId, newMessage);

  return { userMessage: newMessage, chat };
};
