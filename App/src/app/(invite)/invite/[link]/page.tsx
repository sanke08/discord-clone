import { db } from '@/lib/db'
import { getServerSideUser } from '@/lib/helper/getServerSideUser'
import { redirect } from 'next/navigation'
import React from 'react'
import JoinButton from './_component/JoinButton'
import { formatTimeToNow } from '@/lib/helper/formatTimeToNow'
import { CHANNEL_TYPE } from '@prisma/client'
import { Hash, Mic, Video } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'


interface Props {
  params: {
    link: string
  }
}


const page = async ({ params }: Props) => {


  const user = await getServerSideUser()

  if (!user) return redirect("/login")
  const server = await db.server.findFirst({
    where: {
      inviteUrl: params.link,
    },
    include: {
      Member: true,
      Owner: true,
      Channel: true
    }
  })
  if (!server) {
    return (
      <div className=' w-full h-[60vh] flex justify-center items-center text-2xl text-neutral-300/50'>
        Link has been expired
      </div>
    )
  }
  const member = await db.member.findFirst({
    where: {
      userId: user.id,
      serverId: server?.id
    }
  })
  if (member) return redirect(`/server/${server.id}`)

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className=' xl:w-[50%] lg:w-[60%] md:w-[80%] w-[90%]'>
        <div className=' flex flex-col md:flex-row space-y-2 md:space-y-0'>
          <div className=' w-full h-max border p-4 rounded-tl-lg rounded-bl-lg'>
            <div className=' flex flex-col'>
              <p className=' text-3xl'> {server?.name}   </p>
              <p className=' text-sm text-neutral-500'> created by {server.Owner.name} </p>
              <p className=' text-xs flex gap-2 text-neutral-400/50 mt-0.5'>
                {new Date(server.createdAt).toLocaleDateString()}
                <span className=' text-xs'>({formatTimeToNow(new Date(server.createdAt))})</span>
              </p>
            </div>
            <JoinButton  serverId={server.id} userId={user.id} url={server.inviteUrl}/>
          </div>
          <div className=' w-full p-4 border rounded-tr-lg rounded-br-lg'>
            <p> Members: {server.Member.length} </p>
            <p className=' mb-2'> Channels: {server.Channel.length} </p>
            <ScrollArea className=' max-h-[60vh] overflow-y-auto'>
              <div className=' flex flex-col space-y-1'>
                {
                  server.Channel.map((channel) => (
                    <div key={channel.id} className=' flex gap-x-1 items-center bg-neutral-500/5 p-1 rounded-lg'>
                      {channel.type === CHANNEL_TYPE.TEXT && <Hash className=' h-5 w-5 text-neutral-400' />}
                      {channel.type === CHANNEL_TYPE.AUDIO && <Mic className=' h-5 w-5 text-neutral-400' />}
                      {channel.type === CHANNEL_TYPE.VIDEO && <Video className=' h-5 w-5 text-neutral-400' />}
                      {channel.name}
                    </div>
                  ))
                }
              </div>
            </ScrollArea>
          </div>
        </div>

      </div>
    </div>
  )
}

export default page