"use server"
import { db } from "../db"


export const getMembersOfServer = async (serverId: string | undefined) => {
    try {
        const server = await db.server.findUnique({
            where: {
                id: serverId
            }
        })
        if (!server) return null
        const members = await db.member.findMany({
            where: {
                serverId: server?.id
            },
            include: {
                user: true
            }
        })
        return { members }
    } catch (error) {
        return null
    }
}
