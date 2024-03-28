import { useSocket } from "@/components/Provider"
import { Member, Message, User } from "@prisma/client";
import { useEffect, useState } from "react"

interface Props {
    addKey: string;
    updateKey: string;
    queryKey: string;
    apiUrl: string
}
type MessageWithMemberWithProfile = Message & {
    member: Member & {
        user: User;
    }
}
const useChatSocket = ({ addKey, updateKey, apiUrl }: Props) => {
    const { socket, isConnected } = useSocket()
    const [messages, setMessages] = useState<MessageWithMemberWithProfile[]>([])
    useEffect(() => {
        if (!socket) return
        socket.on(addKey, (message: MessageWithMemberWithProfile) => {
            setMessages((pre) => ([message, ...pre]))
        })
        socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
            setMessages((pre) => {
                return pre.map((mess) => {
                    if (mess.id === message.id) return message
                    return mess
                })
            })
        })
        return () => {
            socket.off(addKey)
            socket.off(updateKey)
        }
    }, [addKey, socket, updateKey])
    return { messages: messages.sort((a, b) => a.createdAt - b.createdAt) }

}

export default useChatSocket