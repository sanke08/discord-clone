import { Kafka, Producer, logLevel } from "kafkajs"
import { db } from "./db"

const kafka = new Kafka({
    brokers: [process.env.UPSTASH_KAFKA_REST_URL!],
    ssl: true,
    sasl: {
        mechanism: "scram-sha-256",
        username: process.env.UPSTASH_KAFKA_REST_USERNAME!,
        password: process.env.UPSTASH_KAFKA_REST_PASSWORD!,
    },
    logLevel: logLevel.ERROR
})

let producer: null | Producer = null

export const createProducer = async () => {
    if (producer) return producer
    const _producer = kafka.producer()
    await _producer.connect()
    producer = _producer
    return producer
}

export const produceMessage = async (type: string, message: any) => {
    const producer = await createProducer()


    await producer.send({
        topic: "MESSAGES",
        messages: [{ key: type, value: JSON.stringify(message) }],
    })

    return true

}



export const startConsume = async () => {
    console.log("Starting consume")
    const consumer = kafka.consumer({ groupId: "default" })
    await consumer.connect()
    consumer.subscribe({ topic: "MESSAGES", fromBeginning: true })

    await consumer.run({
        autoCommit: true,
        autoCommitInterval: 3,
        eachMessage: async ({ message, pause }) => {
            if (!message.value || !message.key) return
            try {
                const type = message.key?.toString()
                const item = JSON.parse(message.value.toString())
                if (!item || !item.content) return
                if (type === "channel-message") {
                    await db.message.create({
                        data: {
                            content: item.content,
                            fileUrl: item.fileUrl,
                            channelId: item.channelId,
                            memberId: item.memberId,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt
                        }
                    })
                    return
                }
                if (type === "direct-message") {

                    await db.directMessage.create({
                        data: {
                            content: item.content,
                            fileUrl: item.fileUrl,
                            memberId: item.memberId,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                            conversationId:item.conversationId
                        }
                    })
                    return
                }


            } catch (error) {
                console.log("paused")
                pause()
                setTimeout(() => {
                    consumer.resume([{ topic: "MESSAGES" }])
                }, 60* 1000);
            }

        }
    })



}