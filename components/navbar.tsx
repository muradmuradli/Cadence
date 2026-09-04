"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AudioLines,
  HelpCircle,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const [mobileOpen, setMobileOpen] = useState(false);

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

        <div className="ml-auto flex items-center gap-4">
          <nav className="hidden items-center gap-1 md:flex">
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

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex cursor-pointer items-center rounded-full transition-transform hover:scale-105"
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

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                className="flex cursor-pointer items-center justify-center rounded-full p-2 text-foreground transition-colors hover:bg-surface-2 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              showCloseButton={false}
              className="flex !w-full flex-col gap-0 sm:!max-w-full"
            >
              <SheetHeader className="flex-row items-center justify-between border-b border-border/70">
                <SheetTitle className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
                  <AudioLines className="h-5 w-5 text-acid" />
                  <span>
                    CAD<span className="text-sonic">ENCE</span>
                  </span>
                </SheetTitle>
                <SheetClose asChild>
                  <button
                    className="flex cursor-pointer items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </SheetHeader>

              <div className="flex flex-1 flex-col overflow-y-auto px-4">
                <div className="flex items-center gap-3 border-b border-border/70 py-4">
                  <Avatar size="lg">
                    <AvatarImage
                      src={user?.image ?? undefined}
                      alt={user?.name ?? "Account"}
                    />
                    <AvatarFallback className="bg-sonic font-display font-bold text-background">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {user?.name ?? "Account"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <nav className="flex flex-col gap-1 py-4">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "rounded-lg px-3 py-3 text-base font-medium text-muted-foreground transition-colors",
                            active
                              ? "bg-surface-2 text-foreground"
                              : "hover:bg-surface-2 hover:text-foreground",
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                <div className="mt-auto flex flex-col gap-1 border-t border-border/70 py-4">
                  <SheetClose asChild>
                    <button className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground">
                      <HelpCircle className="h-4 w-4" />
                      Help and Support
                    </button>
                  </SheetClose>
                  <SheetClose asChild>
                    <button
                      onClick={handleSignOut}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-3 text-left text-base font-medium text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
