import { WebSocket } from 'ws';
import { redis } from './redis.config';
import { produceMessage } from './kafka.config';

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Set<WebSocket>();

let redisInitialized = false;

const initializeRedis = () => {
    if (redisInitialized) return;
    redis.subscribe("channel-message", (err) => {
        if (err) console.error('Failed to subscribe:', err);
    });
    redis.subscribe("direct-message", (err) => {
        if (err) console.error('Failed to subscribe:', err);
    });

    redis.on("message", async (chan, item) => {
        if (!item) return;
        const parse = JSON.parse(item);
        if (!parse.address || !parse.message) return;
        const { message, address, type } = parse;
        console.log(message, address, type);


        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                if (type === "CREATE") {
                    console.log("send")
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
        const { member, ...rest } = message;
        if (chan === "channel-message") {
            await produceMessage("channel-message", type, rest);
        } else if (chan === "direct-message") {
            await produceMessage("direct-message", type, rest);
        }
    });

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
