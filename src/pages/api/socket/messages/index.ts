import { NextApiRequest } from "next";
import { db } from "@/lib/db";
import { NextApiResponseServerIo } from "../io";
import { Redis } from "ioredis"



export default async function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIo,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const redis = await new Redis(process.env.UPSTASH_REDIS_URL!)

    try {
        const { content, fileUrl, userId } = req.body;
        const { serverId, channelId } = req.query;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!serverId) return res.status(400).json({ error: "Server ID missing" });

        if (!channelId) return res.status(400).json({ error: "Channel ID missing" });

        if (!content) return res.status(400).json({ error: "Content missing" });

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                Member: {
                    some: {
                        userId: userId as string
                    }
                },
                Channel: {
                    some: {
                        id: channelId as string
                    }
                }
            },
            include: {
                Member: {
                    include: {
                        user: true
                    }
                },
            }
        });

        if (!server) return res.status(404).json({ message: "Server not found" });

        const member = server.Member.find((member) => member.userId === userId as string);

        if (!member) return res.status(404).json({ message: "Member not found" });


        const item = {
            address: channelId as string,
            message: {
                content,
                fileUrl:"file",
                channelId: channelId as string,
                memberId: member.id,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                member: {
                    id: member.id,
                    userId: userId as string,
                    role: member.role,
                    serverId: member.serverId,
                    user: {
                        id: member.userId,
                        name: member.user.name,
                        avatar: member.user.avatar
                    }
                }
            }
        }

        await redis.publish("channel-message", JSON.stringify(item))

        return res.status(200).json("message");
    } catch (error) {
        console.log("[MESSAGES_POST]", error);
        return res.status(500).json({ message: "Internal Error" });
    }
}