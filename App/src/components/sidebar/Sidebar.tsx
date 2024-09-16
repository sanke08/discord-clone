
import React, { Suspense } from 'react'
import { ScrollArea } from '../ui/scroll-area'
import CreateServer from '../models/CreateServer'
import { Member, ROLE, Server, User } from '@prisma/client'
import ServerCard from './ServerCard'
import UserButton from '../UserButton'
import ServerAtion from './ServerAtion'
import { twMerge } from 'tailwind-merge'
import { LogOut, Plus, UserIcon } from 'lucide-react'


interface Props {
    members: Array<Member & { server: Server, user: User }>
    user: User
}



const Sidebar = ({ members, user }: Props) => {
    return (

        <div className=' w-full flex flex-1 flex-col h-full items-center border-r border-violet-950'>
            <Suspense fallback={<Skeleton />} >
                <CreateServer />
                <p className=' h-[0.1em] w-full bg-neutral-300/20 my-1 rounded-full' />
                <ScrollArea className={twMerge(' w-full h-full p-1 flex items-center')}>
                    {
                        members.map(({ server }) => (
                            <ServerCard key={server.id} server={server} />
                        ))
                    } 
                </ScrollArea>
                <p className=' h-[0.1em] w-full bg-neutral-300/20 my-1 rounded-full' />
                <ServerAtion members={members} user={user} />
                <p className=' h-[0.1em] w-full bg-neutral-300/20 my-1 rounded-full' />
                <UserButton user={user} />
            </Suspense>
        </div>
    )
}

export default Sidebar



const Skeleton = () => {
    return (
        <>
            <div className=' w-full flex h-full flex-col items-center'>
                <div className='my-1 h-[40px] w-[40px] flex justify-center items-center rounded-full bg-gradient-to-tr from-violet-950'>
                    <Plus />
                </div>
                <p className=' h-[0.1em] w-full bg-neutral-300/20 my-1 rounded-full' />
                <div className=' h-full w-full flex flex-col items-center'>
                    {
                        [...Array(7)].map((i, j) => (
                            <div key={j} className=' group flex gap-1 aspect-square w-[80%] rounded-full my-1 items-center'>
                                <div className='h-[10px] w-[4px] bg-white group-hover:h-[45px] transition-all duration-500 rounded-full' />
                                <div className=' aspect-square w-full rounded-[30px] bg-neutral-500/50 group-hover:rounded-[20px] animate-pulse' />
                            </div>
                        ))
                    }
                </div>
                <p className=' h-[0.1em] w-full bg-neutral-300/20 my-1 rounded-full' />
                <div className=' flex flex-col space-y-3'>

                    <LogOut />
                    <UserIcon />
                </div>
            </div>
        </>
    )
}