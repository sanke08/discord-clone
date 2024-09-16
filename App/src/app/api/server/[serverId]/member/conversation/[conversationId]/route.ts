import { db } from "@/lib/db";
import { getServerSideUser } from "@/lib/helper/getServerSideUser"
import { NextRequest, NextResponse } from "next/server";



export const GET = async (req: NextRequest, { params }: { params: { conversationId: string } }) => {
    try {
        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        const url = new URL(req.url)
        const messCnt = url.searchParams.get("cnt")
        const page = url.searchParams.get("page")
        const skip = (messCnt ? parseInt(messCnt, 10) : 0) + (page ? parseInt(page, 10) : 1) * 5

        const messages = await db.directMessage.findMany({
            where: {
                conversationId: params.conversationId
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
            take: 5
        })
        if (messages.length === 0) return NextResponse.json({ message: "No messages found" }, { status: 404 })
        return NextResponse.json({ messages })
    } catch (error) {
        return NextResponse.json({ message: "err" })
    }
}