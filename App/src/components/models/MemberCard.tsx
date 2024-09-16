import { Member, User } from '@prisma/client'
import React from 'react'




const jj = ({ member }: { member: Member & { user: User } }) => {
    return (
        <div className=' w-full p-2 bg-secondary rounded-lg'>
            <p> {member.user.name}</p>
        </div>
    )
}

export default jj