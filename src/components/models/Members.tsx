"use client"
import { Member, ROLE, User } from '@prisma/client'
import { Eye, MoreHorizontal, ShieldCheck, User2Icon, UserIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
// import PopoverComponent from '../reuse/popover-component'
import { Button } from '../ui/button'
import { useMutation } from '@tanstack/react-query'
import { twMerge } from 'tailwind-merge'
import { getMembersOfServer } from '@/lib/helper/getMembersOfServer'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'



const Members = ({ isAdmin }: { isAdmin: boolean }) => {
    const params: { serverId: string } | null = useParams()
    const [loadin, setLoading] = useState(false)
    const [members, setMembers] = useState<Array<Member & { user: User }>>([])

    const router = useRouter()
    // const { mutate, isPending } = useMutation({
    //     mutationFn: async (id) => {
    //         const { data } = await axios.put(`/api/server/${params?.serverId}/member/${id}`)
    //         return data
    //     },
    //     onSuccess: ({ memberId }) => {
    //         members.forEach((member) => {
    //             if (member.id === memberId) {
    //                 if (member.role === ROLE.MODERATOR) {
    //                     member.role = ROLE.GUEST
    //                 } else {
    //                     member.role = ROLE.MODERATOR
    //                 }
    //             }

    //         })
    //         router.refresh()
    //     }
    // })

    useEffect(() => {
        const get = async () => {
            setLoading(true)
            // @ts-ignore
            const { members } = await getMembersOfServer(params?.serverId)
            if (members) {
                setMembers(members)
            }
            setLoading(false)
        }
        get()
    }, [params?.serverId])


    return (
        <>
            {
                loadin ?
                    <Skeleton />
                    :
                    <div className=' space-y-2'>
                        {
                            members && members.map((member) => (
                                <ManageMemberCard key={member.id} member={member} />
                            ))
                        }
                    </div>
            }
        </>
    )
}

export default Members

export const ManageMemberCard = ({ member }: { member: Member & { user: User } }) => {

    const params: { serverId: string } | null = useParams()
    const router = useRouter()

    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            const { data } = await axios.put(`/api/server/${params?.serverId}/member/${member.id}`)
            return data
        },
        onSuccess: ({ memberId }) => {
            if (member.role === ROLE.GUEST) {
                member.role = ROLE.MODERATOR
            } else {
                member.role = ROLE.GUEST
            }
            router.refresh()
        }
    })



    return (
        <div className=' w-full p-2 bg-secondary rounded-lg flex justify-between items-center'>
            <div className=' flex gap-x-1 items-center w-full overflow-hidden'>
                {member.role === ROLE.ADMIN && <ShieldCheck className=' w-5 h-5 text-emerald-500' />}
                {member.role === ROLE.GUEST && <UserIcon className=' w-5 h-5' />}
                {member.role === ROLE.MODERATOR && <Eye className=' text-blue-500 w-5 h-5' />}
                <p>{member.user.name} </p>
            </div>
            <div className=' flex items-center gap-x-2'>
                <p className=' text-[0.6rem] text-neutral-500'>
                    {new Date(member.createdAt).toLocaleDateString()}
                </p>
                {
                    member.role !== ROLE.ADMIN &&
                    <Popover >
                        <PopoverTrigger><Button variant={"none"} size={"fit"} className=''><MoreHorizontal /> </Button></PopoverTrigger>
                        <PopoverContent className=' flex space-x-2 w-max'>
                            <Popover>
                                <PopoverTrigger>
                                    <Button variant={"outline"} disabled={isPending} className=' text-black'>Kick</Button>
                                </PopoverTrigger>
                                <PopoverContent className=' w-max' sideOffset={15}>
                                    <Button className=' text-rose-500'>
                                        Are you sure? if yes click me
                                    </Button>
                                </PopoverContent>
                            </Popover>
                            <Button onClick={() => mutate()} isLoading={isPending} className=' text-sm text-start w-max'>
                                {member.role === "GUEST" && <>Change role to MODERATOR</>}
                                {member.role === "MODERATOR" && <>Change role to GUEST</>}
                            </Button>
                        </PopoverContent>
                    </Popover>
                }
            </div>
        </div>
    )
}



const Skeleton = () => {
    return (
        <div className=' space-y-2'>
            {
                [...Array(4)].map((i, j) => (
                    <div key={j} className={twMerge(' bg-secondary w-full p-2 rounded-lg flex items-center justify-between shadow')}>
                        <div className=' w-[70%] flex items-center gap-x-2'>
                            <p className=' h-5 w-5 animate-pulse bg-neutral-500/50 rounded-lg' />
                            <p className=' w-32 py-3 rounded-lg bg-neutral-500/50 animate-pulse' />
                        </div>
                        <p className=' text-[0.6rem] w-[20%] py-3 animate-pulse bg-neutral-500/50 rounded-lg' />
                    </div>
                ))
            }
        </div>
    )
}