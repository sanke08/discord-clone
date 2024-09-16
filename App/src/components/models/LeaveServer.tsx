"use client"

import { Server } from '@prisma/client'
import React, { useRef } from 'react'
import SomethingWentWrong from '../SomethingWentWrong'
import { Button } from '../ui/button'
import { LogOut } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import ErrorField from '../ErrorField'

const LeaveServer = ({ server }: { server: Server | undefined }) => {

    const errRef = useRef("")
    const router = useRouter()

    const { isPending, mutate } = useMutation({
        mutationFn: async () => {
            const { data } = await axios.delete(`/api/server/${server?.id}/member/leave`)
            return data
        },
        onSuccess: () => {
            router.push("/")
        },
        onError: ({ response }: any) => {
            errRef.current = response.data.message
        }
    })




    return (
        <div>
            {
                server ?
                    <div>
                        <div className=' w-full my-2 px-3'>
                            <p className=' text-3xl'>{server?.name}</p>
                            <p className=' text-[0.6em] text-neutral-500 mt-1'>{new Date(server?.createdAt).toLocaleDateString()} </p>
                        </div>
                        <p className='text-center mt-3'>All data related to you will be <span className=' text-rose-500'> deleted permenantly</span></p>
                        <ErrorField string={errRef.current} className=' mt-5' />
                        <Button onClick={() => mutate()} isLoading={isPending} className=' w-full mt-5'>Leave <LogOut /></Button>

                    </div>
                    :
                    <SomethingWentWrong />
            }
        </div>
    )
}

export default LeaveServer