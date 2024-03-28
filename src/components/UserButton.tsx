"use client"
import { User } from '@prisma/client'
import React from 'react'
import { Button } from './ui/button'
import TooltipComponent from './reuse/tooltip-component'
import { LogOut, UserIcon } from 'lucide-react'


interface Props {
    user: User
}


const UserButton = ({ user }: Props) => {
    return (
        <>
            <TooltipComponent message={user.name}>
                <Button variant={"none"}><UserIcon/> </Button>
            </TooltipComponent>
            {/* <TooltipComponent message="logout">
                <Button variant={"none"}> <LogOut /> </Button>
            </TooltipComponent> */}
        </>
    )
}

export default UserButton