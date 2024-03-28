"use client"
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import Link from 'next/link'
import {  Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { RegisterRequest } from '@/lib/validator/auth.validator'
import axios from 'axios'
import { Button } from './ui/button'
import { Input } from './ui/input'


export default function Register() {


    const router = useRouter()
    const userRef = useRef({
        email: "",
        password: "",
        name: ""
    })

    const { mutate: handleRegister, isPending } = useMutation({
        mutationFn: async () => {
            const payload: RegisterRequest = {
                email: userRef.current.email,
                password: userRef.current.password,
                name: userRef.current.name
            }
            const { data } = await axios.post("/api/signup", payload)
            return data
        },
        onSuccess: () => {
            router.push("/")
        }
    })

    return (
        <div className=' w-full h-screen flex justify-center items-center bg-slate-900/70'>
            <div className='relative bg-transparent w-80 h-[23em] p-2  rounded-lg outline outline-white/5'>
                <p className=' mx-4 mb-5 text-2xl font-medium'>Register</p>
                <div className=' flex flex-col gap-3 px-8'>
                    <Input type={"text"} placeholder={"Enter Name"}  onChange={(e) => userRef.current.name = e.target.value} className={" bg-transparent border-gray-700"} />
                    <Input type={"email"} placeholder={"Enter email"} onChange={(e) => userRef.current.email = e.target.value} className={" bg-transparent border-gray-700"} />
                    <Input type={"password"} placeholder={"Enter password"} onChange={(e) => userRef.current.password = e.target.value} className={" bg-transparent border-gray-700"} />
                </div>
                <div className=' w-full text-center p-8 flex justify-center'>
                    <Button onClick={() => handleRegister()} className={" bg-transparent border border-gray-700 w-full"}>Register</Button>
                </div>
                <div className=' absolute bottom-0 pb-3'>
                    <p className=' text-xs'>Already have Account</p>
                    <Link href={"/login"} className=' border-b border-neutral-500 pb-1'>Login</Link>
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
