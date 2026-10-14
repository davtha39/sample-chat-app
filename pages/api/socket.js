import { Server } from "socket.io";
import { prisma } from "../../lib/prisma";

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};

const MAX_MESSAGES = 100;
const MAX_TEXT_LENGTH = 500;
const MAX_NAME_LENGTH = 32;

let messages = [];

async function loadMessagesFromDB() {
  try {
    const chats = await prisma.chats.findMany({
      orderBy: { createdAt: "asc" },
      take: MAX_MESSAGES,
    });

    messages = chats.map((chat) => ({
      id: `${chat.createdAt.getTime()}-${chat.id}`,
      user: chat.name,
      text: chat.message,
      at: chat.createdAt.getTime(),
    }));
    console.log(`Loaded ${messages.length} messages from database`);
  } catch (error) {
    console.error("Error loading messages from database:", error);
    messages = [];
  }
}

export default async function socketHandler(_req, res) {
  if (!res.socket.server.io) {
    await loadMessagesFromDB();

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

      socket.on("chat:message", async (payload = {}) => {
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

        // try {
        //   await prisma.chats.create({
        //     data: {
        //       name: user,
        //       message: text,
        //       ip: "-",
        //       userAgent: "socket.io",
        //     },
        //   });
        // } catch (error) {
        //   console.error("Error saving message to database:", error);
        // }

        io.emit("chat:message", message);
      });

      socket.on("disconnect", broadcastPresence);
    });

    res.socket.server.io = io;
  }

  res.end();
}