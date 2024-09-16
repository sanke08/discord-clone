"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMessage = exports.deleteMessage = exports.createMessage = void 0;
const db_1 = require("../lib/db");
const redis_1 = require("../lib/redis");
const cuid2_1 = require("@paralleldrive/cuid2");
const client_1 = require("@prisma/client");
const createMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, userId, memberId } = req.body;
        const { serverId, channelId } = req.query;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!memberId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!serverId)
            return res.status(400).json({ error: 'Server ID missing' });
        if (!channelId)
            return res.status(400).json({ error: 'Channel ID missing' });
        if (!content)
            return res.status(400).json({ error: 'Content missing' });
        const server = yield db_1.db.server.findFirst({
            where: {
                id: serverId,
                Member: {
                    some: {
                        id: memberId
                    }
                },
                Channel: {
                    some: { id: channelId }
                }
            },
            include: {
                Member: {
                    where: {
                        id: memberId,
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
        if (!server)
            return res.status(404).json({ message: 'Server not found' });
        const member = server.Member[0];
        const { role, user } = member;
        const item = {
            type: "CREATE",
            address: channelId,
            message: {
                content,
                id: (0, cuid2_1.createId)(),
                fileUrl: null,
                channelId: channelId,
                memberId: memberId,
                createdAt: new Date(),
                updatedAt: new Date(),
                member: {
                    id: memberId,
                    userId: userId,
                    role,
                    serverId: serverId,
                    user: {
                        id: userId,
                        name: user.name,
                        avatar: user.avatar,
                    },
                },
            },
        };
        yield redis_1.redis.publish('channel-message', JSON.stringify(item));
        return res.status(200).json('message');
    }
    catch (error) {
        console.log('[MESSAGES_POST]', error);
        return res.status(500).json({ message: 'Internal Error' });
    }
});
exports.createMessage = createMessage;
const deleteMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const { content } = req.body;
        const { id } = req.params;
        const { serverId, channelId, userId } = req.query;
        console.log(id, serverId, channelId, userId);
        const user = db_1.db.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user)
            return res.status(401).json({ error: "Unauthorized" });
        if (!serverId)
            return res.status(400).json({ error: "Server ID missing" });
        if (!channelId)
            return res.status(400).json({ error: "Channel ID missing" });
        const server = yield db_1.db.server.findFirst({
            where: {
                id: serverId,
                Member: {
                    some: {
                        userId: userId
                    }
                },
                Channel: {
                    some: {
                        id: channelId
                    }
                }
            },
            include: {
                Member: true,
            }
        });
        if (!server)
            return res.status(404).json({ error: "Server not found" });
        const member = server.Member.find((member) => member.userId === userId);
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        let message = yield db_1.db.message.findFirst({
            where: {
                id: id,
                channelId: channelId,
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        });
        if (!message || message.deleted)
            return res.status(404).json({ error: "Message not found" });
        const isMessageOwner = message.memberId === member.id;
        const isAdmin = member.role === client_1.ROLE.ADMIN;
        const isModerator = member.role === client_1.ROLE.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;
        if (!canModify)
            return res.status(401).json({ error: "Unauthorized" });
        const item = yield db_1.db.message.update({
            where: {
                id: id,
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
        });
        // const updateKey = `chat:${channelId}:messages:update`;
        yield redis_1.redis.publish('channel-message', JSON.stringify(Object.assign(Object.assign({}, item), { type: "MODIFY" })));
        return res.status(200).json("message");
    }
    catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
});
exports.deleteMessage = deleteMessage;
const updateMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const { id } = req.params;
        const { serverId, channelId, userId } = req.query;
        const user = yield db_1.db.user.findFirst({
            where: {
                id: userId
            }
        });
        if (!user)
            return res.status(401).json({ error: "Unauthorized" });
        if (!serverId)
            return res.status(400).json({ error: "Server ID missing" });
        if (!channelId)
            return res.status(400).json({ error: "Channel ID missing" });
        const server = yield db_1.db.server.findFirst({
            where: {
                id: serverId,
                Member: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                Member: true,
            }
        });
        if (!server)
            return res.status(404).json({ error: "Server not found" });
        const channel = yield db_1.db.channel.findFirst({
            where: {
                id: channelId,
                serverId: serverId,
            },
        });
        if (!channel)
            return res.status(404).json({ error: "Channel not found" });
        let message = yield db_1.db.message.findFirst({
            where: {
                id: id,
                channelId: channelId,
            },
            include: {
                member: {
                    include: {
                        user: true,
                    }
                }
            }
        });
        if (!message || message.deleted)
            return res.status(404).json({ error: "Message not found" });
        const isMessageOwner = message.memberId === server.Member[0].id;
        const isAdmin = server.Member[0].role === client_1.ROLE.ADMIN;
        const isModerator = server.Member[0].role === client_1.ROLE.MODERATOR;
        const canModify = isMessageOwner || isAdmin || isModerator;
        if (!canModify)
            return res.status(401).json({ error: "Unauthorized" });
        // if (!isMessageOwner) {
        //     return res.status(401).json({ error: "Unauthorized" });
        // }
        let { id: memberId, role, userId: messageUserId } = message.member;
        const item = {
            type: "MODIFY",
            address: channelId,
            message: {
                content,
                id: message.id,
                fileUrl: null,
                channelId: channelId,
                memberId: memberId,
                createdAt: message.createdAt,
                updatedAt: new Date(Date.now()),
                member: {
                    id: memberId,
                    userId: messageUserId,
                    role: role,
                    serverId: serverId,
                    user: {
                        id: messageUserId,
                        name: user.name,
                        avatar: user.avatar,
                    },
                },
            },
        };
        // const updateKey = `chat:${channelId}:messages:update`;
        yield redis_1.redis.publish('channel-message', JSON.stringify(item));
        // res.socket.server.io.emit(updateKey, message)
        return res.status(200).json("message");
    }
    catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
});
exports.updateMessage = updateMessage;
