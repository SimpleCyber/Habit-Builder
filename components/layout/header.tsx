"use client"
import { signOut } from "@/lib/firebase-auth"
import { useRouter, usePathname } from "next/navigation"
import { UserMenu } from "@/components/layout/user-menu"
import Link from "next/link"
import { ContactRound , UserPlus } from "lucide-react"

interface HeaderProps {
  onPhotoClick?: () => void
}

export function Header({ onPhotoClick }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname() // detect friends route

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="bg-card  border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">HabitX</h1>
        <div className="flex items-center gap-3">
          {pathname?.startsWith("/friends") ? (
            <Link
              href="/friends#add-friend"
              aria-label="Add friend"
              title="Add friend"
              className="p-2 rounded-md hover:bg-muted transition"
            >
              <UserPlus className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/friends"
              aria-label="Friends"
              title="Friends"
              className="p-2 rounded-md hover:bg-muted transition"
            >
              <ContactRound  className="w-5 h-5" />
            </Link>
          )}
          {!pathname?.startsWith("/friends") && <UserMenu />}
        </div>
      </div>
    </header>
  )
}
