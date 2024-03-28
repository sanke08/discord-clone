import { CHANNEL_TYPE, ROLE } from '@prisma/client'
import React from 'react'
import Header from './Header'
import { getServerSideUser } from '@/lib/helper/getServerSideUser'
import { db } from '@/lib/db'
import { ScrollArea } from '../ui/scroll-area'
import FieldAction from './FieldAction'
import FieldCard from './FieldCard'

const ServerContainer = async ({ serverId }: { serverId: string }) => {

    const user = await getServerSideUser()
    if (!user) return

    const server = await db.server.findUnique({
        where: {
            id: serverId
        },
        include: {
            Channel: true,
            Member: {
                include: {
                    user: true
                }
            }
        }
    })
    const role = server?.Member.find((member) => member.userId === user.id)?.role

    const textChannels = server?.Channel.filter((channel) => channel.type === CHANNEL_TYPE.TEXT)
    const audioChannels = server?.Channel.filter((channel) => channel.type === CHANNEL_TYPE.AUDIO)
    const videoChannels = server?.Channel.filter((channel) => channel.type === CHANNEL_TYPE.VIDEO)
    const members = server?.Member.filter((member) => member.userId !== user.id)

    return (
        <div className=' w-full h-full'>
            <Header serverImgUrl={server?.imgUrl} serverName={server?.name} />
            <ScrollArea className=' h-[98vh]'>
                {
                    !!textChannels?.length &&
                    <div className=' w-full'>
                        <FieldAction sectionType="channels" role={role} label='Text Channels' channelType={CHANNEL_TYPE.TEXT} />
                        <div className=' w-full'>
                            {
                                textChannels.map((channel) => (
                                    <FieldCard key={channel.id} role={role} channel={channel} serverId={server?.id}/>
                                ))
                            }
                        </div>
                    </div>
                }
                {
                    !!videoChannels?.length &&
                    <div className=' w-full'>
                        <FieldAction sectionType="channels" role={role} label='Video Channels' channelType={CHANNEL_TYPE.VIDEO} />
                        <div className=' w-full'>
                            {
                                videoChannels.map((channel) => (
                                    <FieldCard key={channel.id} role={role} channel={channel} serverId={server?.id} />
                                ))
                            }
                        </div>
                    </div>
                }
                {
                    !!audioChannels?.length &&
                    <div className=' w-full'>
                        <FieldAction sectionType="channels" role={role} label='Audio Channels' channelType={CHANNEL_TYPE.AUDIO} />
                        <div className=' w-full'>
                            {
                                audioChannels.map((channel) => (
                                    <FieldCard key={channel.id} role={role} channel={channel} serverId={server?.id}/>
                                ))
                            }
                        </div>
                    </div>
                }
                <p className=' w-full h-[1px] bg-neutral-500/50 rounded-full my-1' />
                {
                    !!members?.length &&
                    <div className=' w-full'>
                        <FieldAction sectionType="members" role={role} label='Members' channelType={CHANNEL_TYPE.AUDIO} />
                        <div className=' w-full'>
                            {
                                members.map((member) => (
                                    <FieldCard key={member.id} role={role} member={member} serverId={server?.id}/>
                                ))
                            }
                        </div>
                    </div>
                }
            </ScrollArea>
        </div>
    )
}

export default ServerContainer