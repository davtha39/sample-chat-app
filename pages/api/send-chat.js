import { prisma } from "../../lib/prisma";

export default async function handler(req, res) {
    try {
        const { name, message, ip, user_agent } = req.body;

        if (!name || !message || !ip || !user_agent) {
            return res.status(400).json({ 
                status: 400,
                message: "Missing required fields" 
            });
        }

        await prisma.chats.create({
            data: {
                name,
                message,
                ip,
                userAgent: user_agent
            },
        });

        return res.status(200).json({ 
            status: 200,
            message: "Chat sent successfully" 
        });
    } catch (error) {
        console.error("Error sending chat:", error);
        return res.status(500).json({ 
            status: 500,
            message: "Failed to send chat" ,
            error: error.message
        });
    }
}