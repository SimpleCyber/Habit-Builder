"use client"

import { LogOut, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/firebase-auth"
import { useRouter } from "next/navigation"

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
        <h1 className="text-2xl font-bold">TaskTracker</h1>
        <div className="flex items-center gap-2">
          {onPhotoClick && (
            <Button variant="ghost" size="icon" onClick={onPhotoClick}>
              <Camera className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
