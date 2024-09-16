"use client"
import React, { useEffect, useState } from 'react'

export default function Ball() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    setTimeout(() => {
        setPosition({
            x: Math.floor(Math.random() * 80),
            y: Math.floor(Math.random() * 80)
        })
    }, 5000);
    useEffect(() => {
        setPosition({
            x: Math.floor(Math.random() * 50),
            y: Math.floor(Math.random() * 60)
        })
    }, [])
    return (
        <div className=' w-full'>
            <div className=' -z-10 absolute bg-white/5 top-0 bg-opacity-50 w-20 h-20 rounded-full ' style={{ top: `${position.y}vh`, left: `${position.x}vw`, transition: "all 4.5s ease-in-out" }}></div>
        </div>
    )
}
