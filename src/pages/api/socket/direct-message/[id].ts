import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiResponseServerIo } from "../io";


const handler = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (req.method !== "DELETE" && req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const { content } = req.body;
        const { id, userId, conversationId } = req.query;
        const user = await db.user.findUnique({
            where: {
                id: userId as string
            }
        })
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        const conversation = await db.conversation.findUnique({
            where: {
                id: conversationId as string
            },
            include: {
                memberOne: true,
                memberTwo: true
            }
        })

        if (!conversation) return res.status(404).json({ error: "conversation not found" });


        let message = await db.directMessage.findFirst({
            where: {
                id: id as string,
                conversationId: conversationId as string,
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

        const member = await db.member.findFirst({
            where: {
                userId: user.id
            }
        })
        const canModify = message.memberId !== member?.id

        if (!canModify) return res.status(401).json({ error: "Unauthorized" })

        if (req.method === "DELETE") {

            message = await db.directMessage.update({
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
            message = await db.directMessage.update({
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

        const updateKey = `chat:${conversationId as string}:messages:update`;

        res.socket.server.io.emit(updateKey, message)

        return res.status(200).json(message);

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}


export default handler