"use client"
import { Channel, Member, ROLE, User } from '@prisma/client'
import React from 'react'
import { Button } from '../ui/button'
import { Edit, Eye, Hash, Mic, MoreHorizontal, Shield, ShieldCheck, Trash, UserIcon, Video } from 'lucide-react'
import TooltipComponent from '../reuse/tooltip-component'
import CustomDialogTrigger from '../reuse/custom-dialog-trigger'
import AddChannel from '../models/AddChannel'
import { useParams, useRouter } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import DeleteChannel from '../models/DeleteChannel'
import { ManageMemberCard } from '../models/Members'


interface Props {
  role: ROLE | undefined
  channel?: Channel
  member?: Member & { user: User }
  serverId: string | undefined
}


const FieldCard = ({ role, channel, member, serverId }: Props) => {
  let mem = {
    id: "",
    role: ROLE,
    name: "",
    avatar: "",
    joinedAt: ""
  }
  if (member) {
    const { id, role, createdAt, user } = member
    const { name, avatar } = user
    mem = {
      id: id,
      // @ts-ignore
      role: role,
      name: name,
      avatar: avatar || "",
      joinedAt: new Date(createdAt).toLocaleDateString()
    }
  }

  const params: { channelId: string, serverId: string } | null = useParams()
  const router = useRouter()
 
  const handleNav = () => {
    if (member) {
      router.push(`/server/${serverId}/conversation/${member.id}`)
    }
    if (channel) {
      router.push(`/server/${serverId}/channel/${channel.id}`)
    }
  }




  return (
    <div className={twMerge(' w-[250px] opacity-50 hover:opacity-100 my-1 group px-5  flex justify-between items-center rounded-lg hover:bg-secondary/10  bg-secondary transition-all duration-300', params?.channelId === channel?.id && "bg-secondary/10 opacity-100")}>
      <Button onClick={handleNav} variant={"none"} className=' w-full text-start flex justify-start p-1 '>
        {
          channel &&
          <>
            {channel?.type === "TEXT" && <Hash className=' h-5 w-5' />}
            {channel.type === "AUDIO" && <Mic className=' h-5 w-5' />}
            {channel.type === "VIDEO" && <Video className=' h-5 w-5' />}
            {
              channel.name.length < 18 ? channel.name :
                <p>
                  {channel.name.slice(0, 18)}...
                </p>
            }
          </>
        }
        {
          member &&
          <>
            <div className=' relative'>
           
              {member.role === ROLE.ADMIN && <ShieldCheck className=' h-5 w-5 text-green-500' />}
              {member.role === ROLE.MODERATOR && <Eye className=' h-5 w-5 text-blue-500' />}
              {member.role === ROLE.GUEST && <UserIcon className=' h-5 w-5' />}
            </div>
            {member.user.name}
          </>
        }
      </Button>
      {
        role !== "GUEST" && channel &&
        <div className='flex w-max items-center opacity-0 group-hover:opacity-100 gap-x-1 transition-all duration-500'>
          <CustomDialogTrigger content={<AddChannel channelType={channel.type} channelId={channel.id} channelName={channel.name} action='update' />} header='Update your channel' description='you can modify channel any time'>
            <TooltipComponent message='Edit' side='top'>
              <Button variant={"none"} size="fit" className=' text-neutral-400/50 hover:text-white ' ><Edit className=' h-4 w-4' /> </Button>
            </TooltipComponent>
          </CustomDialogTrigger>
          <CustomDialogTrigger content={<DeleteChannel channel={channel} />} header='Delete channel' description='all chats deleted as channel deleted' >
            <TooltipComponent message='Delete' side='top'>
              <Button variant={"none"} size={"fit"} className=' text-neutral-400/50 hover:text-white'><Trash className=' h-4 w-4' />  </Button>
            </TooltipComponent>
          </CustomDialogTrigger>
        </div>
      }
      {
        member && mem && role !== "GUEST" &&
        // @ts-ignore
        <CustomDialogTrigger content={<ManageMemberCard member={member} />} className=' min-h-[13rem]' header='Manage member' description='change member role or kick them'>
          <TooltipComponent message='Manage Member' side='top'>
            <Button variant={"none"} size="fit" className=' text-neutral-400/50 hover:text-white '><MoreHorizontal /> </Button>
          </TooltipComponent>
        </CustomDialogTrigger>
      }
    </div>
  )
}

export default FieldCard