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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const redis_config_1 = require("./redis.config");
const kafka_config_1 = require("./kafka.config");
const wss = new ws_1.WebSocket.Server({ port: 8080 });
const clients = new Set();
let redisInitialized = false;
const initializeRedis = () => {
    if (redisInitialized)
        return;
    redis_config_1.redis.subscribe("channel-message", (err) => {
        if (err)
            console.error('Failed to subscribe:', err);
    });
    redis_config_1.redis.subscribe("direct-message", (err) => {
        if (err)
            console.error('Failed to subscribe:', err);
    });
    redis_config_1.redis.on("message", (chan, item) => __awaiter(void 0, void 0, void 0, function* () {
        if (!item)
            return;
        const parse = JSON.parse(item);
        if (!parse.address || !parse.message)
            return;
        const { message, address, type } = parse;
        console.log(message, address, type);
        clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                if (type === "CREATE") {
                    console.log("send");
                    client.send(JSON.stringify({
                        event: `chat:${address}:message`,
                        message,
                    }));
                }
                if (type === "MODIFY") {
                    client.send(JSON.stringify({
                        event: `chat:${address}:messages:update`,
                        message,
                    }));
                }
            }
        });
        // Produce Kafka messages
        const { member } = message, rest = __rest(message, ["member"]);
        if (chan === "channel-message") {
            yield (0, kafka_config_1.produceMessage)("channel-message", type, rest);
        }
        else if (chan === "direct-message") {
            yield (0, kafka_config_1.produceMessage)("direct-message", type, rest);
        }
    }));
    redisInitialized = true;
};
wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    clients.add(ws);
    // Initialize Redis once per application start
    initializeRedis();
    // Handle WebSocket disconnection
    ws.on('close', () => {
        clients.delete(ws);
        console.log('WebSocket connection closed');
    });
    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
console.log('WebSocket server running on port 8080');
