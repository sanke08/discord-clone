import { LoginValidator } from "@/lib/validator/auth.validator"
import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"



export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { email, password } = await LoginValidator.parse(body)

        const user = await db.user.findFirst({
            where: {
                email
            }
        })
        if (!user) return NextResponse.json({ message: "User Not found" }, { status: 404 })
        const matchPassword = await bcryptjs.compare(password, user.password)
        if (!matchPassword) throw new Error("Email or Password Wrong")
        const token = await jwt.sign({ id: user.id }, process.env.SECRETE_KEY!)
        const cookieStore = cookies()
        cookieStore.set("discord_auth_token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
        return NextResponse.json({ message: "Registered Successfullt" }, { status: 200 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}
