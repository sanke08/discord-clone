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
const action_1 = require("./action");
const kafka_1 = require("./kafka");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const consumer = kafka_1.kafka.consumer({ groupId: "default" });
    yield consumer.connect();
    consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });
    yield consumer.run({
        autoCommit: true,
        autoCommitInterval: 10,
        eachMessage: ({ message, pause }) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            if (!message.value || !message.key)
                return;
            console.log("message Consume");
            try {
                const channel = (_a = message.key) === null || _a === void 0 ? void 0 : _a.toString();
                const item = yield JSON.parse(message.value.toString());
                const { type, message: orgMessage } = item;
                console.log(channel, type, orgMessage);
                if (!orgMessage || !type)
                    return;
                if (channel === "channel-message") {
                    console.log("enter1");
                    if (type === "CREATE") {
                        console.log(orgMessage);
                        yield (0, action_1.createMessage)({ message: orgMessage });
                    }
                    else if (type === "MODIFY") {
                        console.log("enter2");
                        yield (0, action_1.updateMessage)({ message: orgMessage });
                    }
                    return;
                }
                if (channel === "direct-message") {
                    console.log("direct message");
                    if (type === "CREATE") {
                        yield (0, action_1.createDirectMessage)({ message: orgMessage });
                    }
                    else if (type === "MODIFY") {
                        yield (0, action_1.updateDirectMessage)({ message: orgMessage });
                    }
                    return;
                }
            }
            catch (error) {
                console.log(error);
                console.log("paused");
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: "MESSAGES" }]);
                }, 60 * 1000);
            }
        })
    });
});
main();
