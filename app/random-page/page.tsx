"use client"

import { useSession } from "next-auth/react";


export default function RandomPage() {

    const { data: session, update } = useSession()

    async function updateSession() {
        await update({
            ...session,
            user: {
                ...session?.user,
                id: session?.user.id
            }
        })
    }

    return <div className="flex flex-col gap-48 w-64">
        <button 
            className="bg-neutral-500 p-3 rounded-md"
            onClick={updateSession}    
        >
            Update session
        </button>
         <button 
            className="bg-neutral-500 p-3 rounded-md"
            onClick={() => console.log("session: ", session)}    
        >
            Log session
        </button>
    </div>
}