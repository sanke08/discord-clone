
import { Hash, Menu, } from 'lucide-react'
import React, { Suspense } from 'react'
import UserAvatar from '../UserAvatar';
import MobileToggle from '../MobileToggle';
import { Member, Server, User } from '@prisma/client';
import ServerContainer from '../serverComponents/ServerContainer';
import Sidebar from '../sidebar/Sidebar';
import SocketIndicator from '../SocketIndicator';



interface Props {
    serverId: string;
    name: string;
    type: "channel" | "conversation";
    imageUrl?: string | null;
    members: Array<Member & { server: Server, user: User }>
    user: User
}



const ChatHeader = ({ name, type, imageUrl, members, user, serverId }: Props) => {

    return (
        <div className=' fixed top-0 h-12 flex items-center justify-between bg-secondary px-5 w-full md:w-[calc(100vw-320px)]'>
            <div className='flex items-center justify-between w-full'>
                <div className=' flex items-center gap-1'>
                    <div className=' block sm:hidden'>
                        <MobileToggle>
                            <div className=' flex h-full'>
                                <Suspense fallback >
                                    <Sidebar members={members} user={user} />
                                    <ServerContainer serverId={serverId} />
                                </Suspense>
                            </div>
                        </MobileToggle>
                    </div>
                    {
                        type === "channel" && (
                            <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-400 ml-2" />
                        )
                    }
                    {
                        type === "conversation" &&
                        <UserAvatar />
                    }
                    {
                        name.length < 18 ? name :
                            <p>
                                {name.slice(0, 18)}...
                            </p>
                    }
                </div>
                <div>
                    <SocketIndicator  />
                </div>
            </div>
        </div>
    )
}

export default ChatHeader