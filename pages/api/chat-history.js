import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    const chats = await prisma.chats.findMany({
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    const messages = chats.map((chat) => ({
      id: `${chat.createdAt.getTime()}-${chat.id}`,
      user: chat.name,
      text: chat.message,
      at: chat.createdAt.getTime(),
    }));

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({
      status: 500,
      message: "Failed to fetch chat history",
      error: error.message,
    });
  }
}