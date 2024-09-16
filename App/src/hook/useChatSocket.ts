import { useSocket } from "@/components/Provider"
import { Member, Message, User } from "@prisma/client";
import { useEffect, useState } from "react"

interface Props {
    addKey: string;
    updateKey: string;
}
type MessageWithMemberWithProfile = Message & {
    member: Member & {
        user: User;
    }
}
const useChatSocket = ({ addKey }: Props) => {
    const { socket }: { socket: WebSocket | null } = useSocket()
    const [messages, setMessages] = useState<MessageWithMemberWithProfile[]>([])

    useEffect(() => {
        console.log(addKey)
        if (!socket) return
        socket.onmessage = ({ data }) => {
            console.log(JSON.parse(data))
            const { event, message } = JSON.parse(data)

            if (event === addKey) {
                setMessages((pre) => ([message, ...pre]))
            }
        }
        return () => {
            // socket.close()
        }

    }, [socket, addKey])


    return { messages: messages.sort((a, b) => a.createdAt - b.createdAt) }

}

export default useChatSocket