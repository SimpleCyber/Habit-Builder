"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, UserPlus, Inbox } from "lucide-react"
import { getMyFriends } from "@/lib/firebase-db"
import { useAuth } from "@/hooks/use-auth"
import {Header} from "@/components/layout/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function FriendsPage() {
  const { user } = useAuth()
  const [friends, setFriends] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const frs = await getMyFriends(user.uid)
      setFriends(frs)
      // </CHANGE>
    })()
  }, [user])

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <p>Please login to access Friends.</p>
      </div>
    )
  }

  return (
    <>
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-8">
        <header className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-semibold">Friends</h1>
          <div className="ml-auto flex gap-2">
            <Link
              href="/friends/requestsend"
              className="px-3 py-2 rounded-md bg-primary text-white flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Send request
            </Link>
            <Link
              href="/friends/requestrecive"
              className="px-3 py-2 rounded-md border border-primary text-primary flex items-center gap-2"
            >
              <Inbox className="w-4 h-4" /> Requests
            </Link>
          </div>
        </header>

        <section className="glass-effect rounded-xl p-4">
          <h2 className="font-medium mb-3">My friends</h2>
          {friends.length === 0 ? (
            <div className="flex items-center justify-between rounded-md border border-[var(--border)] p-3">
              <div className="text-sm flex items-center gap-2">
                <Inbox className="w-4 h-4" />
                No friends yet
              </div>
              <Link
                href="/friends/requestsend"
                className="px-3 py-2 rounded-md bg-primary text-white flex items-center gap-2"
                title="Add now"
              >
                <UserPlus className="w-4 h-4" /> Add now
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {friends.map((f) => (
                <Link
                  key={f.uid}
                  href={`/friends/${f.uid}`}
                  className="rounded-md border border-[var(--border)] p-3 flex items-center justify-between hover:bg-[var(--glass-hover)]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={f.photoURL || ""} alt="" />
                      <AvatarFallback className="text-xs">
                        {(f.name || f.email || "?")
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{f.name || "Unknown"}</div>
                      <div className="text-xs text-muted-foreground truncate">{f.email}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
        {/* </CHANGE> */}
      </main>
    </>
  )
}
