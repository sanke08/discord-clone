"use client"

import { formatTimeToNow } from '@/lib/helper/formatTimeToNow'
import { Channel } from '@prisma/client'
import React, { useRef } from 'react'
import { Button } from '../ui/button'
import { useMutation } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'

interface Props {
    channel: Channel
}


const DeleteChannel = ({ channel }: Props) => {
    const router = useRouter()
    const params = useParams()
    const errRef = useRef("")
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            const { data } = await axios.delete(`/api/server/${params?.serverId}/channel/${channel.id}`)
            return data
        },
        onSuccess: () => {
            router.refresh()
        },
        onError: (data) => {
            errRef.current = "someting went wrong"
        }
    })


    return (
        <div className=' mt-2'>
            <p className=' text-3xl text-emerald-500 w-full overflow-scroll hidescrollbar'>{channel.name} </p>
            <p className=' text-xs text-neutral-300'> {new Date(channel.createdAt).toLocaleDateString()} <span className=' text-[0.6rem]'>({formatTimeToNow(new Date(channel.createdAt))} )</span> </p>
            <p className=' text-center mt-4 text-rose-400'>All chats within the channels will be deleted as channel deleted</p>
            <Button onClick={() => mutate()} isLoading={isPending} className=' w-full mt-5'>Delete</Button>
        </div>
    )
}

export default DeleteChannel