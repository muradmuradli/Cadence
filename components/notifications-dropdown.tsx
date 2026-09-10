"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationsDropdown({
  onOpenInvitations,
  className,
}: {
  onOpenInvitations: () => void;
  className?: string;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: notifications } = useQuery(
    trpc.notifications.getAll.queryOptions(),
  );

  const markRead = useMutation(
    trpc.notifications.markRead.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    }),
  );

  const items = notifications ?? [];
  const unreadCount = items.filter((n) => !n.read).length;

  const handleSelect = (notificationId: string, read: boolean) => {
    if (!read) {
      markRead.mutate({ id: notificationId });
    }
    onOpenInvitations();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative flex cursor-pointer items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground",
            className,
          )}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-magenta" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-1.5 py-4 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        ) : (
          items.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="cursor-pointer flex-col items-start gap-0.5 whitespace-normal"
              onSelect={() => handleSelect(n.id, n.read)}
            >
              <div className="flex w-full items-center gap-1.5">
                {!n.read && (
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-acid" />
                )}
                <span
                  className={cn(
                    "truncate text-sm",
                    n.read
                      ? "text-muted-foreground"
                      : "font-medium text-foreground",
                  )}
                >
                  {n.message}
                </span>
              </div>
              <span className="pl-3 text-xs text-muted-foreground">
                {timeAgo(new Date(n.createdAt))}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
