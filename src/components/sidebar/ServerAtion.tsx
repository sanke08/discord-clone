"use client"

import React from 'react'
import TooltipComponent from '../reuse/tooltip-component'
import CustomDialogTrigger from '../reuse/custom-dialog-trigger'
import { LogOut, PlusCircle, Settings, Trash, UserPlus, Users } from 'lucide-react';
import Invite from '../models/Invite';
import { Member, ROLE, Server, User } from '@prisma/client';
import { useParams } from 'next/navigation';
import DeleteServer from '../models/DeleteServer';
import AddChannel from '../models/AddChannel';
import ServerSetting from '../models/ServerSetting';
import Members from '../models/Members';
import LeaveServer from '../models/LeaveServer';

interface Props {
    members: Array<Member & { server: Server, user: User }>
    user: User
}


const ServerAtion = ({ user, members, }: Props) => {
    const params: { serverId: string } | null = useParams()
    const server = members.find((member) => member.serverId === params?.serverId)?.server

    const isAdmin = members.find((member) => {
        if (member.userId === user.id && member.serverId === params?.serverId) return member
    })?.role === ROLE.ADMIN

    const isModerator = isAdmin || members.find((member) => {
        if (member.userId === user.id && member.serverId === params?.serverId) return member
    })?.role === ROLE.MODERATOR


    return (
        <div className='flex flex-col w-full h-max items-center space-y-5 py-2 relative'>
            {
                !server &&
                <div className=' w-full h-full bg-neutral-700/50 absolute top-0 ' />
            }
            {
                isModerator &&
                <CustomDialogTrigger content={<Invite server={server} />} header='Invite People' description='Copy and share to people to join server'>
                    <div className=' hover:scale-110 text-primary transition-all duration-300'>
                        <TooltipComponent message='Invite People' align="center">
                            <UserPlus className="" />
                        </TooltipComponent>
                    </div>
                </CustomDialogTrigger>
            }
            {
                isAdmin &&
                <CustomDialogTrigger content={<Members isAdmin={isAdmin} />} header="Member Setting" description='change member role or kick them'>
                    <div className='text-primary group transition-all duration-300 hover:scale-110'>
                        <TooltipComponent message='Manage Members'>
                            <Users />
                        </TooltipComponent>
                    </div>
                </CustomDialogTrigger>
            }
            {
                isAdmin &&
                <CustomDialogTrigger content={<ServerSetting server={server} />} header='Edit Server' description='update server as your wish'>
                    <div className='text-primary  group transition-all duration-100'>
                        <TooltipComponent message=' Server Settings'>
                            <Settings className=' group-hover:rotate-180 transition-all duration-500' />
                        </TooltipComponent>
                    </div>
                </CustomDialogTrigger>
            }
            {
                isModerator &&
                <CustomDialogTrigger content={<AddChannel action='create' />} header='Add channel' description='you can update it later as by your wish'>
                    <div className=' hover:scale-110 text-primary group transition-all duration-100'>
                        <TooltipComponent message='Create Channel'>
                            <PlusCircle className=' group-hover:rotate-90 transition-all duration-500' />
                        </TooltipComponent>
                    </div>
                </CustomDialogTrigger>
            }
            {
                isAdmin &&
                <CustomDialogTrigger content={<DeleteServer server={server} />} header='Delete Server' description=''>
                    <div className='text-red-500 group transition-all duration-300 hover:scale-110'>
                        <TooltipComponent message=' Delete Server'>
                            <Trash />
                        </TooltipComponent>
                    </div>
                </CustomDialogTrigger>
            }
            {
                !isAdmin &&
                <CustomDialogTrigger content={<LeaveServer server={server}/>} header='Leave Server'>
                    <div className='hover:text-rose-500 group transition-all duration-300 hover:scale-110'>
                        <TooltipComponent message='Leave Server'>
                            <LogOut />
                        </TooltipComponent>
                    </div>
                </CustomDialogTrigger>
            }
        </div>
    )
}

export default ServerAtion
