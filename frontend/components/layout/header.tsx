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
          <button
            onClick={goback}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => router.push("/home")}
            className="text-xl font-bold hover:opacity-90"
            aria-label="Go to home"
            title="Home"
          >
            HabitX
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Link href="/community" className="flex items-center gap-2">
                <NewspaperIcon className="w-5 h-5" />
              </Link>
            </div>

            {/* <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Add friend"
                    title="Add friend"
                    className="p-2 rounded-md hover:bg-muted transition"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/friends" className="flex items-center gap-2">
                      <UserSquare className="w-4 h-4" />
                      Your Friends
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/friends/requestrecive"
                      className="flex items-center gap-2"
                    >
                      <UserRoundCheck className="w-4 h-4" />
                      Requests Received
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/friends/requestsend"
                      className="flex items-center gap-2"
                    >
                      <UserRoundSearch className="w-4 h-4" />
                      Search Friends
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {!pathname?.startsWith("/friends")}
            </div> */}

            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
