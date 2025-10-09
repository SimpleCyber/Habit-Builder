"use client"

import { useEffect, useState } from "react"
import {Header} from "@/components/layout/header"
import { getReceivedRequests, respondToRequest } from "@/lib/firebase-db"
import { useAuth } from "@/hooks/use-auth"

export default function FriendRequestReceivePage() {
  const { user } = useAuth()
  const [incoming, setIncoming] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const reqs = await getReceivedRequests()
      setIncoming(reqs)
    })()
  }, [user])

  const handleRespond = async (reqId: string, status: "accepted" | "rejected") => {
    await respondToRequest(reqId, status)
    const updated = await getReceivedRequests()
    setIncoming(updated)
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Header />
      <div className="glass-effect rounded-2xl p-4">
        <h2 className="font-semibold mb-2">Incoming requests</h2>
        <div className="space-y-2">
          {incoming.map((r: any) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">{r.fromEmail || "Unknown"}</div>
                <div className="text-xs text-muted-foreground">
                  {r.type === "all" ? "Request all tasks" : "Request selected tasks"}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(r.id, "accepted")}
                  className="px-3 py-1 rounded-md bg-green-600 text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRespond(r.id, "rejected")}
                  className="px-3 py-1 rounded-md bg-rose-600 text-white"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!incoming.length && <p className="text-sm text-muted-foreground">No incoming requests.</p>}
        </div>
      </div>
      {/* </CHANGE> */}
    </main>
  )
}
