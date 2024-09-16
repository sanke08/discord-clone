import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UpdateChannelValidator } from "@/lib/validator/channel.validator";
import { db } from "@/lib/db";
import { memo } from "react";


export const GET = async (req: NextRequest, { params }: { params: { serverId: string, channelId: string } }) => {
    try {
        const channel = await db.channel.findFirst({
            where: {
                id: params.channelId,
                serverId: params.serverId
            }
        })
        if (!channel) return NextResponse.json({ message: "channel Not Found" }, { status: 404 })
        return NextResponse.json({ message: "success", channel }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}


export const PUT = async (req: NextRequest, { params }: { params: { serverId: string, channelId: string } }) => {
    try {
        const body = await req.json()
        const { name, type } = UpdateChannelValidator.parse(body)

        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

        const server = await db.server.findFirst({
            where: {
                id: params.serverId
            }
        })
        if (!server) return NextResponse.json({ message: "server Not Found" }, { status: 404 })

        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId: server.id,
                role: "ADMIN" || "MEMBER"
            }
        })

        if (!member || member?.role === "GUEST") return NextResponse.json({ message: "You Not allowed to access this field" }, { status: 400 })

        const channel = await db.channel.findFirst({
            where: {
                id: params.channelId,
                serverId: server.id
            }
        })

        if (!channel) return NextResponse.json({ message: "channel Not Found" }, { status: 404 })

        await db.channel.update({
            where: {
                id: params.channelId,
                serverId: server.id
            },
            data: {
                name: name || channel.name,
                // @ts-ignore
                type: type || channel.type
            }
        })
        return NextResponse.json({ message: "Updated Succeessfully" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}


export const DELETE = async (req: NextRequest, { params }: { params: { serverId: string, channelId: string } }) => {
    try {
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
                serverId: server.id
            }
        })

        if (!member || member?.role === "GUEST") return NextResponse.json({ message: "You Not allowed to access this field" }, { status: 400 })
        await db.channel.delete({
            where: {
                id: params.channelId
            }
        })
        return NextResponse.json({ message: "Deleted Succeessfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}