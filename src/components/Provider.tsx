"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { useEffect, useState, createContext, useContext } from 'react'
import { io as ClientIo } from "socket.io-client"


type ScocketContext = {
    socket: any | null
    isConnected: boolean
}

const SocketContext = createContext<ScocketContext>({
    socket: null,
    isConnected: false
})

export const useSocket = () => {
    return useContext(SocketContext)
}



const Provider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient()

    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConneted] = useState(false)

    useEffect(() => {
        const socketinst = ClientIo.connect("http://localhost:3000/", {
            path: "/api/socket/io",
        });
        socketinst.on("connect", () => {
            setIsConneted(true)
        })
        setSocket(socketinst)
        socketinst.on("disconnect", () => {
            setIsConneted(false)
        })
        return () => socketinst.disconnect()
    }, [])


    return (
        <SocketContext.Provider value={{ socket, isConnected }} >
            <QueryClientProvider client={queryClient} >
                {children}
            </QueryClientProvider>
        </SocketContext.Provider>
    )
}

export default Provider