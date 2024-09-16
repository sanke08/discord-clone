import { DirectMessage, Message } from "@prisma/client"
import { db } from "./db"

export const createMessage = async ({ message }: { message: Message }) => {
    try {
        await db.message.create({
            data: {
                ...message
            }
        })
    } catch (error) {
        console.log(error)
    }
}
export const updateMessage = async ({ message }: { message: Message }) => {
    const { content, id } = message

    await db.message.update({
        where: { id },
        data: { content }
    })
}




export const createDirectMessage = async ({ message }: { message: DirectMessage }) => {
    await db.directMessage.create({
        data: {
            ...message
        }
    })
}

export const updateDirectMessage = async ({ message }: { message: Message }) => {
    const { content, id } = message

    await db.directMessage.update({
        where: { id },
        data: { content }
    })
}
