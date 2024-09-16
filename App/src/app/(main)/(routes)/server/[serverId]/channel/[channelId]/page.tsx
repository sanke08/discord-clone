import ChatHeader from '@/components/chat/ChatHeader'
import ChatInput from '@/components/chat/ChatInput'
import ChatMessageContainer from '@/components/chat/ChatMessageContainer'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/db'
import { getServerSideUser } from '@/lib/helper/getServerSideUser'
import { ROLE } from '@prisma/client'
import { SendHorizonal, User } from 'lucide-react'
import { redirect } from 'next/navigation'
import React, { Suspense, use } from 'react'
import { twMerge } from 'tailwind-merge'


interface Props {
  params: {
    serverId: string
    channelId: string
  }
}

const page = async ({ params }: Props) => {

  const user = await getServerSideUser()
  if (!user) return redirect("/signin")
  const channel = await db.channel.findFirst({
    where: {
      id: params.channelId
    }
  })
  if (!channel) return redirect("/")
  const members = await db.member.findMany({
    where: {
      userId: user.id
    },
    include: {
      server: true,
      user: true
    } 
  })
  const member = members.find((member) => {
    if (member.serverId === params.serverId) {
      return member.userId === user.id
    }
  }
  )
  if (!member) return redirect("/")


  const isAdmin = member.role === ROLE.ADMIN
  const isModerator = member.role === ROLE.MODERATOR
 
 
  return (  
    <Suspense fallback={<Skeleton />} >
      <div className=' flex flex-col h-full w-full'>
        <ChatHeader name={channel.name} type='channel' serverId={params.serverId} members={members} user={user} />
        <ChatMessageContainer
          member={member}
          name={channel.name}
          chatId={channel.id}
          type="channel"
          apiUrl={`/api/server/${params.serverId}/channel/${channel.id}/message`}
          socketUrl="http://localhost:8000/message"
          query={{
            channelId: channel.id,
            serverId: params.serverId,
            conversationId: undefined
          }}
          user={user}
          isAdmin={isAdmin}
          isModerator={isModerator}
        />
        <ChatInput name={channel.name} type="channel"
          apiUrl='http://localhost:8000/message'
          userId={user.id}
          memberId={member.id}
          query={{
            channelId: channel.id, 
            serverId: params.serverId,
            conversationId: undefined
          }}
        />

      </div>
    </Suspense>
  )
}

export default page


const Skeleton = () => {
  return (
    <div className='  w-full h-full'>
      <div className=' h-full w-full flex flex-col space-y-1'>
        <div className=' w-full flex p-2 gap-x-2 pl-2 bg-secondary items-center '>
          <p className=' w-6 h-6 aspect-square bg-neutral-500/50 animate-pulse rounded-lg' />
          <p className=' w-40 py-4 rounded-lg bg-neutral-500/50 animate-pulse' />
        </div>
        <div className='px-4 py-2 h-full flex-1 overflow-y-auto'>
          {
            [...Array(14)].map((i, j) => {

              return (
                <div key={j} className={twMerge('w-full py-1 flex', j % 2 === 0 && "justify-end")}>
                  <div className={twMerge(' w-60 flex gap-x-1 items-center', j % 2 === 0 && " flex-row-reverse")}>
                    <p className=' w-9 h-9 rounded-full bg-neutral-500/50 animate-pulse' />
                    <div className=' w-40 h-full bg-neutral-500/50 animate-pulse rounded-lg' />
                  </div>
                </div>
              )
            }
            )
          }
        </div>
        <div className=' px-3 p-1 flex items-center gap-x-2'>
          <Input readOnly />
          <SendHorizonal className='' />
        </div>
      </div>
      <div>
      </div>
    </div>
  )
}