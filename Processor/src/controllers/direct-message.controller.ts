import { Request, Response } from "express";
import { db } from "../lib/db";
import { redis } from "../lib/redis";

export const createDirectMessage = async (req: Request, res: Response) => {
    try {

        const { content, fileUrl, userId, memberId } = await req.body
        const { conversationId } = req.query

        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        if (!content) return res.status(400).json({ error: "Content missing" });
        const conversation = await db.conversation.findFirst({
            where: {
                id: conversationId as string,
                OR: [
                    { memberOneId: memberId },
                    { memberTwoId: memberId }
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
            type: "CREATE",
            message: {
                content,
                fileUrl: "file",
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
        console.log(content)
        await redis.publish("direct-message", JSON.stringify(item))
        console.log("to redis")
        return res.status(200).json("message");
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal Error" });
    }
}

export const deleteDirectMessage = async (req: Request, res: Response) => {

    try {
        const { content } = req.body;
        const { id } = req.params
        const { userId, conversationId } = req.query;
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

        const item = message = await db.directMessage.update({
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

        // const updateKey = `chat:${conversationId as string}:messages:update`;
        await redis.publish('channel-message', JSON.stringify({ ...item, type: "MODIFY" }));

        // res.socket.server.io.emit(updateKey, message)

        return res.status(200).json("messae");

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}



export const updateDirectMessage = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const { id } = req.params
        const { userId, conversationId } = req.query;
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

        const canModify = message.memberId === member?.id
        console.log(message.memberId, member?.id)
        if (!canModify) return res.status(401).json({ error: "Unauthorized" })

        const { memberId, member: messageMember } = message
        const item = {
            address: conversation.id,
            type: "MODIFY",
            message: {
                id:message.id,
                content,
                fileUrl: "file",
                conversationId: conversation.id,
                memberId: memberId,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                member: {
                    id: messageMember.id,
                    userId: userId as string,
                    role: messageMember.role,
                    serverId: messageMember.serverId,
                    user: {
                        id: messageMember.userId,
                        name: messageMember.user.name,
                        avatar: messageMember.user.avatar
                    }
                }
            }
        }

        // const updateKey = `chat:${conversationId as string}:messages:update`;
        await redis.publish('direct-message', JSON.stringify(item));

        // res.socket.server.io.emit(updateKey, message)

        return res.status(200).json("messae");

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}