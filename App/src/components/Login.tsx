"use client"
import { useRouter } from 'next/navigation'
import React, { useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useMutation } from "@tanstack/react-query"
import { LoginRequest } from '@/lib/validator/auth.validator'
import { Input } from './ui/input'
import { Button } from './ui/button'
import axios from "axios"
import { resolve } from 'path'
import ErrorField from './ErrorField'



export default function Login() {
    const router = useRouter()
    const userRef = useRef({
        email: "",
        password: ""
    })
    const errRef = useRef("")

    const { mutate: handleLogin, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            const payload: LoginRequest = {
                email: userRef.current.email,
                password: userRef.current.password
            }
            const { data } = await axios.post("/api/signin", payload)

            return data
        },
        onSuccess: () => {
            router.push("/")
        },
        onError: ({ response }: any) => {
            errRef.current = response.data.message
        }
    })



    return (
        <div className=' w-full h-screen overflow-hidden flex justify-center items-center bg-slate-900/70'>
            <div className='relative w-80 h-[23em] p-2 rounded-lg outline outline-white/5'>
                <p className=' mx-4 mb-5 text-2xl font-medium'>Login</p>
                <div className=' flex flex-col gap-3 px-8 mt-10 w-full'>
                    <Input type={"email"} placeholder={"Enter email"} onChange={(e) => userRef.current.email = e.target.value} className={"bg-transparent border-gray-700"} />
                    <Input type={"password"} placeholder={"Enter password"} onChange={(e) => userRef.current.password = e.target.value} className={"bg-transparent border-gray-700"} />
                </div>
                <ErrorField string={errRef.current} className=' px-8 text-[0.55rem] h-[10px]' />
                <div className=' w-full text-center p-8 flex justify-center'>
                    <Button onClick={() => handleLogin()} className={" bg-transparent outline outline-[0.5px] w-full outline-white/20"} >Login</Button>
                </div>
                <div className=' absolute bottom-0 pb-3'>
                    <p className=' text-xs'>Create an Account</p>
                    <Link href={"/register"} className=' border-b border-neutral-500 pb-1'>Register</Link>
                </div>
                {
                    isPending &&
                    <div className=' absolute top-0 left-0 w-full h-full flex justify-center items-center bg-neutral-900/50'>
                        <Loader2 size={50} className=' animate-spin' />
                    </div>
                }
            </div>
        </div>
    )
}
