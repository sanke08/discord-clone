import { db } from "@/lib/db";
import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { CreateChannelValidator } from "@/lib/validator/channel.validator";
import { CHANNEL_TYPE } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


export const POST = async (req: NextRequest, { params }: { params: { serverId: string } }) => {
    try {
        const body = await req.json()
        const { name, type } = CreateChannelValidator.parse(body)
        if (!type) {
            return NextResponse.json({ message: "channel must have specified type" }, { status: 400 })
        }
        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        const server = await db.server.findUnique({
            where: {
                id: params.serverId
            }
        })
        if (!server) return NextResponse.json({ message: "server Not Found" }, { status: 404 })
        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId: params.serverId,
                role: "ADMIN" || "MEMBER"
            }
        })
        if (!member || member?.role === "GUEST") return NextResponse.json({ message: "You Not allowed to access this field" }, { status: 400 })
        await db.channel.create({
            data: {
                name,
                memberId: member.id,
                serverId: server.id,
                // @ts-ignore
                type: type
            }
        })
        return NextResponse.json({ message: "Channel Created Successfully", server }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}
