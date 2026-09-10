"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronsUpDown, PlusCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
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
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";
import { InviteMemberDialog } from "@/components/invite-member-dialog";

export function OrgSwitcher({
  variant = "compact",
}: {
  /** "prominent" is a full-width, larger-touch-target treatment for mobile. */
  variant?: "compact" | "prominent";
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const { data } = useQuery(trpc.organizations.getAll.queryOptions());

  const organizations = data?.organizations ?? [];
  const activeOrganization = organizations.find(
    (org) => org.id === data?.activeOrganizationId,
  );

  const setActive = useMutation(
    trpc.organizations.setActive.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
      onError: (error) => {
        toast.error(error.message || "Couldn't switch organization");
      },
    }),
  );

  const otherOrganizations = organizations.filter(
    (org) => org.id !== activeOrganization?.id,
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-full border border-border bg-surface-2 font-medium text-foreground transition-colors hover:bg-surface",
              variant === "prominent"
                ? "rounded-xl px-4 py-3.5 text-base"
                : "w-auto px-3 py-1.5 text-sm",
            )}
            aria-label="Switch organization"
          >
            <Building2
              className={cn(
                "shrink-0 text-muted-foreground",
                variant === "prominent" ? "h-5 w-5" : "h-4 w-4",
              )}
            />
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left",
                variant === "compact" && "max-w-32 flex-none",
              )}
            >
              {activeOrganization?.name ?? "Workspace"}
            </span>
            <ChevronsUpDown
              className={cn(
                "shrink-0 text-muted-foreground",
                variant === "prominent" ? "h-4 w-4" : "h-3.5 w-3.5",
              )}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={variant === "prominent" ? "start" : "end"}
          className={variant === "prominent" ? "w-[calc(100vw-2.5rem)]" : "w-64"}
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm font-semibold text-foreground">
                {activeOrganization?.name ?? "Workspace"}
              </span>
            </div>
          </DropdownMenuLabel>

          {otherOrganizations.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {otherOrganizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="cursor-pointer gap-2"
                  disabled={setActive.isPending}
                  onSelect={() =>
                    setActive.mutate({ organizationId: org.id })
                  }
                >
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{org.name}</span>
                </DropdownMenuItem>
              ))}
            </>
          )}

          {activeOrganization && (
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onSelect={() => setInviteOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Invite member
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onSelect={() => setCreateOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Create organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />

      {activeOrganization && (
        <InviteMemberDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          organizationId={activeOrganization.id}
          organizationName={activeOrganization.name}
        />
      )}
    </>
  );
}
