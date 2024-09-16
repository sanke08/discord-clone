"use client"
import React from 'react'
import { Badge } from './ui/badge'
import { twMerge } from 'tailwind-merge'
import { Loader } from 'lucide-react'
import { useSocket } from './chat/ChatProvider'


const SocketIndicator = () => {
    const { isConnected } = useSocket()

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