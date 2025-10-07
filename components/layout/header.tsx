"use client"
import { signOut } from "@/lib/firebase-auth"
import { useRouter } from "next/navigation"
import { UserMenu } from "@/components/layout/user-menu"

interface HeaderProps {
  onPhotoClick?: () => void
}

export function Header({ onPhotoClick }: HeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">HabitX</h1>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
