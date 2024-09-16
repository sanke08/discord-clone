import { Kafka, Producer, logLevel } from "kafkajs"


const kafka = new Kafka({
    // clientId: 'my-app',
    brokers: ["localhost:9092"],
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

export const produceMessage = async (channel: string, type: "CREATE" | "MODIFY", message: any) => {
    console.log("Firse producer")
    const producer = await createProducer()

    await producer.send({
        topic: "MESSAGES",
        messages: [{ key: channel, value: JSON.stringify({ message, type }) }]
    })

    return true
}
