import { RegisterValidator } from "@/lib/validator/auth.validator"
import { NextRequest, NextResponse } from "next/server"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { z } from "zod"
import { db } from "@/lib/db"



export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json()
        const { email, password, name } = RegisterValidator.parse(body)
        const existuser = await db.user.findFirst({
            where: {
                email
            }
        })

        if (existuser) return NextResponse.json({ message: "Invalid credentials" }, { status: 400 })
        const hashPass = await bcryptjs.hash(password, 10)
        const user = await db.user.create({
            data: {
                name,
                email,
                avatar: "",
                password: hashPass
            }
        })

        const token = await jwt.sign({ id: user.id }, process.env.SECRETE_KEY!)
        const cookieStore = cookies()
        cookieStore.set("discord_auth_token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000) })
        return NextResponse.json({ message: "Registered Successfullt" }, { status: 200 })
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
        }
        return NextResponse.json({ message: "something went wrong" }, { status: 500 })
    }
}

