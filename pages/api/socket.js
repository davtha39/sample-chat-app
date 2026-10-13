import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const MAX_MESSAGES = 100;
const MAX_TEXT_LENGTH = 500;
const MAX_NAME_LENGTH = 32;

const messages = [];

export default function socketHandler(_req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    const broadcastPresence = () => {
      io.emit("chat:presence", io.engine.clientsCount);
    };

    io.on("connection", (socket) => {
      socket.emit("chat:history", messages);
      broadcastPresence();

      socket.on("chat:message", (payload = {}) => {
        const text =
          typeof payload.text === "string"
            ? payload.text.trim().slice(0, MAX_TEXT_LENGTH)
            : "";
        const user =
          typeof payload.user === "string" && payload.user.trim()
            ? payload.user.trim().slice(0, MAX_NAME_LENGTH)
            : "Anonymous";

        if (!text) return;

        const message = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          user,
          text,
          at: Date.now(),
        };

        messages.push(message);
        if (messages.length > MAX_MESSAGES) messages.shift();

        io.emit("chat:message", message);
      });

      socket.on("disconnect", broadcastPresence);
    });

    res.socket.server.io = io;
  }

  res.end();
}
