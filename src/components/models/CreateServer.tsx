"use client"
import { Plus, X } from 'lucide-react'
import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'
import TooltipComponent from '../reuse/tooltip-component'
import CustomDialogTrigger from '../reuse/custom-dialog-trigger'
import { useMutation } from '@tanstack/react-query'
import { CreateServerValidatorRequest } from '@/lib/validator/server.validator'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import ErrorField from '../ErrorField'
import SuccessField from '../SuccessField'
import FileUploader from '../FileUploader'
import Image from 'next/image'


const CreateServer = () => {
    return (
        <CustomDialogTrigger content={<CreateServerModel />} header='Costomize your Server' description='Give your server a personality with a name and an image .You can always change it later'>
            <TooltipComponent message='Create Server' >
                <Button variant={"none"} className='my-1 h-[40px] w-[40px] p-0 group rounded-full bg-gradient-to-tr from-violet-950  transition-all duration-500'>
                    <Plus className=' group-hover:rotate-180 transition-all duration-500' />
                </Button>
            </TooltipComponent>
        </CustomDialogTrigger>
    ) 
}

export default CreateServer



const CreateServerModel = () => {
    const router = useRouter()
    const nameRef = useRef("")
    const errRef = useRef("")
    const successRef = useRef("")
    const exUrl = "https://utfs.io/f/72db6f46-9b01-4bd5-bdeb-c8098649dd6d-k3i6eq.jpg"
    const [url, seturl] = useState("")
    const [imageUrl, setImageUrl] = useState<string>("")

    const { mutate: handleCreate, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            successRef.current = ""
            const payload: CreateServerValidatorRequest = {
                name: nameRef.current,
            }
            const { data } = await axios.post("/api/server", { ...payload, imageUrl })
            return data
        },
        onSuccess: () => {
            successRef.current = "Server created successfully"
            router.refresh()
        },
        onError: ({ response }: { response: { data: any } }) => {
            errRef.current = response.data.message
        }
    })
    const handle = () => {
        if (!url) return
        router.push(url)
    }


    return (
        <div className=' w-full flex flex-col items-center'>
            <div className=' w-full px-2 mt-4'>
                
                {
                    imageUrl ?
                        <div className=' relative w-28 h-28 rounded-full mx-auto'>
                            <Image src={imageUrl} alt='Img' fill className=' rounded-full object-cover bg-neutral-500/50' />
                            <Button variant={"none"} size={"fit"} onClick={() => setImageUrl("")} className=' absolute right-1 top-1 bg-rose-500 rounded-full p-0.5 min-w-fit aspect-square'> <X size={20} /></Button>
                        </div>
                        :
                        <FileUploader endpoint={"imageUploader"} onchange={(value: any) => setImageUrl(value)} />
                }
                <Label htmlFor='name'>Name</Label>
                <Input onChange={(e) => nameRef.current = e.target.value} id='name' placeholder='Server name' />
                <ErrorField string={errRef.current} />
                <SuccessField string={successRef.current} />
                <Button variant={"default"} onClick={() => handleCreate()} isLoading={isPending} className=" my-2 w-full">Create</Button>
            </div>
            <div className=' w-full'>
                <p className=' w-full text-[0.7em]'>OR</p>
                <p className=' text-[0.8em]'>Join new Server</p>
            </div>
            <div className=' w-full px-2'>
                <Label htmlFor='name'>Invite url</Label>
                <Input onChange={(e) => seturl(e.target.value)} id='name' placeholder='paste url' />
                <Button onClick={handle} disabled={url.length === 0} isLoading={isPending} className=" my-2 w-full">Join</Button>
            </div>
        </div>
    )
}