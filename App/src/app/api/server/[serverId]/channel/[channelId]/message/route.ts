import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { serverId: string, channelId: string } }) => {
    try {
        const url = new URL(req.url)
        const page = url.searchParams.get("page")
        const skip = (page ? parseInt(page, 10) : 0) * 10
        const messages = await db.message.findMany({
            where: {
                channelId: params.channelId,
            },
            include: {
                member: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            skip: skip || 0,
            take: 10
        })
        if (messages.length === 0) return NextResponse.json({ message: "No messages found" }, { status: 404 })
        return NextResponse.json({ messages })
    } catch (error) {
        return NextResponse.json({ message: "err" })
    }
} 