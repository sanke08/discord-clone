import ChatProvider from '@/components/chat/ChatProvider'
import ServerContainer from '@/components/serverComponents/ServerContainer'
import { db } from '@/lib/db'
import { ImageIcon, Plus } from 'lucide-react'
import React, { Suspense } from 'react'

interface Props {
  params: {
    serverId: string
  }
  children: React.ReactNode
}


const layout = async ({ children, params }: Props) => {
  const server = await db.server.findUnique({
    where: {
      id: params.serverId
    }
  })
  if (!server) return
  return (
    <Suspense fallback={<Skeleton />}  >

      <div>
        <div className=' fixed hidden sm:block top-0 left-[70px] w-[250px] h-full border-r border-neutral-700 bg-primary z-40'>
          <ServerContainer serverId={server.id} />
        </div>
        <div className=' w-full h-screen sm:pl-[320px]'>
          {children}
        </div>
      </div>
    </Suspense>
  )
}

export default layout



const Skeleton = () => {
  return (
    <div className='fixed hidden sm:block top-0 left-[70px] w-[250px] h-full border-r border-neutral-700 bg-primary z-40'>
      <div className=' w-full h-32 py-1 border-b'>
        <ImageIcon />
      </div>
      <div>
        <div className='flex justify-between pr-5 pl-2 p-1 items-center'>
          <p className=' text-white/80'> Text channels</p>
          <div className=' opacity-50 hover:opacity-100 p-1 h-max w-max transition-all duration-300'><Plus className=' w-5 h-5' /></div>
        </div>
        <div className=' space-y-1'>
          {
            [...Array(2)].map((i, j) => (

              <div key={j} className='w-full pr-5 pl-2 p-2 bg-secondary opacity-70 hover:opacity-100'>
                <p className=' w-36 py-3 bg-neutral-700/50 animate-pulse rounded-lg' />
              </div>
            ))
          }
        </div>
      </div>
      <div>
        <div className='flex justify-between pr-5 pl-2 p-1 items-center'>
          <p className=' text-white/80'> Audio channels</p>
          <div className=' opacity-50 hover:opacity-100 p-1 h-max w-max transition-all duration-300'><Plus className=' w-5 h-5' /></div>
        </div>
        <div className=' space-y-1'>
          {
            [...Array(2)].map((i, j) => (

              <div key={j} className='w-full pr-5 pl-2 p-2 bg-secondary opacity-70 hover:opacity-100'>
                <p className=' w-36 py-3 bg-neutral-700/50 animate-pulse rounded-lg' />
              </div>
            ))
          }
        </div>
      </div>
      <div>
        <div className='flex justify-between pr-5 pl-2 p-1 items-center'>
          <p className=' text-white/80'> Video channels</p>
          <div className=' opacity-50 hover:opacity-100 p-1 h-max w-max transition-all duration-300'><Plus className=' w-5 h-5' /></div>
        </div>
        <div className=' space-y-1'>
          {
            [...Array(2)].map((i, j) => (

              <div key={j} className='w-full pr-5 pl-2 p-2 bg-secondary opacity-70 hover:opacity-100'>
                <p className=' w-36 py-3 bg-neutral-700/50 animate-pulse rounded-lg' />
              </div>
            ))
          }
        </div>
      </div>
      <div>
        <div className='flex justify-between pr-5 pl-2 p-1 items-center'>
          <p className=' text-white/80'> Members</p>
        </div>
        <div className=' space-y-1'>
          {
            [...Array(2)].map((i, j) => (

              <div key={j} className='w-full pr-5 pl-2 p-2 bg-secondary opacity-70 hover:opacity-100'>
                <p className=' w-36 py-3 bg-neutral-700/50 animate-pulse rounded-lg' />
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}