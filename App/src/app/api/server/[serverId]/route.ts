import { getServerSideUser } from "@/lib/helper/getServerSideUser";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken"
import { UpdateServerValidator } from "@/lib/validator/server.validator";
import { db } from "@/lib/db";
import { ROLE } from "@prisma/client";

export const HEAD = async (req: NextRequest, { params }: { params: { serverId: string } }) => {
    try {
        const { serverId } = params
        if (!serverId) return NextResponse.json({ message: "serverId is required" }, { status: 400 })
        const user = await getServerSideUser()
        if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        const member = await db.member.findFirst({
            where: {
                userId: user.id,
                serverId: params.serverId,
                role: "ADMIN"
            }
        })
        if (!member) return NextResponse.json({ message: "Member not found" }, { status: 404 })
        const randomNumber: number = await Math.floor(Math.random() * 1000000)
        const inviteUrl = jwt.sign({ randomNumber }, process.env.SECRETE_KEY!)
        await db.server.update({
            where: {
                id: serverId
            },
            data: {
                inviteUrl
            }
        })
        return NextResponse.json({ message: "Generated" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}





export const GET = async (req: NextRequest, { params }: { params: { serverId: string } }) => {
    try {
        const server = await db.server.findUnique({
            where: {
                id: params.serverId
            }
        })
        if (!server) return NextResponse.json({ message: "server Not Found" }, { status: 404 })
        return NextResponse.json({ message: "success", server }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}


export const PUT = async (req: NextRequest, { params }: { params: { serverId: string } }) => {
    try {
        const body = await req.json()
        const { name, } = UpdateServerValidator.parse(body)
        const { imageUrl } = body
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
                role: "ADMIN"
            }
        })

        if (!member || member?.role !== "ADMIN") return NextResponse.json({ message: "You Not allowed to access this field" }, { status: 400 })

        await db.server.update({
            where: {
                id: server.id,
            },
            data: {
                name: name || server.name,
                imgUrl: imageUrl || server.imgUrl
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


export const DELETE = async (req: NextRequest, { params }: { params: { serverId: string } }) => {
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
                serverId: params.serverId,
                role: ROLE.ADMIN
            }
        })
        if (!member || member?.role !== ROLE.ADMIN) return NextResponse.json({ message: "You Not allowed to access this field" }, { status: 400 })
        await db.server.delete({
            where: {
                id: server.id
            }
        })
        return NextResponse.json({ message: "Deleted Succeessfully" }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}