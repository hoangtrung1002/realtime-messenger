import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";
import { Env } from "../config/env.config";
import { validateChatParticipants } from "../services/chat.service";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

let io: Server | null = null;
const onlineUsers = new Map<string, string>();
export const initializeSocket = (httpServer: HTTPServer) => {
  /* 
    attaches Socket.IO to existing HTTP server.
    That allows both HTTP requests and WebSocket connections on the same port.
   */
  io = new Server(httpServer, {
    cors: {
      origin: Env.FRONTEND_ORIGIN,
      methods: ["GET", "POST"], // allowed request methods
      credentials: true, // allowed cookies / authentication headers
    },
  });
  /* 
    This is middleware for every socket connection — similar to Express middleware.
        (It runs before a socket is allowed to connect.)
    this middleware runs first to check if that client is authorized.
    Whenever tries to connect via io
  */
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      /* 
        - When the socket connects, it sends a handshake request (like an HTTP request)
        that contains headers — including cookies.
        - socket.handshake.headers gives those headers.
        - Here, grab the cookie header — which might look like: accessToken=<token>
        */
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("Unauthorized"));

      const token = rawCookie?.split("=")?.[1];
      if (!token) return next(new Error("Unauthorized"));

      const decodedToken = jwt.verify(token, Env.JWT_SECRET) as {
        userId: string;
      };
      if (!decodedToken) return next(new Error("Unauthorized"));

      socket.userId = decodedToken.userId;
      next();
    } catch (error) {
      next(new Error("Internal Server error"));
    }
  });
  io.on("connection", (socket: AuthenticatedSocket) => {
    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }
    const userId = socket.userId;
    const newSocketId = socket.id;
    console.log("socket connected", { userId, newSocketId });

    // register socket for the user
    onlineUsers.set(userId, newSocketId);
    // Broadcast online users to all socket
    io?.emit("online:users", Array.from(onlineUsers.keys()));
    // create personal room for user
    socket.join(`user:${userId}`);
    socket.on(
      "chat:join",
      async (chatId: string, callback?: (err?: string) => void) => {
        try {
          await validateChatParticipants(chatId, userId);
          socket.join(`chat:${chatId}`);
          callback?.();
        } catch (error) {
          callback?.("Error joining chat");
        }
      }
    );
    socket.on("chat:leave", (chatId: string) => {
      if (chatId) {
        socket.leave(`chat:${chatId}`);
        console.log(`User ${userId} left room chat:${chatId}`);
      }
    });
    // disconnect socket and remove that user from broadcast list user online
    socket.on("disconnect", () => {
      if (onlineUsers.get(userId) === newSocketId) {
        if (userId) onlineUsers.delete(userId);
        io?.emit("online:users", Array.from(onlineUsers.keys()));
        console.log("socket disconnected", { userId, newSocketId });
      }
    });
  });
};

function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export const emitNewChatToParticipants = (
  participantIds: string[] = [],
  chat: any
) => {
  const io = getIO();
  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:new", chat);
  }
};

export const emitNewMessageToChatRoom = (
  senderId: string,
  chatId: string,
  message: any
) => {
  const io = getIO();
  const senderSocketId = onlineUsers.get(senderId);

  if (senderSocketId) {
    io.to(`chat:${chatId}`).except(senderSocketId).emit("message:new", message);
  } else {
    io.to(`chat:${chatId}`).emit("message:new", message);
  }
};
export const emitLastMessageToParticipants = (
  participantIds: string[],
  chatId: string,
  lastMessage: any
) => {
  const io = getIO();
  const payload = { chatId, lastMessage };

  for (const participantId of participantIds) {
    io.to(`user:${participantId}`).emit("chat:update", payload);
  }
};
