"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { twMerge } from 'tailwind-merge';

interface CustomDialogTriggerProps {
  header?: string;
  content?: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  className?: string;
  close?:boolean
}

const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({
  header,
  content,
  children,
  description,
  className,
}) => {
  return (
    <Dialog >
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className={twMerge("block min-h-[300px] max-h-full xl:w-[35%] md:w-[50%] sm:w-[70%] w-[90%] overflow-scroll hidescrollbar rounded-lg ", className)} >
        <DialogHeader >
          <DialogTitle className='text-[1.5em]'>{header}</DialogTitle>
          <DialogDescription className='text-[0.8em]'>{description}</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialogTrigger;
