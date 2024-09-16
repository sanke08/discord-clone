import React, { useRef, useState } from 'react'
import { Button } from '../ui/button'
import { Check, Edit, MoreVertical, Trash } from 'lucide-react'
import PopoverComponent from '../reuse/popover-component'
import { Input } from '../ui/input'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { twMerge } from 'tailwind-merge'


interface Props {
  content: string
  id: string
  socketUrl: string
  query: { channelId?: string, serverId?: string, conversationId?: string }
  userId: string
  isModerator?: boolean
  isAdmin?: boolean
  isMyMessage?: boolean
  isDeletedMessage?: boolean
  isEdited?: boolean
  updatedDate?: string
}


const MessageContent = ({ content, id, socketUrl, query, userId, isMyMessage, isAdmin, isModerator, isDeletedMessage, isEdited, updatedDate }: Props) => {
  const isEditable = isMyMessage || isModerator || isAdmin

  return (
    <div className=' px-2 pb-1 flex justify-between items-center'> 
      <div >
        <p className={twMerge('', isDeletedMessage && "text-xs text-neutral-500")}>
          {content}
        </p>
        {
          !isDeletedMessage && isEdited && updatedDate &&
          <p className=' text-[0.5rem] text-neutral-500'>
            edited {updatedDate}
          </p>
        }
      </div>
      {
        isEditable && !isDeletedMessage &&
        <PopoverComponent content={<MessageAction content={content} isModerator={isModerator} isAdmin={isAdmin} id={id} socketUrl={socketUrl} query={query} userId={userId} />} align="end" className='w-fit h-fit p-2'>
          <Button variant={"none"} size={"fit"}><MoreVertical className=' h-4 w-4' /> </Button>
        </PopoverComponent>
      }
    </div>
  ) 
}

export default MessageContent


const MessageAction = ({ content, id, socketUrl, query, userId }: Props) => {
  const url = `${socketUrl}/${id}?channelId=${query.channelId}&serverId=${query.serverId}&userId=${userId}&conversationId=${query.conversationId}`
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete(url)
      return data
    }
  })




  return (
    <div className=' w-full flex h-full justify-evenly items-center'>
      <PopoverComponent content={<EDIT content={content} id={id} socketUrl={socketUrl} query={query} userId={userId} />} align="end" dist={10} className=' w-max h-fit p-0 bg-indigo-950'>
        <Button variant={"none"} size={"fit"} className='hover:text-green-600  transition-all duration-300'><Edit className=' h-4 w-4' /></Button>
      </PopoverComponent>
      <Button onClick={() => mutate()} isLoading={isPending} variant={"none"} size={"fit"} className='hover:text-rose-600 transition-all duration-300'><Trash className=' h-4 w-4' /> </Button>
    </div>
  )
}


const EDIT = ({ content, id, socketUrl, query, userId }: Props) => {
  const [text, setText] = useState(content || "")
  const url = `${socketUrl}/${id}?channelId=${query.channelId}&serverId=${query.serverId}&userId=${userId}&conversationId=${query.conversationId}`
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      console.log(userId)
      const { data } = await axios.put(url, { content: text })
      return data
    }
  })

  return (
    <div className=' flex justify-between items-center p-2 space-x-1'>
      <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" className='' />
      <Button onClick={() => mutate()} isLoading={isPending} variant={"none"} size={"fit"} className=' text-green-500 bg-primary rounded-full'><Check /> </Button>
    </div>

  )
}