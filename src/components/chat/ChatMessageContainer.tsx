"use client"

import useChatSocket from '@/hook/useChatSocket';
import { Member, Message, User } from '@prisma/client';
import React, { useEffect } from 'react'
import { Button } from '../ui/button';
import useChatFetch from '@/hook/useChatFetch';
import MessageCard from './MessageCard';
import ErrorField from '../ErrorField';
import { Loader2 } from 'lucide-react';
import { useSocket } from '../Provider';

interface Props {
    name: string;
    member: Member;
    chatId: string;
    apiUrl: string;
    socketUrl: string;
    type: "channel" | "conversation"
    query: { channelId?: string, serverId?: string, conversationId?: string }
    user: User
    isAdmin?: boolean
    isModerator?: boolean
}




 


const ChatMessageContainer = ({ chatId, member, name, apiUrl, socketUrl, type, query,  user, isAdmin, isModerator }: Props) => {

    const queryKey = `chat:${chatId}`;
    const addKey = `chat:${chatId}:message`;
    const updateKey = `chat:${chatId}:messages:update`
    const { messages } = useChatSocket({ addKey, updateKey, queryKey, apiUrl })
    const { fetch, isFetching, mess, errRef } = useChatFetch({ apiUrl, updateKey })




    return (
        <>
            <div className=' flex-1 pt-14 h-full overflow-y-auto'>
                <div className='flex-col-reverse flex h-full py-5 gap-1 overflow-y-auto'>
                    {
                        messages.map((message) => (
                            <MessageCard key={message.id} message={message} user={user} socketUrl={socketUrl} query={query} isAdmin={isAdmin} isModerator={isModerator} />
                        ))
                    }
                    {
                        mess && mess.map((message) => (
                            <MessageCard key={message.id} message={message} user={user} socketUrl={socketUrl} query={query} isModerator={isModerator} isAdmin={isAdmin} />
                        ))
                    }
                    <ErrorField string={errRef.current} className=' text-center' />
                    <Button variant={"none"} disabled={isFetching} onClick={() => fetch()} className=' w-full bg-neutral-400/5 opacity-40'>
                        {
                            isFetching ?
                                <p className=' flex gap-x-1 items-center animate-pulse'>
                                    <Loader2 className=' animate-spin w-4 h-4' />
                                    Loading
                                </p>
                                :
                                <>
                                    load more messaged
                                </>
                        }
                    </Button>
                </div>
            </div>

        </>
    )
}

export default ChatMessageContainer