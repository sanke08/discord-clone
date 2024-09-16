import { createDirectMessage, createMessage, updateDirectMessage, updateMessage } from "./action";

import { kafka } from "./kafka";




const main = async () => {
    const consumer = kafka.consumer({ groupId: "default" })
    await consumer.connect()
    consumer.subscribe({ topic: "MESSAGES", fromBeginning: true })

    await consumer.run({
        autoCommit: true,
        autoCommitInterval: 10,
        eachMessage: async ({ message, pause }) => {
            if (!message.value || !message.key) return
            console.log("message Consume")

            try {
                const channel = message.key?.toString()
                const item = await JSON.parse(message.value.toString())
                const { type, message: orgMessage } = item
                console.log(channel, type, orgMessage)

                if (!orgMessage || !type) return
                if (channel === "channel-message") {
                    console.log("enter1")
                    if (type === "CREATE") {
                        console.log(orgMessage)
                        await createMessage({ message: orgMessage })
                    }
                    else if (type === "MODIFY") {
                        console.log("enter2")
                        await updateMessage({ message: orgMessage })
                    }
                    return
                }

                if (channel === "direct-message") {
                    console.log("direct message")
                    if (type === "CREATE") {
                        await createDirectMessage({ message: orgMessage })
                    }
                    else if (type === "MODIFY") {
                        await updateDirectMessage({ message: orgMessage })
                    }
                    return
                }
            } catch (error) {
                console.log(error)
                console.log("paused")
                pause()
                setTimeout(() => {
                    consumer.resume([{ topic: "MESSAGES" }])
                }, 60 * 1000);
            }

        }
    })

}

main()