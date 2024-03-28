"use client"
import React, { useEffect } from 'react'
import { useSocket } from './Provider'
import { Badge } from './ui/badge'
import { twMerge } from 'tailwind-merge'
import { Loader } from 'lucide-react'
import { Member } from '@prisma/client'
import axios from 'axios'
import { useParams, useRouter } from 'next/navigation'
import { io } from "socket.io-client"


interface Props {
    member: Member | undefined
    serverId: string
}
const SocketIndicator = ({ member, serverId }: Props) => {
    const params = useParams()
    const router = useRouter()
    const { isConnected, socket } = useSocket()



    useEffect(() => {
        // @ts-ignore
        const socketinst = io.connect("http://localhost:3000/", {
            path: "/api/socket/io",
        });
        socketinst.on("disconnect", async () => {
            await axios.post("/api/socket/online?disconnect=true", { member: member?.id, serverId: params?.serverId })
        })
        return () => {
            socketinst.off("disconnect")
        }
    }, [member, params?.serverId])
    useEffect(() => {

    }, [member?.id, params?.serverId])
    return (
        <Badge className={twMerge(' transition-all duration-1000 rounded-lg h-8', isConnected ? " bg-emerald-700" : "bg-rose-700")}>
            {
                isConnected ?
                    <p>
                        Connected
                    </p>
                    :
                    <>
                        <Loader className=' animate-spin h-5 w-5' />
                        Connecting...
                    </>
            }
        </Badge>
    )
}

export default SocketIndicator