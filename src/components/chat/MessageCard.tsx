"use client"
import { Member, Message, User } from '@prisma/client'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import UserAvatar from '../UserAvatar'
import MessageContent from './MessageContent'
import { formatTimeToNow } from '@/lib/helper/formatTimeToNow'
import { useParams, useRouter } from 'next/navigation'


interface Props {
    message: Message & { member: Member & { user: User } }
    user: User
    socketUrl: string
    query: { channelId?: string, serverId?: string, conversationId?: string }
    isAdmin?: boolean
    isModerator?: boolean
}


const MessageCard = ({ message, user, socketUrl, query, isAdmin, isModerator }: Props) => {

    const isMyMessage = message.member.user.id === user.id
    const updatedDate = formatTimeToNow(new Date(message.updatedAt))
    const isEdited = new Date(message.createdAt).toString() !== new Date(message.updatedAt).toString()
    const isDeletedMessage = message.deleted
    const params: { serverId: string, channelId: string } | null = useParams()
    const router = useRouter()
    const navigate = () => {
        router.push(`/server/${params?.serverId}/conversation/${message.memberId}`)
    }




    return (
        <div className={twMerge(' w-full flex gap-x-1', isMyMessage && "justify-end")}>
            {
                !isMyMessage &&
                <div onClick={ navigate} className=' w-max cursor-pointer'>
                    {
                        message.member.user.avatar ?
                            <UserAvatar />
                            :
                            <p className=' w-10 h-10 aspect-square bg-neutral-600/50 text-2xl text-center rounded-full'>
                                {message.member.user.name[0]}
                            </p>
                    }
                </div>
            }
            <div className={twMerge('min-w-[15%] rounded-b-lg max-w-[70%]', !isMyMessage ? " rounded-tr-xl" : "rounded-tl-xl bg-green-600/10")}>
                <div className='flex pt-1 pb-0.5 px-2 justify-between text-[0.65em] border-b-[0.01rem] border-b-neutral-300/20'>
                    {message.member.user.name}
                    <p className=' text-[0.57rem]'>
                        {formatTimeToNow(new Date(message.createdAt))}
                    </p>
                </div>

                <MessageContent content={message.content} isDeletedMessage={isDeletedMessage} id={message.id} socketUrl={socketUrl} query={query} userId={user.id} isMyMessage={isMyMessage} isAdmin={isAdmin} isModerator={isModerator} isEdited={isEdited} updatedDate={updatedDate} />
            </div>
            {
                isMyMessage &&
                <div className=' w-max'>
                    {
                        message.member.user.avatar ?
                            <UserAvatar />
                            :
                            <p className=' w-10 h-10 aspect-square bg-neutral-600/50 text-2xl text-center rounded-full'>
                                {message.member.user.name[0]}
                            </p>
                    }
                </div>
            }
        </div>
    )
}

export default MessageCard