"use client"
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { twMerge } from 'tailwind-merge'


interface Props {
    children: React.ReactNode,
    content: React.ReactNode,
    className?: string
    align?: "center" | "start" | "end"
    dist?: number
    disable?:boolean
}


const PopoverComponent = ({ children, content, className, align, dist ,disable}: Props) => {
    return (
        <Popover>
            <PopoverTrigger disabled={disable} className=' p-0 h-fit w-fit flex justify-center items-center'>
                {children}
            </PopoverTrigger>
            <PopoverContent align={align} sideOffset={dist} className={twMerge(className)}>
                {content}
            </PopoverContent>
        </Popover>
    )
}

export default PopoverComponent