"use client";
import { signOut } from "@/lib/firebase-auth";
import { useRouter, usePathname } from "next/navigation";
import { UserMenu } from "@/components/layout/user-menu";
import Link from "next/link";
import {
  UserPlus,
  UserRoundCheck,
  UserRoundSearch,
  ArrowLeft,
  UserSquare,
  Newspaper,
  NewspaperIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onPhotoClick?: () => void;
}

export function Header({ onPhotoClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const goback = async () => {
    router.back();
  };

  return (
    <header className="w-full sticky top-0 z-10">
      <div className="glass-effect rounded-2xl shadow-xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/home"
            className="text-2xl font-black tracking-tighter hover:opacity-80 transition-opacity"
          >
            Habitx
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Link href="/community" className="flex items-center gap-2">
                <NewspaperIcon className="w-5 h-5" />
              </Link>
            </div>

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
