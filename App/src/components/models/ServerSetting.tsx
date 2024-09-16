"use client"
import { Server } from '@prisma/client'
import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'
import ErrorField from '../ErrorField'
import { Input } from '../ui/input'
import SuccessField from '../SuccessField'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import SomethingWentWrong from '../SomethingWentWrong'
import { UpdateServerValidatorRequest } from '@/lib/validator/server.validator'
import Image from 'next/image'
import FileUploader from '../FileUploader'
import { X } from 'lucide-react'

const ServerSetting = ({ server }: { server: Server | undefined }) => {
    const errRef = useRef("")
    const successRef = useRef("")
    const nameRef = useRef("")
    const router = useRouter()

    const [imageUrl, setImageUrl] = useState<string>(server?.imgUrl || "")




    const { mutate: update, isPending } = useMutation({
        mutationFn: async () => {
            successRef.current = ""
            errRef.current = ""
            const payload: UpdateServerValidatorRequest = {
                name: nameRef.current
            }
            const { data } = await axios.put(`/api/server/${server?.id}`, { ...payload, imageUrl })
            return data
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
        <div className=' w-full flex flex-col items-center'>
            {
                server ?
                    <>
                        <div className=' w-full my-2 px-3'>
                            <p className=' text-3xl'>{server?.name}</p>
                            <p className=' text-[0.6em] text-neutral-500'>{new Date(server?.createdAt).toLocaleDateString()} </p>
                        </div>
                        {
                            imageUrl ?
                                <div className=' relative w-28 h-28 rounded-full mx-auto my-3'>
                                    <Image src={imageUrl} alt='Img' fill className=' rounded-full object-cover bg-neutral-500/50' />
                                    <Button variant={"none"} size={"fit"} onClick={() => setImageUrl("")} className=' absolute right-1 top-1 bg-rose-500 rounded-full p-0.5 min-w-fit aspect-square'> <X size={20} /></Button>
                                </div>
                                :
                                <FileUploader endpoint={"imageUploader"} onchange={(value: any) => setImageUrl(value)} />
                        }
                        <Input onChange={(e) => nameRef.current = e.target.value} placeholder={server.name} className=' mt-3' />
                        <ErrorField string={errRef.current} className=' mt-5' />
                        <SuccessField string={successRef.current} />
                        <Button isLoading={isPending} onClick={() => update()} className=' w-full mt-3 capitalize'>Update</Button>
                    </>
                    :
                    <SomethingWentWrong />
            }
        </div>
    )
}

export default ServerSetting