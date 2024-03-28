"use client"
import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { twMerge } from 'tailwind-merge';

interface Props {
  children: React.ReactNode
  message: string
  side?: "top" | "right" | "bottom" | "left" | undefined
  align?: "start" | "center" | "end";
  delayDuration?: 100 | 200 | 300 | 400
  className?: string
}



const TooltipComponent = ({ children, message, side, delayDuration, className, align }: Props) => {
  return (
    <TooltipProvider delayDuration={delayDuration || 100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side || "right"} align={align} className={twMerge(" px-3 py-0.5 m-2 h-fit w-fit outline-none border-none capitalize z-50", className)} >
          {message}
          </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipComponent;
