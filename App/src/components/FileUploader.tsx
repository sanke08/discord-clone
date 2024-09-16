"use client";

import { UploadButton } from "@/utils/uploadthings";

interface Props {
    onchange: any
    endpoint: any
}

export default function FileUploader({ onchange, endpoint }: Props) {
    return (
        <div className=" w-full flex justify-center items-center">
            <UploadButton
                endpoint={endpoint} 
                onClientUploadComplete={(res: any) => {
                    console.log(res)
                    
                    onchange(res?.[0].url);
                }
                
                } 
                onUploadError={(error: any) => { console.log(error) }}
            />
        </div>
    );
}