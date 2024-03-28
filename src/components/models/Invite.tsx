"use client"
import React, { useRef, useState } from 'react'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Check, RefreshCcw } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { Server } from '@prisma/client'
import SomethingWentWrong from '../SomethingWentWrong'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import ErrorField from '../ErrorField'
import SuccessField from '../SuccessField'





const Invite = ({ server }: { server: Server | undefined }) => {

    const origin = window.origin
    const inviteUrl = `${origin}/invite/${server?.inviteUrl}`
    const errRef = useRef("")
    const successRef = useRef("")
    const [copied, setcopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteUrl)
        setcopied(true)
        setTimeout(() => {
            setcopied(false)
        }, 3000);
    }

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            successRef.current = ""
            const { data } = await axios.head(`/api/server/${server?.id}`)
            return data
        },
        onSuccess: () => {
            successRef.current = "new link generated"
        },
        onError: () => {
            errRef.current = "something wnet wrong"
        },
    })





    return (
        <div className='mt-5'>
            {
                server?.inviteUrl ?
                    <>
                        <Label htmlFor='urll'>Url</Label>
                        <Input id='urll' value={inviteUrl} onChange={() => { }} />
                        <Button onClick={() => mutate()} variant={"none"} size={"fit"} className={twMerge(' mt-2 text-neutral-400 text-xs p-1 px-2', isPending && " bg-secondary animate-pulse")}><RefreshCcw className={twMerge(' h-4 w-4', isPending && "animate-spin")} /> Generate new Link </Button>
                        <ErrorField string={errRef.current} />
                        <SuccessField string={successRef.current} />
                        <Button onClick={handleCopy} disabled={isPending} className=' w-full mt-4'>
                            <Check className={twMerge(' text-green-500 transition-all duration-300', copied ? " scale-100" : " scale-0")} />
                            <p className={twMerge('transition-all duration-300', copied ? " scale-100" : " scale-0")}>Copied</p>
                            <p className={twMerge('transition-all duration-300 absolute', copied ? " scale-0" : " scale-1000")}>Copy</p>
                        </Button>
                    </>
                    :
                    <SomethingWentWrong />
            }
        </div>
    )
}

export default Invite
