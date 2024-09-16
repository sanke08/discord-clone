"use client"
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { Hash, Mic, SearchIcon, User2, VideoIcon } from 'lucide-react'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command'


interface Props {
    data: {
        label: string,
        type: "channel" | "member",
        data: {
            name: string,
            id: string
            type: "AUDIO" | "VIDEO" | "TEXT" | "MEMBER"
        }[] | undefined
    }[]
}



const Search = ({ data }: Props) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const params = useParams();


    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        }
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down)
    }, []);


    const onClick = ({ id, type }: { id: string, type: "channel" | "member" }) => {
        setOpen(false);

        if (type === "member") {
            return router.push(`/servers/${params?.serverId}/conversations/${id}`)
        }

        if (type === "channel") {
            return router.push(`/servers/${params?.serverId}/channels/${id}`)
        }
    }






    return (
        <>
            <Button variant={"none"} onClick={() => setOpen(true)} className=' w-full bg-neutral-500 text-white hover:bg-neutral-500'>
                <SearchIcon />
                <p>Search</p>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search all channels and members" />
                <CommandList>
                    <CommandEmpty>
                        No Results found
                    </CommandEmpty>
                    {data.map(({ label, type, data }) => {
                        if (!data?.length) return null;

                        return (
                            <CommandGroup key={label} heading={label}>
                                {data?.map(({ id, name, type }) => {
                                    return (
                                        // @ts-ignore
                                        <CommandItem key={id} onSelect={() => onClick({ id, type })}>
                                            {type === "AUDIO" && <Mic className=' h-5 w-5' />}
                                            {type === "VIDEO" && <VideoIcon className=' h-5 w-5' />}
                                            {type === "TEXT" && <Hash className=' h-5 w-5' />}
                                            {type === "MEMBER" && <User2 className=' h-5 w-5' />}
                                            <span>{name}</span>
                                        </CommandItem>
                                    )
                                })}
                            </CommandGroup>
                        )
                    })}
                </CommandList>
            </CommandDialog>
        </>
    )
}

export default Search