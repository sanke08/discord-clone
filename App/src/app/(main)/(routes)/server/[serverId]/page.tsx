import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

interface Props {
  params: {
    serverId: string
  }
}

export const dynamic = "force-dynamic"


const page = async ({ params }: Props) => {
  const server = await db.server.findUnique({
    where: {
      id: params.serverId
    }
  })
  if (!server) return
  const channel = await db.channel.findFirst({
    where: {
      serverId: server.id
    }
  })
  if (!channel) {
    return (
      <div className=' h-[60%] w-full flex justify-center items-center text-2xl text-neutral-500'>
    Please create a channel
      </div>
    )
  }
  return redirect(`/server/${server.id}/channel/${channel.id}`)
}

export default page