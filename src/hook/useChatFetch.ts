"use client"
import { useSocket } from "@/components/Provider"
import { Member, Message, User } from "@prisma/client"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { useEffect, useRef, useState } from "react"


interface Props {
    apiUrl: string
    updateKey: string
}
type MessageWithMemberWithProfile = Message & {
    member: Member & {
        user: User;
    }
}



const useChatFetch = ({ apiUrl,  updateKey }: Props) => {
    const pageRef = useRef(0)
    const errRef = useRef("")
    const { socket } = useSocket()
    const [mess, setMess] = useState<Array<Message & { member: Member & { user: User } }>>([])
    const { mutate, isPending } = useMutation({
        mutationFn: async () => {
            errRef.current = ""
            const { data } = await axios.get(`${apiUrl}?page=${pageRef.current}`)
            return data
        },
        onSuccess: ({ messages }) => {
            setMess((pre) => [...pre, ...messages])
            pageRef.current += 1
        },
        onError: () => {
            errRef.current = "No more messages"
        }
    })
    useEffect(() => {
        if (!socket) return
        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            setMess((pre) => {
                return pre.map((mess) => {
                    if (mess.id === message.id) return message
                    return mess
                })
            })
        })
        return () => {
            socket.off(updateKey)
        }
    }, [socket, updateKey])
    useEffect(() => {
        if (pageRef.current === 0) {
            const get = async () => {
                try {
                    const { data } = await axios.get(`${apiUrl}?page=${pageRef.current}`)
                    if (data.messages) {
                        setMess(() => [...data.messages])
                        pageRef.current = 1
                    }
                } catch (error: any) {
                    console.log(error.message)
                }
            }
            get()
        }
    }, [apiUrl])
    return { mess: mess, isFetching: isPending, fetch: mutate, errRef }
}

export default useChatFetch 