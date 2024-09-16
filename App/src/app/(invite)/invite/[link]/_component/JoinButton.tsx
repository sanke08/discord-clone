"use client"
import { Button } from '@/components/ui/button'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useRef } from 'react'





interface Props {
    serverId: string,
    userId: string
    url: string
}



const JoinButton = ({ serverId, userId, url }: Props) => {
    const router = useRouter()
    const errRef = useRef("")
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            const { } = await axios.post(`/api/server/${serverId}/invite/${url}`)
        },
        onSuccess: () => {
            router.push("/")
            
        }
    })



    return (
        <Button onClick={() => mutate()} isLoading={isPending} className=' w-full mt-5'> join</Button>
    )
}

export default JoinButton