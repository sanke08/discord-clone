import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Socket, Server } from "net";
import { NextApiResponse } from "next";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { produceMessage, startConsume } from "@/lib/kafka";



export const config = {
    api: {
        bodyParser: false,
    },
};
export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: Server & {
            io: ServerIO
        }
    }
}


const ioHandler = async (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        })
        res.socket.server.io = io;
        io.on("connection", () => {
            startConsume()
        })
        redis.subscribe("channel-message", (err) => {
            if (err)
                return console.error('Failed to subscribe:', err);
            console.log(`Subscribed to channel`);
        });
        redis.subscribe("direct-message", (err) => {
            if (err)
                return console.error('Failed to subscribe:', err);

            console.log(`Subscribed to direct message`);
        });
        redis.on("message", async (chan, item) => {
            if (!item) return

            const parse = JSON.parse(item)
            if (!parse.address || !parse.message) return
            const { message, address } = parse

            io.emit(`chat:${address}:message`, message)

            const { member, ...rest } = message


            if (chan === "channel-message") {
                await produceMessage("channel-message", rest)
            }
            else
                await produceMessage("direct-message", rest)
        })

    }
    res.end()
}

export default ioHandler;


// {"address":"clt8dw85i000dmdwki28ju1ss","message":{"content":"hi","channelId":"clt8dw85i000dmdwki28ju1ss","memberId":"clt8dw85g000bmdwklkm447w4"}}