import { Server } from "socket.io";
import { setupChatSocket, emitNewMessage } from "./chatSocket";
import {
  setupOfficerSocket,
  emitQueueChatCreated,
  emitQueueChatClaimed,
} from "./officerSocket";

export const initializeSocket = (io: Server): void => {
  setupChatSocket(io);
  setupOfficerSocket(io);
};

export { emitNewMessage, emitQueueChatCreated, emitQueueChatClaimed };
