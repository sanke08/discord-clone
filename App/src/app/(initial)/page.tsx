import InitialModel from '@/components/InitialModel'
import { db } from '@/lib/db'
import { getServerSideUser } from '@/lib/helper/getServerSideUser'
import { redirect } from 'next/navigation'
import React from 'react'

const page = async () => {

    const user = await getServerSideUser()
    if (!user) return redirect("/login")
    const member = await db.member.findFirst({
        where: {
            userId: user.id
        }
    })
    if (member) return redirect("/server/" + member.serverId)
    return (
        <InitialModel />
    )
}

export default page