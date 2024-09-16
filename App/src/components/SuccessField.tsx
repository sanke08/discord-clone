import React from 'react'
import { twMerge } from 'tailwind-merge'

const SuccessField = ({ string, className }: { string: string, className?: string }) => {
    return (
        <div className={twMerge("w-full text-right text-green-500 text-[0.7rem] transition-all duration-300", string ? "h-[20px]" : "h-[0px]", className)}>
            {string && <p>{string}</p>}
        </div>
    )
}

export default SuccessField