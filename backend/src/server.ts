import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { initializeSocket } from "./socket";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

initializeSocket(io);

export { httpServer, io };
