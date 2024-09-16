import { Request, Response } from "express";
import { db } from "../lib/db";
import { redis } from "../lib/redis";
import { createId } from "@paralleldrive/cuid2";
import { ROLE } from "@prisma/client";




export const createMessage = async (req: Request, res: Response) => {
    try {
        const { content, userId, memberId } = req.body;
        const { serverId, channelId } = req.query;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });
        if (!memberId) return res.status(401).json({ error: 'Unauthorized' });
        if (!serverId) return res.status(400).json({ error: 'Server ID missing' });
        if (!channelId) return res.status(400).json({ error: 'Channel ID missing' });
        if (!content) return res.status(400).json({ error: 'Content missing' });

        const server = await db.server.findFirst({
            where: {
                id: serverId as string,
                Member: {
                    some: {
                        id: memberId as string
                    }
                },
                Channel: {
                    some: { id: channelId as string }
                }
            },
            include: {
                Member: {
                    where: {
                        id: memberId as string,
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },

                    }
                }
            }
        });

        if (!server) return res.status(404).json({ message: 'Server not found' });

        const member = server.Member[0];
        const { role, user } = member;

        const item = {
            type: "CREATE",
            address: channelId as string,
            message: {
                content,
                id: createId(),
                fileUrl: null,
                channelId: channelId as string,
                memberId: memberId as string,
                createdAt: new Date(),
                updatedAt: new Date(),
                member: {
                    id: memberId,
                    userId: userId as string,
                    role,
                    serverId: serverId as string,
                    user: {
                        id: userId,
                        name: user.name,
                        avatar: user.avatar,
                    },
                },
            },
        };

        await redis.publish('channel-message', JSON.stringify(item));

        return res.status(200).json('message');
    } catch (error) {
        console.log('[MESSAGES_POST]', error);
        return res.status(500).json({ message: 'Internal Error' });
    }
}


export const deleteMessage = async (req: Request, res: Response) => {
    try {
        // const { content } = req.body;
        const { id } = req.params
        const { serverId, channelId, userId } = req.query;
        console.log(id, serverId, channelId, userId);
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
                },
                Channel: {
                    some: {
                        id: channelId as string
                    }
                }
            },
            include: {
                Member: true,
            }
        })

        if (!server) return res.status(404).json({ error: "Server not found" })

        const member = server.Member.find((member) => member.userId === userId as string);

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

        const item = await db.message.update({
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



        // const updateKey = `chat:${channelId}:messages:update`;


        await redis.publish('channel-message', JSON.stringify({ ...item, type: "MODIFY" }));

        return res.status(200).json("message");

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}


export const updateMessage = async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const { id } = req.params
        const { serverId, channelId, userId } = req.query;

        const user =await db.user.findFirst({
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

        const isMessageOwner = message.memberId === server.Member[0].id;
        const isAdmin = server.Member[0].role === ROLE.ADMIN;
        const isModerator = server.Member[0].role === ROLE.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;

        if (!canModify) return res.status(401).json({ error: "Unauthorized" })

        // if (!isMessageOwner) {
        //     return res.status(401).json({ error: "Unauthorized" });
        // }

        

        let { id: memberId ,role,userId:messageUserId} = message.member

        const item = {
            type: "MODIFY",
            address: channelId as string,
            message: {
                content,
                id: message.id,
                fileUrl: null,
                channelId: channelId as string,
                memberId: memberId as string,
                createdAt: message.createdAt,
                updatedAt: new Date(Date.now()),

                member: {
                    id: memberId,
                    userId: messageUserId as string,
                    role: role,
                    serverId: serverId as string,
                    user: {
                        id: messageUserId,
                        name: user.name,
                        avatar: user.avatar,
                    },
                },
            },
        };

        // const updateKey = `chat:${channelId}:messages:update`;
        await redis.publish('channel-message', JSON.stringify(item));

        // res.socket.server.io.emit(updateKey, message)

        return res.status(200).json("message");

    } catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
}