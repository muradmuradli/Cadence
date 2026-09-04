"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AudioLines, HelpCircle, LogOut, Settings } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore-voices", label: "Explore Voices" },
  { href: "/text-to-speech", label: "Text to Speech" },
  { href: "/voice-cloning", label: "Voice Cloning" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const user = session?.user;
  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <AudioLines className="h-5 w-5 text-acid" />
          <span className="font-display text-lg font-extrabold tracking-tight">
            CAD<span className="text-sonic">ENCE</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-surface-2 text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="ml-2 flex cursor-pointer items-center rounded-full transition-transform hover:scale-105 md:ml-0"
              aria-label="Account menu"
            >
              <Avatar>
                <AvatarImage
                  src={user?.image ?? undefined}
                  alt={user?.name ?? "Account"}
                />
                <AvatarFallback className="bg-sonic font-display font-bold text-background">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col">
                <span className="truncate text-sm font-semibold text-foreground">
                  {user?.name ?? "Account"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <HelpCircle className="h-4 w-4" />
              Help and Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2"
              onSelect={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border/70 px-4 py-2 md:hidden">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors",
                active && "bg-surface-2 text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
