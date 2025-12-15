import { Server, Socket } from "socket.io";

interface JoinChatPayload {
  chatId: string;
  userType: "customer" | "officer";
  userId: string;
}

export const setupChatSocket = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    socket.on("join_chat", (payload: JoinChatPayload) => {
      const { chatId } = payload;
      const roomName = `chat:${chatId}`;
      socket.join(roomName);
    });
  });
};

export const emitNewMessage = (
  io: Server,
  chatId: string,
  message: any
): void => {
  const roomName = `chat:${chatId}`;
  io.to(roomName).emit("new_message", message);
};
