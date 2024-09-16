"use client"
import { Server } from '@prisma/client'
import Image from 'next/image'
import React from 'react'
import TooltipComponent from '../reuse/tooltip-component'
import { Button } from '../ui/button'
import { useParams, useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'


interface Props {
    server: Server
}



const ServerCard = ({ server }: Props) => {
    const router = useRouter()
    const params = useParams()
    return (
        <TooltipComponent message={server.name} className=' group'>
            <Button onClick={() => router.push(`/server/${server.id}`)} variant={"none"} className=' group flex gap-1 relative h-max w-max p-0 my-1'>
                <div className={twMerge(' left-0 h-[10px] w-[4px] bg-white group-hover:h-[45px] transition-all duration-500 rounded-full', params?.serverId === server.id && "h-[45px]")} />
                <div className={twMerge(' relative h-[55px] w-[55px] rounded-[30px] group-hover:rounded-[20px] duration-300 transition-all overflow-hidden', params?.serverId === server.id && "rounded-[20px]")}>
                    <Image src={server.imgUrl} alt='' fill className=' w-full h-full object-cover' />
                </div>
            </Button>
        </TooltipComponent>
    )
}

export default ServerCard