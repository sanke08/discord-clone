
import React from 'react'
import { Channel, Member, ROLE, Server, User } from '@prisma/client';
import Image from 'next/image';
import { ImageIcon } from 'lucide-react';


interface Props {
    serverImgUrl: string | undefined
    serverName: string | undefined
}

const Header = ({ serverImgUrl, serverName }: Props) => {
    return (
        <div className=' w-full h-40 py-1 relative'>
            {
                serverImgUrl ?
                    <div>
                        <Image src={serverImgUrl} fill alt='' className=' object-cover' />
                        <div className=' absolute h-full w-full flex justify-center items-center text-lg bg-neutral-800/50 top-0'>
                            {serverName}
                        </div>
                    </div>
                    :
                    <ImageIcon />
            }
        </div>
    )
}

export default Header