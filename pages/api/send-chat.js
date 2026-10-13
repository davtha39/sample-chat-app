import { prisma } from "../../lib/prisma";

import { userAgentFromString } from 'next/server';

export default async function handler(req, res) {
    // if (req.method !== "POST") {
    //     return res.status(405).json({ error: "Method not allowed" });
    // }

    try {
        const { name, message, user_agent } = req.body;

        // if (!name || !message || !ip || !user_agent) {
        //     return res.status(400).json({ 
        //         status: 400,
        //         message: "Missing required fields" 
        //     });
        // }
        const headersList = await headers();

        const ip =
            headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
            headersList.get('x-real-ip') ||
            '127.0.0.1';
        return res.status(200).json({ip})

        await prisma.chat.create({
            data: {
                name,
                message,
                ip,
                user_agent
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
            message: "Failed to send chat" 
        });
    }
}