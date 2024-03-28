"use client"
import { CHANNEL_TYPE } from '@prisma/client'
import React, { useRef, useState } from 'react'
import { Input } from '../ui/input'
import { useMutation } from '@tanstack/react-query'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import ErrorField from '../ErrorField'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { CreateChannelValidatorRequset, UpdateChannelValidatorRequset } from '@/lib/validator/channel.validator'
import { channel } from 'diagnostics_channel'
import { twMerge } from 'tailwind-merge'
import SuccessField from '../SuccessField'

interface Props {
    channelType?: CHANNEL_TYPE
    channelId?: string
    channelName?: string
    className?: string
    action: "create" | "update"
}






const AddChannel = ({ channelType, channelId, channelName, className, action }: Props) => {
    const nameRef = useRef("")
    const errRef = useRef("")
    const successRef = useRef("")
    const [channelTypee, setChannelType] = useState("")
    const router = useRouter()
    const params: { serverId: string }|null = useParams()
    const { mutate: handleClick, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            successRef.current = ""
            if (action === "create" && !channelId) {
                const payload: CreateChannelValidatorRequset = {
                    name: nameRef.current,
                    // @ts-ignore
                    type: channelType ? channelType : channelTypee
                }
                const { data } = await axios.post(`/api/server/${params?.serverId}/channel`, payload)
                return data
            }
            if (action === "update" && channelId) {
                const payload: UpdateChannelValidatorRequset = {
                    name: nameRef.current,
                }
                const { data } = await axios.put(`/api/server/${params?.serverId}/channel/${channelId}`, payload)
                return data
            }
        },
        onSuccess: ({ message }) => {
            successRef.current = message
            router.refresh()
        },
        onError: ({ response }: { response: { data: any } }) => {
            errRef.current = response.data.message
        }
    })


    return (
        <div className={twMerge(className)}>
            {
                channelName &&
                <p className=' font-bold text-3xl text-indigo-700 '>{channelName} </p>
            }
            <div className=' my-3'>
                <Label htmlFor='name'>Name</Label>
                <Input id='name' placeholder={channelName || "Channel name"} onChange={(e) => nameRef.current = e.target.value} />
            </div>
            {
                !channelType &&
                <Select value={channelTypee} onValueChange={(val) => { setChannelType(val) }}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a channel type" className=' capitalize' />
                    </SelectTrigger>
                    <SelectContent>
                        {
                            Object.values(CHANNEL_TYPE).map((type) => (
                                <SelectItem key={type} value={type} className=' capitalize'>
                                    {type}
                                </SelectItem>
                            ))
                        }
                    </SelectContent>
                </Select>
            }
            <SuccessField string={successRef.current} />
            <ErrorField string={errRef.current} />
            <Button onClick={() => handleClick()} isLoading={isPending} className=' w-full mt-5 capitalize'>
                {action}
            </Button>
        </div>
    )
}

export default AddChannel