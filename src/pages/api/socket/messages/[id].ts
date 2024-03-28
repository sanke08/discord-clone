import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";
import { NextApiRequest } from "next";
import { NextApiResponseServerIo } from "../io";


const handler = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const { content } = req.body;
        const { id, serverId, channelId,userId } = req.query;
        const user = db.user.findUnique({
            where: {
                id: userId as string 
            }
        })
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        if (!serverId) return res.status(400).json({ error: "Server ID missing" })

        if (!channelId) return res.status(400).json({ error: "Channel ID missing" })

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                Member: {
                    some: {
                        userId: userId as string 
                    }
                }
            },
            include: {
                Member: true,
            }
        })

        if (!server) return res.status(404).json({ error: "Server not found" })
        const channel = await db.channel.findFirst({
            where: {
                id: channelId as string,
                serverId: serverId as string,
            },
        });

        if (!channel) return res.status(404).json({ error: "Channel not found" })
        const member = server.Member.find((member) => member.userId === userId as string );


        if (!member) return res.status(404).json({ error: "Member not found" })

        let message = await db.message.findFirst({
            where: {
                id: id as string,
                channelId: channelId as string,
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        })

        if (!message || message.deleted) return res.status(404).json({ error: "Message not found" })

        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === ROLE.ADMIN;
        const isModerator = member.role === ROLE.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) return res.status(401).json({ error: "Unauthorized" })

        if (req.method === "DELETE") {

            message = await db.message.update({
                where: {
                    id: id as string,
                },
                data: {
                    fileUrl: null,
                    content: "This message has been deleted.",
                    deleted: true,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                }
            })
        }

        if (req.method === "PATCH") {
            if (!isMessageOwner) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            message = await db.message.update({
                where: {
                    id: id as string,
                },
                data: {
                    content,
                },
                include: {
                    member: {
                        include: {
                            user: true,
                        }
                    }
                }
            })
        }

        const updateKey = `chat:${channelId}:messages:update`;

        res.socket.server.io.emit(updateKey, message)

        return res.status(200).json(message);

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}


export default handler