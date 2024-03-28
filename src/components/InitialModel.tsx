"use client"
import React, { ChangeEvent, ReactEventHandler, useRef, useState } from 'react'
import { LogOut, X } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { CreateServerValidatorRequest } from '@/lib/validator/server.validator'
import FileUploader from './FileUploader'

export default function InitialModel({ }) {
  const exUrl = "https://utfs.io/f/72db6f46-9b01-4bd5-bdeb-c8098649dd6d-k3i6eq.jpg"
  const router = useRouter()
  const [url, setUrl] = useState("")

  const nameRef = useRef("")


  const { mutate: handleCreate, isPending } = useMutation({
    mutationFn: async () => {
      const payload: CreateServerValidatorRequest = {
        name: nameRef.current
      }
      const { data } = await axios.post("/api/server", { ...payload,imageUrl:url })
      return data
    },
    onSuccess: () => {
      window.location.reload()
      router.push("/")
      router.refresh()
    }
  })

  return (


    <div className='w-full sm:h-screen h-[80vh] flex justify-center items-center px-5 z-50'>
      <div className=' bg-white rounded-xl text-black text-center z-10 md:w-[50vw] lg:w-[30vw] w-full sm:px-10 px-5 py-5 flex flex-col items-center'>
        <div>
          <p className=' font-semibold text-lg sm:text-2xl'>Costomize your Server</p>
          <p className=' text-neutral-400 text-xs sm:text-base'>Give your server a personality with a name and an image .You can always change it later</p>
        </div>
        <div className=' w-full text-start mt-5 sm:mt-10'>
          {
            url ?
              <div className=' relative w-28 h-28 rounded-full mx-auto my-3'>
                <Image src={url} alt='Img' fill className=' rounded-full object-cover bg-neutral-500/50' />
                <Button variant={"none"} size={"fit"} onClick={() => setUrl("")} className=' absolute right-1 top-1 bg-rose-500 rounded-full p-0.5 min-w-fit aspect-square'> <X size={20} /></Button>
              </div>
              :
              <FileUploader endpoint={"imageUploader"} onchange={(value: any) => setUrl(value)} />
          }
          <p>SERVER NAME</p>
          <Input onChange={(e) => nameRef.current = e.target.value} type={"text"} placeholder={"Enter Server Name"} className={" rounded-lg bg-blue-950"} />
        </div>
        <Button onClick={() => handleCreate()} className=' bg-blue-800 w-full mt-5 hover:bg-blue-800/80'>Create</Button>
      </div>

    </div>
  )
}
