"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

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


const ChatProvider = ({ children }: { children: React.ReactNode }) => {

    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false)

    const setUpWS = useCallback(() => {
        const ws = new WebSocket("ws://localhost:8080");
        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onclose = () => {
            setIsConnected(false);
            setUpWS()
        };

        socketRef.current = ws

    }, [])

    useEffect(() => {

        if (!socketRef.current)
            setUpWS()

    }, [])



    return (
        <SocketContext.Provider value={{ socket:socketRef.current, isConnected }} >
            {children}
        </SocketContext.Provider>
    )
}

export default ChatProvider
