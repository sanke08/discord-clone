import { db } from "@/lib/db";
import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { ROLE } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";



export const PUT = async (req: NextRequest, { params }: { params: { serverId: string, id: string } }) => {
    try {
        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        const server = await db.server.findUnique({
            where: {
                id: params.serverId
            }
        })
        if (!server) return NextResponse.json({ message: "server not found" }, { status: 404 })
        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId: server.id,
                role: ROLE.ADMIN
            }
        })
        if (!member) return NextResponse.json({ message: "only Admin allowed " }, { status: 400 })
        const mem = await db.member.findFirst({
            where: {
                id: params.id
            }
        })
        if (mem?.role === ROLE.MODERATOR) {
            await db.member.update({
                where: {
                    id: params.id
                },
                data: {
                    role: ROLE.GUEST
                }
            })
        }
        if (mem?.role === ROLE.GUEST) {
            await db.member.update({
                where: {
                    id: params.id
                },
                data: {
                    role: ROLE.MODERATOR
                }
            })
        }
        return NextResponse.json({ memberId: params.id }, { status: 200, })
    } catch (error) {
        return NextResponse.json({ message: "internal server error" }, { status: 500 })
    }
}