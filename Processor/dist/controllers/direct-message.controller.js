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
exports.updateDirectMessage = exports.deleteDirectMessage = exports.createDirectMessage = void 0;
const db_1 = require("../lib/db");
const redis_1 = require("../lib/redis");
const createDirectMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, fileUrl, userId, memberId } = yield req.body;
        const { conversationId } = req.query;
        if (!userId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!content)
            return res.status(400).json({ error: "Content missing" });
        const conversation = yield db_1.db.conversation.findFirst({
            where: {
                id: conversationId,
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
        });
        if (!conversation)
            return res.status(404).json({ message: "Conversation not found" });
        const member = conversation.memberOne.userId === userId ? conversation.memberOne : conversation.memberTwo;
        if (!member)
            return res.status(404).json({ message: "Member not found" });
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
                    userId: userId,
                    role: member.role,
                    serverId: member.serverId,
                    user: {
                        id: member.userId,
                        name: member.user.name,
                        avatar: member.user.avatar
                    }
                }
            }
        };
        console.log(content);
        yield redis_1.redis.publish("direct-message", JSON.stringify(item));
        console.log("to redis");
        return res.status(200).json("message");
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Error" });
    }
});
exports.createDirectMessage = createDirectMessage;
const deleteDirectMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const { id } = req.params;
        const { userId, conversationId } = req.query;
        const user = yield db_1.db.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user)
            return res.status(401).json({ error: "Unauthorized" });
        const conversation = yield db_1.db.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                memberOne: true,
                memberTwo: true
            }
        });
        if (!conversation)
            return res.status(404).json({ error: "conversation not found" });
        let message = yield db_1.db.directMessage.findFirst({
            where: {
                id: id,
                conversationId: conversationId,
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
        const member = yield db_1.db.member.findFirst({
            where: {
                userId: user.id
            }
        });
        const canModify = message.memberId !== (member === null || member === void 0 ? void 0 : member.id);
        if (!canModify)
            return res.status(401).json({ error: "Unauthorized" });
        const item = message = yield db_1.db.directMessage.update({
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
        // const updateKey = `chat:${conversationId as string}:messages:update`;
        yield redis_1.redis.publish('channel-message', JSON.stringify(Object.assign(Object.assign({}, item), { type: "MODIFY" })));
        // res.socket.server.io.emit(updateKey, message)
        return res.status(200).json("messae");
    }
    catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
});
exports.deleteDirectMessage = deleteDirectMessage;
const updateDirectMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content } = req.body;
        const { id } = req.params;
        const { userId, conversationId } = req.query;
        const user = yield db_1.db.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user)
            return res.status(401).json({ error: "Unauthorized" });
        const conversation = yield db_1.db.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                memberOne: true,
                memberTwo: true
            }
        });
        if (!conversation)
            return res.status(404).json({ error: "conversation not found" });
        let message = yield db_1.db.directMessage.findFirst({
            where: {
                id: id,
                conversationId: conversationId,
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
        const member = yield db_1.db.member.findFirst({
            where: {
                userId: user.id
            }
        });
        const canModify = message.memberId === (member === null || member === void 0 ? void 0 : member.id);
        console.log(message.memberId, member === null || member === void 0 ? void 0 : member.id);
        if (!canModify)
            return res.status(401).json({ error: "Unauthorized" });
        const { memberId, member: messageMember } = message;
        const item = {
            address: conversation.id,
            type: "MODIFY",
            message: {
                id: message.id,
                content,
                fileUrl: "file",
                conversationId: conversation.id,
                memberId: memberId,
                createdAt: new Date(Date.now()),
                updatedAt: new Date(Date.now()),
                member: {
                    id: messageMember.id,
                    userId: userId,
                    role: messageMember.role,
                    serverId: messageMember.serverId,
                    user: {
                        id: messageMember.userId,
                        name: messageMember.user.name,
                        avatar: messageMember.user.avatar
                    }
                }
            }
        };
        // const updateKey = `chat:${conversationId as string}:messages:update`;
        yield redis_1.redis.publish('direct-message', JSON.stringify(item));
        // res.socket.server.io.emit(updateKey, message)
        return res.status(200).json("messae");
    }
    catch (error) {
        console.log("[MESSAGE_ID]", error);
        return res.status(500).json({ error: "Internal Error" });
    }
});
exports.updateDirectMessage = updateDirectMessage;
