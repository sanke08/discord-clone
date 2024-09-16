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
exports.produceMessage = exports.createProducer = void 0;
const kafkajs_1 = require("kafkajs");
const kafka = new kafkajs_1.Kafka({
    // clientId: 'my-app',
    brokers: ["localhost:9092"],
    logLevel: kafkajs_1.logLevel.ERROR
});
let producer = null;
const createProducer = () => __awaiter(void 0, void 0, void 0, function* () {
    if (producer)
        return producer;
    const _producer = kafka.producer();
    yield _producer.connect();
    producer = _producer;
    return producer;
});
exports.createProducer = createProducer;
const produceMessage = (channel, type, message) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Firse producer");
    const producer = yield (0, exports.createProducer)();
    yield producer.send({
        topic: "MESSAGES",
        messages: [{ key: channel, value: JSON.stringify({ message, type }) }]
    });
    return true;
});
exports.produceMessage = produceMessage;
