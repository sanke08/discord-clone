import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { creaeServerValidator } from "@/lib/validator/server.validator";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { z } from "zod";
import { CHANNEL_TYPE, ROLE, User } from "@prisma/client";
import { db } from "@/lib/db";




export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { name, } = creaeServerValidator.parse(body)
        const { imageUrl } = body
        const user: User | null = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const number = Math.floor(Math.random() * 100000000000000)
        const inviteCode = await jwt.sign({ number }, process.env.SECRETE_KEY!)

        const server = await db.server.create({
            data: {
                name,
                imgUrl: imageUrl,
                inviteUrl: inviteCode,
                ownerId: user.id
            }
        })


        const member = await db.member.create({
            data: {
                userId: user.id,
                role: ROLE.ADMIN,
                serverId: server.id
            }
        })


        await db.channel.create({
            data: {
                name: "general",
                memberId: member.id,
                type: CHANNEL_TYPE.TEXT,
                serverId: server.id
            }
        })


        return NextResponse.json({ message: "success", }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}