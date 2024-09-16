import { CHANNEL_TYPE, ROLE } from '@prisma/client';
import React from 'react'
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import TooltipComponent from '../reuse/tooltip-component';
import CustomDialogTrigger from '../reuse/custom-dialog-trigger';
import AddChannel from '../models/AddChannel';

interface Props {
    label: string;
    role?: ROLE;
    sectionType: "channels" | "members";
    channelType?: CHANNEL_TYPE;
    // server?: ServerWithMembersWithProfiles;
}



const FieldAction = ({ label, role, sectionType, channelType }: Props) => {
    return (
        <div className='flex justify-between pr-5 pl-2 p-1 items-center'>
            <p className=' text-white/80'> {label}</p>
            {
                sectionType === "channels" &&
                <CustomDialogTrigger content={<AddChannel channelType={channelType} action='create' />} header='Add Text Channel' description='you can change it later if you want. now enjoy it !' className=' min-h-[250px]'>
                    <TooltipComponent message='Add text channel' side="top" className=' m-0'>
                        <Button variant={"none"} className=' opacity-50 hover:opacity-100 p-1 h-max w-max transition-all duration-300'><Plus className=' w-5 h-5' /></Button>
                    </TooltipComponent>
                </CustomDialogTrigger>
            }
        </div>
    )
}

export default FieldAction