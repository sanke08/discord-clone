"use server"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { db } from "../db"
import { User } from "@prisma/client"
export const getServerSideUser = async () => {

    try {
        const cookieStore = await cookies()
        // @ts-ignore
        const { value } = await cookieStore.get("discord_auth_token")
        if (!value) return null
        // @ts-ignore
        const { id } = await jwt.decode(value)
        if (!id) {
            return null
        }
        const user: User | null = await db.user.findUnique({
            where: {
                id
            }
        })
        if (!user) return null
        return user
    } catch (error: any) {
        return null
    }
} 