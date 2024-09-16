import { db } from "@/lib/db";
import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { ROLE } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (req: NextRequest, { params }: { params: { url: string } }) => {
    try {
        const { url } = params
        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthenticated" }, { status: 401 })
        const server = await db.server.findFirst({
            where: {
                inviteUrl: url
            }
        })
        if (!server) return NextResponse.json({ message: "Url expired" }, { status: 404 })
        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId: server.id
            }
        })
        if (member) return NextResponse.json({ message: "Already member" }, { status: 200 })
        await db.member.create({
            data: {
                userId: user.id,
                serverId: server.id,
                role: ROLE.GUEST
            }
        })
        return NextResponse.json({ message: "joined member" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}