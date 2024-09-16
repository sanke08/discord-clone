import Sidebar from '@/components/sidebar/Sidebar'
import { getServerSideUser } from '@/lib/helper/getServerSideUser'
import React, { Suspense } from 'react'
import { redirect } from 'next/navigation'
import InitialModel from '@/components/InitialModel'
import { db } from '@/lib/db'
import { LogOut, Plus, PlusCircle, Settings, User } from 'lucide-react'

const layout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getServerSideUser()
  if (!user) return redirect("/login")

  const members = await db.member.findMany({
    where: {
      userId: user.id
    },
    include: {
      server: true,
      user: true
    }
  })

  if (members.length === 0) {
    return (
      <InitialModel />
    )
  }
  return (
    <div>
      <div className=' fixed hidden sm:block top-0 z-50 h-full left-0 w-[70px] bg-main py-2 border-r border-indigo-950'>
        <Suspense fallback={<Skeleton />} >
          <Sidebar members={members} user={user} />
        </Suspense>
      </div>
      {children}
    </div>
  )
}

export default layout


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
          <User />
        </div>
      </div>
    </>
  )
}