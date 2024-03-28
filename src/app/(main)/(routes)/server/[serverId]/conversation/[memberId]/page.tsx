import ChatHeader from '@/components/chat/ChatHeader'
import ChatInput from '@/components/chat/ChatInput'
import ChatMessageContainer from '@/components/chat/ChatMessageContainer'
import { Input } from '@/components/ui/input'
import { db } from '@/lib/db'
import { getOrCreateConversation } from '@/lib/helper/conversation'
import { getServerSideUser } from '@/lib/helper/getServerSideUser'
import { SendHorizonal } from 'lucide-react'
import { redirect } from 'next/navigation'
import React, { Suspense } from 'react'
import { twMerge } from 'tailwind-merge'


interface Props {
  params: {
    memberId: string
    serverId: string
  }
}

const page = async ({ params }: Props) => {

  const user = await getServerSideUser()
  if (!user) return redirect("/login")
  const member = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      userId: user.id
    }
  })
  if (!member) return redirect("/")
  const conversation = await getOrCreateConversation(member.id, params.memberId);
  if (!conversation) return redirect(`/servers/${params.serverId}`);

  const membres = await db.member.findMany({
    where: {
      userId: user.id
    },
    include: {
      server: true,
      user: true
    }
  })
  const { memberOne, memberTwo } = conversation

  const otherMember = memberOne.userId === user.id ? memberTwo : memberOne;

  return (
    <Suspense>

      <div className=' flex flex-col h-full w-full'>
        <ChatHeader
          imageUrl={otherMember.user.avatar}
          name={otherMember.user.name}
          serverId={params.serverId}
          type="conversation"
          members={membres}
          user={user}
        />
        <ChatMessageContainer
          member={member}
          name={otherMember.user.name}
          chatId={conversation.id}
          type="channel"
          apiUrl={`/api/server/${params.serverId}/member/conversation/${conversation.id}`}
          socketUrl="/api/socket/direct-message"
          user={user}
          query={{
            channelId: '',
            serverId: '',
            conversationId: conversation.id
          }}
        />
        <ChatInput
          name={otherMember.user.name}
          type="conversation"
          apiUrl="/api/socket/direct-message"
          query={{
            conversationId: conversation.id
          }}
          userId={user.id}
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