"use client"
import React, { useRef, useState } from 'react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { SendHorizonal } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'


interface Props {
    name: string;
    type: "conversation" | "channel";
    apiUrl: string;
    query: { channelId?: string, serverId?: string, conversationId?: string }
    userId: string
}



const ChatInput = ({ name, type, apiUrl, query, userId }: Props) => {
    const url = `${apiUrl}?channelId=${query.channelId}&serverId=${query.serverId}&conversationId=${query.conversationId}`
    const [inp, setInp] = useState("")


    const { mutate: submit, isPending } = useMutation({
        mutationFn: async () => {
            const { data } = await axios.post(url, { content: inp, userId })
            return data
        },
        onSuccess: () => {
            setInp("")
        }
    })


    return (
        <div className=' h-10 px-3 flex justify-between space-x-3 my-2 sticky bottom-0'>
            <Input value={inp} onChange={(e) => setInp(e.target.value)}
                placeholder={
                    `Message ${type === "conversation"
                        ? name.length < 18 ? name : ` ${name.slice(0, 18)}...`
                        :
                        `#${name.length < 18 ? name : ` ${name.slice(0, 18)}...`}`
                    }`
                }
            />
            <Button onClick={() => submit()} variant={"none"} className=' bg-neutral-500/10 hover:bg-neutral-400/20 text-primary'> <SendHorizonal /> </Button>
        </div>
    )
}

export default ChatInput