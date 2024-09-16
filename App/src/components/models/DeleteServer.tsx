"use client"
import React, { useRef } from 'react'
import { Button } from '../ui/button'
import { Server } from '@prisma/client'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import ErrorField from '../ErrorField'
import SomethingWentWrong from '../SomethingWentWrong'

const DeleteServer = ({ server }: { server: Server | undefined }) => {
    const router = useRouter()
    const errRef = useRef("")

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            const { data } = await axios.delete(`/api/server/${server?.id}`)
            return data
        },
        onSuccess: () => {
            router.push("/")
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
                            <p className=' text-[0.6em] text-neutral-500 mt-1'>{new Date(server?.createdAt).toLocaleDateString()} </p>
                        </div>
                        <p className='text-center mt-3'>All data related to server will be <span className=' text-rose-500'> deleted permenantly</span></p>
                        <p className=' opacity-70 text-sm text-center text-neutral-500'>(members,channels,chats) deleted permenantly</p>
                        <ErrorField string={errRef.current} className=' mt-5' />
                        <Button onClick={() => mutate()} isLoading={isPending} className=' w-full mt-3'>Delete</Button>
                    </>
                    :
                    <SomethingWentWrong />
            }
        </div>
    )
}

export default DeleteServer