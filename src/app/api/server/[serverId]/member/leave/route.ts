import { db } from "@/lib/db";
import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { ROLE } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";





export const DELETE = async (req: NextRequest, { params }: { params: { serverId: string } }) => {
    try {
        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ messag: "Unauthorized" }, { status: 401 })

        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId: params.serverId
            }
        })
        if (!member) return NextResponse.json({ messag: "Member not found" }, { status: 404 })
        if (member.role === ROLE.ADMIN) return NextResponse.json({ messag: "you not allwed to leave server" }, { status: 400 })

        await db.member.delete({
            where: {
                id:member.id
            }
        })
        return NextResponse.json({ messag: "Removed", }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 })
    }
}