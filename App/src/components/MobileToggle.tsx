"use client"
import { Menu } from 'lucide-react'
import React from 'react'
import { SheetContent, SheetTrigger, Sheet, SheetClose } from './ui/sheet'


interface Props {
    children: React.ReactNode;
}


const MobileToggle = ({ children }: Props) => {




    return (
        <Sheet>
            <SheetTrigger className=' w-max  mt-1.5'>
                <Menu className=' h-5 w-5' />
            </SheetTrigger>
            <SheetContent side={"left"} className='p-1 border-r border-neutral-500/50 w-max py-1'>
                {children}
            </SheetContent>
        </Sheet>
    )
}

export default MobileToggle