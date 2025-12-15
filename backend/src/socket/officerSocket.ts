import { Server, Socket } from "socket.io";

interface JoinOfficersPayload {
  officerId: string;
}

export const setupOfficerSocket = (io: Server): void => {
  io.on("connection", (socket: Socket) => {
    socket.on("join_officers", (payload: JoinOfficersPayload) => {
      socket.join("officers:all");
    });
  });
};

export const emitQueueChatCreated = (io: Server, chat: any): void => {
  io.to("officers:all").emit("queue_chat_created", chat);
};

export const emitQueueChatClaimed = (
  io: Server,
  chatId: string,
  officerId: string
): void => {
  io.to("officers:all").emit("queue_chat_claimed", { chatId, officerId });
};
