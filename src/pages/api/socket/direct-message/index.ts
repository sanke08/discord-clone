import { NextApiResponseServerIo } from "../io";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { NextApiRequest } from "next";


const handler = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {

        const { content, fileUrl, userId } = await req.body
        const { conversationId } =  req.query

        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        if (!content) return res.status(400).json({ error: "Content missing" });
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    {
                        memberOne: {
                            userId
                        }
                    },
                    {
                        memberTwo: {
                            userId
                        }
                    }
                ]
            },
            include: {
                memberOne: {
                    include: {
                        user: true,
                    }
                },
                memberTwo: {
                    include: {
                        user: true,
                    }
                }
            }
        })

        if (!conversation) return res.status(404).json({ message: "Conversation not found" });

        const member = conversation.memberOne.userId === userId as string ? conversation.memberOne : conversation.memberTwo
        if (!member) return res.status(404).json({ message: "Member not found" });

        const item = {
            address: conversation.id,
            message: {
                content,
                fileUrl:"file",
                conversationId: conversation.id,
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

        await redis.publish("direct-message", JSON.stringify(item))


        // const message = await db.directMessage.create({
        //     data: {
        //         content,
        //         fileUrl,
        //         memberId: member.id,
        //         conversationId: conversation.id
        //     },
        //     include: {
        //         member: {
        //             include: {
        //                 user: true
        //             }
        //         }
        //     }
        // })
        // const channelKey = `chat:${conversation.id}:message`
        // res.socket.server.io.emit(channelKey, message)
        return res.status(200).json("message");
    } catch (error) {
        return res.status(500).json({ message: "Internal Error" });
    }
}


export default handler